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
      // eslint-disable-next-line global-require
      externalRegistry = require('../src/externalRegistry');
    });
  });

  it('maintains registry of required external fallbacks', () => {
    externalRegistry.addRequiredExternal({
      moduleName: 'child-module-a',
      externalName: 'this-version',
      version: '1.2.3',
      semanticRange: '^1.2.0',
      filename: 'this-version.js',
      integrity: '12345hash',
    });

    externalRegistry.addRequiredExternal({
      moduleName: 'child-module-a',
      externalName: 'that-dep',
      version: '2.3.1',
      semanticRange: '^2.2.0',
      filename: 'this-dep.js',
      integrity: '12345hash',
    });

    externalRegistry.addRequiredExternal({
      moduleName: 'child-module-b',
      externalName: 'this-version',
      version: '1.2.4',
      semanticRange: '^1.2.0',
      filename: 'this-version.js',
      integrity: '123456hash',
    });

    expect(externalRegistry.getRequiredExternalsRegistry())
      .toMatchInlineSnapshot(`
      Object {
        "child-module-a": Object {
          "that-dep": Object {
            "filename": "this-dep.js",
            "integrity": "12345hash",
            "semanticRange": "^2.2.0",
            "version": "2.3.1",
          },
          "this-version": Object {
            "filename": "this-version.js",
            "integrity": "12345hash",
            "semanticRange": "^1.2.0",
            "version": "1.2.3",
          },
        },
        "child-module-b": Object {
          "this-version": Object {
            "filename": "this-version.js",
            "integrity": "123456hash",
            "semanticRange": "^1.2.0",
            "version": "1.2.4",
          },
        },
      }
    `);
  });

  describe('getRequiredExternals', () => {
    it('returns all required fallbacks externals for a module', () => {
      const moduleName = 'child-module-a';
      externalRegistry.addRequiredExternal({
        moduleName,
        externalName: 'some-dep',
        version: '1.2.3',
        semanticRange: '^1.2.0',
        filename: 'some-dep.js',
        integrity: '12345hash',
      });

      externalRegistry.addRequiredExternal({
        moduleName,
        externalName: 'that-dep',
        version: '1.2.4',
        semanticRange: '^1.2.0',
        filename: 'that-dep.js',
        integrity: '123456hash',
      });

      expect(externalRegistry.getRequiredExternals(moduleName))
        .toMatchInlineSnapshot(`
        Array [
          Object {
            "filename": "some-dep.js",
            "integrity": "12345hash",
            "moduleName": "child-module-a",
            "name": "some-dep",
            "semanticRange": "^1.2.0",
            "version": "1.2.3",
          },
          Object {
            "filename": "that-dep.js",
            "integrity": "123456hash",
            "moduleName": "child-module-a",
            "name": "that-dep",
            "semanticRange": "^1.2.0",
            "version": "1.2.4",
          },
        ]
      `);
    });
  });

  describe('getUnregisteredRequiredExternals', () => {
    it('returns fallback externals for module which have not been loaded', () => {
      const moduleName = 'child-module-a';

      expect(
        externalRegistry.getUnregisteredRequiredExternals(moduleName)
      ).toMatchInlineSnapshot('Array []');

      externalRegistry.addRequiredExternal({
        moduleName,
        externalName: 'some-dep',
        version: '1.2.3',
        semanticRange: '^1.2.0',
        filename: 'some-dep.js',
        integrity: '12345hash',
      });

      externalRegistry.addRequiredExternal({
        moduleName,
        externalName: 'that-dep',
        version: '1.2.4',
        semanticRange: '^1.2.0',
        filename: 'that-dep.js',
        integrity: '123456hash',
      });

      externalRegistry.registerExternal({
        name: 'some-dep',
        version: '1.2.3',
        module: noOp,
      });

      expect(externalRegistry.getUnregisteredRequiredExternals(moduleName))
        .toMatchInlineSnapshot(`
        Array [
          Object {
            "filename": "that-dep.js",
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
      ).toMatchInlineSnapshot('Array []');
    });

    it('does not accidentally match different registered version', () => {
      const moduleName = 'child-module-a';
      const externalName = 'some-dep';
      externalRegistry.addRequiredExternal({
        moduleName,
        externalName,
        version: '1.0.0',
        semanticRange: '^1.0.0',
        filename: 'some-dep.js',
        integrity: '12345hash',
      });

      externalRegistry.registerExternal({
        name: externalName,
        version: '1.2.3',
      });

      expect(externalRegistry.getUnregisteredRequiredExternals(moduleName))
        .toMatchInlineSnapshot(`
        Array [
          Object {
            "filename": "some-dep.js",
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
      modules: noOp,
    });

    externalRegistry.registerExternal({
      name: 'that-dep',
      version: '0.0.1-alpha.0.1',
      modules: noOp,
    });

    expect(externalRegistry.getExternals()).toMatchInlineSnapshot(`
      Object {
        "some-dep": Object {
          "1.2.3": [Function],
          "2.0.0": undefined,
        },
        "that-dep": Object {
          "0.0.1-alpha.0.1": undefined,
        },
      }
    `);
  });

  describe('setRequiredExternalsRegistry', () => {
    it('can hydrate the required module fallback registry', () => {
      externalRegistry.setRequiredExternalsRegistry({
        'child-module-a': {
          'that-dep': {
            filename: 'this-dep.js',
            semanticRange: '^2.2.0',
            integrity: '12345hash',
            version: '2.3.1',
          },
        },
        'child-module-b': {
          'this-version': {
            filename: 'this-version.js',
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
});
