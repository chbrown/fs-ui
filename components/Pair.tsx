import * as React from 'react';
import {FSNode} from 'fs-metadata';
import {FSNodePair} from '../fs-helpers';

function determineOp(left: FSNode, right: FSNode, equal: boolean): 'equal' | 'recurse' | 'delete' | 'insert' {
  if (equal) {
    return 'equal';
  }
  if (!left && right) {
    return 'insert';
  }
  if (left && !right) {
    return 'delete'
  }
  return 'recurse';
}

interface PairProps extends FSNodePair {
  maxDepth: number;
  depth: number;
}
class Pair extends React.Component<PairProps, {collapsed?: boolean}> {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: props.depth > props.maxDepth,
    };
  }
  onDoubleClick(event: React.FormEvent) {
    const {left, right} = this.props;
    const url = `?leftPath=${left.name}&rightPath=${right.name}`;
    window.open(url);
  }
  // onClick(event: React.FormEvent) {
  //   this.setState({collapsed: !this.state.collapsed});
  // }
  render() {
    const {left, right, equal, children, maxDepth, depth} = this.props;
    const op = determineOp(left, right, equal);

    const nextDepth = depth + 1;
    // left, right, and children might all be undefined before initializing
    // difference in children
    const nameStyle = {paddingLeft: (depth * 2) + 'ch'};
    // onClick={this.onClick.bind(this)}
    return (
      <div className={'pair ' + op}>
        <div className="cols-2" onDoubleClick={this.onDoubleClick.bind(this)} >
          <div style={nameStyle}>{left && <div title={left.name}>{left.name}</div>}</div>
          <div style={nameStyle}>{right && <div title={right.name}>{right.name}</div>}</div>
        </div>
        <div className="children">
          {(!this.state.collapsed && children) && children.map((childPair, i) => {
            const name = childPair.left ? childPair.left.name : childPair.right.name;
            // const name = i;
            return <Pair key={name} depth={nextDepth} maxDepth={maxDepth} {...childPair} />;
          })}
        </div>
      </div>
    );
  }
}

export default Pair;
