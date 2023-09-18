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

import React from 'react';
import { ReactReduxContext } from 'react-redux';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import RenderModule from '../src/RenderModule';

// eslint-disable-next-line react/prop-types
const MyTestModule = ({ children, ...otherProperties }) => (
  <div>
    {JSON.stringify(otherProperties, undefined, 2)}
    {children}
  </div>
);

const store = {
  modules: fromJS({
    'my-test-module': MyTestModule,
  }),
  getState: jest.fn(() => fromJS({
    holocron: {
      loaded: {
        'my-test-module': true,
      },
    },
  })),
};

describe('RenderModule', () => {
  const consoleWarn = jest.spyOn(console, 'warn');

  beforeEach(() => jest.clearAllMocks());

  it('should warn and render null when it cannot find a module in registry', () => {
    expect.assertions(2);

    const tree = mount(
      <ReactReduxContext.Provider value={{ store }}>
        <RenderModule moduleName="not-in-module-map" />
      </ReactReduxContext.Provider>
    );
    expect(consoleWarn.mock.calls).toMatchSnapshot();
    expect(tree).toMatchSnapshot();
  });

  it('should warn and render null when module is not loaded', () => {
    store.getState.mockImplementationOnce(() => fromJS({
      holocron: {
        loaded: {},
      },
    }));
    expect.assertions(2);

    const tree = mount(
      <ReactReduxContext.Provider value={{ store }}>
        <RenderModule moduleName="not-in-module-map" />
      </ReactReduxContext.Provider>
    );
    expect(consoleWarn.mock.calls).toMatchSnapshot();
    expect(tree).toMatchSnapshot();
  });

  it('should render a module', () => {
    expect.assertions(1);

    const tree = mount(
      <ReactReduxContext.Provider value={{ store }}>
        <RenderModule moduleName="my-test-module" />
      </ReactReduxContext.Provider>
    );
    expect(tree).toMatchSnapshot();
  });

  it('should pass props to the module', () => {
    expect.assertions(1);

    const properties = { hello: 'world', foo: 'bar' };
    const tree = mount(
      <ReactReduxContext.Provider value={{ store }}>
        <RenderModule moduleName="my-test-module" props={properties} />
      </ReactReduxContext.Provider>
    );
    expect(tree).toMatchSnapshot();
  });

  it('should pass children to the module', () => {
    expect.assertions(1);

    const tree = mount(
      <ReactReduxContext.Provider value={{ store }}>
        <RenderModule moduleName="my-test-module"><h1>Hello, world</h1></RenderModule>
      </ReactReduxContext.Provider>
    );
    expect(tree).toMatchSnapshot();
  });
});
