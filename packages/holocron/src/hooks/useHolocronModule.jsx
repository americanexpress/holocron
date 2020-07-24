/*
 * Copyright 2020 American Express Travel Related Services Company, Inc.
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

/* eslint-disable
  camelcase,
  react/jsx-pascal-case,
  no-underscore-dangle,
  react/jsx-props-no-spreading,
  react/destructuring-assignment
*/

import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { useSelector, useDispatch } from 'react-redux';
import shallowEqual from 'shallowequal';

import { MODULE_REDUCER_ADDED } from '../ducks/constants';
import { loadModule, registerModuleReducer } from '../ducks/load';
import { useHolocronContext } from './useHolocron';
import {
  getLoadModuleDataFn,
  getModuleReducer,
  createModuleStateSelector,
  createHolocronModuleStateSelector,
} from '../utility';

export const HolocronModuleContext = React.createContext({});

export function useHolocronModuleContext() {
  return React.useContext(HolocronModuleContext);
}

export default function useHolocronModule(config = { name: 'module' }) {
  const { store, registry, ssr } = useHolocronContext();

  const __Holocron_Module__ = React.useMemo(
    () => registry.getModule(config.name) || null,
    [config, registry]
  );

  const moduleConfig = React.useMemo(() => ({
    ...(__Holocron_Module__ || {}).holocron || {},
    ...config || {},
    reducer: config.reducer || getModuleReducer(__Holocron_Module__),
    loadModuleData: config.loadModuleData || getLoadModuleDataFn(__Holocron_Module__),
  }), [config, registry, __Holocron_Module__]);

  const moduleState = useSelector(
    React.useMemo(
      () => createModuleStateSelector(moduleConfig),
      [moduleConfig]
    )
  );
  const holocronState = useSelector(
    React.useMemo(
      () => createHolocronModuleStateSelector(moduleConfig),
      [moduleConfig]
    )
  );

  const dispatch = useDispatch();

  const [moduleData, setModuleData] = React.useState(null);
  const [moduleLoadStatus, setLoadStatus] = React.useState(() => (ssr ? 'loaded' : 'initial'));
  const loadModuleData = React.useCallback((ownProps) => {
    if (!moduleConfig.loadModuleData || ssr) {
      setLoadStatus('loaded');
      return Promise.resolve();
    }
    setLoadStatus('loading');
    return Promise.resolve(
      dispatch(async (_, getState, { fetchClient }) => moduleConfig
        .loadModuleData({
          store: { dispatch, getState },
          fetchClient,
          ownProps,
          module: __Holocron_Module__,
        }))
    ).then((data) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug('Holocron Module "%s" data loaded successfully!', moduleConfig.name);
        console.dir(data);
      }
      setLoadStatus('loaded');
      setModuleData(data);
      return data;
    }).catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug('Holocron Module "%s" data failed to be loaded..', moduleConfig.name);
        console.error(error);
      }
      setLoadStatus('error');
      return error;
    });
  }, [moduleConfig, __Holocron_Module__, ssr]);

  React.useEffect(() => {
    if (
      moduleConfig.reducer
      && registry.getModuleReducer(moduleConfig.name) !== moduleConfig.reducer
    ) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('Loading reducer for Holocron Module "%s"', moduleConfig.name);
      }
      // TODO: rebuild reducer for module
      registry.setModuleReducer(moduleConfig.name, moduleConfig.reducer);
    }
  }, [moduleConfig]);

  React.useEffect(() => {
    if (
      !holocronState.isReducerLoaded && registry.getModuleReducer(moduleConfig.name)
    ) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('Loading reducer for Holocron Module "%s"', moduleConfig.name);
      }
      dispatch(registerModuleReducer(moduleConfig.name));
      store.rebuildReducer(registry);
      dispatch({ type: MODULE_REDUCER_ADDED });
    }
  }, [registry]);

  React.useLayoutEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (typeof moduleConfig.name !== 'string' || !moduleConfig.name) {
        console.assert(false, 'Expected "Module.holocron.name" to be configured, received "%s"', moduleConfig.name);
      } else {
        console.debug('Holocron Module "%s" started successfully!', moduleConfig.name);
        console.dir(moduleConfig);
      }
    }

    dispatch(loadModule(moduleConfig.name, registry, moduleConfig.moduleMetaData))
      .then((module) => {
        if (process.env.NODE_ENV === 'development') {
          console.debug('Holocron Module "%s" loaded successfully!', moduleConfig.name);
          console.dir(moduleState);
        }
        if (!registry.getModule(moduleConfig.name)) {
          registry.registerModule(moduleConfig.name, module);
        }
      });
  }, [__Holocron_Module__]);

  React.useEffect(() => {
    if (holocronState.isHolocronLoaded) loadModuleData({});
  }, [loadModuleData, holocronState]);

  const context = React.useMemo(() => ({
    holocronState,
    moduleConfig,
    moduleState,
    moduleData,
    moduleLoadStatus,
    loadModuleData,
  }), [
    holocronState,
    moduleConfig,
    moduleState,
    moduleData,
    moduleLoadStatus,
    loadModuleData,
  ]);

  // TODO: integrate layers here - useHolocronLayers(...);
  return React.useMemo(
    () => {
      const Module = __Holocron_Module__ || (() => null);
      const MemoizedModule = hoistNonReactStatics(
        React.memo(
          (props) => (
            <HolocronModuleContext.Provider value={context}>
              {__Holocron_Module__ ? (
                <__Holocron_Module__ {...props} {...context} />
              // eslint-disable-next-line react/prop-types
              ) : props.children || null}
            </HolocronModuleContext.Provider>
          ),
          typeof moduleConfig.shouldModuleReload === 'function'
            ? (prevProps, nextProps) => !moduleConfig.shouldModuleReload(prevProps, nextProps)
            : shallowEqual
        ),
        Module
      );
      MemoizedModule.displayName = `HolocronModule(${Module.displayName || Module.name})`;
      MemoizedModule.holocron = moduleConfig;
      MemoizedModule.getContext = () => context;
      return MemoizedModule;
    },
    [context, __Holocron_Module__]
  );
}

export function HolocronModule({
  name,
  reducer,
  loadModuleData,
  shouldModuleReload,
  initialState,
  moduleMetaData,
  ...props
}) {
  const __Holocron_Module__ = useHolocronModule(
    React.useMemo(() => ({
      name, reducer, loadModuleData, shouldModuleReload, initialState, moduleMetaData,
    }), [name, reducer, loadModuleData, shouldModuleReload, initialState, moduleMetaData])
  );
  return (
    <__Holocron_Module__ {...props} />
  );
}
HolocronModule.propTypes = {
  name: PropTypes.string,
  reducer: PropTypes.func,
  loadModuleData: PropTypes.func,
  shouldModuleReload: PropTypes.func,
  initialState: PropTypes.shape({}),
  moduleMetaData: PropTypes.shape({}),
};
HolocronModule.defaultProps = {
  name: 'module',
  reducer: undefined,
  loadModuleData: undefined,
  shouldModuleReload: undefined,
  initialState: undefined,
  moduleMetaData: undefined,
};
