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

import { Map as iMap, fromJS } from 'immutable';
import semver from 'semver';

let registeredExternals = iMap();
let requiredModuleExternals = iMap();

function getExternals() {
  return registeredExternals.toJS();
}

function validateExternal({ providedVersion, requestedRange }) {
  return semver.satisfies(providedVersion, requestedRange);
}

function registerExternal({ name, version, module }) {
  registeredExternals = registeredExternals.setIn([name, version], module);
}

function getExternal({ name, version }) {
  return registeredExternals.getIn([name, version]);
}

function hasExternalLoaded({ name, version }) {
  return registeredExternals.hasIn([name, version]);
}

function addRequiredExternal({
  moduleName, name, version, semanticRange, filename, integrity,
}) {
  requiredModuleExternals = requiredModuleExternals.setIn([moduleName, name], fromJS({
    version,
    semanticRange,
    filename,
    integrity,
  }));
}

function getRequiredExternals(moduleName) {
  return Object.entries(
    requiredModuleExternals.get(moduleName, iMap()).toJS()
  ).map(([name, rest]) => ({
    moduleName,
    name,
    ...rest,
  }));
}

function getRequiredExternalsRegistry() {
  return requiredModuleExternals.toJS();
}

function setRequiredExternalsRegistry(newRequiredModuleExternals) {
  requiredModuleExternals = fromJS(newRequiredModuleExternals);
}

function getUnregisteredRequiredExternals(moduleName) {
  const fallbacks = getRequiredExternals(moduleName);

  return fallbacks.filter(
    ({ name, version }) => !hasExternalLoaded({ name, version })
  );
}

export {
  validateExternal,
  registerExternal,
  getExternal,
  getExternals,
  addRequiredExternal,
  getUnregisteredRequiredExternals,
  getRequiredExternals,
  getRequiredExternalsRegistry,
  setRequiredExternalsRegistry,
};
