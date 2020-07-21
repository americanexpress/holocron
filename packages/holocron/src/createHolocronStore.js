/*
 * Copyright 2019 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,either express
 * or implied. See the License for the specific language governing permissions and limitations
 * under the License.
 */

import { createStore, compose } from 'redux';
import immutableCombineReducers from '@americanexpress/vitruvius/immutable';
import thunk from 'redux-thunk';
import { Map as iMap, Set as iSet, isImmutable } from 'immutable';

import holocronReducer from './ducks/load';
import { getModule, getModules } from './moduleRegistry';
import {
  HOLOCRON_STORE_KEY, MODULES_STORE_KEY, MODULE_REDUCER_ADDED,
} from './ducks/constants';
import { getModuleReducer } from './utility';

function immutableCombineReducersWithNewModules(moduleReducerMap, newModuleState) {
  if (Object.keys(moduleReducerMap).length === 0) {
    const emptyState = iMap();
    return () => emptyState;
  }

  const baseReducer = immutableCombineReducers(moduleReducerMap);

  if (Object.keys(newModuleState).length === 0) {
    return baseReducer;
  }

  return (state, action) => {
    if (action.type === MODULE_REDUCER_ADDED) {
      return state.merge(newModuleState);
    }
    return baseReducer(state, action);
  };
}

function createReducer({
  appReducer, state, localsForBuildInitialState, registry = { getModule },
}) {
  const moduleReducerMap = {};
  const newModuleState = {};

  let withReducers = iSet();
  let loadedReducers = iMap();

  if (state) {
    withReducers = state.getIn([HOLOCRON_STORE_KEY, 'withReducers'], withReducers);
    loadedReducers = state.get(MODULES_STORE_KEY, loadedReducers);
  }

  withReducers.forEach((moduleName) => {
    const module = registry.getModule(moduleName);
    if (!module) {
      console.warn(`unable to get the reducer of holocron module ${moduleName}`);
      return;
    }
    const moduleReducer = getModuleReducer(module);
    if (typeof moduleReducer.buildInitialState === 'function' && !loadedReducers.has(moduleName)) {
      newModuleState[moduleName] = moduleReducer.buildInitialState(
        localsForBuildInitialState
      );
    }
    moduleReducerMap[moduleName] = moduleReducer;
  });

  const holocronReducers = immutableCombineReducers({
    [HOLOCRON_STORE_KEY]: holocronReducer,
    [MODULES_STORE_KEY]: immutableCombineReducersWithNewModules(moduleReducerMap, newModuleState),
  });

  const holocronStoreKeys = [HOLOCRON_STORE_KEY, MODULES_STORE_KEY];

  return (storeState = iMap(), action) => {
    const holocronState = holocronReducers(
      storeState.filter((_, key) => holocronStoreKeys.includes(key)), action);
    const appState = appReducer(
      storeState.filter((_, key) => !holocronStoreKeys.includes(key)), action);

    return appState.merge(holocronState);
  };
}

const holocronEnhancer = (localsForBuildInitialState, extraThunkArguments = {}) => (
  createReduxStore
) => (
  appReducer,
  preloadedState,
  enhancer
) => {
  const reducer = createReducer({
    appReducer,
    state: preloadedState,
    localsForBuildInitialState,
  });
  const store = createReduxStore(reducer, preloadedState, enhancer);
  const { getState } = store;
  const rebuildReducer = (registry) => store.replaceReducer(createReducer({
    registry,
    appReducer,
    state: getState(),
    localsForBuildInitialState,
  }));
  store.rebuildReducer = rebuildReducer;
  let { dispatch } = store;

  if (!global.BROWSER) { store.modules = getModules(); }

  const middlewareAPI = {
    getState: store.getState,
    dispatch: (action) => dispatch(action),
  };
  dispatch = thunk.withExtraArgument({
    ...extraThunkArguments,
    rebuildReducer,
    modules: store.modules,
  })(middlewareAPI)(store.dispatch);

  return {
    ...store,
    dispatch,
  };
};

export default function createHolocronStore({
  reducer,
  initialState,
  enhancer,
  localsForBuildInitialState,
  extraThunkArguments,
}) {
  if (!(!initialState || isImmutable(initialState))) {
    throw new Error('createHolocronStore expects immutable initial state');
  }

  const enhancedEnhancer = enhancer
    ? compose(holocronEnhancer(localsForBuildInitialState, extraThunkArguments), enhancer)
    : holocronEnhancer(localsForBuildInitialState, extraThunkArguments);

  return createStore(reducer, initialState, enhancedEnhancer);
}
