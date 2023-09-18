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

import updateModuleRegistry, { areModuleEntriesEqual } from '../src/updateModuleRegistry';
import loadModule from '../src/loadModule.node';
import {
  getModules,
  getModuleMap,
  resetModuleRegistry,
  addHigherOrderComponent,
} from '../src/moduleRegistry';

function AwesomeModule() {
  return 'initial awesome-module';
}
function AnotherModule() {
  return 'initial awesome-module';
}
function ModuleThree() {
  return 'initial awesome-module';
}

jest.mock('../src/loadModule.node', () => {
  const createTimeoutPromise = (
    resolveWith,
    time
  ) => new Promise(
    (resolve) => setTimeout(() => resolve(resolveWith), time)
  );

  const makeUpdatedModule = (moduleName, moduleVersion) => function UpdatedModule() {
    return `new ${moduleName}@${moduleVersion}`;
  };

  return jest.fn((moduleName, moduleVersion) => createTimeoutPromise(
    makeUpdatedModule(moduleName, moduleVersion),
    100
  ));
});

describe('updateModuleRegistry', () => {
  const onModuleLoad = jest.fn();

  const getModuleOutputs = (modules) => modules.reduce((accumulator, module, moduleName) => ({
    ...accumulator,
    [moduleName]: module,
  }), {});

  beforeEach(() => {
    jest.clearAllMocks();
    resetModuleRegistry(
      {
        'awesome-module': addHigherOrderComponent(AwesomeModule),
        'another-module': addHigherOrderComponent(AnotherModule),
        'module-three': addHigherOrderComponent(ModuleThree),
      },
      {
        key: 'key123',
        modules: {
          'awesome-module': {
            node: {
              url: 'https://example.com/cdn/awesome-module/1.0.0/awesome-module.node.js',
              integrity: '47474',
            },
            browser: {
              url: 'https://example.com/cdn/awesome-module/1.0.0/awesome-module.browser.js',
              integrity: '465345v',
            },
            legacyBrowser: {
              url: 'https://example.com/cdn/awesome-module/1.0.0/awesome-module.legacy.browser.js',
              integrity: '4564632',
            },
          },
          'another-module': {
            node: {
              url: 'https://example.com/cdn/another-module/1.0.0/another-module.node.js',
              integrity: '6786784',
            },
            browser: {
              url: 'https://example.com/cdn/another-module/1.0.0/another-module.browser.js',
              integrity: '66465879',
            },
            legacyBrowser: {
              url: 'https://example.com/cdn/another-module/1.0.0/another-module.legacy.browser.js',
              integrity: '4776754',
            },
          },
          'module-three': {
            node: {
              url: 'https://example.com/cdn/module-three/1.0.0/module-three.node.js',
              integrity: '7747545',
            },
            browser: {
              url: 'https://example.com/cdn/module-three/1.0.0/module-three.browser.js',
              integrity: '44532345',
            },
            legacyBrowser: {
              url: 'https://example.com/cdn/module-three/1.0.0/module-three.legacy.browser.js',
              integrity: '3534536',
            },
            baseUrl: 'https://example.com/cdn/module-three/1.0.0/module-three.node.js',
          },
        },
      }
    );
  });

  it('should only fetch the changed modules', async () => {
    expect.assertions(2);

    const updatedModuleData = {
      node: {
        url: 'https://example.com/cdn/another-module/2.4.0/another-module.node.js',
        integrity: '235534',
      },
      browser: {
        url: 'https://example.com/cdn/another-module/2.4.0/another-module.browser.js',
        integrity: '56643',
      },
      legacyBrowser: {
        url: 'https://example.com/cdn/another-module/2.4.0/another-module.legacy.browser.js',
        integrity: '1145',
      },
    };
    const currentModuleMap = getModuleMap().toJS();
    const newModuleMap = {
      ...currentModuleMap,
      modules: {
        ...currentModuleMap.modules,
        'another-module': updatedModuleData,
      },
    };
    const batchModulesToUpdate = (x) => [x];
    await updateModuleRegistry({
      moduleMap: newModuleMap,
      onModuleLoad,
      batchModulesToUpdate,
    });
    expect(loadModule).toHaveBeenCalledTimes(1);
    expect(loadModule).toHaveBeenCalledWith('another-module', updatedModuleData, onModuleLoad);
  });

  it('should use a default onModuleLoad', async () => {
    expect.assertions(1);
    const updatedModuleData = {
      node: {
        url: 'https://example.com/cdn/another-module/2.4.0/another-module.node.js',
        integrity: '2342352',
      },
      browser: {
        url: 'https://example.com/cdn/another-module/2.4.0/another-module.browser.js',
        integrity: 'w445',
      },
      legacyBrowser: {
        url: 'https://example.com/cdn/another-module/2.4.0/another-module.legacy.browser.js',
        integrity: '3455c',
      },
    };
    const currentModuleMap = getModuleMap().toJS();
    const newModuleMap = {
      ...currentModuleMap,
      modules: {
        ...currentModuleMap.modules,
        'another-module': updatedModuleData,
      },
    };

    await updateModuleRegistry({
      moduleMap: newModuleMap,
    });

    expect(loadModule.mock.calls[0][2]()).toBe(null);
  });

  it('should batch the requests', async () => {
    const currentModuleMap = getModuleMap().toJS();
    const newModuleMap = {
      ...currentModuleMap,
      modules: {
        ...currentModuleMap.modules,
        'another-module': {
          node: {
            url: 'https://example.com/cdn/another-module/2.4.0/another-module.node.js',
            integrity: '333354',
          },
          browser: {
            url: 'https://example.com/cdn/another-module/2.4.0/another-module.browser.js',
            integrity: '13456',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/another-module/2.4.0/another-module.legacy.browser.js',
            integrity: '4456643',
          },
        },
        'yet-another-module': {
          node: {
            url: 'https://example.com/cdn/yet-another-module/2.4.0/yet-another-module.node.js',
            integrity: '8975431',
          },
          browser: {
            url: 'https://example.com/cdn/yet-another-module/2.4.0/yet-another-module.browser.js',
            integrity: '23566',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/yet-another-module/2.4.0/yet-another-module.legacy.browser.js',
            integrity: '345346',
          },
        },
        'cool-module': {
          node: {
            url: 'https://example.com/cdn/cool-module/2.4.0/cool-module.node.js',
            integrity: '893312123',
          },
          browser: {
            url: 'https://example.com/cdn/cool-module/2.4.0/cool-module.browser.js',
            integrity: '225356',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/cool-module/2.4.0/cool-module.legacy.browser.js',
            integrity: '789685',
          },
        },
        'cooler-module': {
          node: {
            url: 'https://example.com/cdn/cooler-module/2.4.0/cooler-module.node.js',
            integrity: '8905454',
          },
          browser: {
            url: 'https://example.com/cdn/cooler-module/2.4.0/cooler-module.browser.js',
            integrity: '63478',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/cooler-module/2.4.0/cooler-module.legacy.browser.js',
            integrity: '35523',
          },
        },
      },
    };

    const batchModulesToUpdate = (moduleNames) => moduleNames.reduce((accumulator, moduleName) => {
      const lastArray = accumulator[accumulator.length - 1];
      if (lastArray.length < 2) lastArray.push(moduleName);
      else accumulator.push([moduleName]);
      return accumulator;
    }, [[]]);

    const startTime = performance.now();
    await updateModuleRegistry({
      moduleMap: newModuleMap,
      onModuleLoad,
      batchModulesToUpdate,
    });
    const executionTime = performance.now() - startTime;

    expect(executionTime).toBeGreaterThanOrEqual(200);
    expect(executionTime).toBeLessThan(300);
  });

  it('should put the requests in a single batch by default', async () => {
    const currentModuleMap = getModuleMap().toJS();
    const newModuleMap = {
      ...currentModuleMap,
      modules: {
        ...currentModuleMap.modules,
        'another-module': {
          node: {
            url: 'https://example.com/cdn/another-module/2.4.0/another-module.node.js',
            integrity: '123',
          },
          browser: {
            url: 'https://example.com/cdn/another-module/2.4.0/another-module.browser.js',
            integrity: '234',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/another-module/2.4.0/another-module.legacy.browser.js',
            integrity: '344',
          },
        },
        'yet-another-module': {
          node: {
            url: 'https://example.com/cdn/yet-another-module/2.4.0/yet-another-module.node.js',
            integrity: '123',
          },
          browser: {
            url: 'https://example.com/cdn/yet-another-module/2.4.0/yet-another-module.browser.js',
            integrity: '234',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/yet-another-module/2.4.0/yet-another-module.legacy.browser.js',
            integrity: '344',
          },
        },
        'cool-module': {
          node: {
            url: 'https://example.com/cdn/cool-module/2.4.0/cool-module.node.js',
            integrity: '123',
          },
          browser: {
            url: 'https://example.com/cdn/cool-module/2.4.0/cool-module.browser.js',
            integrity: '234',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/cool-module/2.4.0/cool-module.legacy.browser.js',
            integrity: '344',
          },
        },
        'cooler-module': {
          node: {
            url: 'https://example.com/cdn/cooler-module/2.4.0/cooler-module.node.js',
            integrity: '123',
          },
          browser: {
            url: 'https://example.com/cdn/cooler-module/2.4.0/cooler-module.browser.js',
            integrity: '234',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/cooler-module/2.4.0/cooler-module.legacy.browser.js',
            integrity: '344',
          },
        },
      },
    };

    const startTime = performance.now();
    await updateModuleRegistry({
      moduleMap: newModuleMap,
      onModuleLoad,
    });
    const executionTime = performance.now() - startTime;

    expect(executionTime).toBeGreaterThanOrEqual(100);
    expect(executionTime).toBeLessThan(200);
  });

  it('should update the modules in the registry', async () => {
    expect.assertions(2);
    const currentModuleMap = getModuleMap().toJS();
    const newModuleMap = {
      ...currentModuleMap,
      modules: {
        ...currentModuleMap.modules,
        'another-module': {
          node: {
            url: 'https://example.com/cdn/another-module/2.4.0/another-module.node.js',
            integrity: '123',
          },
          browser: {
            url: 'https://example.com/cdn/another-module/2.4.0/another-module.browser.js',
            integrity: '234',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/another-module/2.4.0/another-module.legacy.browser.js',
            integrity: '344',
          },
        },
      },
    };
    const batchModulesToUpdate = (x) => [x];

    await updateModuleRegistry({
      moduleMap: newModuleMap,
      onModuleLoad,
      batchModulesToUpdate,
    });

    expect(getModuleOutputs(getModules())).toMatchSnapshot('modules');
    expect(getModuleMap()).toMatchSnapshot('module map');
  });

  it('should remove modules from the registry', async () => {
    expect.assertions(3);
    expect(getModuleMap().getIn(['modules', 'awesome-module'])).toMatchSnapshot();
    expect(getModules().getIn(['awesome-module', 'displayName'])).toBe('Connect(HolocronModule(AwesomeModule))');

    const newModuleMap = {
      key: 'key-123',
      modules: {
        'another-module': {
          node: {
            url: 'https://example.com/cdn/another-module/2.4.0/another-module.node.js',
            integrity: '578996',
          },
          browser: {
            url: 'https://example.com/cdn/another-module/2.4.0/another-module.browser.js',
            integrity: '53344335',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/another-module/2.4.0/another-module.legacy.browser.js',
            integrity: '58342',
          },
        },
      },
    };
    const batchModulesToUpdate = (x) => [x];

    await updateModuleRegistry({
      moduleMap: newModuleMap,
      onModuleLoad,
      batchModulesToUpdate,
    });
    expect(getModuleMap().getIn(['modules', 'awesome-module'])).toBeUndefined();
  });

  it('should resolve with the new versions of the changed modules', async () => {
    expect.assertions(1);
    const currentModuleMap = getModuleMap().toJS();
    const newModuleMap = {
      ...currentModuleMap,
      modules: {
        ...currentModuleMap.modules,
        'another-module': {
          node: {
            url: 'https://example.com/cdn/another-module/2.5.6/another-module.node.js',
            integrity: '4556',
          },
          browser: {
            url: 'https://example.com/cdn/another-module/2.5.6/another-module.browser.js',
            integrity: '7764',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/another-module/2.5.6/another-module.legacy.browser.js',
            integrity: '34566',
          },
        },
      },
    };

    const batchModulesToUpdate = (x) => [x];
    const updatedModules = await updateModuleRegistry({
      moduleMap: newModuleMap,
      onModuleLoad,
      batchModulesToUpdate,
    });

    expect(updatedModules).toMatchSnapshot();
  });

  it('should resolve with the new versions of the changed modules if the current module registry is empty', async () => {
    expect.assertions(1);
    // occurs first time updateModuleRegistry is called
    resetModuleRegistry({}, {});

    const currentModuleMap = getModuleMap().toJS();
    const newModuleMap = {
      ...currentModuleMap,
      modules: {
        ...currentModuleMap.modules,
        'another-module': {
          node: {
            url: 'https://example.com/cdn/another-module/2.5.6/another-module.node.js',
            integrity: '4556',
          },
          browser: {
            url: 'https://example.com/cdn/another-module/2.5.6/another-module.browser.js',
            integrity: '7764',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/another-module/2.5.6/another-module.legacy.browser.js',
            integrity: '34566',
          },
        },
      },
    };

    const batchModulesToUpdate = (x) => [x];
    const updatedModules = await updateModuleRegistry({
      moduleMap: newModuleMap,
      onModuleLoad,
      batchModulesToUpdate,
    });

    expect(updatedModules).toMatchSnapshot();
  });

  it('resolves with accepted and rejected modules when detailedResponse is selected', async () => {
    const mockLoadModule = async (moduleName, moduleVersion) => `new ${moduleName}@${moduleVersion}`;
    jest.spyOn(console, 'error').mockImplementation((x) => x);
    // occurs first time updateModuleRegistry is called
    resetModuleRegistry({}, {});
    loadModule.mockImplementationOnce(mockLoadModule);
    loadModule.mockImplementationOnce(async () => { throw new Error('Failed to load module'); });
    const currentModuleMap = getModuleMap().toJS();
    const newModuleMap = {
      ...currentModuleMap,
      modules: {
        ...currentModuleMap.modules,
        'another-module': {
          node: {
            url: 'https://example.com/cdn/another-module/2.5.6/another-module.node.js',
            integrity: '4556',
          },
          browser: {
            url: 'https://example.com/cdn/another-module/2.5.6/another-module.browser.js',
            integrity: '7764',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/another-module/2.5.6/another-module.legacy.browser.js',
            integrity: '34566',
          },
        },
        'reject-this-module': {
          node: {
            url: 'https://example.com/cdn/reject-this-module/2.5.6/reject-this-module.node.js',
            integrity: '5234',
          },
          browser: {
            url: 'https://example.com/cdn/reject-this-module/2.5.6/reject-this-module.browser.js',
            integrity: '77534664',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/reject-this-module/2.5.6/reject-this-module.legacy.browser.js',
            integrity: '6435',
          },
        },
      },
    };

    const batchModulesToUpdate = (x) => [x];
    const updatedModules = await updateModuleRegistry({
      moduleMap: newModuleMap,
      onModuleLoad,
      batchModulesToUpdate,
      listRejectedModules: true,
    });

    expect(updatedModules).toEqual({
      loadedModules: {
        'another-module': {
          node: {
            url: 'https://example.com/cdn/another-module/2.5.6/another-module.node.js',
            integrity: '4556',
          },
          browser: {
            url: 'https://example.com/cdn/another-module/2.5.6/another-module.browser.js',
            integrity: '7764',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/another-module/2.5.6/another-module.legacy.browser.js',
            integrity: '34566',
          },
        },
      },
      rejectedModules: {
        'reject-this-module': {
          node: {
            url: 'https://example.com/cdn/reject-this-module/2.5.6/reject-this-module.node.js',
            integrity: '5234',
          },
          browser: {
            url: 'https://example.com/cdn/reject-this-module/2.5.6/reject-this-module.browser.js',
            integrity: '77534664',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/reject-this-module/2.5.6/reject-this-module.legacy.browser.js',
            integrity: '6435',
          },
          reasonForRejection: 'Failed to load module',
        },
      },
    });
  });

  it('should not throw if any of the modules fail to load', async () => {
    const mockLoadModule = async (moduleName, moduleVersion) => `new ${moduleName}@${moduleVersion}`;
    jest.spyOn(console, 'error').mockImplementation((x) => x);

    loadModule.mockImplementationOnce(mockLoadModule);
    loadModule.mockImplementationOnce(async () => { throw new Error('Failed to load module'); });
    const currentModuleMap = getModuleMap().toJS();

    const newModuleMap = {
      ...currentModuleMap,
      modules: {
        ...currentModuleMap.modules,
        'another-module': {
          node: {
            url: 'https://example.com/cdn/another-module/2.5.6/another-module.node.js',
            integrity: '23124',
          },
          browser: {
            url: 'https://example.com/cdn/another-module/2.5.6/another-module.browser.js',
            integrity: '346346',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/another-module/2.5.6/another-module.legacy.browser.js',
            integrity: '123545',
          },
        },
        'module-three': {
          node: {
            url: 'https://example.com/cdn/module-three/1.0.1/module-three.node.js',
            integrity: '123444',
          },
          browser: {
            url: 'https://example.com/cdn/module-three/1.0.1/module-three.browser.js',
            integrity: '555111',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/module-three/1.0.1/module-three.legacy.browser.js',
            integrity: '1234444455',
          },
          baseUrl: 'https://example.com/cdn/module-three/1.0.1/module-three.node.js',
        },
        'good-module': {
          node: {
            url: 'https://example.com/cdn/good-module/2.5.6/good-module.js',
            integrity: '1111122222',
          },
          browser: {
            url: 'https://example.com/cdn/good-module/2.5.6/good-module.browser.js',
            integrity: '1111122222333',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/good-module/2.5.6/good-module.legacy.browser.js',
            integrity: '333332222111',
          },
        },
      },
    };
    const batchModulesToUpdate = (x) => x.map((i) => [i]);
    const updatedRegistry = await updateModuleRegistry({
      moduleMap: newModuleMap,
      onModuleLoad,
      batchModulesToUpdate,
    });
    expect(updatedRegistry['another-module']).toBeTruthy();
    expect(updatedRegistry['module-three']).toBeFalsy();
    expect(updatedRegistry['good-module']).toBeTruthy();
    // Ensure the new module "good" module gets added even though bad module was in the same update
    expect(getModules().toJS()['good-module']).toBeTruthy();
    // Since "module-three" already exists in the module map, we expect it to use the old version
    expect(getModuleMap().toJS().modules['module-three'].node.url).toBe('https://example.com/cdn/module-three/1.0.0/module-three.node.js');
    expect(console.error).toHaveBeenCalled();
  });
  it('should not throw if any of the modules fail to load - empty module map', async () => {
    const mockLoadModule = async (moduleName, moduleVersion) => `new ${moduleName}@${moduleVersion}`;
    jest.spyOn(console, 'error').mockImplementation((x) => x);

    loadModule.mockImplementationOnce(mockLoadModule);
    loadModule.mockImplementationOnce(async () => { throw new Error('Failed to load module'); });
    resetModuleRegistry({}, {});
    const currentModuleMap = getModuleMap().toJS();
    const newModuleMap = {
      ...currentModuleMap,
      modules: {
        ...currentModuleMap.modules,
        'another-module': {
          node: {
            url: 'https://example.com/cdn/another-module/2.5.6/another-module.node.js',
            integrity: '23124',
          },
          browser: {
            url: 'https://example.com/cdn/another-module/2.5.6/another-module.browser.js',
            integrity: '346346',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/another-module/2.5.6/another-module.legacy.browser.js',
            integrity: '123545',
          },
        },
        'module-three': {
          node: {
            url: 'https://example.com/cdn/module-three/1.0.1/module-three.node.js',
            integrity: '7747545',
          },
          browser: {
            url: 'https://example.com/cdn/module-three/1.0.1/module-three.browser.js',
            integrity: '44532345',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/module-three/1.0.1/module-three.legacy.browser.js',
            integrity: '3534536',
          },
          baseUrl: 'https://example.com/cdn/module-three/1.0.1/module-three.node.js',
        },
      },
    };
    const batchModulesToUpdate = (x) => x.map((i) => [i]);
    const updatedRegistry = await updateModuleRegistry({
      moduleMap: newModuleMap,
      onModuleLoad,
      batchModulesToUpdate,
    });
    expect(updatedRegistry['another-module']).toBeTruthy();
    expect(getModuleMap().toJS().modules['module-three']).toBeFalsy();
    expect(console.error).toHaveBeenCalled();
  });
});

