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

const ModuleFilenameHelpers = require('webpack/lib/ModuleFilenameHelpers');

function HolocronModuleRegisterPlugin(moduleName, holocronModuleName = 'holocronModule') {
  this.moduleName = moduleName;
  this.holocronModuleName = holocronModuleName;
  this.options = {};
}
module.exports = HolocronModuleRegisterPlugin;

HolocronModuleRegisterPlugin.prototype.apply = function apply(compiler) {
  const { moduleName, holocronModuleName, options } = this;
  compiler.hooks.compilation.tap('HolocronModuleRegisterPlugin', (compilation) => {
    compilation.hooks.optimizeChunkAssets.tapAsync('HolocronModuleRegisterPlugin', (chunks, callback) => {
      chunks.forEach((chunk) => {
        if (chunk.name !== 'main') return;
        chunk.files
          .filter(ModuleFilenameHelpers.matchObject.bind(undefined, options))
          .forEach((file) => {
            const source = compilation.assets[file];
            // descend into the source and inject the registration within the iife
            // The last two symbols are always the closing of the iife, then a `;`
            // Therefore, insert the registration immediately before the iife closes
            // eslint-disable-next-line no-underscore-dangle
            source._source._children.splice(source._source._children.length - 2, 0, `;Holocron.registerModule("${moduleName}", ${holocronModuleName});`);
          });
      });

      callback();
    });
  });
};
