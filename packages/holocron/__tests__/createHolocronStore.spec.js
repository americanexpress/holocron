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

import { Map as iMap, Set as iSet, fromJS } from 'immutable';

import { REDUCER_KEY, REGISTER_MODULE_REDUCER, MODULE_REDUCER_ADDED } from '../src/ducks/constants';

import createHolocronStore from '../src/createHolocronStore';

const mockReducerKey = REDUCER_KEY;
jest.mock('../src/moduleRegistry', () => {
  // eslint-disable-next-line global-require
  const immutable = require('immutable');

  const createModuleReducer = (moduleName) => {
    const moduleReducer = (state = immutable.fromJS({ moduleName })) => state;
    if (moduleName !== 'moduleWithoutVitruvius') {
      moduleReducer.buildInitialState = (data) => data;
    }
    return moduleReducer;
  };

  return {
    getModule: jest.fn((moduleName) => {
      if (moduleName && moduleName.endsWith('LoadError')) {
        return undefined;
      }

      return { [mockReducerKey]: createModuleReducer(moduleName) };
    }),
    getModules: () => 'modules',
  };
});

describe('createHolocronStore', () => {
  const defaultAppState = 'app state';
  const defaultAppReducer = (state = { app: defaultAppState }) => state;
  const helpers = (function helpers() {
    const getStateFromSource = (callback) => ({ store, state } = {}) => callback(
      state || store ? store.getState() : iMap()
    );

    return {
      getState: getStateFromSource((state) => state),
      getModules: getStateFromSource((state) => state.get('modules')),
    };
  }());

  describe('initialization', () => {
    const initialStateLabel = 'immutable-initial-state';
    it('should throw if initialState is not immutable', () => {
      expect.assertions(7);

      const create = (initialState) => createHolocronStore({
        reducer: defaultAppReducer,
        initialState,
      });

      expect(() => {
        create(true);
      }).toThrowErrorMatchingSnapshot(initialStateLabel);
      expect(() => {
        create('true');
      }).toThrowErrorMatchingSnapshot(initialStateLabel);
      expect(() => {
        create(Math.exp(Math.random()));
      }).toThrowErrorMatchingSnapshot(initialStateLabel);
      expect(() => {
        create([{}]);
      }).toThrowErrorMatchingSnapshot(initialStateLabel);
      expect(() => {
        create({ ...defaultAppReducer() });
      }).toThrowErrorMatchingSnapshot(initialStateLabel);
      expect(() => {
        create({ ...defaultAppReducer(), holocron: fromJS({}) });
      }).toThrowErrorMatchingSnapshot(initialStateLabel);
      expect(() => {
        create({ '@@__IMMUTABLE_ITERABLE__@@': false, ...iMap() });
      }).toThrowErrorMatchingSnapshot(initialStateLabel);
    });
  });

  describe('rebuildReducer', () => {
    it('should rebuild the store reducers with all registered module reducers', () => {
      const store = createHolocronStore({
        reducer: defaultAppReducer,
        initialState: fromJS({
          ...defaultAppReducer(),
          holocron: { withReducers: ['moduleA', 'moduleB'] },
        }),
      });
      expect(helpers.getModules({ store })).toEqual(fromJS({
        moduleA: { moduleName: 'moduleA' },
        moduleB: { moduleName: 'moduleB' },
      }));
    });

    it('should rebuild the store correctly if there are no registered module reducers', () => {
      const store = createHolocronStore({
        reducer: defaultAppReducer,
        initialState: fromJS({
          ...defaultAppReducer(),
          holocron: {},
        }),
      });
      expect(helpers.getModules({ store })).toEqual(fromJS({}));
    });

    it('should skip adding reducers of modules that failed to load', () => {
      const store = createHolocronStore({
        reducer: defaultAppReducer,
        initialState: fromJS({
          ...defaultAppReducer(),
          holocron: { withReducers: ['moduleA', 'moduleLoadError', 'moduleB'] },
        }),
      });
      expect(helpers.getModules({ store })).toEqual(fromJS({
        moduleA: { moduleName: 'moduleA' },
        moduleB: { moduleName: 'moduleB' },
      }));
    });

    it('should handle no new module state', () => {
      const store = createHolocronStore({
        reducer: defaultAppReducer,
        initialState: fromJS({
          ...defaultAppReducer(),
          holocron: { withReducers: ['moduleA', 'moduleB'] },
        }),
      });
      expect(helpers.getModules({ store })).toEqual(fromJS({
        moduleA: { moduleName: 'moduleA' },
        moduleB: { moduleName: 'moduleB' },
      }));
      store.rebuildReducer();
      expect(helpers.getModules({ store })).toEqual(fromJS({
        moduleA: { moduleName: 'moduleA' },
        moduleB: { moduleName: 'moduleB' },
      }));
    });
  });

  it('should use vitruvius to generate initial module state', () => {
    const store = createHolocronStore({
      reducer: defaultAppReducer,
      initialState: fromJS({
        ...defaultAppReducer(),
        holocron: { withReducers: ['myModule'] },
      }),
      localsForBuildInitialState: {
        foo: 'bar',
      },
    });
    store.dispatch({ type: MODULE_REDUCER_ADDED });
    expect(helpers.getModules({ store })).toEqual(iMap({
      myModule: { foo: 'bar' },
    }));
  });

  it('should use vitruvius to generate initial module state as modules are added', () => {
    const store = createHolocronStore({
      reducer: defaultAppReducer,
      initialState: fromJS({
        ...defaultAppReducer(),
        holocron: { withReducers: iSet(['moduleA']) },
      }),
      localsForBuildInitialState: {
        foo: 'bar',
      },
    });
    store.dispatch({ type: MODULE_REDUCER_ADDED });
    store.dispatch({
      type: REGISTER_MODULE_REDUCER,
      moduleName: 'moduleB',
    });
    store.rebuildReducer();
    store.dispatch({ type: MODULE_REDUCER_ADDED });
    expect(helpers.getModules({ store })).toEqual(iMap({
      moduleA: { foo: 'bar' },
      moduleB: { foo: 'bar' },
    }));
  });

  it('should work with modules that dont implement vitruvius', () => {
    const store = createHolocronStore({
      reducer: defaultAppReducer,
      initialState: fromJS({
        ...defaultAppReducer(),
        holocron: { withReducers: ['myModule', 'moduleWithoutVitruvius'] },
      }),
      localsForBuildInitialState: {
        foo: 'bar',
      },
    });
    store.dispatch({ type: MODULE_REDUCER_ADDED });
    expect(helpers.getModules({ store })).toEqual(iMap({
      myModule: { foo: 'bar' },
      moduleWithoutVitruvius: iMap({ moduleName: 'moduleWithoutVitruvius' }),
    }));
  });

  it('should add extraThunkArguments as the third argument in thunks', () => {
    const fakeFetch = jest.fn();
    const store = createHolocronStore({
      reducer: defaultAppReducer,
      initialState: fromJS({
        ...defaultAppReducer(),
        holocron: {},
      }),
      extraThunkArguments: {
        fetchClient: fakeFetch,
      },
    });
    const fakeActionCreator = () => (dispatch, getState, { fetchClient }) => {
      fetchClient();
      dispatch({ type: 'FAKE_ACTION' });
    };
    store.dispatch(fakeActionCreator());
    expect(fakeFetch).toHaveBeenCalledTimes(1);
  });

  it('should work with no intial state', () => {
    const fakeFetch = jest.fn();
    const store = createHolocronStore({
      reducer: defaultAppReducer,
      extraThunkArguments: {
        fetchClient: fakeFetch,
      },
    });
    const fakeActionCreator = () => (dispatch, getState, { fetchClient }) => {
      fetchClient();
      dispatch({ type: 'FAKE_ACTION' });
    };
    expect(() => store.dispatch(fakeActionCreator())).not.toThrow();
  });

  it('should not add the modules to the store in the browser', () => {
    global.BROWSER = true;
    const fakeFetch = jest.fn();
    const store = createHolocronStore({
      reducer: defaultAppReducer,
      extraThunkArguments: {
        fetchClient: fakeFetch,
      },
    });
    expect(store.modules).toBe(undefined);
  });

  it('should add the modules to the store on the server', () => {
    global.BROWSER = false;
    const fakeFetch = jest.fn();
    const store = createHolocronStore({
      reducer: defaultAppReducer,
      extraThunkArguments: {
        fetchClient: fakeFetch,
      },
    });
    expect(store.modules).toBe('modules');
  });

  it('should apply the given enhancer to the store', () => {
    global.BROWSER = false;
    const fakeFetch = jest.fn();
    const myEnhancer = jest.fn((createReduxStore) => (appReducer, preloadedState, enhancer) => {
      const store = createReduxStore(appReducer, preloadedState, enhancer);
      return {
        ...store,
        enhanced: true,
      };
    });
    const store = createHolocronStore({
      reducer: defaultAppReducer,
      extraThunkArguments: {
        fetchClient: fakeFetch,
      },
      enhancer: myEnhancer,
    });
    expect(store.modules).toBe('modules');
    expect(store.enhanced).toBe(true);
  });
});
