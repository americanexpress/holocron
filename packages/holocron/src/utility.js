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

import { createSelector } from 'reselect';

import {
  LOAD_KEY, REDUCER_KEY, HOLOCRON_STORE_KEY, MODULES_STORE_KEY, INIT_MODULE_STATE,
} from './ducks/constants';
import { getInitialState } from '../ducks/load';

export const getModuleLoadFn = (module) => (module
  ? module[LOAD_KEY] || (module.holocron && module.holocron.load)
  : null);

export const getLoadModuleDataFn = (module) => (module
  ? module.loadModuleData || (module.holocron && module.holocron.loadModuleData)
  : null);

export const getModuleReducer = (module) => (module
  ? module[REDUCER_KEY] || (module.holocron && module.holocron.reducer)
  : null);

export function createModuleStateSelector({ name: moduleName, reducer, initialState }) {
  return createSelector(
    (state) => state.getIn(
      [MODULES_STORE_KEY, moduleName],
      initialState || typeof reducer === 'function'
        ? reducer(undefined, { type: INIT_MODULE_STATE })
        : { toJS: () => null }
    ),
    (moduleState) => moduleState.toJS()
  );
}

export function createHolocronModuleStateSelector({ name: moduleName }) {
  return createSelector(
    (state) => state.getIn(
      [HOLOCRON_STORE_KEY],
      getInitialState()
    ),
    (holocronState) => ({
      isReducerLoaded: holocronState.getIn(['withReducers', moduleName], false),
      isHolocronLoaded: holocronState.getIn(['loaded', moduleName], false),
      isHolocronLoading: holocronState.getIn(['loading', moduleName], false),
      isHolocronError: holocronState.getIn(['failed', moduleName], false),
    })
  );
}
