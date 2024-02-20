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

import ModuleRoute from '../src/ModuleRoute';
// eslint erroneously believes '@testing-library/react' is not a dev dependency
// eslint-disable-next-line import/no-extraneous-dependencies -- only used in tests
const { render } = require('@testing-library/react');

describe('ModuleRoute', () => {
  console.error = jest.fn();

  beforeEach(() => console.error.mockClear());

  it('should log an error when render is attempted', () => {
    render(<ModuleRoute />);
    expect(console.error).toHaveBeenCalled();
  });

  it('should render null', () => {
    expect(render(<ModuleRoute />).asFragment()).toMatchInlineSnapshot('<DocumentFragment />');
  });

  it('should have a createModuleRouteFromElement method', () => {
    expect(ModuleRoute.createRouteFromReactElement).toBeInstanceOf(Function);
  });
});
