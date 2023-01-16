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

// import { getModule, getModuleMap } from './moduleRegistry';

/**
 * @typedef {Object} Options
 * @property {string} context
 * @property {(assetName: string) => any} getAsset
 * @property {() => string | number | null} [clientCacheRevision]
 */

/**
 * @param {Options} options
 */
export default function createLoader({
  context,
  getAsset,
  clientCacheRevision,
}) {
  return function load(assetName, assetData) {
    return new Promise((resolve, reject) => {
      if (typeof assetName !== 'string') {
        throw new TypeError(`load ${context}: assetName must be a string`);
      }

      if (typeof assetData !== 'object') {
        throw new TypeError(`load ${context}: assetData must be an object`);
      }

      // TODO: should we look for a property for externals?
      if (!('__holocron_module_bundle_type__' in window)) {
        throw new Error(`Missing holocron ${context} bundle type`);
      }

      // @ts-ignore
      // eslint-disable-next-line no-underscore-dangle
      const integrity = assetData.getIn([window.__holocron_module_bundle_type__, 'integrity']);
      // @ts-ignore
      // eslint-disable-next-line no-underscore-dangle
      const url = assetData.getIn([window.__holocron_module_bundle_type__, 'url']);
      const isProduction = process.env.NODE_ENV === 'production';
      const head = global.document.getElementsByTagName('head')[0];
      const script = global.document.createElement('script');
      const revision = clientCacheRevision ? clientCacheRevision() : null;

      script.src = isProduction && revision ? `${url}?clientCacheRevision=${revision}` : url;
      script.type = 'text/javascript';
      script.charset = 'utf-8'; // deprecated but we can leave it just in case for old browsers
      script.async = true;
      // @ts-ignore
      script.timeout = 120000; // 'timeout' is not a valid property, does this actually work?
      script.crossOrigin = 'anonymous';

      if (isProduction) {
        script.integrity = integrity;
      }

      script.addEventListener('error', (event) => {
        reject(event.message);
      });

      script.addEventListener('load', () => {
        resolve(getAsset(assetName));
      });

      head.appendChild(script);
    });
  };
}
