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

export function loadModuleDataAction(Component, props) {
  return async (dispatch, getState, { fetchClient }) => Component.loadModuleData({
    store: { dispatch, getState },
    fetchClient,
    ownProps: props,
    module: Component,
  });
}

export function executeLoad(load, props) {
  if (load) {
    console.warn('The \'load\' function in holocron has been deprecated. Please use \'loadModuleData\' instead.');
    return load(props);
  }
  return undefined;
}

export function executeLoadModuleData(WrappedComponent, dispatch, props) {
  if (WrappedComponent.loadModuleData) {
    return dispatch(loadModuleDataAction(WrappedComponent, props));
  }
  return undefined;
}

export function getName(WrappedComponent, name) {
  return WrappedComponent && (WrappedComponent.displayName || WrappedComponent.name || name);
}

export function getDisplayName(name) {
  return `HolocronModule(${name})`;
}

export default function holocronModule({
  name,
  reducer,
  load,
  shouldModuleReload,
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
        if ((WrappedComponent.loadModuleData || load) && !global.INITIAL_STATE) {
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

      async initiateLoad(loadCount, props) {
        try {
          const { dispatch } = this.props;
          await Promise.all([
            // eslint-disable-next-line react/destructuring-assignment
            executeLoad(this.props.load, props),
            executeLoadModuleData(WrappedComponent, dispatch, props),
          ]);
          // Ignoring else on these two safety checks as they are not testable
          // and most likely unnecessary.
          /* istanbul ignore else */
          // ignoring this as destructuring this causes this to behave different
          // eslint-disable-next-line react/destructuring-assignment
          if (this.mounted && this.state.loadCount <= loadCount) {
            this.setState({ status: 'loaded' });
          }
        } catch (error) {
          console.error(`Error while attempting to load Holocron module ${getName(WrappedComponent, name)}.`, error);
          /* istanbul ignore else */
          if (this.mounted) {
            this.setState({ status: 'error' });
          }
        }
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

    HolocronModuleWrapper.displayName = getDisplayName(getName(WrappedComponent, name));

    if (load && (options.ssr || global.BROWSER)) {
      HolocronModuleWrapper[LOAD_KEY] = load;
    }


    let mapModuleStateToProps;

    if (reducer && name) {
      HolocronModuleWrapper[REDUCER_KEY] = reducer;
      const getModuleState = createSelector(
        (state) => state.getIn(
          [MODULES_STORE_KEY, name],
          reducer(undefined, { type: INIT_MODULE_STATE })
        ),
        (moduleState) => moduleState.toJS()
      );

      mapModuleStateToProps = reducer && ((state) => {
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

    return connect(
      mapModuleStateToProps,
      mapDispatchToProps,
      mergeProps
    )(HolocronModuleWrapper);
  };
}
