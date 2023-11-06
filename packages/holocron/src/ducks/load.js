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

import { Map as iMap, Set as iSet } from 'immutable';
import { getModule, getModuleMap } from '../moduleRegistry';
import {
  HOLOCRON_STORE_KEY,
  MODULES_STORE_KEY,
  REDUCER_KEY,
  REGISTER_MODULE_REDUCER,
  MODULE_LOADED,
  MODULE_LOAD_FAILED,
  MODULE_LOADING,
  MODULE_REDUCER_ADDED,
} from './constants';

const initialState = iMap({
  withReducers: iSet(),
  loaded: iSet(),
  failed: iMap(),
  loading: iMap(),
});
// eslint-disable-next-line default-param-last -- long message
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case REGISTER_MODULE_REDUCER: {
      const { moduleName } = action;
      return state.update('withReducers', iSet(), (withReducers) => withReducers.add(moduleName));
    }
    case MODULE_LOADED: {
      const { moduleName } = action;
      return state.withMutations((holocronState) => {
        holocronState
          .update('loaded', iSet(), (loaded) => loaded.add(moduleName))
          .update('loading', iMap(), (loading) => loading.delete(moduleName));
      });
    }
    case MODULE_LOAD_FAILED: {
      const { moduleName, error } = action;
      return state.withMutations((holocronState) => {
        holocronState
          .update('failed', iMap(), (failed) => failed.set(moduleName, error))
          .update('loading', iMap(), (loading) => loading.delete(moduleName));
      });
    }
    case MODULE_LOADING: {
      const { moduleName, promise } = action;
      return state.update('loading', iMap(), (loading) => loading.set(moduleName, promise));
    }

    default:
      return state;
  }
}

function registerModuleReducer(moduleName) {
  return {
    type: REGISTER_MODULE_REDUCER,
    moduleName,
  };
}

function moduleLoaded(moduleName) {
  return {
    type: MODULE_LOADED,
    moduleName,
  };
}

function moduleLoadFailed(moduleName, error) {
  return {
    type: MODULE_LOAD_FAILED,
    moduleName,
    error,
  };
}

function moduleLoading(moduleName, promise) {
  return {
    type: MODULE_LOADING,
    moduleName,
    promise,
  };
}

export function isLoaded(moduleName) {
  return (state) => state.hasIn([HOLOCRON_STORE_KEY, 'loaded', moduleName]);
}

export function failedToLoad(moduleName) {
  return (state) => state.hasIn([HOLOCRON_STORE_KEY, 'failed', moduleName]);
}

export function getLoadError(moduleName) {
  return (state) => state.getIn([HOLOCRON_STORE_KEY, 'failed', moduleName]);
}

export function isLoading(moduleName) {
  return (state) => !!state.getIn([HOLOCRON_STORE_KEY, 'loading', moduleName]);
}

export function getLoadingPromise(moduleName) {
  return (state) => state.getIn([HOLOCRON_STORE_KEY, 'loading', moduleName]);
}

/* eslint-disable global-require -- require module */
export function loadModule(moduleName) {
  return (dispatch, getState, { modules, rebuildReducer }) => {
    const state = getState();
    const moduleData = getModuleMap().getIn([MODULES_STORE_KEY, moduleName]);

    let loadPromise;
    if (isLoaded(moduleName)(state)) {
      return Promise.resolve(getModule(moduleName, modules));
    }

    if (failedToLoad(moduleName)(state)) {
      return Promise.reject(getLoadError(moduleName)(state));
    }

    if (isLoading(moduleName)(state)) {
      return getLoadingPromise(moduleName)(state);
    }

    if (!moduleData) {
      // eslint-disable-next-line max-len -- long message
      const moduleLoadError = new Error(`Could not load Module ${moduleName} because it does not exist in the Module Version Map`);
      dispatch(moduleLoadFailed(moduleName, moduleLoadError));
      return Promise.reject(moduleLoadError);
    }

    if (modules) {
      const module = getModule(moduleName, modules);
      // eslint-disable-next-line max-len -- ternary operator
      loadPromise = module ? Promise.resolve(module) : Promise.reject(new Error(`Module ${moduleName} was not preloaded on server`));
    } else {
      // eslint-disable-next-line import/extensions -- include extension
      loadPromise = require('../loadModule.web.js').default(moduleName, moduleData);
    }

    dispatch(moduleLoading(moduleName, loadPromise));

    return loadPromise
      .then(
        (module) => {
          if (module[REDUCER_KEY]) {
            dispatch(registerModuleReducer(moduleName));
            rebuildReducer();
            dispatch({ type: MODULE_REDUCER_ADDED });
          }
          dispatch(moduleLoaded(moduleName));
          return module;
        },
        (error) => {
          console.warn(error);
          dispatch(moduleLoadFailed(moduleName, error));
          return Promise.reject(error);
        }
      );
  };
}
/* eslint-enable global-require -- enable */
