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

import { Map as iMap, fromJS, is } from 'immutable';
import {
  addToModuleBlockList,
  getModuleBlockList,
  isModuleInBlockList,
  registerModule,
  getModule,
  getModules,
  getModuleMap,
  resetModuleRegistry,
  setModuleMap,
  addHigherOrderComponent,
  registerModuleUsingExternals,
  clearModulesUsingExternals,
  getModulesUsingExternals,
} from '../src/moduleRegistry';

describe('moduleRegistry', () => {
  beforeEach(() => {
    clearModulesUsingExternals();
  });

  it('should maintain a block list', () => {
    addToModuleBlockList('https://example.com/cdn/bad-module/0.2.0/module.js');
    addToModuleBlockList('https://example.com/cdn/worse-module/0.0.0-46/module.js');

    expect(getModuleBlockList()).toMatchSnapshot();
    expect(isModuleInBlockList('https://example.com/cdn/bad-module/0.2.0/module.js')).toMatchSnapshot();
  });

  it('should register modules', () => {
    const GoodModule = () => null;
    registerModule('good-module', GoodModule);
    expect(getModules()).toMatchSnapshot();
    expect(getModule('good-module')).toMatchSnapshot();
  });

  it('should set the module map', () => {
    const moduleMap = {
      key: '1',
      modules: {
        'cool-module': {
          node: {
            url: 'https://example.com/cdn/cool-module/0.2.0/module.node.js',
            integrity: '123',
          },
          browser: {
            url: 'https://example.com/cdn/cool-module/0.2.0/module.browser.js',
            integrity: '234',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/cool-module/0.2.0/module.legacyBrowser.js',
            integrity: '345',
          },
        },
      },
    };
    setModuleMap(moduleMap);

    expect(is(getModuleMap(), fromJS(moduleMap))).toBe(true);
  });

  it('should use alternative modules when provided', () => {
    const GoodModule = () => null;
    const AltModule = () => null;
    const AltModuleHoC = addHigherOrderComponent(AltModule);
    const altModules = iMap({ 'good-module': AltModuleHoC });
    registerModule('good-module', GoodModule);
    expect(getModule('good-module').displayName).toEqual('Connect(HolocronModule(GoodModule))');
    expect(getModule('good-module', altModules).displayName).toEqual('Connect(HolocronModule(AltModule))');
  });

  it('should reset the whole registry', () => {
    const modules = {
      'cool-module': () => null,
    };
    const moduleMap = {
      key: '1',
      modules: {
        'cool-module': {
          node: {
            url: 'https://example.com/cdn/cool-module/0.2.0/module.node.js',
            integrity: '123',
          },
          browser: {
            url: 'https://example.com/cdn/cool-module/0.2.0/module.browser.js',
            integrity: '234',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/cool-module/0.2.0/module.legacyBrowser.js',
            integrity: '345',
          },
        },
      },
    };
    resetModuleRegistry(modules, moduleMap);
    expect(is(getModules(), fromJS(modules))).toBe(true);
    expect(is(getModuleMap(), fromJS(moduleMap))).toBe(true);
  });

  describe('registerModuleUsingExternals', () => {
    it('registers a module using an external', () => {
      expect(getModulesUsingExternals()).toEqual([]);

      registerModuleUsingExternals('awesome');

      expect(getModulesUsingExternals()).toEqual(['awesome']);
    });
  });

  describe('clearModulesUsingExternals', () => {
    it('clears the registry', () => {
      expect(getModulesUsingExternals()).toEqual([]);

      registerModuleUsingExternals('awesome');

      expect(getModulesUsingExternals()).toEqual(['awesome']);

      clearModulesUsingExternals();

      expect(getModulesUsingExternals()).toEqual([]);
    });
  });

  describe('getModulesUsingExternals', () => {
    it('returns registry as array', () => {
      registerModuleUsingExternals('awesome');

      expect(getModulesUsingExternals()).toEqual(['awesome']);
    });
  });
});
