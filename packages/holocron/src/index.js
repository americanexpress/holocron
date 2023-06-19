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

import createHolocronStore from './createHolocronStore';
import {
  registerModule,
  getModule,
  getModules,
  getModuleMap,
  setModuleMap,
  clearModulesUsingExternals,
  getModulesUsingExternals,
  setModulesUsingExternals,
} from './moduleRegistry';
import {
  loadModule,
  isLoaded,
  failedToLoad,
  getLoadError,
  isLoading,
  getLoadingPromise,
} from './ducks/load';
import { composeModules } from './ducks/compose';
import RenderModule from './RenderModule';
import holocronModule from './publicHolocronModule';
import forceLoadModule from './loadModule.web';
import {
  validateExternal,
  registerExternal,
  getExternal,
  getExternals,
  addRequiredExternal,
  getRequiredExternals,
  getUnregisteredRequiredExternals,
  getRequiredExternalsRegistry,
  setRequiredExternalsRegistry,
} from './externalRegistry';

// Public API
export {
  createHolocronStore,
  registerModule,
  getModule,
  getModules,
  getModuleMap,
  setModuleMap,
  composeModules,
  loadModule,
  isLoaded,
  failedToLoad,
  getLoadError,
  isLoading,
  getLoadingPromise,
  RenderModule,
  holocronModule,
  forceLoadModule,
  validateExternal,
  registerExternal,
  getExternal,
  getExternals,
  addRequiredExternal,
  getRequiredExternalsRegistry,
  getRequiredExternals,
  getUnregisteredRequiredExternals,
  setRequiredExternalsRegistry,
  clearModulesUsingExternals,
  getModulesUsingExternals,
  setModulesUsingExternals,
};
