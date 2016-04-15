import * as React from 'react';
import {connect} from 'react-redux';
import {Link, RouterState} from 'react-router';

import {FSNodePair} from '../fs-helpers';
import store from '../store';
import Pair from './Pair';

interface CompareProps {
  leftPath?: string;
  rightPath?: string;
  maxDepth?: number;
  pair?: FSNodePair;
}
interface CompareState {
}
@connect(({leftPath, rightPath, maxDepth, pair}) => ({leftPath, rightPath, maxDepth, pair}))
class Compare extends React.Component<CompareProps, CompareState> {
  // leftChange(event: React.FormEvent) {
  //   const leftPath = (event.target as HTMLInputElement).value;
  //   // localStorage['leftPath'] = leftPath;
  //   // this.setState({leftPath, pair: null});
  //   history.push({pathname: '/', query} as any);
  // }
  // rightChange(event: React.FormEvent) {
  //   var rightPath = (event.target as HTMLInputElement).value;
  //   // localStorage['rightPath'] = rightPath;
  //   this.setState({rightPath, pair: null});
  // }
  // maxDepthChange(event: React.FormEvent) {
  //   var maxDepth = parseInt((event.target as HTMLInputElement).value, 10);
  //   // localStorage['maxDepth'] = maxDepth;
  //   this.setState({maxDepth, pair: null});
  // }
  render() {
    // const {location} = this.props;
    // const {leftPath, rightPath, maxDepth = 10} = location.query as any;
    const {leftPath, rightPath, maxDepth, pair} = this.props;
    console.log('Compare#render', pair);
    return (
      <div>
        <h1>Compare</h1>
        <section className="cols-2">
          <div>
            <label>
              <div><b>Input</b></div>
              {/*<input onChange={this.leftChange.bind(this)} value={this.props.leftPath} className="hfill" />*/}
              <div>{leftPath}</div>
            </label>
          </div>
          <div>
            <label>
              <div><b>Output</b></div>
              {/*<input onChange={this.rightChange.bind(this)} value={rightPath} className="hfill" />*/}
              <div>{rightPath}</div>
            </label>
          </div>
        </section>
        {/*<section className="cols">
          <div>
            <label>
              <span>Max Depth: </span>
              <input type="number" className="short"
                onChange={this.maxDepthChange.bind(this)} value={maxDepth as any} />
            </label>
          </div>
          <div>
            <button onClick={this.refresh.bind(this)}>Refresh</button>
          </div>
        </section>*/}
        <div>
          {pair ? <Pair {...pair} depth={0} maxDepth={maxDepth} /> : <div>Missing path(s)</div>}
        </div>
      </div>
    );
  }
}

export default Compare;
