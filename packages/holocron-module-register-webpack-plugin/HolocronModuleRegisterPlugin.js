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

const { ConcatSource } = require('webpack-sources');
const ModuleFilenameHelpers = require('webpack/lib/ModuleFilenameHelpers');

function HolocronModuleRegisterPlugin(moduleName) {
  this.moduleName = moduleName;
  this.options = {};
}
module.exports = HolocronModuleRegisterPlugin;

HolocronModuleRegisterPlugin.prototype.apply = function apply(compiler) {
  const { moduleName, options } = this;
  compiler.hooks.compilation.tap('HolocronModuleRegisterPlugin', (compilation) => {
    compilation.hooks.optimizeChunkAssets.tapAsync('HolocronModuleRegisterPlugin', (chunks, callback) => {
      chunks.forEach((chunk) => {
        if (chunk.name !== 'main') return;
        chunk.files
          .filter(ModuleFilenameHelpers.matchObject.bind(undefined, options))
          .forEach((file) => {
            // eslint-disable-next-line no-param-reassign
            compilation.assets[file] = new ConcatSource(
              '(function() {',
              '\n',
              compilation.assets[file],
              '\n',
              `Holocron.registerModule("${moduleName}", holocronModule);})();`
            );
          });
      });

      callback();
    });
  });
};
