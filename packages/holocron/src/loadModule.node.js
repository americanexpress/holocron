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

import { isModuleInBlockList, addToModuleBlockList } from './moduleRegistry';

const maxRetries = Number(process.env.HOLOCRON_SERVER_MAX_MODULES_RETRY) || 3;
const maxSockets = Number(process.env.HOLOCRON_SERVER_MAX_SIM_MODULES_FETCH) || 30;
const agentOptions = { maxSockets };

function fetchModuleContent(moduleUrl) {
  let tries = 0;
  const { protocol } = parseUrl(moduleUrl);

  if (process.env.NODE_ENV === 'production') {
    assert(protocol === 'https:', 'HTTPS must be used to load modules in production');
  }

  const agent = protocol === 'http:'
    ? new HttpAgent(agentOptions)
    : new HttpsAgent(agentOptions);

  const fetchModuleContentAttempt = () => fetch(moduleUrl, { agent })
    .catch((err) => {
      tries += 1;
      if (tries > maxRetries) {
        throw err;
      }
      console.warn(`Encountered error fetching module at ${moduleUrl}: ${err.message}\nRetrying (${tries})...`);
      return fetchModuleContentAttempt();
    });

  return fetchModuleContentAttempt();
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

export default async function loadModule(
  moduleName,
  { node: { integrity, url } },
  onModuleLoad = () => null
) {
  try {
    assert(typeof moduleName === 'string', 'moduleName must be a string');

    if (isModuleInBlockList(url)) {
      throw new Error(`module at ${url} previously failed to load, will not attempt to reload.`);
    }

    const moduleResponse = await fetchModuleContent(url);
    let nodeModule;

    try {
      checkStatus(moduleResponse);
      const moduleString = await moduleResponse.text();
      if (process.env.NODE_ENV === 'production') {
        const actualSRI = ssri.fromData(
          moduleString,
          { algorithms: ['sha256', 'sha384'] }
        ).toString();

        assert(integrity === actualSRI, `SRI for module at ${url} must match SRI in module map.\n Expected ${integrity}, received ${actualSRI}`);
      }
      nodeModule = requireFromString(moduleString, url);
    } catch (err) {
      if (err.shouldBlockModuleReload !== false || process.env.NODE_ENV !== 'development') {
        addToModuleBlockList(url);
        console.warn(`Holocron module at ${url} added to blocklist: ${err.message}`);
      }
      throw err;
    }

    onModuleLoad({
      moduleName,
      module: nodeModule,
    });

    return nodeModule;
  } catch (e) {
    console.log(`Failed to load Holocron module at ${url}`);
    console.log(e.stack);
    throw e;
  }
}
