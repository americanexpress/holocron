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

import holocron from 'holocron';
import EmptyModule from '../src/EmptyModule';

import queryModule from '../src/queryModule';

jest.mock('holocron', () => ({
  getModule: jest.fn(),
  loadModule: jest.fn(),
  isLoaded: jest.fn(() => () => false),
  failedToLoad: jest.fn(() => () => false),
  getLoadError: jest.fn(() => () => undefined),
}));

const dispatch = jest.fn(x => x);
const getState = jest.fn();

describe('queryModule', () => {
  it('should return a loading response if the Module is in the process of loading', async () => {
    const LoadedModule = () => null;
    holocron.getModule.mockImplementationOnce(() => undefined);
    holocron.loadModule.mockImplementationOnce(() => Promise.resolve(LoadedModule));

    const thunk = queryModule('my-module');
    const { data, status, promise } = thunk(dispatch, getState);
    expect(data).toBe(EmptyModule);
    expect(status).toBe('loading');
    await expect(promise).resolves.toBe(LoadedModule);
  });

  it('should return a loaded response when the Module has loaded successfully', async () => {
    const LoadedModule = () => null;
    holocron.getModule.mockImplementationOnce(() => LoadedModule);
    holocron.loadModule.mockImplementationOnce(() => Promise.resolve(LoadedModule));
    holocron.isLoaded.mockImplementationOnce(() => () => true);

    const thunk = queryModule('my-module');
    const { data, status, promise } = thunk(dispatch, getState);
    expect(data).toBe(LoadedModule);
    expect(status).toBe('complete');
    await expect(promise).resolves.toBe(LoadedModule);
  });

  it('should return a loaded response with an empty Module if the Module failed to load', async () => {
    holocron.getModule.mockImplementationOnce(() => undefined);
    const loadModuleError = new Error('load failure');
    holocron.loadModule.mockImplementationOnce(() => Promise.reject(loadModuleError));
    holocron.failedToLoad.mockImplementationOnce(() => () => true);
    holocron.getLoadError.mockImplementationOnce(() => () => loadModuleError);

    const thunk = queryModule('my-module');
    const {
      data,
      status,
      error,
      promise,
    } = thunk(dispatch, getState);
    expect(data).toBe(EmptyModule);
    expect(status).toBe('complete');
    expect(error).toBe(loadModuleError);
    await expect(promise).rejects.toBe(loadModuleError);
  });
});
