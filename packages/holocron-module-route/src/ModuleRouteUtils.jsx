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

export const addToRouteProps = (route, newProps) => ({
  ...route,
  props: {
    ...route.props,
    ...newProps,
  },
});

export const passChildrenProps = (givenRoutes = [], newProps) => {
  try {
    const routes = typeof givenRoutes === 'function' ? givenRoutes(newProps.store) : givenRoutes;
    return Array.isArray(routes) ? routes.map((route) => addToRouteProps(route, newProps))
      : [addToRouteProps(routes, newProps)];
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`Error thrown ${e} please check childRoutes on your root module`);
    return null;
  }
};

export const getRouteIndex = (
  routes, props
) => routes && createRoutes(passChildrenProps(routes, props))[0].indexRoute;
export const createModuleRoute = (defaultProps, props) => {
  const { moduleName, store } = props;

  const capitalizePath = (path) => path[0].toUpperCase() + path.slice(1).toLowerCase();

  let moduleRoute = {
    ...defaultProps,
    ...props,
    title: props.title || (props.path && capitalizePath(props.path)),
  };

  if (moduleName) {
    moduleRoute = Object.assign(moduleRoute, {
      getIndexRoute(partialNextState, cb) {
        store.dispatch(loadModule(moduleName))
          .then(
            ({ childRoutes }) => cb(null, getRouteIndex(childRoutes, { store })),
            cb
          );
      },
      getChildRoutes(location, cb) {
        store.dispatch(loadModule(moduleName))
          .then(
            ({ childRoutes }) => cb(null, passChildrenProps(childRoutes, { store })),
            cb
          );
      },
      getComponent(nextState, cb) {
        store.dispatch(loadModule(moduleName))
          .then(
            (module) => cb(null, module),
            cb
          );
      },
    });
  }
  if (moduleName && !moduleRoute.onEnter) {
    moduleRoute = Object.assign(moduleRoute, {
      onEnter(nextState, replace, cb) {
        store.dispatch(loadModule(moduleName))
          .then(
            ({ onEnterRouteHook }) => {
              if (!onEnterRouteHook) {
                return cb();
              }
              const onEnter = onEnterRouteHook.length === 1
                ? onEnterRouteHook(store) : onEnterRouteHook;
              if (onEnter.length === 3) {
                return onEnter(nextState, replace, cb);
              }
              onEnter(nextState, replace);
              return cb();
            },
            cb
          );
      },
    });
  }
  return moduleRoute;
};

export function createModuleRouteFromElement({ type, props }) {
  const route = createModuleRoute(type.defaultProps, props);
  if (route.children) {
    const { store } = props;
    const children = passChildrenProps(route.children, { store });
    const childRoutes = createRoutesFromReactChildren(children, route);

    if (childRoutes.length > 0) {
      route.childRoutes = childRoutes;
    }
    delete route.children;
  }
  return route;
}
