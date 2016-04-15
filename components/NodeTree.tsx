import * as React from 'react';
import {FSNode} from 'fs-metadata';

class NodeTree extends React.Component<FSNode, {}> {
  render() {
    const {name, type, size, children} = this.props;
    return (
      <div>
        <div>
          <b>{name}{(type === 'directory') && '/'}</b> <i>size={size}</i>
        </div>
        <div className="indent">
          {children && children.map(child =>
            <NodeTree key={child.name} {...child} />
          )}
        </div>
      </div>
    );
  }
}
export default NodeTree;
