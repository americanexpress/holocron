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

/* eslint-disable react/prop-types, import/no-extraneous-dependencies  */
import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { combineReducers as immutableCombineReducers } from 'redux-immutable';
import { Provider, connect } from 'react-redux';
import { fromJS } from 'immutable';
import renderer from 'react-test-renderer';
import _ from 'lodash';

import holocronModule from '../src/holocronModule';
import { REDUCER_KEY, LOAD_KEY } from '../src/ducks/constants';

const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

describe('holocronModule', () => {
  afterEach(() => {
    global.BROWSER = false;
  });

  it('should throw an error if a name is not provided', () => {
    function createHolocronModule() {
      holocronModule({})(() => <div>Mock Module</div>);
    }

    expect(createHolocronModule).toThrowErrorMatchingSnapshot();
  });

  it('should provide the module state as a plain JS prop if a reducer is provided', () => {
    const reducer = (state) => state;
    const Module = holocronModule({
      name: 'mock-module',
      reducer,
    })(({ moduleState }) => <div>{moduleState.key}</div>);
    const mockStore = createStore((state) => state, fromJS({ modules: { 'mock-module': { key: 'value' } } }));
    const component = renderer.create(<Module store={mockStore} />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should not rerender if module state has not changed', () => {
    const renderSpy = jest.fn();
    const moduleReducer = (state) => state || {};
    const InnerModule = () => { renderSpy(); return <div>Mock Module</div>; };
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
      fromJS({ app: { someParam: 'initial' }, modules: { 'mock-module': { key: 'value' } } })
    );
    renderer.create(<Module store={mockStore} />);
    mockStore.dispatch({ type: 'MOCK_ACTION_TYPE', newState: { someParam: 'new' } });
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });

  it('should dispatch the module\'s load action on componentDidMount with no preloaded state', () => {
    global.INITIAL_STATE = undefined;
    const load = jest.fn(() => () => Promise.resolve());
    const Module = holocronModule({
      name: 'mock-module',
      load,
    })(() => <div>Mock Module</div>);
    const mockStore = createStore((state) => state, applyMiddleware(thunk));
    const props = { a: 'b', x: { y: 'z' } };
    renderer.create(
      <Provider store={mockStore}>
        <Module {...props} />
      </Provider>
    );
    // couldn't use toHaveBeenCalledWith because mapDispatchToProps is used
    const calledProps = load.mock.calls[0][0];
    const calledPropsWithoutFunctions = _.pickBy(calledProps, (p) => typeof p !== 'function');
    expect(calledPropsWithoutFunctions).toEqual(props);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('should not dispatch the module\'s load action on client takeover of a server render', () => {
    global.INITIAL_STATE = { some: 'state' };
    const load = jest.fn(() => () => Promise.resolve());
    const Module = holocronModule({
      name: 'mock-module',
      load,
    })(() => <div>Mock Module</div>);
    const mockStore = createStore((state) => state, applyMiddleware(thunk));
    renderer.create(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    );
    expect(load).not.toHaveBeenCalled();
  });

  it('should not dispatch the module\'s load action on the server render', () => {
    const load = jest.fn();
    const Module = holocronModule({
      name: 'mock-module',
      load,
    })(({ moduleLoadStatus }) => <div>Mock Module - {moduleLoadStatus}</div>);
    const mockStore = createStore((state) => state);
    renderer.create(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    );
    expect(load).not.toHaveBeenCalled();
  });

  it('should dispatch the module\'s load action if it receives new props that pass shouldModuleReload', () => {
    const load = jest.fn(() => () => Promise.resolve());
    const Module = connect((state) => state)(holocronModule({
      name: 'mock-module',
      load,
      shouldModuleReload: (currProps, nextProps) => currProps.someParam !== nextProps.someParam,
    })(() => <div>Mock Module</div>));
    const mockStore = createStore(
      (state, action) => (action.type === 'MOCK_ACTION_TYPE' ? action.newState : state),
      { someParam: 'initial' },
      applyMiddleware(thunk)
    );
    renderer.create(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    );
    mockStore.dispatch({ type: 'MOCK_ACTION_TYPE', newState: { someParam: 'new' } });
    // couldn't use toHaveBeenCalledWith because mapDispatchToProps is used
    const calledProps = load.mock.calls[0][0];
    const calledPropsWithoutFunctions = _.pickBy(calledProps, (p) => typeof p !== 'function');
    expect(calledPropsWithoutFunctions).toEqual({ someParam: 'new' });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('should not dispatch the module\'s load action if it receives new props that do not pass shouldModuleReload', () => {
    const load = jest.fn(() => ({ type: 'LOAD' }));
    const Module = connect((state) => state)(holocronModule({
      name: 'mock-module',
      load,
      shouldModuleReload: (currProps, nextProps) => currProps.someParam !== nextProps.someParam,
    })(() => <div>Mock Module</div>));
    const mockStore = createStore((state, action) => (action.type === 'MOCK_ACTION_TYPE' ? action.newState : state), { someParam: 'initial' });
    renderer.create(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    );
    const { dispatch } = mockStore;
    dispatch({ type: 'MOCK_ACTION_TYPE', newState: { someParam: 'initial', differentParam: 'new' } });
    expect(load).not.toHaveBeenCalled();
  });

  it('should not dispatch the module\'s load action if no shouldModuleReload function is provided', () => {
    const load = jest.fn(() => ({ type: 'LOAD' }));
    const Module = connect((state) => state)(holocronModule({
      name: 'mock-module',
      load,
    })(() => <div>Mock Module</div>));
    const mockStore = createStore((state, action) => (action.type === 'MOCK_ACTION_TYPE' ? action.newState : state), { someParam: 'initial' });
    renderer.create(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    );
    const { dispatch } = mockStore;
    dispatch({ type: 'MOCK_ACTION_TYPE', newState: { someParam: 'new' } });
    expect(load).not.toHaveBeenCalled();
  });

  // TODO: use enzyme to assert correct props, need to update version of jest first
  it('should pass the moduleLoadStatus prop as loading when loading', () => {
    global.INITIAL_STATE = undefined;
    const loadPromise = Promise.resolve();
    const load = jest.fn(() => () => loadPromise);
    const Module = holocronModule({
      name: 'mock-module',
      load,
    })(({ moduleLoadStatus }) => <div>Mock Module - {moduleLoadStatus}</div>);
    const mockStore = createStore((state) => state, applyMiddleware(thunk));
    const tree = renderer.create(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    );

    expect(tree.toJSON()).toMatchSnapshot();
  });

  // TODO: use enzyme to assert correct props, need to update version of jest first
  it('should pass the moduleLoadStatus prop as loaded when loaded', async () => {
    global.INITIAL_STATE = undefined;
    const loadPromise = Promise.resolve();
    const load = jest.fn(() => () => loadPromise);
    const Module = holocronModule({
      name: 'mock-module',
      load,
    })(({ moduleLoadStatus }) => <div>Mock Module - {moduleLoadStatus}</div>);
    const mockStore = createStore((state) => state, applyMiddleware(thunk));
    const tree = renderer.create(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    );

    // Wait one cycle of the event loop since we can't retrieve a promise from initiateLoad
    await sleep(1);

    return loadPromise
      .then(() => {
        expect(tree.toJSON()).toMatchSnapshot();
      });
  });

  // TODO: use enzyme to assert correct props, need to update version of jest first
  it('should pass the moduleLoadStatus prop as error when it failed to load', () => {
    global.INITIAL_STATE = undefined;
    const loadPromise = Promise.reject();
    const load = jest.fn(() => () => loadPromise);
    const Module = holocronModule({
      name: 'mock-module',
      load,
    })(({ moduleLoadStatus }) => <div>Mock Module - {moduleLoadStatus}</div>);
    const mockStore = createStore((state) => state, applyMiddleware(thunk));
    const tree = renderer.create(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    );

    return loadPromise
      .catch(() => {
        expect(tree.toJSON()).toMatchSnapshot();
      });
  });

  it('should not try to setState if it is not mounted', () => {
    // TODO: actually test this when we update jest and start using enzyme and we can unmount
  });

  it('should gracefully handle load not returning a Promise', () => {
    global.INITIAL_STATE = undefined;
    const load = jest.fn(() => () => 'not a promise');
    const Module = holocronModule({
      name: 'mock-module',
      load,
    })(({ moduleLoadStatus }) => <div>Mock Module - {moduleLoadStatus}</div>);
    const mockStore = createStore((state) => state, applyMiddleware(thunk));
    renderer.create(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    );
    // Don't need to expect anything, it passes if no errors are thrown
  });

  it('should have a helpful display name', () => {
    const name = 'mock-module';
    const SomeComponent = () => <div />;
    SomeComponent.displayName = 'DisplayName';
    function FuncName() { return <div />; }
    expect(holocronModule({ name })(SomeComponent).displayName).toBe('Connect(HolocronModule(DisplayName))');
    expect(holocronModule({ name })(FuncName).displayName).toBe('Connect(HolocronModule(FuncName))');
    expect(holocronModule({ name })(() => <div />).displayName).toBe('Connect(HolocronModule(mock-module))');
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
    })(({ moduleState: { x }, y, xy }) => <div>{x} * {y} = {xy}</div>);
    const mockStore = createStore((state) => state, fromJS({ modules: { 'mock-module': { x: 3 } } }));
    const component = renderer.create(
      <Provider store={mockStore}>
        <Module y={4} />
      </Provider>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should gracefully handle module state missing from store', () => {
    const reducer = () => fromJS({ x: 2 });
    const Module = holocronModule({
      name: 'mock-module',
      reducer,
    })(({ moduleState }) => <div>Mock Module {moduleState.x}</div>);
    const mockStore = createStore((state) => state, fromJS({ modules: {} }));
    const render = () => renderer.create(
      <Provider store={mockStore}>
        <Module />
      </Provider>
    );
    expect(render).not.toThrowError();
    expect(render().toJSON()).toMatchSnapshot();
  });
});
