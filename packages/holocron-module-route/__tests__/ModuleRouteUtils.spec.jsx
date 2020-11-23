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

import React from 'react';
// holocron is a peer dependency, I would add it to devDeps, but it is immediately mocked
import { loadModule } from 'holocron'; // eslint-disable-line import/no-unresolved,import/extensions
import ModuleRoute from '../src/ModuleRoute';
import {
  addToRouteProps,
  passChildrenProps,
  getRouteIndex,
  createModuleRoute,
  createModuleRouteFromElement,
} from '../src/ModuleRouteUtils';

jest.mock('holocron', () => ({
  loadModule: jest.fn((moduleName) => {
    const modules = {
      'test-module': {
        childRoutes: [{
          moduleName: 'another-module',
          path: 'another',
          indexRoute: 'index',
        }],
      },
      'store-hook-module': {
        onEnterRouteHook: (store) => (nextState, replace) => {
          store.dispatch({ type: 'NEXT_STATE', nextState });
          replace('/test-store-hook');
        },
      },
      'sync-hook-module': {
        onEnterRouteHook: jest.fn((nextState, replace) => replace('/test-sync-hook')),
      },
      'async-hook-module': {
        onEnterRouteHook: (nextState, replace, cb) => {
          replace('/test-async-hook');
          cb('async hook done');
        },
      },
    };

    return Promise.resolve(modules[moduleName]);
  }),
}));

