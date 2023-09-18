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

import { createRoutesFromReactChildren } from '@americanexpress/one-app-router/lib/RouteUtils';
import { createRoutes } from '@americanexpress/one-app-router';
// holocron is a peer dependency
import { loadModule } from 'holocron'; // eslint-disable-line import/no-unresolved,import/extensions

export const addToRouteProperties = (route, newProperties) => ({
  ...route,
  props: {
    ...route.props,
    ...newProperties,
  },
});

export const passChildrenProperties = (givenRoutes = [], newProperties) => {
  const routes = typeof givenRoutes === 'function' ? givenRoutes(newProperties.store) : givenRoutes;
  return Array.isArray(routes) ? routes.map((route) => addToRouteProperties(route, newProperties))
    : [addToRouteProperties(routes, newProperties)];
};

export const getRouteIndex = (
  routes, properties
) => routes && createRoutes(passChildrenProperties(routes, properties))[0].indexRoute;

const capitalizePath = (path) => path[0].toUpperCase() + path.slice(1).toLowerCase();

export const createModuleRoute = (defaultProps, properties) => {
  const { moduleName, store } = properties;

  let moduleRoute = {
    ...defaultProps,
    ...properties,
    title: properties.title || (properties.path && capitalizePath(properties.path)),
  };

  if (moduleName) {
    moduleRoute = Object.assign(moduleRoute, {
      getIndexRoute(partialNextState, callback) {
        store.dispatch(loadModule(moduleName))
          .then(
            ({ childRoutes }) => callback(null, getRouteIndex(childRoutes, { store }))
          )
          .catch(callback);
      },
      getChildRoutes(location, callback) {
        store.dispatch(loadModule(moduleName))
          .then(
            ({ childRoutes }) => callback(null, passChildrenProperties(childRoutes, { store }))
          )
          .catch(callback);
      },
      getComponent(nextState, callback) {
        store.dispatch(loadModule(moduleName))
          .then(
            (module) => callback(null, module)
          )
          .catch(callback);
      },
    });
  }
  if (moduleName && !moduleRoute.onEnter) {
    moduleRoute = Object.assign(moduleRoute, {
      onEnter(nextState, replace, callback) {
        store.dispatch(loadModule(moduleName))
          .then(
            ({ onEnterRouteHook }) => {
              if (!onEnterRouteHook) {
                return callback();
              }
              const onEnter = onEnterRouteHook.length === 1
                ? onEnterRouteHook(store) : onEnterRouteHook;
              if (onEnter.length === 3) {
                return onEnter(nextState, replace, callback);
              }
              onEnter(nextState, replace);
              return callback();
            }
          )
          .catch(callback);
      },
    });
  }
  return moduleRoute;
};

export function createModuleRouteFromElement({ type, props }) {
  const route = createModuleRoute(type.defaultProps, props);
  if (route.children) {
    const { store } = props;
    const children = passChildrenProperties(route.children, { store });
    const childRoutes = createRoutesFromReactChildren(children, route);

    if (childRoutes.length > 0) {
      route.childRoutes = childRoutes;
    }
    delete route.children;
  }
  return route;
}
