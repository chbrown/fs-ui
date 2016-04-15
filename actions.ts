import {FSNode} from 'fs-metadata';
import {compare, FSNodePair, readCached} from './fs-helpers';

import store from './store';

export interface Action {
  type: string;
  maxDepth?: number;
  path?: string;
  node?: FSNode;
  pair?: FSNodePair;
  filterFn?: string;
  mapFn?: string;
  compareFn?: string;
  /** when type == react-router-redux.LOCATION_CHANGE */
  payload?: HistoryModule.Location;
}

export function setPathPair(leftPath: string, rightPath: string) {
  setImmediate(() => {
    store.dispatch({type: 'SET_LEFT_PATH', path: leftPath});
    store.dispatch({type: 'SET_RIGHT_PATH', path: rightPath});
  });
}

export function loadPair(leftPath: string, rightPath: string) {
  setImmediate(() => {
    store.dispatch({type: 'SET_LEFT_PATH', path: leftPath});
    store.dispatch({type: 'SET_RIGHT_PATH', path: rightPath});
  });
  compare(leftPath, rightPath, (error, pair) => {
    if (error) {
      return console.error(error);
    }
    store.dispatch({type: 'SET_NODE_PAIR', pair});
  });
}

export function setPath(path: string) {
  setImmediate(() => {
    store.dispatch({type: 'SET_PATH', path});
  });
}

export function loadNode(path: string) {
  setImmediate(() => {
    store.dispatch({type: 'SET_PATH', path});
  });
  readCached(path, (error, node) => {
    if (error) {
      return console.error(error);
    }
    store.dispatch({type: 'SET_NODE', node});
  });
}
