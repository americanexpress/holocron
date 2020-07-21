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

import { LOAD_KEY, REDUCER_KEY } from './ducks/constants';

export const getModuleLoadFn = (module) => (module
  ? module[LOAD_KEY] || (module.holocron && module.holocron.load)
  : null);

export const getLoadModuleDataFn = (module) => (module
  ? module.loadModuleData || (module.holocron && module.holocron.loadModuleData)
  : null);

export const getModuleReducer = (module) => (module
  ? module[REDUCER_KEY] || (module.holocron && module.holocron.reducer)
  : null);
