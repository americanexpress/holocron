/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
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

import { fromJS, Map as iMap, List as iList } from 'immutable';

import {
  MODULES_STORE_KEY,
  REGISTRY_MODULE_MAP_KEY,
  REGISTRY_MODULE_BLOCKED_KEY,
  REGISTRY_MODULE_REDUCERS_KEY,
  REGISTER_MODULE,
  BLOCK_MODULE,
  SET_MODULE_MAP,
  SET_MODULE_REDUCER,
  RESET_MODULES_AND_MAP,
} from './constants';
import { getModuleReducer as getModuleReducerFromModule } from '../utility';

const initialState = iMap({
  [MODULES_STORE_KEY]: iMap({ module: ({ children }) => children }),
  [REGISTRY_MODULE_MAP_KEY]: iMap({ modules: iMap({ module: {} }) }),
  [REGISTRY_MODULE_BLOCKED_KEY]: iList(),
  [REGISTRY_MODULE_REDUCERS_KEY]: iMap(),
});

export function createInitialState(moduleMap, modules, blocked) {
  let reducers = iMap();
  if (Object.keys(modules || {}).length > 0) {
    Object.entries(modules || {}).forEach(([name, module]) => {
      const moduleReducer = getModuleReducerFromModule(module);
      if (moduleReducer) reducers = reducers.merge(fromJS({ [name]: moduleReducer }));
    });
  }
  return initialState.mergeDeep({
    [MODULES_STORE_KEY]: fromJS(modules || {}),
    [REGISTRY_MODULE_MAP_KEY]: fromJS(moduleMap || {}),
    [REGISTRY_MODULE_BLOCKED_KEY]: iList(blocked),
    [REGISTRY_MODULE_REDUCERS_KEY]: reducers,
  });
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case RESET_MODULES_AND_MAP: {
      const { newModuleMap, newModules } = action;
      return state
        .update(MODULES_STORE_KEY, iMap(),
          (modules) => modules.clear().merge(fromJS(newModules || {})))
        .update(REGISTRY_MODULE_MAP_KEY, iMap(),
          (moduleMap) => moduleMap.clear().merge(fromJS(newModuleMap || {})));
    }
    case BLOCK_MODULE: {
      const { moduleUrl } = action;
      return state
        .update(REGISTRY_MODULE_BLOCKED_KEY, iList(),
          (blockedModules) => blockedModules.push(moduleUrl));
    }
    case SET_MODULE_MAP: {
      const { newModuleMap } = action;
      return state
        .update(REGISTRY_MODULE_MAP_KEY, iMap(),
          (moduleMap) => moduleMap.clear().merge(fromJS(newModuleMap)));
    }
    case SET_MODULE_REDUCER: {
      const { moduleName, moduleReducer } = action;
      return state
        .update(REGISTRY_MODULE_REDUCERS_KEY, iMap(),
          (modules) => modules.set(moduleName, moduleReducer));
    }
    case REGISTER_MODULE: {
      const { moduleName, module } = action;
      return state
        .update(MODULES_STORE_KEY, iMap(),
          (modules) => modules.set(moduleName, module));
    }
    default:
      return state;
  }
}

export function registerModule(moduleName, module) {
  return {
    type: REGISTER_MODULE,
    moduleName,
    module,
  };
}

export function blockModule(moduleUrl) {
  return {
    type: BLOCK_MODULE,
    moduleUrl,
  };
}

export function setModuleMap(newModuleMap) {
  return {
    type: SET_MODULE_MAP,
    newModuleMap,
  };
}

export function setModuleReducer(moduleName, moduleReducer) {
  return {
    type: SET_MODULE_REDUCER,
    moduleName,
    moduleReducer,
  };
}

export function resetModuleRegistry(newModules, newModuleMap) {
  return {
    type: RESET_MODULES_AND_MAP,
    newModules,
    newModuleMap,
  };
}

export function isModuleBlocked(moduleUrl) {
  return (state) => state.get(REGISTRY_MODULE_BLOCKED_KEY).includes(moduleUrl);
}

export function getModule(moduleName) {
  return (state) => state.getIn([MODULES_STORE_KEY, moduleName], null);
}

export function getModules() {
  return (state) => state.getIn([MODULES_STORE_KEY], iMap());
}

export function getModuleMap() {
  return (state) => state.getIn([REGISTRY_MODULE_MAP_KEY], iMap({ modules: iMap() }));
}

export function getBlockedModules() {
  return (state) => state.getIn([REGISTRY_MODULE_BLOCKED_KEY], iList());
}

export function getModuleReducer(moduleName) {
  return (state) => state.getIn([REGISTRY_MODULE_REDUCERS_KEY, moduleName]);
}

export function getModuleReducers() {
  return (state) => state.get(REGISTRY_MODULE_REDUCERS_KEY);
}
