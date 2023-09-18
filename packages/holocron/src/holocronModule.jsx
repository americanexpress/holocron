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

import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import hoistStatics from 'hoist-non-react-statics';

import {
  LOAD_KEY,
  REDUCER_KEY,
  MODULES_STORE_KEY,
  INIT_MODULE_STATE,
} from './ducks/constants';

// Execute deprecated load function and provide deprecation message
export function executeLoad({ dispatch, load, ...restProperties } = { }) {
  if (load) {
    console.warn('The \'load\' function in holocron has been deprecated. Please use \'loadModuleData\' instead.');
    return dispatch(load(restProperties));
  }
  return undefined;
}

// Dispatch loadModuleData inside a thunk if it exists
export function executeLoadModuleData(loadModuleData, WrappedComponent, properties) {
  const { dispatch, ...restProperties } = properties;
  if (loadModuleData) {
    return dispatch(async (_, getState, { fetchClient }) => loadModuleData({
      store: { dispatch, getState },
      fetchClient,
      ownProps: restProperties,
      module: WrappedComponent,
    }));
  }
  return undefined;
}

export function getModuleName(WrappedComponent, name) {
  return WrappedComponent && (WrappedComponent.displayName || WrappedComponent.name || name);
}

export function getModuleDisplayName(name) {
  return `HolocronModule(${name})`;
}

export async function executeLoadingFunctions({
  // Provide loadModuleData function
  loadModuleData,
  // Provide WrappedComponent for loadModuleData
  WrappedComponent,
  // Frozen props as of when called
  frozenProps,
  // Provide loadCount to limit state changes
  currentLoadCount,
  // Provide componentName for error messages
  componentName,
  // Provide component instance for getting current state of component post async
  hocInstance: { mounted, setStatus, loadCount },
}) {
  try {
    // Call deprecated load function if exists
    await executeLoad(frozenProps);
    // Call loadModuleData if it exists
    await executeLoadModuleData(loadModuleData, WrappedComponent, frozenProps);
    // Modify state only when mounted and current loadCount is less or equal than previous loadCount
    if (mounted && loadCount <= currentLoadCount) {
      setStatus('loaded');
    }
  } catch (error) {
    console.error(`Error while attempting to call 'load' or 'loadModuleData' inside Holocron module ${componentName}.`, error);
    if (mounted) {
      setStatus('error');
    }
  }
}

export default function holocronModule({
  name,
  reducer,
  load, // TODO remove in next major version
  shouldModuleReload,
  loadModuleData,
  mergeProps,
  mapStateToProps: mapStateToProperties = () => ({}),
  options = {},
} = {}) {
  return function wrapWithHolocron(WrappedComponent) {
    const HolocronModuleWrapper = (properties) => {
      const [status, setStatus] = useState('loading');
      const isMounted = useRef(false);
      const loadCountReference = useRef(0);
      const previousPropertiesReference = useRef({});

      const initiateLoad = (currentLoadCount, frozenProperties) => executeLoadingFunctions({
        loadModuleData,
        WrappedComponent,
        frozenProps: frozenProperties,
        currentLoadCount,
        componentName: getModuleName(WrappedComponent, name),
        hocInstance: { mounted: isMounted.current, loadCount: loadCountReference.current, setStatus },
      });

      if (
        Object.keys(previousPropertiesReference.current).length > 0
        && typeof shouldModuleReload === 'function'
        && shouldModuleReload(previousPropertiesReference.current, properties)
      ) {
        loadCountReference.current += 1;
        setStatus('loading');
        initiateLoad(loadCountReference.current, properties);
      }

      previousPropertiesReference.current = properties;

      React.useEffect(() => {
        isMounted.current = true;
        initiateLoad(0, properties);

        return () => {
          isMounted.current = false;
        };
      }, []);

      // eslint-disable-next-line react/jsx-props-no-spreading
      return <WrappedComponent {...properties} moduleLoadStatus={status} />;
    };

    HolocronModuleWrapper.propTypes = {
      load: PropTypes.func,
      dispatch: PropTypes.func.isRequired,
    };

    HolocronModuleWrapper.defaultProps = {
      load: undefined,
    };

    HolocronModuleWrapper.displayName = getModuleDisplayName(getModuleName(WrappedComponent, name));

    if (load && (options.ssr || global.BROWSER)) {
      HolocronModuleWrapper[LOAD_KEY] = load;
    }

    let mapModuleStateToProperties = mapStateToProperties;

    if (reducer && !name) {
      console.warn(`The Holocron Config in '${getModuleDisplayName(getModuleName(WrappedComponent, name))}' requires a 'name' when passing a 'reducer'.\nThe 'reducer' will not be added to the Redux Store without a 'name'.`);
    }

    if (reducer && name) {
      HolocronModuleWrapper[REDUCER_KEY] = reducer;
      // TODO: make this off default as a breaking performance feature in the next major version
      if (!('provideModuleState' in options) || options.provideModuleState !== false) {
        const getModuleState = createSelector(
          (state) => state.getIn(
            [MODULES_STORE_KEY, name],
            reducer(undefined, { type: INIT_MODULE_STATE })
          ),
          (moduleState) => moduleState.toJS()
        );

        mapModuleStateToProperties = (state, ownProperties) => {
          const moduleState = getModuleState(state);
          return { ...mapStateToProperties(state, ownProperties), moduleState };
        };
      }
    }

    const mapDispatchToProperties = (dispatch) => {
      if (load) {
        return {
          load,
          dispatch,
        };
      }
      return { dispatch };
    };

    hoistStatics(HolocronModuleWrapper, WrappedComponent);

    const DerivedComponent = connect(
      mapModuleStateToProperties,
      mapDispatchToProperties,
      mergeProps
    )(HolocronModuleWrapper);

    hoistStatics(DerivedComponent, HolocronModuleWrapper);

    return DerivedComponent;
  };
}
