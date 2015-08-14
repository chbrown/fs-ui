/// <reference path="type_declarations/index.d.ts" />
import React = require('react');
import {join} from 'path';
import {readdir, stat, Stats} from 'fs';
import fs = require('fs');
import {FSNode} from './fsnode';
import {compare, FSNodePair} from './diff';
import {NotifyUI} from 'notify-ui';

const max_depth = 2;

interface FSNodePairProps extends FSNodePair {
  key?: any;
}

class FSNodePairComponent extends React.Component<FSNodePairProps, {}> {
  constructor(props) {
    super(props);
  }
  render() {
    // var next_depth = this.props.depth + 1;
    var left = this.props.left ? <div alt={this.props.left.path}>{this.props.left.basename}</div> : <div></div>;
    var right = this.props.right ? <div alt={this.props.right.path}>{this.props.right.basename}</div> : <div></div>;
    var children = [<div></div>];
    if (this.props.equal) {
      // no-op
    }
    else if (!this.props.children && this.props.left) {
      // deletion
      left = <del>{left}</del>;
    }
    else if (!this.props.children && this.props.right) {
      // insertion
      right = <ins>{right}</ins>;
    }
    else if (this.props.children) { // left, right, and children might all be undefined before intiializing
      // difference in children
      children = this.props.children.map(child_pair => {
        var basename = child_pair.left ? child_pair.left.basename : child_pair.right.basename;
        return <FSNodePairComponent key={basename} {...child_pair} />;
      });
    }

    return (
      <div className="pair">
        <div className="row">
          <div className="left">{left}</div>
          <div className="right">{right}</div>
        </div>
        <div className="children">{children}</div>
      </div>
    );
  }
}


class App extends React.Component<{}, {left_path?: string, right_path?: string, pair?: FSNodePair}> {
  constructor(props) {
    super(props);
    this.state = {
      left_path: localStorage['left_path'] || '/tmp/left',
      right_path: localStorage['right_path'] || '/tmp/right',
    };
  }
  leftChange(event: React.FormEvent) {
    var left_path = (event.target as HTMLInputElement).value;
    localStorage['left_path'] = left_path;
    this.refresh(left_path, this.state.right_path);
  }
  rightChange(event: React.FormEvent) {
    var right_path = (event.target as HTMLInputElement).value;
    localStorage['right_path'] = right_path;
    this.refresh(this.state.left_path, right_path);
  }
  refresh(left_path: string, right_path: string) {
    compare(left_path, right_path, (error, pair) => {
      if (error) {
        console.error(error);
        NotifyUI.add(error.message);
      }
      this.setState({left_path, right_path, pair});
    });
  }
  componentDidMount() {
    this.refresh(this.state.left_path, this.state.right_path);
  }
  render() {
    return (
      <main>
        <div className="row">
          <div className="left">
            <input onChange={this.leftChange.bind(this)} value={this.state.left_path} />
          </div>
          <div className="right">
            <input onChange={this.rightChange.bind(this)} value={this.state.right_path} />
          </div>
        </div>
        <div>
          <FSNodePairComponent {...this.state.pair} />
        </div>
      </main>
    );
  }
}

// attach app
React.render(<App />, document.getElementById('app'));
