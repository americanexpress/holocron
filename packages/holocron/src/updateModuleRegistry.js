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

import shallowEqual from 'shallowequal';
import {
  getModules, getModuleMap, resetModuleRegistry, addHigherOrderComponent,
} from './moduleRegistry';
import loadModule from './loadModule.node';

export function areModuleEntriesEqual(firstModuleEntry, secondModuleEntry) {
  return !!(
    firstModuleEntry
    && secondModuleEntry
    && shallowEqual(firstModuleEntry.browser, secondModuleEntry.browser)
    && shallowEqual(firstModuleEntry.legacyBrowser, secondModuleEntry.legacyBrowser)
    && shallowEqual(firstModuleEntry.node, secondModuleEntry.node)
  );
}

function defaultGetModulesToUpdate(curr, next) {
  return Object
    .keys(next)
    .filter((moduleName) => !areModuleEntriesEqual(curr[moduleName], next[moduleName]));
}

export default async function updateModuleRegistry({
  moduleMap: newModuleMap,
  onModuleLoad = () => null,
  batchModulesToUpdate = (x) => [x],
  getModulesToUpdate = defaultGetModulesToUpdate,
}) {
  const currentModuleMap = getModuleMap().toJS();
  const modulesToUpdate = batchModulesToUpdate(
    getModulesToUpdate(currentModuleMap.modules || {}, newModuleMap.modules)
  );
  const flatModulesToUpdate = modulesToUpdate.reduce((acc, batch) => [...acc, ...batch], []);
  const problemModules = [];
  let updatedModules = await modulesToUpdate.reduce(async (acc, moduleBatch) => {
    const loadedModules = await acc;
    const nextModules = await Promise.allSettled(moduleBatch.map(
      async (moduleName) => {
        try {
          const loadedModule = await loadModule(
            moduleName,
            newModuleMap.modules[moduleName],
            onModuleLoad
          );
          return addHigherOrderComponent(loadedModule);
        } catch (e) {
          problemModules.push(moduleName);
          return Promise.reject(e);
        }
      }
    ));
    const successfullyLoadedModules = nextModules.filter(
      ({ status }) => status === 'fulfilled'
    ).map(({ value }) => value);
    return [...loadedModules, ...successfullyLoadedModules];
  }, []);
  updatedModules = updatedModules.reduce((
    acc, module, i) => ({ ...acc, [flatModulesToUpdate[i]]: module }), {});
  const newModules = getModules().merge(updatedModules);
  // Updated modules may have less modules than flatModulesToUpdate if any modules failed to load
  const updatedFlatMap = flatModulesToUpdate.filter(
    (mod) => Object.keys(updatedModules).some((updatedModule) => updatedModule === mod)
  );
  const finalNewModuleMap = { ...newModuleMap };
  // Keep working version of modules if they are in the list of problem modules
  problemModules.forEach((module) => {
    if (currentModuleMap.modules) {
      finalNewModuleMap.modules[module] = currentModuleMap.modules[module];
    } else {
      // If it doesn't exist in the old module map, that means its being deployed for the first time
      // or holocron is initializing modules for the first time. If there is an issue with the
      // module we should exclude it from the module map entirely.
      delete finalNewModuleMap.modules[module];
    }
  });
  resetModuleRegistry(newModules, finalNewModuleMap);

  return updatedFlatMap.reduce((
    acc, moduleName) => ({ ...acc, [moduleName]: newModuleMap.modules[moduleName] }), {});
}
