/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
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

// eslint-disable-next-line import/no-extraneous-dependencies
import { renderHook, act } from '@testing-library/react-hooks';

import useModuleRegistry, { createRegistryActions } from '../../src/hooks/useModuleRegistry';
import { createInitialState } from '../../src/ducks/registry';

describe(createRegistryActions.name, () => {
  test('returns state', () => {
    const dispatch = jest.fn();
    const actions = createRegistryActions(createInitialState(), dispatch);
    expect(() => actions.getModule()).not.toThrow();
    expect(() => actions.getModules()).not.toThrow();
    expect(() => actions.getModuleMap()).not.toThrow();
    expect(() => actions.getBlockedModules()).not.toThrow();
    expect(() => actions.isModuleBlocked()).not.toThrow();
    expect(() => actions.blockModule()).not.toThrow();
    expect(() => actions.registerModule()).not.toThrow();
    expect(() => actions.setModuleMap()).not.toThrow();
    expect(() => actions.resetModuleRegistry()).not.toThrow();
    expect(() => actions.getModuleReducers()).not.toThrow();
    expect(() => actions.getModuleReducer()).not.toThrow();
    expect(() => actions.setModuleReducer()).not.toThrow();
  });
});

describe(useModuleRegistry.name, () => {
  function Module() { }

  test('default state', () => {
    const { result } = renderHook(() => useModuleRegistry());
    expect(result.current).toMatchSnapshot();
  });

  test('adds a holocron module and removes it', () => {
    const moduleName = 'my-module';
    const { result } = renderHook(() => useModuleRegistry());
    expect(result.current.getModule(moduleName)).toBe(null);
    act(() => {
      result.current.registerModule(moduleName, Module);
    });
    expect(result.current).toMatchSnapshot();
    expect(result.current.getModule(moduleName)).toEqual(expect.any(Function));
    act(() => {
      result.current.resetModuleRegistry();
    });
    expect(result.current.getModule(moduleName)).toBe(null);
  });
});
