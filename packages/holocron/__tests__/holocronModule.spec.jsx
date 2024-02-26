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

/* eslint-disable react/prop-types, import/no-extraneous-dependencies -- disable for tests */
import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { thunk, withExtraArgument } from 'redux-thunk';
import { combineReducers as immutableCombineReducers } from 'redux-immutable';
import { Provider, connect } from 'react-redux';
import { fromJS } from 'immutable';
import _ from 'lodash';
import { render, screen, act } from '@testing-library/react';

import holocronModule, {
  executeLoad,
  executeLoadModuleData,
  executeLoadingFunctions,
} from '../src/holocronModule';
import { REDUCER_KEY, LOAD_KEY } from '../src/ducks/constants';

const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const warn = jest.spyOn(console, 'warn');
const error = jest.spyOn(console, 'error');

describe('holocronModule', () => {
  let fakeLoadModuleData;
  let FakeComponent;
  let fakeDispatch;
  let fakeGetState;
  let fakeFetchClient;
  let fakeProps;
  let fakeSetState;
  let fakeInstance;
  let fakeLoad;
  beforeEach(() => {
    jest.resetAllMocks();
    FakeComponent = {
      displayName: 'FakeComponent',
    };
    fakeLoadModuleData = jest.fn(async () => undefined);
    fakeFetchClient = jest.fn();
    fakeGetState = jest.fn();
    fakeDispatch = jest.fn((func) => func(fakeDispatch, fakeGetState, {
      fetchClient: fakeFetchClient,
    })
    );
    fakeSetState = jest.fn();
    fakeProps = {
      dispatch: fakeDispatch,
      load: fakeLoad,
    };
    fakeInstance = {
      setStatus: fakeSetState,
      mounted: true,
      loadCount: 0,
    };
  });
  afterEach(() => {
    global.BROWSER = false;
  });
  const TestComponent = ({ moduleLoadStatus }) => (
    <div>
      <h1>Mock Module</h1>
      <p role="status">{moduleLoadStatus}</p>
    </div>
  );

  describe('executeLoad', () => {
    it('should return undefined with no args', () => {
      expect(executeLoad()).toEqual(undefined);
    });

    it('should call load with props', () => {
      fakeProps = {
        dispatch: jest.fn(),
        load: jest.fn((arg) => arg),
        myFakeProp: true,
      };
      executeLoad(fakeProps);
      expect(warn).toHaveBeenCalled();
      expect(fakeProps.load).toHaveBeenCalledWith({ myFakeProp: true });
    });
  });

  describe('executeLoadModuleData', () => {
    it('should call loadModuleData with correct args', async () => {
      expect.assertions(2);
      await executeLoadModuleData(fakeLoadModuleData, FakeComponent, {
        dispatch: fakeDispatch,
      });
      expect(fakeLoadModuleData.mock.calls).toMatchSnapshot();
      expect(fakeProps.dispatch).toHaveBeenCalled();
    });
  });

  describe('executeLoadingFunctions', () => {
    it('should call setStatus with loaded', async () => {
      expect.assertions(1);
      await executeLoadingFunctions({
        loadModuleData: fakeLoadModuleData,
        WrappedComponent: FakeComponent,
        frozenProps: fakeProps,
        currentLoadCount: 0,
        componentName: 'FakeComponent',
        hocInstance: { ...fakeInstance },
      });
      expect(fakeSetState).toHaveBeenCalledWith('loaded');
    });

    it('should not call setStatus if over loadCount', async () => {
      expect.assertions(1);
      await executeLoadingFunctions({
        loadModuleData: fakeLoadModuleData,
        WrappedComponent: FakeComponent,
        frozenProps: fakeProps,
        loadCount: 0,
        componentName: 'FakeComponent',
        hocInstance: {
          ...fakeInstance,
          mounted: false,
          loadCount: 9999,
        },
      });
      expect(fakeSetState).not.toHaveBeenCalled();
    });

    it('should call setStatus with error on failure', async () => {
      expect.assertions(1);
      fakeLoadModuleData = () => {
        throw new Error('Failed');
      };
      await executeLoadingFunctions({
        loadModuleData: fakeLoadModuleData,
        WrappedComponent: FakeComponent,
        frozenProps: fakeProps,
        currentLoadCount: 0,
        componentName: 'FakeComponent',
        hocInstance: { ...fakeInstance },
      });
      expect(fakeSetState).toHaveBeenCalledWith('error');
    });

    it('should not call setStatus if unmounted on failure', async () => {
      expect.assertions(2);
      fakeLoadModuleData = () => {
        throw new Error('Failed');
      };
      await executeLoadingFunctions({
        loadModuleData: fakeLoadModuleData,
        WrappedComponent: FakeComponent,
        frozenProps: fakeProps,
        currentLoadCount: 0,
        componentName: 'FakeComponent',
        hocInstance: {
          ...fakeInstance,
          mounted: false,
        },
      });
      expect(error).toHaveBeenCalled();
      expect(fakeSetState).not.toHaveBeenCalled();
    });
  });

  it('should wrap module with no arguments', () => {
    const MyModuleComponent = holocronModule()(() => <div>Mock Module</div>);
    const mockStore = createStore(
      (state) => state,
      fromJS({ modules: { 'mock-module': { key: 'value' } } })
    );
    const renderedModule = render(
      <MyModuleComponent store={mockStore} />
    ).asFragment();

    expect(renderedModule).toMatchSnapshot();
  });

  it('should provide the module state as a plain JS prop if a reducer is provided', () => {
    const reducer = (state) => state;
    const Module = holocronModule({
      name: 'mock-module',
      reducer,
    })(({ moduleState }) => <div>{moduleState.key}</div>);
    const mockStore = createStore(
      (state) => state,
      fromJS({ modules: { 'mock-module': { key: 'value' } } })
    );
    const component = render(<Module store={mockStore} />).asFragment();
    expect(component).toMatchSnapshot();
  });

  it('should provide state configured by mapStateToProps when a reducer is provided', () => {
    const reducer = (state) => state;
    const Module = holocronModule({
      name: 'mock-module',
      reducer,
      mapStateToProps: () => ({ mapStateToPropsProp: 'mapStateToPropsProp' }),
    })(({ mapStateToPropsProp }) => <div>{mapStateToPropsProp}</div>);
    const mockStore = createStore(
      (state) => state,
      fromJS({ modules: { 'mock-module': { key: 'value' } } })
    );
    const component = render(<Module store={mockStore} />).asFragment();
    expect(component).toMatchSnapshot();
  });

  it('should provide state configured by mapStateToProps when a reducer is NOT provided', () => {
    const Module = holocronModule({
      name: 'mock-module',
      mapStateToProps: () => ({ mapStateToPropsProp: 'mapStateToPropsProp' }),
    })(({ mapStateToPropsProp }) => <div>{mapStateToPropsProp}</div>);
    const mockStore = createStore(
      (state) => state,
      fromJS({ modules: { 'mock-module': { key: 'value' } } })
    );
    const component = render(<Module store={mockStore} />).asFragment();
    expect(component).toMatchSnapshot();
  });

  it('should not rerender if module state has not changed', () => {
    const renderSpy = jest.fn();
    const moduleReducer = (state) => state || {};
    const InnerModule = () => {
      renderSpy();
      return <div>Mock Module</div>;
    };
    const Module = holocronModule({
      name: 'mock-module',
      reducer: moduleReducer,
    })(InnerModule);
    const appReducer = (state, action) => (action.type === 'MOCK_ACTION_TYPE' ? action.newState : state || {});
    const reducer = immutableCombineReducers({
      app: appReducer,
      modules: immutableCombineReducers({
        'mock-module': moduleReducer,
      }),
    });
    const mockStore = createStore(
      reducer,
      fromJS({
        app: { someParam: 'initial' },
        modules: { 'mock-module': { key: 'value' } },
      })
    );
    render(<Module store={mockStore} />);
    mockStore.dispatch({
      type: 'MOCK_ACTION_TYPE',
      newState: { someParam: 'new' },
    });
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });

  it("should dispatch the module's load action on when component mount's with no preloaded state", () => {
    const load = jest.fn(() => () => Promise.resolve());
    const Module = holocronModule({
      name: 'mock-module',
      load,
    })(() => <div>Mock Module</div>);
    const mockStore = createStore((state) => state, applyMiddleware(thunk));
    const props = { a: 'b', x: { y: 'z' } };
    render(
      <Provider store={mockStore}>
        <Module {...props} />
      </Provider>
    );
    // couldn't use toHaveBeenCalledWith because mapDispatchToProps is used
    const calledProps = load.mock.calls[0][0];
    const calledPropsWithoutFunctions = _.pickBy(
      calledProps,
      (p) => typeof p !== 'function'
    );
    expect(calledPropsWithoutFunctions).toEqual(props);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("should dispatch the module's load action if it receives new props that pass shouldModuleReload", () => {
    const load = jest.fn(() => () => Promise.resolve());
    const Module = connect((state) => state)(
      holocronModule({
        name: 'mock-module',
        load,
        shouldModuleReload: (currProps, nextProps) => currProps.someParam !== nextProps.someParam,
      })(() => <div>Mock Module</div>)
    );
    const mockStore = createStore(
      (state, action) => (action.type === 'MOCK_ACTION_TYPE' ? action.newState : state),
      { someParam: 'initial' },
      applyMiddleware(thunk)
    );
    render(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    );
    expect(load).toHaveBeenCalledTimes(1);
    act(() => {
      mockStore.dispatch({
        type: 'MOCK_ACTION_TYPE',
        newState: { someParam: 'new' },
      });
    });
    // couldn't use toHaveBeenCalledWith because mapDispatchToProps is used
    const calledProps = load.mock.calls[1][0];
    const calledPropsWithoutFunctions = _.pickBy(
      calledProps,
      (p) => typeof p !== 'function'
    );
    expect(calledPropsWithoutFunctions).toEqual({ someParam: 'new' });
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("should not dispatch the module's load action if it receives new props that do not pass shouldModuleReload", () => {
    const load = jest.fn(() => ({ type: 'LOAD' }));
    const Module = connect((state) => state)(
      holocronModule({
        name: 'mock-module',
        load,
        shouldModuleReload: (currProps, nextProps) => currProps.someParam !== nextProps.someParam,
      })(() => <div>Mock Module</div>)
    );
    const mockStore = createStore(
      (state, action) => (action.type === 'MOCK_ACTION_TYPE' ? action.newState : state),
      { someParam: 'initial' }
    );
    render(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    );
    expect(load).toHaveBeenCalledTimes(1);
    const { dispatch } = mockStore;
    dispatch({
      type: 'MOCK_ACTION_TYPE',
      newState: { someParam: 'initial', differentParam: 'new' },
    });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("should not dispatch the module's load action if no shouldModuleReload function is provided", () => {
    const load = jest.fn(() => ({ type: 'LOAD' }));
    const Module = connect((state) => state)(
      holocronModule({
        name: 'mock-module',
        load,
      })(() => <div>Mock Module</div>)
    );
    const mockStore = createStore(
      (state, action) => (action.type === 'MOCK_ACTION_TYPE' ? action.newState : state),
      { someParam: 'initial' }
    );
    render(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    );
    expect(load).toHaveBeenCalledTimes(1);
    const { dispatch } = mockStore;
    dispatch({ type: 'MOCK_ACTION_TYPE', newState: { someParam: 'new' } });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('should pass the moduleLoadStatus prop as loading when loading', () => {
    const loadPromise = Promise.resolve();
    const load = jest.fn(() => () => loadPromise);
    const Module = holocronModule({
      name: 'mock-module',
      load,
    })(TestComponent);
    const mockStore = createStore((state) => state, applyMiddleware(thunk));

    render(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    );

    expect(screen.getByRole('status')).toHaveTextContent('loading');
  });

  it('should pass the moduleLoadStatus prop as loaded when loaded', async () => {
    const loadPromise = Promise.resolve();
    const load = jest.fn(() => () => loadPromise);
    const Module = holocronModule({
      name: 'mock-module',
      load,
    })(TestComponent);
    const mockStore = createStore(
      (state) => state,
      applyMiddleware(withExtraArgument({ fetchClient: jest.fn() }))
    );

    render(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    );

    // Wait one cycle of the event loop since we can't retrieve a promise from initiateLoad
    await sleep(1);
    expect(screen.getByRole('status')).toHaveTextContent('loaded');
  });

  it('should pass the moduleLoadStatus prop as error when it failed to load', async () => {
    const loadPromise = Promise.reject();
    const load = jest.fn(() => () => loadPromise);
    const Module = holocronModule({
      name: 'mock-module',
      load,
    })(TestComponent);
    const mockStore = createStore((state) => state, applyMiddleware(thunk));

    render(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    );
    await sleep(1);
    expect(screen.getByRole('status')).toHaveTextContent('error');
  });

  it('should gracefully handle load not returning a Promise', () => {
    const load = jest.fn(() => () => 'not a promise');
    const Module = holocronModule({
      name: 'mock-module',
      load,
    })(({ moduleLoadStatus }) => <div>Mock Module - {moduleLoadStatus}</div>);
    const mockStore = createStore((state) => state, applyMiddleware(thunk));
    const renderedModule = render(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    ).asFragment();

    // It passes if no errors are thrown
    expect(renderedModule).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          Mock Module - loading
        </div>
      </DocumentFragment>
    `);
  });

  it('should have a helpful display name', () => {
    const name = 'mock-module';
    const SomeComponent = () => <div />;
    SomeComponent.displayName = 'DisplayName';
    function FuncName() {
      return <div />;
    }
    expect(holocronModule({ name })(SomeComponent).displayName).toBe(
      'Connect(HolocronModule(DisplayName))'
    );
    expect(holocronModule({ name })(FuncName).displayName).toBe(
      'Connect(HolocronModule(FuncName))'
    );
    expect(holocronModule({ name })(() => <div />).displayName).toBe(
      'Connect(HolocronModule(mock-module))'
    );
  });

  it('should attach the load function as a static if it is on the browser', () => {
    global.BROWSER = true;
    const InnerModule = () => <div>Mock Module</div>;
    const load = () => null;

    const BrowserModule = holocronModule({
      name: 'mock-module',
      load,
    })(InnerModule);

    expect(BrowserModule[LOAD_KEY]).toBe(load);
  });

  it('should attach the load function as a static on the server if the ssr option is set', () => {
    const InnerModule = () => <div>Mock Module</div>;
    const load = () => null;

    const ModuleWithSSROption = holocronModule({
      name: 'mock-module',
      load,
      options: { ssr: true },
    })(InnerModule);

    expect(ModuleWithSSROption[LOAD_KEY]).toBe(load);
  });

  it('should not attach the load function as a static on the server if ssr option is not set', () => {
    const InnerModule = () => <div>Mock Module</div>;
    const load = () => null;

    const ModuleWithoutSSROption = holocronModule({
      name: 'mock-module',
      load,
    })(InnerModule);

    expect(ModuleWithoutSSROption[LOAD_KEY]).toBeUndefined();
  });

  it('should add reducer as a static', () => {
    const InnerModule = () => <div>Mock Module</div>;
    const reducer = (state) => state;
    const Module = holocronModule({
      name: 'mock-module',
      reducer,
    })(InnerModule);
    expect(Module[REDUCER_KEY]).toBe(reducer);
  });

  it('should hoist non react statics', () => {
    const InnerModule = () => <div>Mock Module</div>;
    InnerModule.someStatic = 'static property';
    const Module = holocronModule({
      name: 'mock-module',
    })(InnerModule);
    expect(Module.someStatic).toBe('static property');
  });

  it('should pass mergeProps to connect if it is specified', () => {
    const reducer = () => fromJS({ x: 3 });
    const mergeProps = (stateProps, dispatchProps, ownProps) => {
      const xy = stateProps.moduleState.x * ownProps.y;
      return {
        ...stateProps,
        ...dispatchProps,
        ...ownProps,
        xy,
      };
    };
    const Module = holocronModule({
      name: 'mock-module',
      reducer,
      mergeProps,
    })(({ moduleState: { x }, y, xy }) => (
      <div>
        {x} * {y} = {xy}
      </div>
    ));
    const mockStore = createStore(
      (state) => state,
      fromJS({ modules: { 'mock-module': { x: 3 } } })
    );
    const component = render(
      <Provider store={mockStore}>
        <Module y={4} />
      </Provider>
    ).asFragment();
    expect(component).toMatchSnapshot();
  });

  it('should pass the moduleState to the module by default, if a reducer and name are specified', () => {
    const reducer = () => fromJS({ mockKey: 'mockValue' });
    const Module = holocronModule({
      name: 'mock-module',
      reducer,
    })(({ moduleState }) => (
      <div>
        {JSON.stringify(moduleState)}|{typeof moduleState}
      </div>
    ));
    const mockStore = createStore(
      (state) => state,
      fromJS({ modules: { 'mock-module': { mockKey: 'mockValue' } } })
    );
    const component = render(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    ).asFragment();
    expect(component).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          {"mockKey":"mockValue"}|object
        </div>
      </DocumentFragment>
    `);
  });

  it('should not pass the moduleState to the module if options.provideModuleState is passed as false', () => {
    const reducer = () => fromJS({ mockKey: 'mockValue' });
    const Module = holocronModule({
      name: 'mock-module',
      reducer,
      options: {
        provideModuleState: false,
      },
    })(({ moduleState }) => (
      <div>
        {JSON.stringify(moduleState)}|{typeof moduleState}
      </div>
    ));
    const mockStore = createStore(
      (state) => state,
      fromJS({ modules: { 'mock-module': { mockKey: 'mockValue' } } })
    );
    const component = render(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    ).asFragment();
    expect(component).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          |undefined
        </div>
      </DocumentFragment>
    `);
  });

  it('should pass the moduleState to the module if options is passed without the `provideModuleState` key for backwards compatibility', () => {
    const reducer = () => fromJS({ mockKey: 'mockValue' });
    const Module = holocronModule({
      name: 'mock-module',
      reducer,
      options: {
        someOtherKey: 'someValue',
      },
    })(({ moduleState }) => (
      <div>
        {JSON.stringify(moduleState)}|{typeof moduleState}
      </div>
    ));
    const mockStore = createStore(
      (state) => state,
      fromJS({ modules: { 'mock-module': { mockKey: 'mockValue' } } })
    );
    const component = render(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    ).asFragment();
    expect(component).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          {"mockKey":"mockValue"}|object
        </div>
      </DocumentFragment>
    `);
  });

  it('should gracefully handle module state missing from store', () => {
    const reducer = () => fromJS({ x: 2 });
    const Module = holocronModule({
      name: 'mock-module',
      reducer,
    })(({ moduleState }) => <div>Mock Module {moduleState.x}</div>);
    const mockStore = createStore((state) => state, fromJS({ modules: {} }));
    const renderComponent = () => render(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    ).asFragment();
    expect(renderComponent).not.toThrow();
    expect(renderComponent()).toMatchSnapshot();
  });

  it('should warn if a reducer is set but no name', () => {
    const reducer = () => {};
    const Module = holocronModule({
      reducer,
    })(() => <div>Mock Module</div>);
    const mockStore = createStore((state) => state, fromJS({}));
    render(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    );
    expect(warn.mock.calls).toMatchSnapshot();
  });
});
/* eslint-enable react/prop-types, import/no-extraneous-dependencies -- enable */
