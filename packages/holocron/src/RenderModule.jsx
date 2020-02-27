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
import { ReactReduxContext } from 'react-redux';
import PropTypes from 'prop-types';

import { getModule } from './moduleRegistry';

export default function RenderModule({ children, moduleName, props }) {
  const { store } = React.useContext(ReactReduxContext);

  const Module = getModule(moduleName, store.modules);
  if (!Module) {
    console.warn(`Module ${moduleName} was not found in the holocron module registry`);
    return null;
  }

  const propsWithChildren = typeof children !== 'undefined' ? { children, ...props } : props;

  // propsWithChildren is computed and passed down to this prop
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Module {...propsWithChildren} />;
}

RenderModule.propTypes = {
  moduleName: PropTypes.string.isRequired,
  // we're simply passing props through, the shape will be different for every module
  props: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  children: PropTypes.node,
};

RenderModule.defaultProps = {
  props: {},
  children: undefined,
};
