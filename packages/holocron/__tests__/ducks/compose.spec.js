/* eslint-disable jest/no-conditional-expect -- test conditionally */
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

import { LOAD_KEY } from '../../src/ducks/constants';

import { composeModules } from '../../src/ducks/compose';

const consoleError = jest.spyOn(console, 'error');

jest.mock('../../src/ducks/load', () => ({
  loadModule: jest.fn(() => Promise.resolve({})),
}));

describe('composeModules', () => {
  it('should return a thunk', () => {
    const thunk = composeModules([]);
    expect(thunk).toBeInstanceOf(Function);
  });

  it('should recursively load submodules', () => {
    expect.assertions(3);
    const thunk = composeModules([
      { name: 'sub-module-a', props: { someParam: 'x' } },
      { name: 'sub-module-b' },
    ]);

    const subModuleA = () => null;
    const subModuleALoad = jest.fn();
    subModuleA[LOAD_KEY] = subModuleALoad;
    const subModuleB = () => null;

    // Disabling global-require rule because it is required for jest mockImplementationOnce
    const { loadModule } = require('../../src/ducks/load'); // eslint-disable-line global-require -- require for tests

    loadModule.mockImplementationOnce(() => Promise.resolve(subModuleA))
      .mockImplementationOnce(() => Promise.resolve(subModuleB));

    const dispatch = (x) => x;

    return thunk(dispatch)
      .then(() => {
        expect(loadModule).toHaveBeenCalledWith('sub-module-a');
        expect(loadModule).toHaveBeenCalledWith('sub-module-b');
        expect(subModuleALoad).toHaveBeenCalledWith({ someParam: 'x' });
      });
  });

  it('should resolve even if module load failed', () => {
    expect.assertions(1);
    const thunk = composeModules([{ name: 'my-submodule' }]);

    // Disabling global-require rule because it is required for jest mockImplementationOnce
    const { loadModule } = require('../../src/ducks/load'); // eslint-disable-line global-require -- require for tests

    const moduleLoadError = new Error('Failed to load Module');
    loadModule.mockImplementationOnce(() => Promise.reject(moduleLoadError));
    const dispatch = (x) => x;

    return thunk(dispatch)
      .then(([error]) => {
        expect(error).toBe(moduleLoadError);
        expect(consoleError).toHaveBeenCalledTimes(1);
        expect(consoleError).toHaveBeenCalledWith(
          'Error while attempting to call \'load\' or \'loadModuleData\' inside composeModules for my-submodule.',
          error
        );
      });
  });

  it('should work with modules that use loadModuleData', () => {
    expect.assertions(2);
    const loadModuleData = jest.fn(() => Promise.resolve('loadModuleData resolve'));
    const fakeModule = { holocron: { loadModuleData } };
    require('../../src/ducks/load').loadModule // eslint-disable-line global-require -- require for tests
      .mockImplementationOnce(() => Promise.resolve(fakeModule));

    const dispatch = (x) => x;
    const getState = () => null;
    const store = { dispatch, getState };
    const thunk = composeModules([{ name: 'my-submodule', props: { some: 'props' } }]);
    const fetchClient = jest.fn();

    return thunk(dispatch, getState, { fetchClient })
      .then(([loadModuleDataResolve]) => {
        expect(loadModuleData).toHaveBeenCalledWith({
          store, module: fakeModule, ownProps: { some: 'props' }, fetchClient,
        });
        expect(loadModuleDataResolve).toEqual('loadModuleData resolve');
      });
  });

  it('should allow modules to abort without waiting for other modules to load', () => {
    expect.assertions(2);
    const error = new Error('loadModuleData reject');
    error.abortComposeModules = true;
    const abortingModule = { holocron: { loadModuleData: () => Promise.reject(error) } };
    let resolveOtherPromise;
    const otherPromise = new Promise((resolve) => { resolveOtherPromise = resolve; });
    const otherModule = { holocron: { loadModuleData: () => otherPromise } };

    require('../../src/ducks/load').loadModule // eslint-disable-line global-require -- require for tests
      .mockImplementationOnce(() => Promise.resolve(otherModule))
      .mockImplementationOnce(() => Promise.resolve(abortingModule));

    const dispatch = (x) => x;
    const getState = () => null;
    const thunk = composeModules([{ name: 'my-submodule', props: { some: 'props' } }]);
    const fetchClient = jest.fn();

    return thunk(dispatch, getState, { fetchClient })
      .catch((err) => {
        expect(err).toBe(error);
        expect(consoleError).toHaveBeenCalledTimes(1);
        expect(consoleError).toHaveBeenCalledWith(
          'Error while attempting to call \'load\' or \'loadModuleData\' inside composeModules for my-submodule.',
          error
        );
        resolveOtherPromise();
      });
  });
});
/* eslint-enable jest/no-conditional-expect -- test conditionally */
