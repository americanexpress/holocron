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

import assert from 'assert';
import { parse as parseUrl } from 'url';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import ssri from 'ssri';
import requireFromString from 'require-from-string';

import {
  getUnregisteredRequiredExternals,
  validateExternal,
  registerExternal,
  clearModulesRequiredExternals,
  setModulesRequiredExternals,
  getRequiredExternalsRegistry,
} from './externalRegistry';
import { isModuleInBlockList, addToModuleBlockList, registerModuleUsingExternals } from './moduleRegistry';

const maxRetries = Number(process.env.HOLOCRON_SERVER_MAX_MODULES_RETRY) || 3;
const maxSockets = Number(process.env.HOLOCRON_SERVER_MAX_SIM_MODULES_FETCH) || 30;
const agentOptions = { maxSockets };

/**
 * Checks a request's response status throws an error
 * with status as error message
 * @param {object} response Http Response object
 */
const checkStatus = (response) => {
  // TODO: If 404, error could mention old bundler and recommend upgrading
  if (!response.ok) {
    throw new Error(response.statusText || response.status);
  }
};

/**
 * Fetches asset from CDN. Automatically retries when request fails
 * @param {string} assetUrl
 * @param {boolean} parseAsJson
 * @returns {Promise<string>}
 */
const fetchAsset = async (assetUrl, parseAsJson) => {
  const { protocol } = parseUrl(assetUrl);

  if (process.env.NODE_ENV === 'production') {
    assert(protocol === 'https:', 'HTTPS must be used to load modules in production');
  }

  const agent = protocol === 'http:'
    ? new HttpAgent(agentOptions)
    : new HttpsAgent(agentOptions);

  const fetchAssetAttempt = async (tries) => {
    let response;

    try {
      response = await fetch(assetUrl, { agent });
    } catch (err) {
      if (tries > maxRetries) {
        throw err;
      }
      // eslint-disable-next-line max-len, no-console -- long message
      console.warn(`Encountered error fetching module at ${assetUrl}: ${err.message}\nRetrying (${tries})...`);

      return fetchAssetAttempt(tries + 1);
    }

    checkStatus(response);
    return parseAsJson ? response.json() : response.text();
  };

  return fetchAssetAttempt(1);
};

/**
 * Fetches a node module from url. It uses 'requireFromString'
 * to load the module from a string
 * @param {string} url CDN url
 * @param {string} integrity Integrity hash
 * @param {object} context Node Module context
 * @param {string} context.name Node Module name
 * @param {string} context.type Node Module type (e.g. holocron module, external  etc)
 * @returns Node Module as module
 */
const fetchNodeModule = async (url, integrity, context) => {
  try {
    const moduleString = await fetchAsset(url);

    if (process.env.NODE_ENV !== 'development') {
      const actualSRI = ssri.fromData(
        moduleString,
        { algorithms: ['sha256', 'sha384'] }
      ).toString();
      // eslint-disable-next-line max-len -- long message
      assert(integrity === actualSRI, `SRI for module at ${url} must match SRI in module map.\n Expected ${integrity}, received ${actualSRI}`);
    }

    return requireFromString(moduleString, url);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn([
        `${context.type} "${context.name}" at "${url}" failed to execute.`,
        `\t[Error Message]: "${err.message}"`,
        'Please fix any errors and wait for it to be reloaded.',
      ].join('\n'));
    } else if (err.shouldBlockModuleReload !== false) {
      addToModuleBlockList(url);

      console.warn(`${context.type} at ${url} added to blocklist: ${err.message}`);
    }
    throw err;
  }
};

/**
 * Loads Fallback Externals server bundle for a module
 * @param {string} baseUrl path to the assets
 * @param {string} moduleName module name
 */
const loadModuleFallbackExternals = async (baseUrl, moduleName) => {
  const fallbacks = getUnregisteredRequiredExternals(moduleName);

  await Promise.all(
    fallbacks.map(async ({ name, version, nodeIntegrity }) => {
      const fallbackDependency = await fetchNodeModule(`${baseUrl}${name}.node.js`, nodeIntegrity, {
        type: 'External Fallback',
        name,
      });

      registerExternal({ name, version, module: fallbackDependency });
    })
  );
};

/**
 * Validates Legacy Required Externals
 * @param {object} params
 * @param {object} params.holocronModule Holocron module
 * @param {string} params.moduleName module name
 * @param {object} params.providedExternals Provided Externals
 */
const validateLegacyRequiredExternals = ({
  moduleName,
  holocronModule,
  providedExternals,
}) => {
  const { requiredExternals } = holocronModule.appConfig || {};
  if (requiredExternals) {
    const messages = [];

    Object.entries(requiredExternals).forEach(([externalName, requestedExternalVersion]) => {
      const providedExternal = providedExternals && providedExternals[externalName];

      if (!providedExternal) {
        // eslint-disable-next-line max-len -- long message
        messages.push(`External '${externalName}' is required by ${moduleName}, but is not provided by the root module`);
      } else if (!validateExternal({
        providedVersion: providedExternal.version,
        requestedRange: requestedExternalVersion,
      })) {
        // eslint-disable-next-line max-len -- long message
        const failedExternalMessage = `${externalName}@${requestedExternalVersion} is required by ${moduleName}, but the root module provides ${providedExternal.version}`;
        if (process.env.ONE_DANGEROUSLY_ACCEPT_BREAKING_EXTERNALS) {
          // eslint-disable-next-line no-console -- console necissary for warning
          console.warn(failedExternalMessage);
        } else {
          messages.push(failedExternalMessage);
        }
      }
    });

    if (messages.length > 0) {
      // eslint-disable-next-line unicorn/error-message -- not empty string
      throw new Error(messages.join('\n'));
    }

    registerModuleUsingExternals(moduleName);
  }
};

