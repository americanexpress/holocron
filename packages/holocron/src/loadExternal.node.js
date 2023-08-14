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

import createLoader from './loader.node';
import { isExternalInBlockList, addToExternalBlockList } from './externalRegistry';

export default createLoader({
  context: 'external',
  maxRetries: Number(process.env.HOLOCRON_SERVER_MAX_EXTERNALS_RETRY) || 3,
  maxSockets: Number(process.env.HOLOCRON_SERVER_MAX_SIM_EXTERNALS_FETCH) || 30,
  isInBlockList: isExternalInBlockList,
  addToBlockList: addToExternalBlockList,
})
