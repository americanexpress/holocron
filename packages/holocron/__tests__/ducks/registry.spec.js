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

import { createStore } from 'redux';
import { fromJS, List as iList } from 'immutable';

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
  createInitialState,
} from '../../src/ducks/registry';

describe('registry', () => {
  const initialState = createInitialState();
  const store = createStore(reducer);

  const moduleName = 'my-module';
  const module = () => 'hello';
  const moduleMap = {
    modules: {
      [moduleName]: {},
    },
  };

  test('returns immutable initialState', () => {
    expect(store.getState()).toEqual(initialState);
    expect(reducer(undefined, {})).toEqual(initialState);
    expect(initialState.toJS()).toEqual({
      blockedModules: [],
      moduleMap: {
        modules: {},
      },
      modules: {},
    });
  });

  test('sets a module map', () => {
    store.dispatch(setModuleMap(moduleMap));
    expect(getModuleMap()(store.getState())).toEqual(fromJS(moduleMap));
  });

  test('registers a module', () => {
    store.dispatch(registerModule(moduleName, module));
    expect(getModules()(store.getState())).toEqual(fromJS({ [moduleName]: module }));
    expect(getModule(moduleName)(store.getState())).toEqual(module);
    expect(getModule('random-module')(store.getState())).toEqual(null);
  });

  test('blocks a module', () => {
    store.dispatch(blockModule(moduleName));
    expect(getBlockedModules()(store.getState())).toEqual(iList([moduleName]));
    expect(isModuleBlocked(moduleName)(store.getState())).toEqual(true);
    expect(isModuleBlocked('random-module')(store.getState())).toEqual(false);
  });

  test('resets the module registry', () => {
    store.dispatch(resetModuleRegistry());
    expect(getModules()(store.getState())).toEqual(fromJS({}));
    expect(getModuleMap()(store.getState())).toEqual(fromJS({}));
    expect(getBlockedModules()(store.getState())).toEqual(iList([moduleName]));
  });
});
