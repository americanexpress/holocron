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

/* eslint-disable no-underscore-dangle, react/jsx-pascal-case */

import React, { useMemo } from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';

import useModuleRegistry from './useModuleRegistry';
import createHolocronStore from '../createHolocronStore';

export const HolocronContext = React.createContext({});

export function useHolocronContext() {
  return React.useContext(HolocronContext);
}

export default function useHolocron(options = {}) {
  const {
    // store config
    store: providedStore,
    reducer = (state) => state,
    initialState,
    enhancer,
    localsForBuildInitialState,
    extraThunkArguments,
    // registry config
    blockedModules,
    holocronModules,
    holocronModuleMap,
    // settings
    ssr = false,
  } = options;

  const initialized = React.useRef(false);
  const registry = useModuleRegistry(holocronModuleMap, holocronModules, blockedModules);
  const store = React.useRef(providedStore || createHolocronStore({
    reducer,
    initialState,
    enhancer,
    localsForBuildInitialState,
    extraThunkArguments: { ...extraThunkArguments, registry },
  }));

  React.useEffect(() => {
    if (!initialized.current) initialized.current = true;
    store.current.rebuildReducer(registry);
  }, [registry]);

  const context = useMemo(
    () => ({ store: store.current, registry, ssr }),
    [store, registry, ssr]
  );

  return React.useMemo(() => {
    function __Holocron__({ children }) {
      return (
        <Provider store={store.current}>
          <HolocronContext.Provider value={context}>
            {initialized && children}
          </HolocronContext.Provider>
        </Provider>
      );
    }
    __Holocron__.propTypes = {
      children: PropTypes.node,
    };
    __Holocron__.defaultProps = {
      children: null,
    };
    __Holocron__.getContext = () => context;
    return __Holocron__;
  }, [context, initialized]);
}

export function Holocron({ children, ...props }) {
  const __Holocron__ = useHolocron(props);
  return (
    <__Holocron__>
      {children}
    </__Holocron__>
  );
}
Holocron.propTypes = {
  children: PropTypes.node,
};
Holocron.defaultProps = {
  children: null,
};