describe('ModuleRouteUtils', () => {
  describe('addToRouteProps', () => {
    it('should add props and replace old props with new ones', () => {
      const route = {
        unchanged: 'value',
        props: {
          unchanged: 'value',
          changed: 'old',
        },
      };
      const newProps = {
        changed: 'new',
        new: 'prop',
      };
      expect(addToRouteProps(route, newProps)).toMatchSnapshot();
    });
  });

  describe('passChildrenProps', () => {
    console.log = jest.fn();
    beforeEach(() => console.log.mockClear());
    it('should pass props to children', () => {
      const routes = [{}];
      const newProps = { hello: 'world' };
      expect(passChildrenProps(routes, newProps)).toMatchSnapshot();
    });

    it('should convert a single route to an array', () => {
      const routes = passChildrenProps({}, {});
      expect(Array.isArray(routes)).toBe(true);
    });

    it('should pass the store to a function that creates routes', () => {
      const getState = () => 'Hello world';
      const createRoutes = (store) => ({ props: { state: store.getState() } });
      const newProps = { store: { getState } };
      expect(passChildrenProps(createRoutes, newProps)).toMatchSnapshot();
    });

    it('should return an empty array if no routes are provided', () => {
      expect(passChildrenProps(undefined, {})).toMatchSnapshot();
    });
    it('catches and logs error when an error is thrown', () => {
      const childRoutes = () => [
        // needs to be undefined for this to throw an error
        // eslint-disable-next-line no-undef
        <ModuleRoute path="/" property={a.b} />,
      ];
      passChildrenProps(childRoutes, 'test');
      expect(console.log).toHaveBeenCalled();
      expect(console.log.mock.calls[0][0]).toEqual(expect.stringContaining('Error thrown ReferenceError: a is not defined please check childRoutes on your root module'));
    });
  });
  describe('getRouteIndex', () => {
    it('should return the index route', () => {
      const indexRoute = 'indexRoute';
      const routes = [{ indexRoute }, { indexRoute: 'lol' }];
      expect(getRouteIndex(routes)).toBe(indexRoute);
    });
  });

  describe('createModuleRoute', () => {
    const dispatch = jest.fn((action) => {
      if (typeof action === 'function') {
        return action(dispatch);
      }
      return action;
    });
    const store = { dispatch };
    const defaultProps = {
      default: 'value',
      hello: 'world',
    };

    beforeEach(() => dispatch.mockClear());

    it('should create a valid module route', () => {
      const props = { title: 'Test', moduleName: 'test-module' };
      const moduleRoute = createModuleRoute(defaultProps, props);
      expect(moduleRoute).toMatchSnapshot();
    });

    it('should use the path to generate a title if none exists', () => {
      const props = { path: 'edit', moduleName: 'edit-module' };
      const moduleRoute = createModuleRoute(defaultProps, props);
      expect(moduleRoute.title).toBe('Edit');
    });

    it('should not add moduleRoute props if no moduleName is present', () => {
      const moduleRoute = createModuleRoute(defaultProps, { title: 'test' });
      expect(moduleRoute).toMatchSnapshot();
    });

    describe('getIndexRoute', () => {
      it('should get the index route', (done) => {
        const moduleName = 'test-module';
        const props = { moduleName, store };
        const moduleRoute = createModuleRoute(defaultProps, props);
        const callback = jest.fn(() => {
          expect(loadModule).toHaveBeenCalledWith(moduleName);
          expect(callback.mock.calls[0][1]).toBe('index');
          done();
        });
        return moduleRoute.getIndexRoute(undefined, callback);
      });
    });

    describe('getChildRoutes', () => {
      it('should get the child routes', (done) => {
        const moduleName = 'test-module';
        const props = { moduleName, store };
        const moduleRoute = createModuleRoute(defaultProps, props);
        const callback = jest.fn(() => {
          expect(loadModule).toHaveBeenCalledWith(moduleName);
          expect(callback.mock.calls[0][1]).toMatchSnapshot();
          done();
        });
        return moduleRoute.getChildRoutes(undefined, callback);
      });
    });

    describe('getComponent', () => {
      it('should get the module', (done) => {
        const moduleName = 'test-module';
        const props = { moduleName, store };
        const moduleRoute = createModuleRoute(defaultProps, props);
        const callback = jest.fn(() => {
          expect(loadModule).toHaveBeenCalledWith(moduleName);
          expect(callback.mock.calls[0][1]).toMatchSnapshot();
          done();
        });
        return moduleRoute.getComponent(undefined, callback);
      });
    });

    describe('onEnter', () => {
      it('should allow the Module to specify an onEnter hook that takes the store and returns a hook', (done) => {
        const moduleName = 'store-hook-module';
        const props = { moduleName, store };
        const moduleRoute = createModuleRoute(defaultProps, props);

        const replace = jest.fn();
        function cb(cbMessage) {
          expect(cbMessage).toBeUndefined();
          expect(store.dispatch).toHaveBeenCalledWith({ type: 'NEXT_STATE', nextState: 'nextState' });
          expect(replace).toHaveBeenCalledWith('/test-store-hook');
          done();
        }
        moduleRoute.onEnter('nextState', replace, cb);
      });

      it('should allow the Module to specify a synchronous onEnter hook', (done) => {
        const moduleName = 'sync-hook-module';
        const props = { moduleName, store };
        const moduleRoute = createModuleRoute(defaultProps, props);

        const replace = jest.fn();
        function cb(cbMessage) {
          expect(cbMessage).toBeUndefined();
          expect(replace).toHaveBeenCalledWith('/test-sync-hook');
          done();
        }
        moduleRoute.onEnter('nextState', replace, cb);
      });

      it('should allow the Module to specify an asyncronous hook', (done) => {
        const moduleName = 'async-hook-module';
        const props = { moduleName, store };
        const moduleRoute = createModuleRoute(defaultProps, props);

        const replace = jest.fn();
        function cb(cbMessage) {
          expect(cbMessage).toBe('async hook done');
          expect(replace).toHaveBeenCalledWith('/test-async-hook');
          done();
        }
        moduleRoute.onEnter('nextState', replace, cb);
      });

      it('should allow the Module to not specify an onEnter hook', (done) => {
        const moduleName = 'test-module';
        const props = { moduleName, store };
        const moduleRoute = createModuleRoute(defaultProps, props);

        const replace = jest.fn();
        function cb() {
          // Don't need to assert anything, as long as it reached here everything's good
          done();
        }
        moduleRoute.onEnter('nextState', replace, cb);
      });

      it('should only use the onEnter hook defined by the Module if there is not one defined directly on the route', () => {
        const moduleName = 'sync-hook-module';
        const onEnter = jest.fn();
        const props = { moduleName, store, onEnter };
        const moduleRoute = createModuleRoute(defaultProps, props);

        moduleRoute.onEnter('nextState', 'replace', 'cb');
        expect(onEnter).toHaveBeenCalledWith('nextState', 'replace', 'cb');
      });
    });
  });

  describe('createModuleRouteFromElement', () => {
    it('should convert a jsx ModuleRoute to a valid module route', () => {
      const route = (
        <ModuleRoute path="/" moduleName="parent-module">
          <ModuleRoute path="test" moduleName="test-module" />
        </ModuleRoute>
      );
      const moduleRoute = createModuleRouteFromElement(route);
      expect(moduleRoute).toMatchSnapshot();
    });

    it('should not add childRoutes if the only children are not valid elements', () => {
      const route = (
        // eslint-disable-next-line react/self-closing-comp
        <ModuleRoute path="/" moduleName="parent-module">
          {[]}
        </ModuleRoute>
      );
      const moduleRoute = createModuleRouteFromElement(route);
      expect(moduleRoute).toMatchSnapshot();
    });
  });
});
