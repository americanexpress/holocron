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

// eslint erroneously believes '@testing-library/react' is not a dev dependency
// eslint-disable-next-line import/no-extraneous-dependencies -- only used in tests
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import RenderModule from '../src/RenderModule';

// eslint-disable-next-line react/prop-types -- disable for tests
const MyTestModule = ({ children, ...otherProps }) => (
  <div>
    <h1>My test module</h1>
    <p>Other Props: {JSON.stringify(otherProps)}</p>
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
  })
  ),
};

describe('RenderModule', () => {
  const consoleWarn = jest.spyOn(console, 'warn');

  beforeEach(() => jest.clearAllMocks());

  it('should warn and render null when it cannot find a module in registry', () => {
    expect.assertions(2);

    const { asFragment } = render(
      <ReactReduxContext.Provider value={{ store }}>
        <div id="module-wrapper">
          <RenderModule moduleName="not-in-module-map" />
        </div>
      </ReactReduxContext.Provider>
    );
    expect(consoleWarn.mock.calls[0][0]).toMatchInlineSnapshot(
      '"Module not-in-module-map was not found in the holocron module registry"'
    );
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          id="module-wrapper"
        />
      </DocumentFragment>
    `);
  });

  it('should warn and render null when module is not loaded', () => {
    store.getState.mockImplementationOnce(() => fromJS({
      holocron: {
        loaded: {},
      },
    })
    );
    expect.assertions(2);

    const { asFragment } = render(
      <ReactReduxContext.Provider value={{ store }}>
        <div id="module-wrapper">
          <RenderModule moduleName="not-in-module-map" />
        </div>
      </ReactReduxContext.Provider>
    );
    expect(consoleWarn.mock.calls[0][0]).toMatchInlineSnapshot(
      '"Module not-in-module-map was not found in the holocron module registry"'
    );
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          id="module-wrapper"
        />
      </DocumentFragment>
    `);
  });

  it('should render a module', () => {
    expect.assertions(1);

    const { asFragment } = render(
      <ReactReduxContext.Provider value={{ store }}>
        <RenderModule moduleName="my-test-module" />
      </ReactReduxContext.Provider>
    );
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          <h1>
            My test module
          </h1>
          <p>
            Other Props: {}
          </p>
        </div>
      </DocumentFragment>
    `);
  });

  it('should pass props to the module', () => {
    expect.assertions(1);

    const props = { hello: 'world', foo: 'bar' };
    const { asFragment } = render(
      <ReactReduxContext.Provider value={{ store }}>
        <RenderModule moduleName="my-test-module" props={props} />
      </ReactReduxContext.Provider>
    );
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          <h1>
            My test module
          </h1>
          <p>
            Other Props: {"hello":"world","foo":"bar"}
          </p>
        </div>
      </DocumentFragment>
    `);
  });

  it('should pass children to the module', () => {
    expect.assertions(1);

    const { asFragment } = render(
      <ReactReduxContext.Provider value={{ store }}>
        <RenderModule moduleName="my-test-module">
          <h1>Hello, world</h1>
        </RenderModule>
      </ReactReduxContext.Provider>
    );
    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          <h1>
            My test module
          </h1>
          <p>
            Other Props: {}
          </p>
          <h1>
            Hello, world
          </h1>
        </div>
      </DocumentFragment>
    `);
  });
});
