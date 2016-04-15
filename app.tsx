import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {createHashHistory} from 'history';
import {Provider} from 'react-redux';
import {Router, Route, IndexRoute, Link, useRouterHistory, RouterState} from 'react-router';
import {syncHistoryWithStore, routerReducer} from 'react-router-redux';

import store from './store';
import {setPathPair, loadPair, setPath, loadNode} from './actions';
import {FSNodePair} from './fs-helpers';
import App from './components/App';
import Compare from './components/Compare';
import Deduplicate from './components/Deduplicate';
import NotFound from './components/NotFound';
import Rename from './components/Rename';

// import moment to expose it to mapFn as global
import * as moment from 'moment';
window['moment'] = moment;

const unsyncedHistory = useRouterHistory(createHashHistory)({queryKey: false});
const history = syncHistoryWithStore(unsyncedHistory, store);

const emptyLocation: HistoryModule.Location = {
  pathname: '',
  search: '',
  query: {},
  state: {},
  action: '',
  key: '',
};
const emptyState: RouterState = {
  location: emptyLocation,
  routes: [],
  params: {},
  components: [],
};

function saveLocalStorageState(state) {
  const {leftPath, rightPath, path, filterFn, mapFn, compareFn} = state;
  // console.log('saveLocalStorageState', {compareFn});
  Object.assign(localStorage, {leftPath, rightPath, path, filterFn, mapFn, compareFn});
}

let prevState: any = {};
function onStoreChange() {
  const nextState = store.getState();
  // console.log('store.subscribe', nextState);
  saveLocalStorageState(nextState);
  // trigger actions for certain changes
  const {path: prevPath} = prevState;
  const {path: nextPath} = nextState;
  if (nextPath !== prevPath) {
    loadNode(nextPath);
  }
  prevState = nextState;
}
store.subscribe(onStoreChange);
onStoreChange();

function onPairChange(nextState: RouterState) {
  const {leftPath, rightPath} = nextState.location.query as {leftPath: string, rightPath: string};
  if (leftPath && rightPath) {
    setPathPair(leftPath, rightPath);
  }
}
function onPathChange(nextState: RouterState) {
  // console.log('onPathChange', prevState, nextState);
  // const {path: prevPath} = prevState.location.query as {path: string};
  const {path} = nextState.location.query as {path: string};
  if (path) {
    setPath(path);
  }
}

ReactDOM.render((
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App}>
        <Route path="compare" component={Compare}
          onEnter={onPairChange} onChange={(_, nextState) => onPairChange(nextState)} />
        <Route path="rename" component={Rename}
          onEnter={onPathChange} onChange={(_, nextState) => onPathChange(nextState)} />
        <Route path="deduplicate" component={Deduplicate}
          onEnter={onPathChange} onChange={(_, nextState) => onPathChange(nextState)} />
        <Route path="*" component={NotFound} />
        <IndexRoute component={NotFound} />
      </Route>
    </Router>
  </Provider>
), document.getElementById('app'));
