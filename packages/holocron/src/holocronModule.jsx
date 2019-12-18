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
} from './constants';

export default function holocronModule({
  name,
  reducer,
  load,
  shouldModuleReload,
  mergeProps,
  options = {},
}) {
  if (!name) {
    throw new Error('A name is required to create a holocron module');
  }

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
        if (load && !global.INITIAL_STATE) { // eslint-disable-line no-underscore-dangle
          this.initiateLoad(0, this.props);
        }
      }

      componentWillReceiveProps(nextProps) {
        if (shouldModuleReload && shouldModuleReload(this.props, nextProps)) {
          const newLoadCount = this.state.loadCount + 1;
          this.setState({ status: 'loading', loadCount: newLoadCount });
          this.initiateLoad(newLoadCount, nextProps);
        }
      }

      // Ignoring as internal state cannot be checked when unmounted.
      /* istanbul ignore next */
      componentWillUnmount() {
        this.mounted = false;
      }

      initiateLoad(loadCount, props) {
        const loadResult = this.props.load(props);
        const loadPromise = loadResult instanceof Promise ? loadResult : Promise.resolve();
        loadPromise
          .then(() => {
            // Ignoring else on these two safety checks as they are not testable
            // and most likely unnecessary.
            /* istanbul ignore else */
            if (this.mounted && this.state.loadCount <= loadCount) {
              this.setState({ status: 'loaded' });
            }
          })
          .catch((error) => {
            console.error(`Error while attempting to load Holocron module ${name}.`, error);
            /* istanbul ignore else */
            if (this.mounted) {
              this.setState({ status: 'error' });
            }
          });
      }

      render() {
        return <WrappedComponent {...this.props} moduleLoadStatus={this.state.status} />;
      }
    }

    HolocronModuleWrapper.propTypes = {
      load: PropTypes.func,
    };

    HolocronModuleWrapper.defaultProps = {
      load: undefined,
    };

    HolocronModuleWrapper.displayName = WrappedComponent && `HolocronModule(${
      WrappedComponent.displayName || WrappedComponent.name || name
    })`;

    HolocronModuleWrapper[REDUCER_KEY] = reducer;
    if (load && (options.ssr || global.BROWSER)) {
      HolocronModuleWrapper[LOAD_KEY] = load;
    }
    hoistStatics(HolocronModuleWrapper, WrappedComponent);

    const getModuleState = createSelector(
      state => state.getIn(
        [MODULES_STORE_KEY, name],
        reducer(undefined, { type: INIT_MODULE_STATE })
      ),
      moduleState => moduleState.toJS()
    );

    const mapModuleStateToProps = reducer && ((state) => {
      const moduleState = getModuleState(state);
      return { moduleState };
    });

    const mapDispatchToProps = load && { load };

    return connect(
      mapModuleStateToProps,
      mapDispatchToProps,
      mergeProps
    )(HolocronModuleWrapper);
  };
}
