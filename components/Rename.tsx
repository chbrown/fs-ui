import * as React from 'react';
import {join, dirname} from 'path';
import {connect} from 'react-redux';
import {Link, RouterState} from 'react-router';
import {read, FSNode} from 'fs-metadata';
import {flatMap} from 'tarry';

import {bind, flattenFSNode, FSNodeWithDepth, compileFunction} from '../util';
import store from '../store';
import {StoredPathEditor} from './PathEditor';

interface RenameProps {
  node?: FSNode;
  path?: string;
  filterFn?: string;
  mapFn?: string;
  /** for redux */
  dispatch?: Function;
}
interface RenameState<T extends FSNode> {
  filterFn?: string;
  filter?: (node: T) => boolean;
  mapFn?: string;
  map?: (node: T) => T;
}
@connect(state => ({path: state.path, node: state.node, filterFn: state.filterFn, mapFn: state.mapFn}))
class Rename<T extends FSNodeWithDepth> extends React.Component<RenameProps, RenameState<T>> {
  constructor(props: RenameProps) {
    super(props);
    // initialize with values from props, but keep local state for simpler render cycles
    const {filterFn, filter} = this.updateFilter(props.filterFn);
    const {mapFn, map} = this.updateMap(props.mapFn);
    this.state = {filterFn, filter, mapFn, map};
  }
  private updateFilter(filterFn: string) {
    const filter = compileFunction<(node: T) => boolean>('node', filterFn);
    return {filterFn, filter};
  }
  private updateMap(mapFn: string) {
    const map = compileFunction<(node: T) => T>('node', mapFn);
    return {mapFn, map};
  }
  @bind
  onChangeFilterFn(ev: React.FormEvent) {
    const {value} = ev.target as HTMLInputElement;
    this.props.dispatch({type: 'SET_FILTER_FUNCTION', filterFn: value});
    this.setState(this.updateFilter(value));
  }
  @bind
  onChangeMapFn(ev: React.FormEvent) {
    const {value} = ev.target as HTMLInputElement;
    this.props.dispatch({type: 'SET_MAP_FUNCTION', mapFn: value});
    this.setState(this.updateMap(value));
  }
  render() {
    const {path, node} = this.props;
    const {filterFn, filter, mapFn, map} = this.state;
    const allNodes = node ? flattenFSNode(node, dirname(path)) : [];
    let inputNodes: FSNodeWithDepth[] = [];
    let filterMessage = <div />;
    try {
      inputNodes = allNodes.filter(filter);
    }
    catch (filterError) {
      filterMessage = <div><code className="error">{filterError.message}</code></div>;
    }
    let outputNodes: FSNodeWithDepth[] = [];
    let mapMessage = <div />;
    try {
      outputNodes = inputNodes.map(map);
    }
    catch (mapError) {
      mapMessage = <div><code className="error">{mapError.message}</code></div>;
    }
    return (
      <div>
        <h2>Rename</h2>
        <div>
          <StoredPathEditor path={path} />
        </div>
        <div className="cols-2">
          <div>
            <h3>Filter</h3>
            <code>function filter(node: FSNode): boolean {'{'}</code>
            <div className="function-body">
              <textarea value={filterFn} onChange={this.onChangeFilterFn} />
            </div>
            <code>{'}'}</code>
            {filterMessage}
          </div>
          <div>
            <h3>Map</h3>
            <code>function map(node: FSNode): FSNode {'{'}</code>
            <div className="function-body">
              <textarea value={mapFn} onChange={this.onChangeMapFn} />
            </div>
            <code>{'}'}</code>
            {mapMessage}
          </div>
        </div>
        <div>
          <h3>Files</h3>
          <table className="fill">
            <thead>
              <tr>
                <th>Name</th>
                <th className="number">Size</th>
                <th>Hash</th>
                <th>&rarr;</th>
                <th>Rename</th>
              </tr>
            </thead>
            <tbody>
              {inputNodes.map((inputNode, i) => {
                const outputNode = outputNodes[i];
                const nameStyle = {paddingLeft: (inputNode.depth * 2) + 'ch'};
                return (
                  <tr key={i}>
                    <td style={nameStyle}>
                      <Link to={{pathname: '/rename', query: {path: inputNode.path}}}>
                        {inputNode.name}{inputNode.type === 'directory' && '/'}
                      </Link>
                    </td>
                    <td className="number">{inputNode.size}</td>
                    <td><code>{inputNode.checksum}</code></td>
                    <td></td>
                    <td style={nameStyle}>
                      {outputNode && outputNode.name}{outputNode && outputNode.type === 'directory' && '/'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <section>
          <h2>Commands</h2>
          {inputNodes.map((inputNode, i) => {
            const outputNode = outputNodes[i];
            return (
              <div key={inputNode.path}>
                {outputNode ?
                  <div>
                    {inputNode.path !== outputNode.path &&
                      <code>mv -n "{inputNode.path}" "{outputNode.path}";</code>}
                  </div> :
                  <span>No output</span>}
              </div>
            );
          })}
        </section>
      </div>
    );
  }
}
export default Rename;
