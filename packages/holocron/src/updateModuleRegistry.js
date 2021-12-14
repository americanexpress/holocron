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
  moduleMap: unsanitizedModuleMap,
  onModuleLoad = () => null,
  batchModulesToUpdate = (x) => [x],
  getModulesToUpdate = defaultGetModulesToUpdate,
}) {
  const currentModuleMap = getModuleMap().toJS();
  const modulesToUpdate = batchModulesToUpdate(
    getModulesToUpdate(currentModuleMap.modules || {}, unsanitizedModuleMap.modules)
  );
  const flatModulesToUpdate = modulesToUpdate.reduce((acc, batch) => [...acc, ...batch], []);
  const problemModules = [];
  let successfullyLoadedModules = await modulesToUpdate.reduce(async (acc, moduleBatch) => {
    const previouslyResolvedModules = await acc;
    const newlyResolvedModules = await Promise.allSettled(moduleBatch.map(
      async (moduleName) => {
        try {
          const loadedModule = await loadModule(
            moduleName,
            unsanitizedModuleMap.modules[moduleName],
            onModuleLoad
          );
          return addHigherOrderComponent(loadedModule);
        } catch (e) {
          const brokenUrl = unsanitizedModuleMap.modules[moduleName].node.url;
          if (currentModuleMap.modules && currentModuleMap.modules[moduleName]) {
            const previousUrl = currentModuleMap.modules[moduleName].node.url;
            // eslint-disable-next-line no-console
            console.error(`There was an error loading module ${moduleName} at ${brokenUrl}. Reverting back to ${previousUrl}`, e);
          } else {
            // eslint-disable-next-line no-console
            console.error(`There was an error loading module ${moduleName} at ${brokenUrl}. Ignoring ${moduleName} until next module map poll.`, e);
          }
          problemModules.push(moduleName);
          return Promise.reject(e);
        }
      }
    ));
    const fulfilledModules = newlyResolvedModules.filter(
      ({ status }) => status === 'fulfilled'
    ).map(({ value }) => value);
    return [...previouslyResolvedModules, ...fulfilledModules];
  }, []);
  successfullyLoadedModules = successfullyLoadedModules.reduce((
    acc, module, i) => ({ ...acc, [flatModulesToUpdate[i]]: module }), {});
  const newModules = getModules().merge(successfullyLoadedModules);
  // Updated modules may have less modules than flatModulesToUpdate if any modules failed to load
  const updatedFlatMap = flatModulesToUpdate.filter(
    (mod) => Object.keys(successfullyLoadedModules).some((updatedModule) => updatedModule === mod)
  );
  const sanitizedModuleMap = { ...unsanitizedModuleMap };
  // Keep working version of modules if they are in the list of problem modules
  problemModules.forEach((module) => {
    if (currentModuleMap.modules) {
      sanitizedModuleMap.modules[module] = currentModuleMap.modules[module];
    } else {
      // If it doesn't exist in the old module map, that means its being deployed for the first time
      // or holocron is initializing modules for the first time. If there is an issue with the
      // module we should exclude it from the module map entirely.
      delete sanitizedModuleMap.modules[module];
    }
  });
  resetModuleRegistry(newModules, sanitizedModuleMap);

  return updatedFlatMap.reduce((
    acc, moduleName) => ({ ...acc, [moduleName]: sanitizedModuleMap.modules[moduleName] }), {});
}
