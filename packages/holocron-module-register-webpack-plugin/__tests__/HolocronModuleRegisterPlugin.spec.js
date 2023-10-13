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
// FIXME: RANDOMBYTESREQUEST via terser-webpack-plugin may be an open handle
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const crypto = require('crypto');
const HolocronModuleRegisterPlugin = require('../HolocronModuleRegisterPlugin');

// Monkey Patch for unsupported hash algorithm. Needed to support Node >=17.
// https://github.com/webpack/webpack/issues/13572#issuecomment-923736472
const originalCreateHash = crypto.createHash;
crypto.createHash = (algorithm) => originalCreateHash(algorithm === 'md4' ? 'sha256' : algorithm);

const fixturesPath = path.join(__dirname, '../__fixtures__');
const buildPath = path.join(fixturesPath, 'build');

const webpackOptions = {
  entry: path.join(fixturesPath, 'SomeModule.js'),
  devtool: 'source-map',
  output: {
    path: buildPath,
  },
  plugins: [new HolocronModuleRegisterPlugin('some-module', 'SomeModule')],
};

function waitForWebpack(options) {
  return new Promise((resolve, reject) => webpack(options, (error, stats) => {
    if (error) { return reject(error); }
    if (stats.hasErrors()) { return reject(stats.toJson().errors); }
    return resolve(stats);
  }));
}

describe('HolocronModuleRegisterPlugin', () => {
  it('should wrap the contents in an IIFE that registers the module in development', async () => {
    expect.assertions(3);

    const outputFileName = 'webpack-test-output-dev.js';

    const options = merge(webpackOptions, {
      mode: 'development',
      output: {
        filename: outputFileName,
      },
    });

    await waitForWebpack(options);

    const fileContents = fs.readFileSync(path.join(buildPath, outputFileName)).toString();
    expect(fileContents.startsWith('/******/ (() => { // webpackBootstrap')).toBe(true);
    expect(fileContents).toContain('const SomeModule = () => null;');
    expect(fileContents).toContain('Holocron.registerModule("some-module", SomeModule);');
  });

  it('should wrap the contents in an IIFE that registers the module in production', async () => {
    expect.assertions(2);

    const outputFileName = 'webpack-test-output-prod.js';

    const options = merge(webpackOptions, {
      devtool: false,
      mode: 'production',
      output: {
        filename: outputFileName,
      },
    });

    await waitForWebpack(options);
    const fileContents = fs.readFileSync(path.join(buildPath, outputFileName)).toString();
    expect(fileContents).toContain('()=>null');
    // This tests an implementation detail to some extent,
    // but webpack is being too clever in this instance not to
    expect(fileContents).toContain('Holocron.registerModule("some-module",(()=>null))})();');
  });

  it('should not wrap the contents of a non-main chunk an IIFE that registers the module', async () => {
    expect.assertions(5);

    const outputFileName = 'webpack-test-output-async.js';

    const options = merge(webpackOptions, {
      mode: 'development',
      entry: path.join(fixturesPath, 'ModuleWithAsyncImport.js'),
      output: {
        filename: outputFileName,
      },
    });

    await waitForWebpack(options);

    const fileContents = fs.readFileSync(path.join(buildPath, outputFileName)).toString();
    expect(fileContents.startsWith('/******/ (() => { // webpackBootstrap')).toBe(true);
    expect(fileContents).toContain('const ModuleWithAsyncImport = () =>');
    expect(fileContents).toContain('Holocron.registerModule("some-module", SomeModule);');
    const asyncChunkContents = fs.readFileSync(path.join(buildPath, `async-import.${outputFileName}`)).toString();
    expect(asyncChunkContents).toContain('() => \'Hello, world\'');
    expect(asyncChunkContents).not.toContain('Holocron.registerModule("some-module"');
  });

  it('should registerModule with provided `moduleName` and `holocronModuleName`', async () => {
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

    await waitForWebpack(options);
    const fileContents = fs.readFileSync(path.join(buildPath, outputFileName)).toString();
    expect(fileContents).toContain('Holocron.registerModule("some-module", holocronModule-some-module);');
  });
});
