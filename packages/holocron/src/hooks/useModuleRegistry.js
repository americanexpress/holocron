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

import React from 'react';

import {
  getModuleMap as hydrateModuleMap,
  getModules as hydrateModules,
  getModuleBlockList as hydrateBlockedModules,
} from '../moduleRegistry';

import {
  MODULES_STORE_KEY,
  REGISTRY_MODULE_MAP_KEY,
  REGISTRY_MODULE_BLOCKED_KEY,
  REGISTRY_MODULE_REDUCERS_KEY,
} from '../ducks/constants';
import reducer, {
  getModule,
  getModules,
  getModuleMap,
  setModuleMap,
  registerModule,
  blockModule,
  getBlockedModules,
  isModuleBlocked,
  resetModuleRegistry,
  getModuleReducer,
  getModuleReducers,
  setModuleReducer,
  createInitialState,
} from '../ducks/registry';

export function createRegistryActions(state, dispatch) {
  return {
    getModule(moduleName) {
      return getModule(moduleName)(state);
    },
    getModules() {
      return getModules()(state);
    },
    getModuleMap() {
      return getModuleMap()(state);
    },
    getBlockedModules() {
      return getBlockedModules()(state);
    },
    isModuleBlocked(moduleUrl) {
      return isModuleBlocked(moduleUrl)(state);
    },
    blockModule(moduleUrl) {
      return dispatch(blockModule(moduleUrl));
    },
    registerModule(moduleName, module) {
      return dispatch(registerModule(moduleName, module));
    },
    setModuleMap(newModuleMap) {
      return dispatch(setModuleMap(newModuleMap));
    },
    resetModuleRegistry(newModules, newModuleMap) {
      return dispatch(resetModuleRegistry(newModules, newModuleMap));
    },
    // Experimental
    getModuleReducers() {
      return getModuleReducers()(state);
    },
    getModuleReducer(module = { holocron: { name: 'module' } }, moduleName = module) {
      let name = moduleName;
      if (typeof moduleName !== 'string') name = module.holocron.name;
      return getModuleReducer(name)(state);
    },
    setModuleReducer(moduleName, moduleReducer) {
      return dispatch(setModuleReducer(moduleName, moduleReducer));
    },
  };
}

export default function useModuleRegistry(
  holocronModuleMap = hydrateModuleMap(),
  holocronModules = hydrateModules(),
  blockedModules = hydrateBlockedModules()
) {
  const [state, dispatch] = React.useReducer(
    reducer,
    createInitialState(holocronModuleMap, holocronModules, blockedModules)
  );
  const registry = React.useMemo(() => ({
    ...createRegistryActions(state, dispatch),
    modules: state.get(MODULES_STORE_KEY),
    moduleMap: state.get(REGISTRY_MODULE_MAP_KEY),
    blocked: state.get(REGISTRY_MODULE_BLOCKED_KEY),
    reducers: state.get(REGISTRY_MODULE_REDUCERS_KEY),
  }), [state, dispatch]);

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      console.debug('Holocron Module Registry has started!');
    }, []);
  }

  return registry;
}
