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

import { iguazuReduce } from 'iguazu';

import queryModule from './queryModule';

function reduceModuleDataLoad(store, module, ownProps) {
  return module.loadDataAsProps ?
    iguazuReduce(module.loadDataAsProps)({ store, ownProps }) : { status: 'complete' };
}

export default function queryModuleWithData(moduleName, moduleProps) {
  return (dispatch, getState) => {
    const store = { dispatch, getState };
    const moduleBundleLoad = dispatch(queryModule(moduleName));
    const {
      status: bundleStatus,
      promise: bundlePromise,
      error: bundleError,
      data,
    } = moduleBundleLoad;

    if (bundleError) { return moduleBundleLoad; }

    const promise = bundlePromise.then(
      module => (reduceModuleDataLoad(store, module, moduleProps).promise || Promise.resolve())
    );

    const { status, error } = bundleStatus === 'complete' ?
      reduceModuleDataLoad(store, data, moduleProps) : { status: 'loading' };

    return {
      status,
      error,
      promise,
      data,
    };
  };
}
