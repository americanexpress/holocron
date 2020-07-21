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
import { getModuleLoadFn, getLoadModuleDataFn } from '../utility';

// This duck does not have a reducer
export default null;

export function composeModules(moduleConfigs, registry) {
  return (dispatch, getState, { fetchClient } = {}) => {
    const modulePromises = moduleConfigs.map((config) => {
      const { name } = config;
      return dispatch(loadModule(name, registry))
        .then((module) => {
          const load = getModuleLoadFn(module);

          if (load) {
            return dispatch(load(config.props));
          }

          const loadModuleData = getLoadModuleDataFn(module);

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
