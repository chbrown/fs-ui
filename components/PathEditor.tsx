import * as React from 'react';
import {join} from 'path';
import {connect} from 'react-redux';

import {loadNode} from '../actions';
import {bind} from '../util';

interface PathEditorProps {
  path: string;
  onChange(newPath: string): void;
}
interface PathEditorState {
  editing: boolean;
}
class PathEditor extends React.Component<PathEditorProps, PathEditorState> {
  constructor(props: PathEditorProps) {
    super(props);
    this.state = {editing: false};
  }
  // @bind
  onSet(newPath: string) {
    // console.log('PathEditor#onSet', newPath);
    this.props.onChange(newPath);
  }
  @bind
  onStartEditing() {
    // console.log('PathEditor#onStartEditing');
    this.setState({editing: true});
  }
  @bind
  onStopEditing() {
    const {value} = this.refs['input'] as HTMLInputElement;
    // console.log('PathEditor#onStopEditing', value);
    this.props.onChange(value);
    this.setState({editing: false});
  }
  render() {
    const {path} = this.props;
    const ancestryNames = path.slice(1).split('/');
    const ancestry = ancestryNames.reduce<{name: string, path: string}[]>((ancestry, name) => {
      const parent = ancestry[ancestry.length - 1] || {name: null, path: '/'};
      return ancestry.concat({name, path: join(parent.path, name)});
    }, []);
    const pathStyle = {width: `${Math.max(20, path.length) + 5}ch`};
    // console.log('PathEditor#render', path);
    const {editing} = this.state;
    return (
      <section>
        <span>
          <b>Path:</b>
        </span>
        <section className="inline">
          {editing ?
            <form className="spaced" onSubmit={this.onStopEditing}>
              <input type="text" ref="input" defaultValue={path}
                className="code" style={pathStyle} />
              <button>Save</button>
            </form> :
            <div>
              <code className="input" style={pathStyle}>
                {ancestry.map(({name, path}) =>
                  <span key={path} onClick={this.onSet.bind(this, path)} className="clickable">/{name}</span>
                )}
              </code>
              <button onClick={this.onStartEditing}>Edit</button>
            </div>}
        </section>
      </section>
    );
  }
}

interface StoredPathEditorProps {
  // name: string;
  path: string;
}
interface StoredPathEditorState { }
/**
StoredPathEditor (runs actions to) writes to the store, but is responsible for
getting its value, {path}, from its parent, not the store.
*/
@connect()
export class StoredPathEditor extends React.Component<StoredPathEditorProps, StoredPathEditorState> {
  @bind
  onChange(newPath: string) {
    // TODO: incorporate props.name
    loadNode(newPath);
  }
  render() {
    const {path} = this.props;
    return <PathEditor path={path} onChange={this.onChange} />;
  }
}

export default PathEditor;
