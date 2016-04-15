import * as React from 'react';
import {dirname, relative} from 'path';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {FSNode} from 'fs-metadata';
import {flatMap} from 'tarry';

import {bind, compileFunction, FSNodeWithDepth, flattenFSNode} from '../util';
import DateTime from './DateTime';
import {StoredPathEditor} from './PathEditor';

interface DeduplicateProps {
  node?: FSNode;
  path?: string;
  compareFn?: string;
  /** for redux */
  dispatch?: Function;
}
interface DeduplicateState {
  compareFn?: string;
  compare?: (a: FSNodeWithDepth, b: FSNodeWithDepth) => number;
}
@connect(state => ({path: state.path, node: state.node, compareFn: state.compareFn}))
class Deduplicate extends React.Component<DeduplicateProps, DeduplicateState> {
  constructor(props: DeduplicateProps) {
    super(props);
    const {compareFn, compare} = this.updateCompare(props.compareFn);
    this.state = {compareFn, compare};
  }
  private updateCompare(compareFn: string) {
    const compare = compileFunction<(a: FSNodeWithDepth, b: FSNodeWithDepth) => number>('a', 'b', compareFn);
    return {compareFn, compare};
  }
  @bind
  onChangeCompareFn(ev: React.FormEvent) {
    const {value} = ev.target as HTMLInputElement;
    this.props.dispatch({type: 'SET_COMPARE_FUNCTION', compareFn: value});
    this.setState(this.updateCompare(value));
  }
  render() {
    const {path, node} = this.props;
    const {compareFn, compare} = this.state;
    const checksumGroups = new Map<string, FSNodeWithDepth[]>();
    const allNodes = node ? flattenFSNode(node, dirname(path)) : [];

    let compareMessage = <div />;
    try {
      allNodes.sort(compare);
    }
    catch (compareError) {
      compareMessage = <div><code className="error">{compareError.message}</code></div>;
    }

    allNodes.forEach(node => {
      const group = checksumGroups.get(node.checksum) || [];
      checksumGroups.set(node.checksum, group.concat(node));
    });
    // const groupsWithDuplicates = Array.from(checksumGroups.values()).filter(nodes => nodes.length > 1);
    const duplicateFilenames = flatMap(Array.from(checksumGroups.values()), nodes => {
      // consider all but the first item in a group (with identical checksums) as the duplicates
      return nodes.slice(1).map(({path}) => `"${path}"`);
    });
    return (
      <div>
        <section>
          <h2>Deduplicate</h2>
        </section>
        <StoredPathEditor path={path} />
        <section>
          <div>
            <h3>Sort</h3>
            <code>function compareFunction(a: FSNode, b: FSNode): number {'{'}</code>
            <div className="function-body">
              <textarea value={compareFn} onChange={this.onChangeCompareFn} />
            </div>
            <code>{'}'}</code>
            {compareMessage}
          </div>
        </section>
        <div>
          {/*<h3>Grouped by duplicates</h3>*/}
          <table className="fill padded">
            <thead>
              <tr>
                <th>Hash</th>
                <th>Name</th>
                <th className="number">Size</th>
                <th>Type</th>
                <th>Birth</th>
                <th>Modified</th>
              </tr>
            </thead>
            {Array.from(checksumGroups).map(([checksum, nodes]) =>
              <tbody key={checksum} className="duplicate-group">
                {nodes.map(node =>
                  <tr key={node.path}>
                    <td><code>{checksum}</code></td>
                    <td>
                      <Link to={{pathname: '/deduplicate', query: {path: node.path}}}>
                        {relative(path, node.path)}{node.type === 'directory' && '/'}
                      </Link>
                    </td>
                    <td className="number">{node.size}</td>
                    <td>{node.type}</td>
                    <td><DateTime date={node.btime * 1000} /></td>
                    <td><DateTime date={node.mtime * 1000} /></td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>
        <section>
          <p>{duplicateFilenames.length} duplicates found.</p>
          {duplicateFilenames.length > 0 &&
            <div>
              <h2>Suggested fix</h2>
              <div>
                <code>trash {duplicateFilenames.join(' \\\n      ')}</code>
              </div>
            </div>}
        </section>
      </div>
    );
  }
}
export default Deduplicate;
