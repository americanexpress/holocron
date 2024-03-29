/*
 * Copyright 2023 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

let externalRegistry;

const noOp = () => {
  // do nothing
};
describe('externalRegistry', () => {
  beforeEach(() => {
    jest.isolateModules(() => {
      // eslint-disable-next-line global-require -- require for test
      externalRegistry = require('../src/externalRegistry');
    });
  });

  it('maintains registry of required external fallbacks', () => {
    externalRegistry.setModulesRequiredExternals({
      moduleName: 'child-module-a',
      externals: {
        'this-version': {
          name: 'this-version',
          version: '1.2.3',
          semanticRange: '^1.2.0',
          integrity: '12345hash',
        },
        'that-dep': {
          name: 'that-dep',
          version: '2.3.1',
          semanticRange: '^2.2.0',
          integrity: '12345hash',
        },
      },
    });

    externalRegistry.setModulesRequiredExternals({
      moduleName: 'child-module-b',
      externals: {
        'this-version': {
          name: 'this-version',
          version: '1.2.4',
          semanticRange: '^1.2.0',
          integrity: '123456hash',
        },
      },
    });

    expect(externalRegistry.getRequiredExternalsRegistry())
      .toMatchInlineSnapshot(`
      {
        "child-module-a": {
          "that-dep": {
            "integrity": "12345hash",
            "name": "that-dep",
            "semanticRange": "^2.2.0",
            "version": "2.3.1",
          },
          "this-version": {
            "integrity": "12345hash",
            "name": "this-version",
            "semanticRange": "^1.2.0",
            "version": "1.2.3",
          },
        },
        "child-module-b": {
          "this-version": {
            "integrity": "123456hash",
            "name": "this-version",
            "semanticRange": "^1.2.0",
            "version": "1.2.4",
          },
        },
      }
    `);
  });

  describe('setModulesRequiredExternals', () => {
    it('does not set required externals when externals not provided', () => {
      const moduleName = 'child-module-a';
      externalRegistry.setModulesRequiredExternals({ moduleName });
      expect(externalRegistry.getRequiredExternalsRegistry()).toEqual({});
    });
  });

  describe('getRequiredExternals', () => {
    it('returns all required fallbacks externals for a module', () => {
      const moduleName = 'child-module-a';
      externalRegistry.setModulesRequiredExternals({
        moduleName,
        externals: {
          'some-dep': {
            name: 'some-dep',
            version: '1.2.3',
            semanticRange: '^1.2.0',
            integrity: '12345hash',
          },
          'that-dep': {
            name: 'that-dep',
            version: '1.2.4',
            semanticRange: '^1.2.0',
            integrity: '123456hash',
          },
        },
      });

      expect(externalRegistry.getRequiredExternals(moduleName))
        .toMatchInlineSnapshot(`
        [
          {
            "integrity": "12345hash",
            "moduleName": "child-module-a",
            "name": "some-dep",
            "semanticRange": "^1.2.0",
            "version": "1.2.3",
          },
          {
            "integrity": "123456hash",
            "moduleName": "child-module-a",
            "name": "that-dep",
            "semanticRange": "^1.2.0",
            "version": "1.2.4",
          },
        ]
      `);
    });

    it('returns empty array when no externals are provided', () => {
      const moduleName = 'child-module-a';
      externalRegistry.setModulesRequiredExternals({
        moduleName,
        externals: undefined,
      });
      expect(externalRegistry.getRequiredExternals(moduleName)).toEqual([]);
    });
  });

  describe('getUnregisteredRequiredExternals', () => {
    it('returns fallback externals for module which have not been loaded', () => {
      const moduleName = 'child-module-a';

      expect(
        externalRegistry.getUnregisteredRequiredExternals(moduleName)
      ).toMatchInlineSnapshot('[]');

      externalRegistry.setModulesRequiredExternals({
        moduleName,
        externals: {
          'some-dep': {
            name: 'some-dep',
            version: '1.2.3',
            semanticRange: '^1.2.0',
            integrity: '12345hash',
          },
          'that-dep': {
            name: 'that-dep',
            version: '1.2.4',
            semanticRange: '^1.2.0',
            integrity: '123456hash',
          },
        },
      });

      externalRegistry.registerExternal({
        name: 'some-dep',
        version: '1.2.3',
        module: noOp,
      });

      expect(externalRegistry.getUnregisteredRequiredExternals(moduleName))
        .toMatchInlineSnapshot(`
        [
          {
            "integrity": "123456hash",
            "moduleName": "child-module-a",
            "name": "that-dep",
            "semanticRange": "^1.2.0",
            "version": "1.2.4",
          },
        ]
      `);

      externalRegistry.registerExternal({ name: 'that-dep', version: '1.2.4' });
      expect(
        externalRegistry.getUnregisteredRequiredExternals(moduleName)
      ).toMatchInlineSnapshot('[]');
    });

    it('does not accidentally match different registered version', () => {
      const moduleName = 'child-module-a';
      const name = 'some-dep';
      externalRegistry.setModulesRequiredExternals({
        moduleName,
        externals: {
          [name]: {
            name,
            version: '1.0.0',
            semanticRange: '^1.0.0',
            integrity: '12345hash',
          },
        },
      });

      externalRegistry.registerExternal({
        name,
        version: '1.2.3',
      });

      expect(externalRegistry.getUnregisteredRequiredExternals(moduleName))
        .toMatchInlineSnapshot(`
        [
          {
            "integrity": "12345hash",
            "moduleName": "child-module-a",
            "name": "some-dep",
            "semanticRange": "^1.0.0",
            "version": "1.0.0",
          },
        ]
      `);
    });
  });

  it('maintains registry of loaded externals', () => {
    externalRegistry.registerExternal({
      name: 'some-dep',
      version: '1.2.3',
      module: noOp,
    });

    externalRegistry.registerExternal({
      name: 'some-dep',
      version: '2.0.0',
      module: noOp,
    });

    externalRegistry.registerExternal({
      name: 'that-dep',
      version: '0.0.1-alpha.0.1',
      module: noOp,
    });

    expect(externalRegistry.getRegisteredExternals()).toMatchInlineSnapshot(`
      {
        "some-dep": {
          "1.2.3": [Function],
          "2.0.0": [Function],
        },
        "that-dep": {
          "0.0.1-alpha.0.1": [Function],
        },
      }
    `);
  });

  describe('setRequiredExternalsRegistry', () => {
    it('can hydrate the required module fallback registry', () => {
      externalRegistry.setRequiredExternalsRegistry({
        'child-module-a': {
          'that-dep': {
            name: 'this-dep.js',
            semanticRange: '^2.2.0',
            integrity: '12345hash',
            version: '2.3.1',
          },
        },
        'child-module-b': {
          'this-version': {
            name: 'this-version.js',
            semanticRange: '^1.2.0',
            integrity: '123456hash',
            version: '1.2.4',
          },
        },
      });

      expect(
        externalRegistry.getRequiredExternalsRegistry
      ).toMatchInlineSnapshot('[Function]');
    });

    it('does not set registry to undefined', () => {
      externalRegistry.setRequiredExternalsRegistry();
      expect(externalRegistry.getRequiredExternalsRegistry()).toEqual({});
    });
  });

  describe('getExternal', () => {
    it('returns loaded external', () => {
      const name = 'some-dep';
      const version = '1.2.3';
      const externalDependency = () => {
        // this is a loaded external dependency.
      };
      externalRegistry.registerExternal({
        name,
        version,
        module: externalDependency,
      });
      expect(externalRegistry.getExternal({ name, version })).toBe(
        externalDependency
      );
    });
  });

  describe('validateExternal', () => {
    it('validates given version and range', () => {
      expect(
        externalRegistry.validateExternal({
          providedVersion: '1.2.3',
          requestedRange: '^1.2.0',
        })
      ).toBeTruthy();
      expect(
        externalRegistry.validateExternal({
          providedVersion: '2.0.0',
          requestedRange: '^1.2.0',
        })
      ).toBeFalsy();
    });
  });

  describe('clearModulesRequiredExternals', () => {
    it('removes required externals for given module', () => {
      externalRegistry.setModulesRequiredExternals({
        moduleName: 'child-module-a',
        externals: {
          'this-version': {
            name: 'this-version',
            version: '1.2.3',
            semanticRange: '^1.2.0',
            integrity: '12345hash',
          },
          'that-dep': {
            name: 'that-dep',
            version: '2.3.1',
            semanticRange: '^2.2.0',
            integrity: '12345hash',
          },
        },
      });

      externalRegistry.setModulesRequiredExternals({
        moduleName: 'child-module-b',
        externals: {
          'this-version': {
            name: 'this-version',
            version: '1.2.4',
            semanticRange: '^1.2.0',
            integrity: '123456hash',
          },
        },
      });

      externalRegistry.clearModulesRequiredExternals('child-module-a');
      expect(externalRegistry.getRequiredExternalsRegistry())
        .toMatchInlineSnapshot(`
        {
          "child-module-b": {
            "this-version": {
              "integrity": "123456hash",
              "name": "this-version",
              "semanticRange": "^1.2.0",
              "version": "1.2.4",
            },
          },
        }
      `);
    });
  });
});
