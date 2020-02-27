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

import { connectAsync } from 'iguazu';

import queryModule from '../src/queryModule';
import EmptyModule from '../src/EmptyModule';

import queryModuleWithData from '../src/queryModuleWithData';

jest.mock('../src/queryModule', () => jest.fn());

const dispatchSpy = jest.fn((x) => x);
const getStateSpy = jest.fn();

describe('queryModuleWithData', () => {
  it('should show a loading response when the Module is loading', async () => {
    const loadDataAsProps = ({ store: { dispatch } }) => ({ someData: () => dispatch({ promise: Promise.resolve('data') }) });
    const LoadedModule = connectAsync({ loadDataAsProps })(() => null);

    queryModule.mockImplementationOnce(() => ({
      data: EmptyModule,
      status: 'loading',
      promise: Promise.resolve(LoadedModule),
    }));

    const thunk = queryModuleWithData('my-module', { some: 'prop' });
    const { data, status, promise } = thunk(dispatchSpy, getStateSpy);
    expect(data).toEqual(EmptyModule);
    expect(status).toBe('loading');
    await expect(promise).resolves.toEqual(['data']);
  });

  it('should show a loading response when the Module\'s data is loading', async () => {
    const loadDataAsProps = ({ store: { dispatch } }) => ({ someData: () => dispatch({ promise: Promise.resolve('data') }) });
    const LoadedModule = connectAsync({ loadDataAsProps })(() => null);

    queryModule.mockImplementationOnce(() => ({
      data: LoadedModule,
      status: 'loading',
      promise: Promise.resolve(LoadedModule),
    }));

    const thunk = queryModuleWithData('my-module', { some: 'prop' });
    const { data, status, promise } = thunk(dispatchSpy, getStateSpy);
    expect(data).toEqual(LoadedModule);
    expect(status).toBe('loading');
    await expect(promise).resolves.toEqual(['data']);
  });

  it('should show a loaded response when the Module and its data is loaded', async () => {
    const loadDataAsProps = ({ store: { dispatch } }) => ({
      someData: () => dispatch({ data: 'data', status: 'complete', promise: Promise.resolve('data') }),
    });
    const LoadedModule = connectAsync({ loadDataAsProps })(() => null);

    queryModule.mockImplementationOnce(() => ({
      data: LoadedModule,
      status: 'complete',
      promise: Promise.resolve(LoadedModule),
    }));

    const thunk = queryModuleWithData('my-module', { some: 'prop' });
    const { data, status, promise } = thunk(dispatchSpy, getStateSpy);
    expect(data).toEqual(LoadedModule);
    expect(status).toBe('complete');
    await expect(promise).resolves.toEqual(['data']);
  });

  it('should indicate there was an error if the Holocron Module failed to load', () => {
    const loadError = new Error('Module failed to load');
    const promise = Promise.reject(loadError);
    promise.catch(() => { /* catch so there is no UnhandledPromiseRejectionWarning */ });
    const queryModuleResponse = {
      data: EmptyModule,
      error: loadError,
      status: 'complete',
      promise,
    };
    queryModule.mockImplementationOnce(() => queryModuleResponse);

    const thunk = queryModuleWithData('my-module', { some: 'prop' });
    const loadResponse = thunk(dispatchSpy, getStateSpy);
    expect(loadResponse).toEqual(queryModuleResponse);
  });

  it('should indicate there was an error if the Module\'s data failed to load', async () => {
    const loadError = new Error('Module\'s data failed to load');
    const dataLoadPromise = Promise.reject(loadError);
    const loadDataAsProps = ({ store: { dispatch } }) => ({
      someData: () => dispatch({
        data: undefined,
        status: 'complete',
        error: loadError,
        promise: dataLoadPromise,
      }),
    });
    const LoadedModule = connectAsync({ loadDataAsProps })(() => null);

    queryModule.mockImplementationOnce(() => ({
      data: LoadedModule,
      status: 'complete',
      promise: Promise.resolve(LoadedModule),
    }));

    const thunk = queryModuleWithData('my-module', { some: 'prop' });
    const {
      data,
      status,
      error,
      promise,
    } = thunk(dispatchSpy, getStateSpy);
    expect(data).toEqual(LoadedModule);
    expect(status).toBe('complete');
    expect(error).toBeTruthy();
    await expect(promise).rejects.toEqual(loadError);
  });

  it('should gracefully handle a Module that does not use iguazu', async () => {
    const LoadedModule = () => null;

    queryModule.mockImplementationOnce(() => ({
      data: LoadedModule,
      status: 'complete',
      promise: Promise.resolve(LoadedModule),
    }));

    const thunk = queryModuleWithData('my-module', { some: 'prop' });
    const { data, status, promise } = thunk(dispatchSpy, getStateSpy);
    expect(data).toEqual(LoadedModule);
    expect(status).toBe('complete');
    await expect(promise).resolves.toBeUndefined();
  });
});
