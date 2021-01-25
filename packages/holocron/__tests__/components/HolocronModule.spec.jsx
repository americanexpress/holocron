/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
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

/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect } from 'react';
import renderer from 'react-test-renderer';

import HolocronModule from '../../src/components/HolocronModule';
import { getModule } from '../../src/moduleRegistry';
import { composeModules } from '../../src/ducks/compose';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(() => jest.fn()),
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(() => jest.fn((p) => p)),
}));

jest.mock('holocron', () => ({
  RenderModule: jest.fn(() => <span id="render-module" />),
  getModule: jest.fn(() => () => <span id="render-module" />),
  composeModules: jest.fn(() => Promise.resolve()),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('HolocronModule', () => {
  it('renders the module', () => {
    expect(
      renderer(<HolocronModule moduleName="test-module" />)
    ).toMatchSnapshot();
    expect(useEffect).toHaveBeenCalled();
    expect(useEffect.mock.calls[0][0]()).toBeUndefined();
    expect(composeModules).not.toHaveBeenCalled();
  });

  it('renders the module loader when the module is loading', () => {
    getModule.mockImplementationOnce(() => false);
    expect(
      renderer(<HolocronModule moduleName="test-module" fallback={() => <div>Fallback</div>} />)
    ).toMatchSnapshot();
    expect(useEffect).toHaveBeenCalled();
    expect(useEffect.mock.calls[0][0]()).toBeUndefined();
    expect(composeModules).toHaveBeenCalled();
  });
});