/**
 * Validates Required Externals
 * @param {object} params
 * @param {object} params.requiredExternals Required Externals
 * @param {string} params.moduleName module name
 * @param {object} params.providedExternals Provided Externals
 * @param {boolean} params.enableUnlistedExternalFallbacks flag to enable external fallbacks
 */
const validateRequiredExternals = ({
  requiredExternals,
  moduleName,
  providedExternals,
  enableUnlistedExternalFallbacks,
}) => {
  const messages = [];
  let moduleCanBeSafelyLoaded = true;
  const moduleExternals = {};

  Object.keys(requiredExternals).forEach((externalName) => {
    const providedExternal = providedExternals[externalName];
    const requiredExternal = requiredExternals[externalName];
    const {
      version, name, nodeIntegrity, browserIntegrity, semanticRange,
    } = requiredExternal;
    const fallbackExternalAvailable = !!name && !!version && !!nodeIntegrity && !!browserIntegrity;
    const fallbackBlockedByRootModule = !!providedExternal && !providedExternal.fallbackEnabled;

    if (!providedExternal) {
      // eslint-disable-next-line max-len -- long message
      messages.push(`External '${externalName}' is required by ${moduleName}, but is not provided by the root module`);
      if (!enableUnlistedExternalFallbacks) {
        moduleCanBeSafelyLoaded = false;
      }
    } else if (
      !validateExternal({
        providedVersion: providedExternal.version,
        requestedRange: semanticRange,
      })
    ) {
      // eslint-disable-next-line max-len -- long message
      messages.push(`${externalName}@${semanticRange} is required by ${moduleName}, but the root module provides ${providedExternal.version}`);

      if (fallbackBlockedByRootModule) {
        moduleCanBeSafelyLoaded = false;
      }
    }

    if (fallbackExternalAvailable) {
      moduleExternals[name] = {
        name,
        version,
        semanticRange,
        nodeIntegrity,
        browserIntegrity,
      };
    }
  });

  if (messages.length > 0) {
    if (moduleCanBeSafelyLoaded || process.env.ONE_DANGEROUSLY_ACCEPT_BREAKING_EXTERNALS === 'true') {
      // eslint-disable-next-line no-console -- console necissary for error logging
      console.warn(messages.join('\n'));
    } else {
      // eslint-disable-next-line unicorn/error-message -- not empty string
      throw new Error(messages.join('\n'));
    }

    setModulesRequiredExternals({ moduleName, externals: moduleExternals });
  }
  registerModuleUsingExternals(moduleName);
};

/**
 * Fetches Module Config. Returns null if does not exist or an error has occurred
 * @param {string} baseUrl path to the assets
 * @returns {Promise<object | null>}
 */
const fetchModuleConfig = async (baseUrl) => {
  const moduleConfigUrl = `${baseUrl}module-config.json`;

  try {
    return await fetchAsset(moduleConfigUrl, true);
  } catch (err) {
    console.warn('Module Config failed to fetch and parse, external fallbacks will be ignored.', err);
  }

  return null;
};

const loadModule = async (
  moduleName,
  { node: { integrity, url }, baseUrl },
  onModuleLoad = () => null
) => {
  let moduleConfig;
  const oldRequiredExternals = getRequiredExternalsRegistry()[moduleName];
  clearModulesRequiredExternals(moduleName);
  try {
    assert(typeof moduleName === 'string', 'moduleName must be a string');
    if (isModuleInBlockList(url)) {
      throw new Error(`module at ${url} previously failed to load, will not attempt to reload.`);
    }

    // TODO: find a reliable way to get root module.
    // root modules can be built without getTenantRootModule
    const rootModule = global.getTenantRootModule ? global.getTenantRootModule() : null;

    // if no root module, module being loaded should be rootModule
    if (rootModule) {
      const {
        providedExternals: rootProvidedExternals,
        enableUnlistedExternalFallbacks,
      } = rootModule.appConfig;

      moduleConfig = await fetchModuleConfig(baseUrl);

      const { requiredExternals } = moduleConfig || {};
      if (requiredExternals) {
        validateRequiredExternals({
          moduleName,
          requiredExternals,
          providedExternals: rootProvidedExternals || {},
          enableUnlistedExternalFallbacks,
        });

        // this is required before loading module
        await loadModuleFallbackExternals(baseUrl, moduleName);
      }
    }

    const holocronModule = await fetchNodeModule(url, integrity, {
      type: 'Holocron module',
      name: moduleName,
    });

    onModuleLoad({
      moduleName,
      module: holocronModule,
    });

    // validate legacy required externals -- remove in next major
    // this handles case where root does not provide getTenantRootModule
    // but child still has required externals.
    if (!moduleConfig) {
      validateLegacyRequiredExternals({
        moduleName,
        holocronModule,
        providedExternals:
          rootModule && rootModule.appConfig && rootModule.appConfig.providedExternals,
      });
    }

    return holocronModule;
  } catch (e) {
    console.log(`Failed to load Holocron module at ${url}`, e);
    console.log(e.stack);

    setModulesRequiredExternals({ moduleName, externals: oldRequiredExternals });

    throw e;
  }
};

export default loadModule;
