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

import { fromJS, List } from 'immutable';
import holocronModule from './holocronModule';

let modules = fromJS({});
let moduleMap = fromJS({});
let moduleBlockList = List();

function addToModuleBlockList(moduleUrl) {
  moduleBlockList = moduleBlockList.push(moduleUrl);
}

function isModuleInBlockList(moduleUrl) {
  return moduleBlockList.find((value) => value === moduleUrl);
}

function getModuleBlockList() {
  return moduleBlockList;
}

function addHigherOrderComponent(module) {
  return holocronModule({ loadModuleData: module.loadModuleData, ...module.holocron })(module);
}

function registerModule(moduleName, module) {
  modules = modules.set(moduleName, addHigherOrderComponent(module));
}

function getModule(moduleName, altModules) {
  if (altModules) {
    return altModules.get(moduleName);
  }

  return modules.get(moduleName);
}

function getModules() {
  return modules;
}

function getModuleMap() {
  return moduleMap;
}

function setModuleMap(newModuleMap) {
  moduleMap = fromJS(newModuleMap);
}

function resetModuleRegistry(newModules, newModuleMap) {
  modules = fromJS(newModules);
  setModuleMap(newModuleMap);
}

export {
  addToModuleBlockList,
  getModuleBlockList,
  isModuleInBlockList,
  registerModule,
  getModule,
  getModules,
  getModuleMap,
  setModuleMap,
  resetModuleRegistry,
  addHigherOrderComponent,
};
