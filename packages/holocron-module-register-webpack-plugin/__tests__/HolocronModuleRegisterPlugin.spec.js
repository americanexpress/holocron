/**
 * @jest-environment node
 */

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

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HolocronModuleRegisterPlugin = require('../HolocronModuleRegisterPlugin');

const fixturesPath = path.join(__dirname, '../__fixtures__');
const buildPath = path.join(fixturesPath, 'build');

const webpackOptions = {
  entry: path.join(fixturesPath, 'SomeModule.js'),
  output: {
    path: buildPath,
  },
  plugins: [new HolocronModuleRegisterPlugin('some-module')],
};

describe('HolocronModuleRegisterPlugin', () => {
  it('should wrap the contents in an IIFE that registers the module in development', (done) => {
    expect.assertions(3);

    const outputFileName = 'webpack-test-output-dev.js';

    const options = merge(webpackOptions, {
      mode: 'development',
      output: {
        filename: outputFileName,
      },
    });

    webpack(options, (err, stats) => {
      if (err) done.fail(err);
      if (stats.hasErrors()) done.fail(stats.toJson().errors);
      const fileContents = fs.readFileSync(path.join(buildPath, outputFileName)).toString();
      expect(fileContents.startsWith('(function() {')).toBe(true);
      expect(fileContents).toContain('const SomeModule = () => null;');
      expect(fileContents.endsWith('Holocron.registerModule("some-module", holocronModuleName);})();')).toBe(true);
      done();
    });
  });

  it('should wrap the contents in an IIFE that registers the module in production', (done) => {
    expect.assertions(2);

    const outputFileName = 'webpack-test-output-prod.js';

    const options = merge(webpackOptions, {
      mode: 'production',
      output: {
        filename: outputFileName,
      },
    });

    webpack(options, (err, stats) => {
      if (err) done.fail(err);
      if (stats.hasErrors()) done.fail(stats.toJson().errors);
      const fileContents = fs.readFileSync(path.join(buildPath, outputFileName)).toString();
      expect(fileContents).toContain('()=>null');
      expect(fileContents.endsWith('Holocron.registerModule("some-module",holocronModuleName);')).toBe(true);
      done();
    });
  });

  it('should not wrap the contents of a non-main chunk an IIFE that registers the module', (done) => {
    expect.assertions(5);

    const outputFileName = 'webpack-test-output-async.js';

    const options = merge(webpackOptions, {
      mode: 'development',
      entry: path.join(fixturesPath, 'ModuleWithAsyncImport.js'),
      output: {
        filename: outputFileName,
      },
    });

    webpack(options, (err, stats) => {
      if (err) done.fail(err);
      if (stats.hasErrors()) done.fail(stats.toJson().errors);
      const fileContents = fs.readFileSync(path.join(buildPath, outputFileName)).toString();
      expect(fileContents.startsWith('(function() {')).toBe(true);
      expect(fileContents).toContain('const ModuleWithAsyncImport = () =>');
      expect(fileContents.endsWith('Holocron.registerModule("some-module", holocronModuleName);})();')).toBe(true);
      const asyncChunkContents = fs.readFileSync(path.join(buildPath, `async-import.${outputFileName}`)).toString();
      expect(asyncChunkContents).toContain('() => \'Hello, world\'');
      expect(asyncChunkContents).not.toContain('Holocron.registerModule("some-module"');
      done();
    });
  });

  it('should registerModule with provided `moduleName` and `holocronModuleName`', (done) => {
    expect.assertions(1);
    const outputFileName = 'webpack-test-output-async.js';
    const moduleName = 'some-module';
    const holocronModuleName = `holocronModule-${moduleName}`;
    const webpackOptionsWithPlugins = {
      ...webpackOptions,
      plugins: [new HolocronModuleRegisterPlugin(moduleName, holocronModuleName)],
    };
    const options = merge(webpackOptionsWithPlugins, {
      mode: 'development',
      entry: path.join(fixturesPath, 'ModuleWithAsyncImport.js'),
      output: {
        filename: outputFileName,
      },
    });

    webpack(options, (err, stats) => {
      if (err) done.fail(err);
      if (stats.hasErrors()) done.fail(stats.toJson().errors);
      const fileContents = fs.readFileSync(path.join(buildPath, outputFileName)).toString();
      expect(fileContents.endsWith(`Holocron.registerModule("${moduleName}", ${holocronModuleName});})();`)).toBe(true);
      done();
    });
  });
});
