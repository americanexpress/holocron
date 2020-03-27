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

import { loadModule } from './load';
import { LOAD_KEY } from './constants';

// This duck does not have a reducer
export default null;

function selectLoadModuleData(module) {
  // TODO remove module.loadModuleData in next major version
  if (module && module.loadModuleData) {
    return module.loadModuleData;
  }
  if (module && module.holocron && module.holocron.loadModuleData) {
    return module.holocron.loadModuleData;
  }
  return undefined;
}

export function composeModules(moduleConfigs) {
  return (dispatch, getState, { fetchClient } = {}) => {
    const modulePromises = moduleConfigs.map((config) => {
      const { name } = config;
      return dispatch(loadModule(name))
        .then((module) => {
          if (module[LOAD_KEY]) {
            return dispatch(module[LOAD_KEY](config.props));
          }

          const loadModuleData = selectLoadModuleData(module);

          if (loadModuleData) {
            return loadModuleData({
              store: { dispatch, getState },
              module,
              ownProps: config.props,
              fetchClient,
            });
          }

          return Promise.resolve();
        })
        .catch((error) => error);
    });
    return Promise.all(modulePromises);
  };
}
