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

/**
 * This registry tracks each external and its version that
 * is loaded and available for modules to use.
 * shape: {
 *    [externalName]:  {
 *       [external version]: [external code]
 *    }
 * }
 * @type { Immutable.Map } registry
 * @param {Immutable.Map} registry.[externalName] name of external
 * @param {Immutable.Map} registry.[externalName].[externalVersion] version of external
 * @param {any} registry.[externalName].[externalVersion].code code of external
 */
let registeredExternals = iMap();

/**
 * This registry tracks all the required fallbacks for each
 * module to successfully load.
 * shape: {
 *    [name of holocron module]: {
 *      [name of external]: {
 *         name: {string}[name of external],
 *         version: {string}[version of external fallback],
 *         semanticRange: {string}[range of expected external],
 *         integrity: {string}[hash value of module code]
 *      }
 *    }
 * }
 * @type { Immutable.Map } registry
 * @param {string} registry.[moduleName].[externalName].name external name
 * @param {string} registry.[moduleName].[externalName].version external version
 * @param {string} registry.[moduleName].[externalName].semanticRange accepted semantic range
 * @param {string} registry.[moduleName].[externalName].integrity hash value of fallback external
 */
let requiredModuleExternals = iMap();

/**
 * returns registry of registered externals
 * @returns { object } - registered external registry
 */
function getRegisteredExternals() {
  return registeredExternals.toJS();
}

/**
 * Validate if given range is satisfied by the provided version
 * @param {string} {providedVersion - version to validate against given range
 * @param {string} requestedRange} - semantic range
 * @returns {boolean}
 */
function validateExternal({ providedVersion, requestedRange }) {
  return semver.satisfies(providedVersion, requestedRange);
}

/**
 * Add external to the registered externals registry
 * @param {string} name name of the external
 * @param {string} version version of the externals
 * @param {any} module the externals code
 */
function registerExternal({ name, version, module }) {
  registeredExternals = registeredExternals.setIn([name, version], module);
}

/**
 * Returns the code of the requested external
 * @param {any} name name of the external dependency
 * @param {any} version version of the external dependency
 * @returns {any} externals code
 */
function getExternal({ name, version }) {
  return registeredExternals.getIn([name, version]);
}

/**
 * validate if specific version of external dependency has been registered
 * @param {string} name
 * @param {string} version
 * @returns {boolean}
 */
function hasExternalLoaded({ name, version }) {
  return registeredExternals.hasIn([name, version]);
}

/**
 * Remove registered required externals for given module
 * @param {string} moduleName
 */
function clearModulesRequiredExternals(moduleName) {
  requiredModuleExternals = requiredModuleExternals.delete(moduleName);
}

/**
 * Register missing external dependencies that a module requires to load
 * @param {string} moduleName name of the holocron module
 * @param {object} externals externals to be added
 * @param {object} externals.[externalName]
 * @param {string} externals.[externalName].name external name
 * @param {string} externals.[externalName].version external version
 * @param {string} externals.[externalName].semanticRange semantic range module will accept
 * @param {string} externals.[externalName].integrity hash value of fallback external
 */
function setModulesRequiredExternals({ moduleName, externals = {} }) {
  requiredModuleExternals = requiredModuleExternals.set(moduleName, fromJS(externals));
}

/**
 * Get the required external data for given module
 * @param {string} moduleName name of holocron module
 * @returns {array} Modules required externals
 */
function getRequiredExternals(moduleName) {
  return Object.entries(
    requiredModuleExternals.get(moduleName, iMap()).toJS()
  ).map(([name, rest]) => ({
    moduleName,
    name,
    ...rest,
  }));
}

/**
 * Get the requiredModuleExternal registry
 * @returns {object}
 */
function getRequiredExternalsRegistry() {
  return requiredModuleExternals.toJS();
}

/**
 * Set the requiredModuleExternals registry
 * @param {object} newRequiredModuleExternals
 */
function setRequiredExternalsRegistry(newRequiredModuleExternals = {}) {
  requiredModuleExternals = fromJS(newRequiredModuleExternals);
}

/**
 * get externals for module which have not already been registered
 * @param {string} moduleName
 * @returns {array}
 */
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
  getRegisteredExternals,
  getUnregisteredRequiredExternals,
  getRequiredExternals,
  getRequiredExternalsRegistry,
  setRequiredExternalsRegistry,
  setModulesRequiredExternals,
  clearModulesRequiredExternals,
};
