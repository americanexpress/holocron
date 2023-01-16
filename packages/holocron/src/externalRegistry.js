/*
 * Copyright 2023 American Express Travel Related Services Company, Inc.
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

let externals = fromJS({});
let externalMap = fromJS({});
let externalBlockList = List();

function addToExternalBlockList(externalUrl) {
  externalBlockList = externalBlockList.push(externalUrl);
}

function isExternalInBlockList(externalUrl) {
  return externalBlockList.find((value) => value === externalUrl);
}

function getExternalBlockList() {
  return externalBlockList;
}

// function registerExternal(externalName, external) {
//   externals = externals.set(externalName, addHigherOrderComponent(external));
// }

function getExternal(externalName, altExternals) {
  if (altExternals) {
    return altExternals.get(externalName);
  }

  return externals.get(externalName);
}

function getExternals() {
  return externals;
}

function getExternalMap() {
  return externalMap;
}

function setExternalMap(newExternalMap) {
  externalMap = fromJS(newExternalMap);
}

function resetExternalRegistry(newExternals, newExternalMap) {
  externals = fromJS(newExternals);
  setExternalMap(newExternalMap);
}

export {
  addToExternalBlockList,
  isExternalInBlockList,
  getExternalBlockList,
  // registerExternal,
  getExternal,
  getExternals,
  getExternalMap,
  setExternalMap,
  resetExternalRegistry,
};
