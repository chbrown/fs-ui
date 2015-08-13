/// <reference path="type_declarations/index.d.ts" />
import React = require('react');
import {join} from 'path';
import fs = require('fs');

const max_depth = 2;

/**
props.path should be a full filepath, props.name should be the basename
state.children should be a list of strings that are filenames / directory names.
*/
interface FilesystemNodeProps {
  name: string;
  path: string;
  key?: any;
  depth?: number;
}
class FilesystemNode extends React.Component<FilesystemNodeProps, {stats: fs.Stats, children: string[]}> {
  constructor(props) {
    super(props);
    var stats;
    try {
      stats = fs.statSync(props.path)
    }
    catch (exc) {
      console.error(exc);
    }
    this.state = {
      stats: stats,
      children: (stats && stats.isDirectory()) ? fs.readdirSync(props.path) : [],
    };
  }
  render() {
    var name = <div>{this.props.name}</div>;
    if (this.state.stats && this.state.stats.isDirectory() && this.props.depth < max_depth) {
      var next_depth = this.props.depth + 1;
      var children = this.state.children.map(child_name => {
        var child_path = join(this.props.path, child_name);
        return <FilesystemNode key={child_name} name={child_name} path={child_path} depth={next_depth} />;
      });
      return (
        <div>
          {name}
          <div className="container">{children}</div>
        </div>
      );
    }
    else {
      return name;
    }
  }
}

class App extends React.Component<{}, {left: FilesystemNodeProps, right: FilesystemNodeProps}> {
  constructor(props) {
    super(props);
    this.state = {
      left: {
        name: 'work',
        path: '/Users/chbrown/work',
      },
      right: {
        name: 'work-tm',
        path: '/Users/chbrown/work-tm',
      },
    };
  }
  render() {
    return (
      <main>
        <article className="left">
          <FilesystemNode {...this.state.left} depth={0} />
        </article>
        <article className="right">
          <FilesystemNode {...this.state.right} depth={0} />
        </article>
      </main>
    );
  }
}

// attach app
React.render(<App />, document.getElementById('app'));
