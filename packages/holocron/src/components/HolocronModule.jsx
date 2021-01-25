/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
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

import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import RenderModule from '../RenderModule';
import { getModule } from '../moduleRegistry';
import { composeModules } from '../ducks/compose';

export default function HolocronModule({ moduleName, fallback, ...props }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [moduleData, setModuleData] = useState(null);
  const [module, setModule] = useState(() => !!getModule(moduleName));
  const loadModuleData = useCallback(() => {
    setLoading(true);
    return dispatch(composeModules([{ name: moduleName, props }]))
      .then(([data]) => {
        setLoading(false);
        if (data) setModuleData(data);
        if (!module) setModule(!!getModule(moduleName));
        return data;
      });
  });

  useEffect(() => {
    if (!loading && !module) {
      loadModuleData();
    }
  }, [loading, module]);

  return module
    ? <RenderModule moduleName={moduleName} props={{ ...props, moduleData, loadModuleData }} />
    : fallback();
}

HolocronModule.propTypes = {
  moduleName: PropTypes.string.isRequired,
  fallback: PropTypes.func,
};

HolocronModule.defaultProps = {
  fallback: () => null,
};
