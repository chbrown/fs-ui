import {createStore, combineReducers} from 'redux';
import {routerReducer, LOCATION_CHANGE} from 'react-router-redux';

import {FSNode} from 'fs-metadata';
import {FSNodePair} from './fs-helpers';

import {Action} from './actions';

function leftPath(leftPath = '/', action: Action) {
  switch (action.type) {
  case 'SET_LEFT_PATH':
    return action.path;
  default:
    return leftPath;
  }
}

function rightPath(rightPath = '/', action: Action) {
  switch (action.type) {
  case 'SET_RIGHT_PATH':
    return action.path;
  default:
    return rightPath;
  }
}

function path(path: string = '', action: Action) {
  switch (action.type) {
  case 'SET_PATH':
    return action.path;
  default:
    return path;
  }
}

function node(node: FSNode = null, action: Action) {
  switch (action.type) {
  case 'SET_NODE':
    return action.node;
  default:
    return node;
  }
}

function pair(pair: FSNodePair = null, action: Action) {
  switch (action.type) {
  case 'SET_NODE_PAIR':
    return action.pair;
  default:
    return pair;
  }
}

function maxDepth(maxDepth: number = 10, action: Action) {
  switch (action.type) {
  case 'SET_MAX_DEPTH':
    return action.maxDepth;
  default:
    return maxDepth;
  }
}

function filterFn(filterFn: string = 'return node.name !== ".DS_Store"', action: Action) {
  switch (action.type) {
  case 'SET_FILTER_FUNCTION':
    return action.filterFn;
  default:
    return filterFn;
  }
}

function mapFn(mapFn: string = 'return node', action: Action) {
  switch (action.type) {
  case 'SET_MAP_FUNCTION':
    return action.mapFn;
  default:
    return mapFn;
  }
}

function compareFn(compareFn: string = 'return a.name.localeCompare(b.name)', action: Action) {
  switch (action.type) {
  case 'SET_COMPARE_FUNCTION':
    return action.compareFn;
  default:
    return compareFn;
  }
}

// function location(location: HistoryModule.Location = null, action: Action) {
//   switch (action.type) {
//   case LOCATION_CHANGE:
//     return action.payload;
//   default:
//     return location;
//   }
// }

const reducer = combineReducers({
  path,
  node,
  leftPath,
  rightPath,
  maxDepth,
  pair,
  filterFn,
  mapFn,
  compareFn,
  routing: routerReducer,
});

function loadLocalStorageState() {
  const {leftPath, rightPath, path, filterFn, mapFn, compareFn} = localStorage;
  return {leftPath, rightPath, path, filterFn, mapFn, compareFn};
}
const initialState = loadLocalStorageState();

export default createStore(reducer, initialState);
