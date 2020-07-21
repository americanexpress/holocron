/* eslint-disable no-underscore-dangle */
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

import { LOAD_KEY, REDUCER_KEY } from '../src/ducks/constants';
import {
  getLoadModuleDataFn,
  getModuleLoadFn,
  getModuleReducer,
} from '../src/utility';

describe('utilities', () => {
  test(getModuleLoadFn.name, () => {
    const load = jest.fn();
    expect(getModuleLoadFn()).toBe(null);
    expect(getModuleLoadFn({ holocron: { load } })).toBe(load);
    expect(getModuleLoadFn({ [LOAD_KEY]: load })).toBe(load);
  });

  test(getLoadModuleDataFn.name, () => {
    const loadModuleData = jest.fn();
    expect(getLoadModuleDataFn()).toBe(null);
    expect(getLoadModuleDataFn({ holocron: { loadModuleData } })).toBe(loadModuleData);
    expect(getLoadModuleDataFn({ loadModuleData })).toBe(loadModuleData);
  });

  test(getModuleReducer.name, () => {
    const reducer = jest.fn();
    expect(getModuleReducer()).toBe(null);
    expect(getModuleReducer({ holocron: { reducer } })).toBe(reducer);
    expect(getModuleReducer({ [REDUCER_KEY]: reducer })).toBe(reducer);
  });
});
