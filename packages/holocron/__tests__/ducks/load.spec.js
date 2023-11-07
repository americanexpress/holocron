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

import { fromJS, Set as iSet, Map as iMap } from 'immutable';
import { getModuleMap } from '../../src/moduleRegistry';

import reducer, { loadModule } from '../../src/ducks/load';

import {
  REGISTER_MODULE_REDUCER,
  MODULE_LOADED,
  MODULE_LOAD_FAILED,
  MODULE_LOADING,
  MODULE_REDUCER_ADDED,
  REDUCER_KEY,
} from '../../src/ducks/constants';

const mockModule = () => 'a mock module';
mockModule[REDUCER_KEY] = () => 'mock reducer state';
jest.mock('../../src/moduleRegistry', () => ({
  getModule: jest.fn((moduleName, modules) => (modules ? modules.get(moduleName) : 'Cached MockModule')),
  getModuleMap: jest.fn(),
}));
jest.mock('../../src/loadModule.web', () => ({ default: jest.fn(() => Promise.resolve(mockModule)) }));

describe('reducer', () => {
  it('should handle REGISTER_MODULE_REDUCER action when the first reducer is ready to be registered', () => {
    const initialState = fromJS({
      moduleVersions: { 'my-module': '1.2.3' },
    });
    const newState = reducer(initialState, { type: REGISTER_MODULE_REDUCER, moduleName: 'my-module' });
    expect(newState.toJS()).toEqual({
      moduleVersions: { 'my-module': '1.2.3' },
      withReducers: ['my-module'],
    });
  });

  it('should handle REGISTER_MODULE_REDUCER action when an additional reducer is ready to be registered', () => {
    const initialState = fromJS({
      moduleVersions: { 'my-module': '1.2.3', 'another-module': '1.1.1' },
      withReducers: iSet(['my-module']),
    });
    const newState = reducer(initialState, { type: REGISTER_MODULE_REDUCER, moduleName: 'another-module' });
    expect(newState.toJS()).toEqual({
      moduleVersions: { 'my-module': '1.2.3', 'another-module': '1.1.1' },
      withReducers: ['my-module', 'another-module'],
    });
  });

  it('should handle MODULE_LOADED action', () => {
    const initialState = fromJS({
      moduleVersions: { 'my-module': '1.2.3' },
      loaded: iSet(),
      loading: { 'my-module': 'promise' },
    });
    const newState = reducer(initialState, { type: MODULE_LOADED, moduleName: 'my-module' });
    expect(newState.toJS()).toEqual({
      moduleVersions: { 'my-module': '1.2.3' },
      loaded: ['my-module'],
      loading: {},
    });
  });

  it('should handle the MODULE_LOAD_FAILED action', () => {
    const initialState = fromJS({
      moduleVersions: { 'my-module': '1.2.3' },
      failed: {},
      loading: { 'my-module': 'promise' },
    });
    const newState = reducer(initialState, { type: MODULE_LOAD_FAILED, moduleName: 'my-module', error: 'load failure' });
    expect(newState.toJS()).toEqual({
      moduleVersions: { 'my-module': '1.2.3' },
      failed: { 'my-module': 'load failure' },
      loading: {},
    });
  });

  it('should handle the MODULE_LOADING action', () => {
    const initialState = fromJS({
      moduleVersions: { 'my-module': '1.2.3' },
      loading: {},
    });
    const newState = reducer(initialState, { type: MODULE_LOADING, moduleName: 'my-module', promise: 'load promise' });
    expect(newState.toJS()).toEqual({
      moduleVersions: { 'my-module': '1.2.3' },
      loading: { 'my-module': 'load promise' },
    });
  });

  it('should return the same state for irrelevant actions', () => {
    const initialState = fromJS({
      moduleVersions: { 'my-module': '1.2.3' },
      loaded: iSet(),
    });
    const newState = reducer(initialState, { type: 'IRRELEVANT' });
    expect(newState).toBe(initialState);
  });

  it('should return the default initialState if no state is provided', () => {
    expect(reducer(undefined, { type: 'IRRELEVANT' })).toEqual(fromJS({
      withReducers: iSet(),
      loaded: iSet(),
      failed: {},
      loading: {},
    }));
  });
});

