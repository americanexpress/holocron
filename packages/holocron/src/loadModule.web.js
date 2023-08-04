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

import { getModule, getModuleMap } from './moduleRegistry';
import { getUnregisteredRequiredExternals } from './externalRegistry';

const noop = () => { };

function createScript({ url, integrity, onLoad = noop }) {
  const script = global.document.createElement('script');
  const isProduction = process.env.NODE_ENV === 'production';
  const head = global.document.getElementsByTagName('head')[0];

  script.type = 'text/javascript';
  script.async = true;
  script.crossOrigin = 'anonymous';

  if (isProduction && integrity) {
    script.integrity = integrity;
  }

  const clientCacheRevision = getModuleMap().get(
    'clientCacheRevision',
    getModuleMap().get('key')
  );
  script.src = isProduction && clientCacheRevision
    ? `${url}?clientCacheRevision=${clientCacheRevision}`
    : url;

  const listener = new Promise((resolve, reject) => {
    script.addEventListener('error', (event) => {
      reject(event.message);
    });

    script.addEventListener('load', () => {
      resolve(onLoad());
    });
  });

  head.appendChild(script);

  return listener;
}

function loadModuleFallbackExternals(moduleName) {
  const fallbacks = getUnregisteredRequiredExternals(moduleName);
  const baseUrl = getModuleMap().getIn(['modules', moduleName, 'baseUrl']);

  return Promise.all(fallbacks.map(({ name, integrity }) => createScript({
    url: `${baseUrl}${name}.browser.js`,
    integrity,
  })));
}

async function loadModule(moduleName, moduleData) {
  if (typeof moduleName !== 'string') {
    throw new TypeError('loadModule: moduleName must be a string');
  }

  if (typeof moduleData !== 'object') {
    throw new TypeError('loadModule: moduleData must be an object');
  }
  // first load all module fallbacks.
  // possible race condition if two modules require the same fallback and version.
  await loadModuleFallbackExternals(moduleName);
  // then load the module script.
  const integrity = moduleData.getIn([
    // eslint-disable-next-line no-underscore-dangle
    window.__holocron_module_bundle_type__,
    'integrity',
  ]);
  const url = moduleData.getIn([
    // eslint-disable-next-line no-underscore-dangle
    window.__holocron_module_bundle_type__,
    'url',
  ]);

  return createScript({
    url,
    integrity,
    onLoad: () => getModule(moduleName),
  });
}

export default loadModule;
