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

/* eslint-disable react/prefer-stateless-function --  extend component */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { createModuleRouteFromElement } from './ModuleRouteUtils';

class ModuleRoute extends Component {
  render() {
    console.error(
      '<ModuleRoute> elements are for router configuration only and should not be rendered'
    );
    return null;
  }
}

ModuleRoute.createRouteFromReactElement = createModuleRouteFromElement;
ModuleRoute.propTypes = {
  // these are not used directly, but are used by createModuleRouteFromElement
  /* eslint-disable react/no-unused-prop-types -- comment above */
  moduleName: PropTypes.string,
  path: PropTypes.string,
  title: PropTypes.string,
  hasChildRoutes: PropTypes.bool,
  /* eslint-enable react/no-unused-prop-types -- enable rule */
};
ModuleRoute.defaultProps = {
  moduleName: undefined,
  path: undefined,
  title: undefined,
  hasChildRoutes: false,
};
ModuleRoute.displayName = 'ModuleRoute';

export default ModuleRoute;
/* eslint-enable react/prefer-stateless-function --  extend component */
