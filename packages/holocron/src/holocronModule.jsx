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
export function executeLoad({ dispatch, load, ...restProps } = {}) {
  if (load) {
    console.warn('The \'load\' function in holocron has been deprecated. Please use \'loadModuleData\' instead.');
    return dispatch(load(restProps));
  }
  return undefined;
}

// Dispatch loadModuleData inside a thunk if it exists
export function executeLoadModuleData(loadModuleData, WrappedComponent, props) {
  const { dispatch, ...restProps } = props;
  if (loadModuleData) {
    return dispatch(async (_, getState, { fetchClient }) => loadModuleData({
      store: { dispatch, getState },
      fetchClient,
      ownProps: restProps,
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
  mapStateToProps = () => ({}),
  options = {},
} = {}) {
  return function wrapWithHolocron(WrappedComponent) {
    const HolocronModuleWrapper = (props) => {
      const [status, setStatus] = useState('loading');
      const isMounted = useRef(false);
      const loadCountRef = useRef(0);
      const prevPropsRef = useRef({});

      const initiateLoad = (currentLoadCount, frozenProps) => executeLoadingFunctions({
        loadModuleData,
        WrappedComponent,
        frozenProps,
        currentLoadCount,
        componentName: getModuleName(WrappedComponent, name),
        hocInstance: { mounted: isMounted.current, loadCount: loadCountRef.current, setStatus },
      });

      if (
        Object.keys(prevPropsRef.current).length > 0
        && typeof shouldModuleReload === 'function'
        && shouldModuleReload(prevPropsRef.current, props)
      ) {
        loadCountRef.current += 1;
        setStatus('loading');
        initiateLoad(loadCountRef.current, props);
      }

      prevPropsRef.current = props;

      React.useEffect(() => {
        isMounted.current = true;
        initiateLoad(0, props);

        return () => {
          isMounted.current = false;
        };
      }, []);

      // eslint-disable-next-line react/jsx-props-no-spreading -- spread props
      return <WrappedComponent {...props} moduleLoadStatus={status} />;
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

    let mapModuleStateToProps = mapStateToProps;

    if (reducer && !name) {
      // eslint-disable-next-line no-console -- long message
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

        mapModuleStateToProps = (state, ownProps) => {
          const moduleState = getModuleState(state);
          return { ...mapStateToProps(state, ownProps), moduleState };
        };
      }
    }

    const mapDispatchToProps = (dispatch) => {
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
      mapModuleStateToProps,
      mapDispatchToProps,
      mergeProps
    )(HolocronModuleWrapper);

    hoistStatics(DerivedComponent, HolocronModuleWrapper);

    return DerivedComponent;
  };
}
