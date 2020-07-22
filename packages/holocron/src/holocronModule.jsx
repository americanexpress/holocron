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
export function executeLoad({ dispatch, load, ...restProps } = { }) {
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
  loadCount,
  // Provide componentName for error messages
  componentName,
  // Provide component instance for getting current state of component post async
  hocInstance,
}) {
  try {
    // Call deprecated load function if exists
    await executeLoad(frozenProps);
    // Call loadModuleData if it exists
    await executeLoadModuleData(loadModuleData, WrappedComponent, frozenProps);
    // Modify state only when mounted and current loadCount is less or equal than previous loadCount
    if (hocInstance.mounted && hocInstance.state.loadCount <= loadCount) {
      hocInstance.setState({ status: 'loaded' });
    }
  } catch (error) {
    console.error(`Error while attempting to call 'load' or 'loadModuleData' inside Holocron module ${componentName}.`, error);
    if (hocInstance.mounted) {
      hocInstance.setState({ status: 'error' });
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
  options = {},
} = {}) {
  return function wrapWithHolocron(WrappedComponent) {
    class HolocronModuleWrapper extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          loadCount: 0,
          status: 'loading',
        };
        this.mounted = false;
      }

      componentDidMount() {
        this.mounted = true;
        // eslint-disable-next-line no-underscore-dangle
        if ((loadModuleData || load) && !global.__INITIAL_STATE__) {
          this.initiateLoad(0, this.props);
        }
      }

      // ignoring to support deprecated componentWillReceiveProps.
      // This needs to be removed to support React17
      // eslint-disable-next-line camelcase
      UNSAFE_componentWillReceiveProps(nextProps) {
        const { loadCount } = this.state;
        const { props } = this;
        if (shouldModuleReload && shouldModuleReload(props, nextProps)) {
          const newLoadCount = loadCount + 1;
          this.setState({ status: 'loading', loadCount: newLoadCount });
          this.initiateLoad(newLoadCount, nextProps);
        }
      }

      // Ignoring as internal state cannot be checked when unmounted.
      /* istanbul ignore next */
      componentWillUnmount() {
        this.mounted = false;
      }

      initiateLoad(loadCount, frozenProps) {
        return executeLoadingFunctions({
          loadModuleData,
          WrappedComponent,
          frozenProps,
          loadCount,
          hocName: getModuleName(WrappedComponent, name),
          hocInstance: this,
        });
      }

      render() {
        const { status } = this.state;
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <WrappedComponent {...this.props} moduleLoadStatus={status} />;
      }
    }

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

    let mapModuleStateToProps;

    if (reducer && !name) {
      console.warn(`The Holocron Config in '${getModuleDisplayName(getModuleName(WrappedComponent, name))}' requires a 'name' when passing a 'reducer'.\nThe 'reducer' will not be added to the Redux Store without a 'name'.`);
    }

    if (reducer && name) {
      HolocronModuleWrapper[REDUCER_KEY] = reducer;
      const getModuleState = createSelector(
        (state) => state.getIn(
          [MODULES_STORE_KEY, name],
          reducer(undefined, { type: INIT_MODULE_STATE })
        ),
        (moduleState) => moduleState.toJS()
      );

      mapModuleStateToProps = ((state) => {
        const moduleState = getModuleState(state);
        return { moduleState };
      });
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
