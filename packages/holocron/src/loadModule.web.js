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

// Ignoring this for now because it does nothing
/* istanbul ignore next */
function onScriptComplete() {
  // Do nothing for now
}

export default function loadModule(moduleName, moduleData) {
  return new Promise((resolve, reject) => {
    if (typeof moduleName !== 'string') {
      throw new TypeError('loadModule: moduleName must be a string');
    }

    if (typeof moduleData !== 'object') {
      throw new TypeError('loadModule: moduleData must be an object');
    }

    // eslint-disable-next-line no-underscore-dangle
    const integrity = moduleData.getIn([window.__holocron_module_bundle_type__, 'integrity']);
    // eslint-disable-next-line no-underscore-dangle
    const url = moduleData.getIn([window.__holocron_module_bundle_type__, 'url']);
    const isProduction = process.env.NODE_ENV === 'production';

    const head = global.document.getElementsByTagName('head')[0];
    const script = global.document.createElement('script');
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.async = true;
    script.timeout = 120000;

    script.crossOrigin = 'anonymous';

    if (isProduction) {
      script.integrity = integrity;
    }
    script.src = isProduction ? `${url}?key=${getModuleMap().get('key')}` : url;
    const timeout = setTimeout(onScriptComplete, 120000);
    script.addEventListener('error', (event) => {
      clearTimeout(timeout);
      reject(event.message);
    });

    script.addEventListener('load', () => {
      clearTimeout(timeout);
      resolve(getModule(moduleName));
    });

    head.appendChild(script);
  });
}