describe('loadModule', () => {
  afterEach(() => {
    global.BROWSER = undefined;
  });

  it('should return a thunk', () => {
    const thunk = loadModule('my-module');
    expect(thunk).toBeInstanceOf(Function);
  });

  it('should resolve with the module if it is already loaded', async () => {
    getModuleMap.mockReturnValue(
      fromJS({ modules: { 'my-module': {} } })
    );

    const thunk = loadModule('my-module');
    const dispatch = jest.fn((x) => x);
    const getState = () => fromJS({ holocron: { loaded: iSet(['my-module']), moduleVersions: {} } });
    await expect(thunk(dispatch, getState, {})).resolves.toBe('Cached MockModule');
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should reject with the load error if it already failed to load', async () => {
    getModuleMap.mockReturnValue(
      fromJS({ modules: { 'my-module': {} } })
    );

    const thunk = loadModule('my-module');
    const dispatch = jest.fn((x) => x);
    const error = new Error('load failure');
    const getState = () => fromJS({ holocron: { loaded: iSet(), failed: { 'my-module': error }, moduleVersions: {} } });
    await expect(thunk(dispatch, getState, {})).rejects.toBe(error);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should return with the loading promise if a load is already in progress', async () => {
    getModuleMap.mockReturnValue(
      fromJS({ modules: { 'my-module': {} } })
    );

    const thunk = loadModule('my-module');
    const dispatch = jest.fn((x) => x);
    const getState = () => fromJS({
      holocron: {
        loaded: iSet(),
        failed: {},
        loading: { 'my-module': Promise.resolve('loaded') },
        moduleVersions: {},
      },
    });
    await expect(thunk(dispatch, getState, {})).resolves.toBe('loaded');
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should reject if the module is not in the module map', async () => {
    getModuleMap.mockReturnValue(
      fromJS({ modules: { 'not-my-module': {} } })
    );

    const thunk = loadModule('my-module');
    const dispatch = jest.fn((x) => x);
    const getState = () => fromJS({
      holocron: {
        loaded: iSet(),
        failed: {},
        loading: {},
        moduleVersions: {},
      },
    });
    const error = new Error('Could not load Module my-module because it does not exist in the Module Version Map');
    await expect(thunk(dispatch, getState, {})).rejects.toEqual(error);
    expect(dispatch).toHaveBeenCalledWith({ type: MODULE_LOAD_FAILED, moduleName: 'my-module', error });
  });

  it('should use preloaded module if it is on the server', async () => {
    getModuleMap.mockReturnValue(
      fromJS({ modules: { 'my-module': {} } })
    );

    const thunk = loadModule('my-module');
    const dispatch = jest.fn((x) => x);
    const getState = () => fromJS({
      holocron: {
        loaded: iSet(),
        failed: {},
        loading: {},
        moduleVersions: { 'my-module': '1.2.3' },
      },
    });
    const rebuildReducer = jest.fn();
    const Module = { holocron: { name: 'my-module', reducer } };
    const modules = iMap({ 'my-module': Module });
    await expect(thunk(dispatch, getState, { rebuildReducer, modules })).resolves.toBe(Module);
    expect(dispatch).toHaveBeenCalledWith({ type: MODULE_LOADED, moduleName: 'my-module' });
    expect(rebuildReducer).not.toHaveBeenCalled();
  });

  it('should reject if it is not preloaded on the server', async () => {
    getModuleMap.mockReturnValue(
      fromJS({ modules: { 'my-module': {} } })
    );

    const thunk = loadModule('my-module');
    const dispatch = jest.fn((x) => x);
    const getState = () => fromJS({
      holocron: {
        loaded: iSet(),
        failed: {},
        loading: {},
        moduleVersions: { 'my-module': '1.2.3' },
      },
    });
    const rebuildReducer = jest.fn();
    const modules = iMap();
    const error = new Error('Module my-module was not preloaded on server');
    await expect(thunk(dispatch, getState, { rebuildReducer, modules })).rejects.toEqual(error);
    expect(dispatch).toHaveBeenCalledWith({ type: MODULE_LOAD_FAILED, moduleName: 'my-module', error });
  });

  it('should update the states when it attempts to load a module', () => {
    getModuleMap.mockReturnValue(
      fromJS({ modules: { 'my-module': {} } })
    );

    const thunk = loadModule('my-module');
    const dispatch = jest.fn((x) => x);
    const getState = () => fromJS({
      holocron: {
        loaded: iSet(),
        failed: {},
        loading: {},
        moduleVersions: { 'my-module': '1.2.3' },
      },
    });
    thunk(dispatch, getState, { rebuildReducer: () => null });
    expect(dispatch).toHaveBeenCalledWith({ type: MODULE_LOADING, moduleName: 'my-module', promise: Promise.resolve('Loaded MockModule') });
  });

  it('should update the state when a module is loaded successfully', async () => {
    getModuleMap.mockReturnValue(
      fromJS({ modules: { 'my-module': {} } })
    );

    const thunk = loadModule('my-module');
    const dispatch = jest.fn((x) => x);
    const getState = () => fromJS({
      holocron: {
        loaded: iSet(),
        failed: {},
        loading: {},
        moduleVersions: { 'my-module': '1.2.3' },
      },
    });
    const rebuildReducer = jest.fn();
    await expect(thunk(dispatch, getState, { rebuildReducer })).resolves.toBe(mockModule);
    expect(dispatch).toHaveBeenCalledWith({ type: REGISTER_MODULE_REDUCER, moduleName: 'my-module' });
    expect(dispatch).toHaveBeenCalledWith({ type: MODULE_REDUCER_ADDED });
    expect(dispatch).toHaveBeenCalledWith({ type: MODULE_LOADED, moduleName: 'my-module' });
    expect(rebuildReducer).toHaveBeenCalled();
  });

  it('should not rebuild the store when a module without a reducer is loaded successfully', async () => {
    const Module = 'Module';
    require('../../src/loadModule.web').default.mockImplementationOnce(() => Promise.resolve(Module));
    getModuleMap.mockReturnValue(
      fromJS({ modules: { 'my-module': {} } })
    );

    const thunk = loadModule('my-module');
    const dispatch = jest.fn((x) => x);
    const getState = () => fromJS({
      holocron: {
        loaded: iSet(),
        failed: {},
        loading: {},
        moduleVersions: { 'my-module': '1.2.3' },
      },
    });
    const rebuildReducer = jest.fn();
    await expect(thunk(dispatch, getState, { rebuildReducer })).resolves.toBe(Module);
    expect(dispatch).toHaveBeenCalledWith({ type: MODULE_LOADED, moduleName: 'my-module' });
    expect(dispatch).not.toHaveBeenCalledWith({ type: REGISTER_MODULE_REDUCER, moduleName: 'my-module' });
    expect(dispatch).not.toHaveBeenCalledWith({ type: MODULE_REDUCER_ADDED });
    expect(rebuildReducer).not.toHaveBeenCalled();
  });

  it('should load a module if the loading promise is falsy', async () => {
    getModuleMap.mockReturnValue(
      fromJS({ modules: { 'my-module': {} } })
    );

    const thunk = loadModule('my-module');
    const dispatch = jest.fn((x) => x);
    const getState = () => fromJS({
      holocron: {
        loaded: iSet(),
        failed: {},
        loading: { 'my-module': null },
        moduleVersions: { 'my-module': '1.2.3' },
      },
    });
    const rebuildReducer = jest.fn();
    await expect(thunk(dispatch, getState, { rebuildReducer })).resolves.toBe(mockModule);
    expect(dispatch).toHaveBeenCalledWith({ type: REGISTER_MODULE_REDUCER, moduleName: 'my-module' });
    expect(dispatch).toHaveBeenCalledWith({ type: MODULE_REDUCER_ADDED });
    expect(dispatch).toHaveBeenCalledWith({ type: MODULE_LOADED, moduleName: 'my-module' });
    expect(rebuildReducer).toHaveBeenCalled();
  });

  it('should update the state when a module fails to load', async () => {
    getModuleMap.mockReturnValue(
      fromJS({ modules: { 'my-module': {} } })
    );

    const loadModuleError = new Error('load failure');
    // eslint-disable-next-line global-require -- require for test
    require('../../src/loadModule.web').default.mockImplementationOnce(() => Promise.reject(loadModuleError));

    const thunk = loadModule('my-module');
    const dispatch = jest.fn((x) => x);
    const getState = () => fromJS({
      holocron: {
        loaded: iSet(),
        failed: {},
        loading: {},
        moduleVersions: { 'my-module': '1.2.3' },
      },
    });
    const rebuildReducer = jest.fn();
    await expect(thunk(dispatch, getState, { rebuildReducer })).rejects.toBe(loadModuleError);
    expect(dispatch).toHaveBeenCalledWith({ type: MODULE_LOAD_FAILED, moduleName: 'my-module', error: loadModuleError });
  });
});