describe('areModuleEntriesEqual', () => {
  const moduleEntry = {
    node: {
      url: 'https://example.com/cdn/best-module/2.5.6/best-module.node.js',
      integrity: '23124',
    },
    browser: {
      url: 'https://example.com/cdn/best-module/2.5.6/best-module.browser.js',
      integrity: '346346',
    },
    legacyBrowser: {
      url: 'https://example.com/cdn/best-module/2.5.6/best-module.legacy.browser.js',
      integrity: '123545',
    },
  };

  it('returns true for equal entries', () => {
    expect(areModuleEntriesEqual(moduleEntry, { ...moduleEntry })).toBe(true);
  });

  it('returns false if there is no first module', () => {
    expect(areModuleEntriesEqual(undefined, moduleEntry)).toBe(false);
  });

  it('returns false if there is no second module', () => {
    expect(areModuleEntriesEqual(moduleEntry, undefined)).toBe(false);
  });

  it('returns false if the node url changes', () => {
    const updatedModuleEntry = { ...moduleEntry, node: { ...moduleEntry.node, url: 'changed' } };
    expect(areModuleEntriesEqual(moduleEntry, updatedModuleEntry)).toBe(false);
  });

  it('returns false if the node sri changes', () => {
    const updatedModuleEntry = { ...moduleEntry, node: { ...moduleEntry.node, integrity: 'changed' } };
    expect(areModuleEntriesEqual(moduleEntry, updatedModuleEntry)).toBe(false);
  });

  it('returns false if the browser url changes', () => {
    const updatedModuleEntry = { ...moduleEntry, browser: { ...moduleEntry.browser, url: 'changed' } };
    expect(areModuleEntriesEqual(moduleEntry, updatedModuleEntry)).toBe(false);
  });

  it('returns false if the browser sri changes', () => {
    const updatedModuleEntry = { ...moduleEntry, browser: { ...moduleEntry.browser, integrity: 'changed' } };
    expect(areModuleEntriesEqual(moduleEntry, updatedModuleEntry)).toBe(false);
  });

  it('returns false if the legacyBrowser url changes', () => {
    const updatedModuleEntry = { ...moduleEntry, legacyBrowser: { ...moduleEntry.legacyBrowser, url: 'changed' } };
    expect(areModuleEntriesEqual(moduleEntry, updatedModuleEntry)).toBe(false);
  });

  it('returns false if the legacyBrowser sri changes', () => {
    const updatedModuleEntry = { ...moduleEntry, legacyBrowser: { ...moduleEntry.legacyBrowser, integrity: 'changed' } };
    expect(areModuleEntriesEqual(moduleEntry, updatedModuleEntry)).toBe(false);
  });
});
