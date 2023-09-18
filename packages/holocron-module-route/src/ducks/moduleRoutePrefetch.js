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

import { match } from '@americanexpress/one-app-router';
import { composeModules } from 'holocron';

function matchPromisified(options) {
  return new Promise((resolve, reject) => {
    match(options, (error, redirectLocation, renderProperties) => {
      if (error) {
        return reject(error);
      }
      return resolve({ renderProps: renderProperties, redirectLocation });
    });
  });
}

export const moduleRoutePrefetch = ({ routes, location }) => {
  if (!routes) {
    throw new Error('Routes must be provided to moduleRoutePrefetch');
  }

  if (!location) {
    throw new Error('Location must be provided to moduleRoutePrefetch');
  }

  return async (dispatch) => {
    const { renderProps } = await matchPromisified({ routes, location });

    if (!renderProps || !renderProps.routes) {
      throw new Error(`Unable to prefetch modules for ${location}, ensure location is valid`);
    }

    const matchedRoutes = renderProps.routes;
    const modules = matchedRoutes.reduce((accumulator, currentRoute) => {
      if (currentRoute.moduleName) {
        accumulator.push({ name: currentRoute.moduleName });
      }
      return accumulator;
    }, []);
    return dispatch(composeModules(modules));
  };
};

// This duck does not have a reducer
export default null;
