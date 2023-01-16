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

import assert from 'assert';
import { parse as parseUrl } from 'url';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import ssri from 'ssri';
import requireFromString from 'require-from-string';

/**
 * Creates a loader that can be use for modules and externals
 * @param {Object} options
 * @param {string} options.context what's being loaded (e.g. module)
 * @param {number} options.maxRetries limit of retries
 * @param {number} options.maxSockets limit of sockets
 * @param {(url: string) => boolean} options.isInBlockList checks if asset url is in block list
 * @param {(url: string) => void} options.addToBlockList adds asset url into block list
 */
const createLoader = ({
  context,
  maxRetries,
  maxSockets,
  isInBlockList,
  addToBlockList,
}) => {
  const agentOptions = { maxSockets };

  /**
   * Module Map data
   * @typedef {Object} ModuleMapData
   * @property {string} url
   * @property {string} integrity
   */

  /**
   * module-map.json type
   * @typedef {Object} ModuleMap
   * @property {ModuleMapData} node
   * @property {ModuleMapData} browser
   */

  /**
   * fetches assets (e.g. module, external)
   * @param {string} assetUrl
   * @returns {Promise<Response>}
   */
  function fetchAssetContent(assetUrl) {
    let tries = 0;
    const { protocol } = parseUrl(assetUrl);

    if (process.env.NODE_ENV === 'production') {
      assert(protocol === 'https:', `HTTPS must be used to load ${context} in production`);
    }

    const agent = protocol === 'http:'
      ? new HttpAgent(agentOptions)
      : new HttpsAgent(agentOptions);

    const fetchAssetContentAttempt = () => fetch(assetUrl, { agent })
      .catch((err) => {
        tries += 1;

        if (tries > maxRetries) {
          throw err;
        }

        console.warn(`Encountered error fetching ${context} at ${assetUrl}: ${err.message}\nRetrying (${tries})...`);

        return fetchAssetContentAttempt();
      });

    return fetchAssetContentAttempt();
  }

  /**
   * checks response status and throws error
   * @param {Response} response
   */
  function checkStatusAndMaybeThrowError(response) {
    if (response.status < 200 || response.status >= 300) {
      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    }
  }

  /**
   * @callback OnLoad
   * @param {{ assetName: string, asset: any }} data
   */

  /**
   * Loads a Module
   * @param {string} assetName
   * @param {ModuleMap} moduleMap
   * @param {OnLoad} onLoad
   */
  async function loader(
    assetName,
    { node: { integrity, url } },
    onLoad = () => undefined
  ) {
    try {
      assert(typeof assetName === 'string', `${context} assetName must be a string`);

      if (isInBlockList(url)) {
        throw new Error(`${context} at ${url} previously failed to load, will not attempt to reload.`);
      }

      const assetResponse = await fetchAssetContent(url);
      let nodeAsset;

      try {
        checkStatusAndMaybeThrowError(assetResponse);

        const assetString = await assetResponse.text();

        if (process.env.NODE_ENV === 'production') {
          const actualSRI = ssri.fromData(
            assetString,
            { algorithms: ['sha256', 'sha384'] }
          ).toString();

          assert(integrity === actualSRI, `SRI for ${context} at ${url} must match SRI in module map.\n Expected ${integrity}, received ${actualSRI}`);
        }

        nodeAsset = requireFromString(assetString, url);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Holocron ${context} "%s" at "%s" failed to execute.\n\t[Error Message]: "%s"\nPlease fix any errors and wait for it to be reloaded.`, assetName, url, err.message);
        } else if (err.shouldBlockModuleReload !== false) {
          addToBlockList(url);
          console.warn(`Holocron ${context} at ${url} added to blocklist: ${err.message}`);
        }
        throw err;
      }

      onLoad({
        assetName,
        asset: nodeAsset,
      });

      return nodeAsset;
    } catch (e) {
      console.log(`Failed to load Holocron ${context} at ${url}`);
      console.log(e.stack);
      throw e;
    }
  }

  return loader;
};

export default createLoader;