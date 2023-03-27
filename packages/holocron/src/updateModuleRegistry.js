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
  moduleMap: nextModuleMap,
  onModuleLoad = () => null,
  batchModulesToUpdate = (x) => [x],
  getModulesToUpdate = defaultGetModulesToUpdate,
  listRejectedModules,
}) {
  const currentModuleMap = getModuleMap().toJS();
  const modulesToUpdate = batchModulesToUpdate(
    getModulesToUpdate(currentModuleMap.modules || {}, nextModuleMap.modules)
  );
  const flatModulesToUpdate = modulesToUpdate.reduce((acc, batch) => [...acc, ...batch], []);
  const rejectedModules = {};
  let successfullyLoadedModules = await modulesToUpdate.reduce(async (acc, moduleBatch) => {
    const previouslyResolvedModules = await acc;
    const newlyResolvedModules = await Promise.allSettled(moduleBatch.map(
      async (moduleName) => {
        try {
          const loadedModule = await loadModule(
            moduleName,
            nextModuleMap.modules[moduleName],
            onModuleLoad
          );
          return addHigherOrderComponent(loadedModule);
        } catch (e) {
          const brokenUrl = nextModuleMap.modules[moduleName].node.url;
          if (currentModuleMap.modules && currentModuleMap.modules[moduleName]) {
            const previousUrl = currentModuleMap.modules[moduleName].node.url;
            // eslint-disable-next-line no-console
            console.error(`There was an error loading module ${moduleName} at ${brokenUrl}. Reverting back to ${previousUrl}`, e);
          } else {
            // eslint-disable-next-line no-console
            console.error(`There was an error loading module ${moduleName} at ${brokenUrl}. Ignoring ${moduleName} until next module map poll.`, e);
          }
          rejectedModules[moduleName] = {
            ...nextModuleMap.modules[moduleName],
            reasonForRejection: e.message,
          };
          return Promise.reject(e);
        }
      }
    ));
    const fulfilledModules = newlyResolvedModules.filter(
      ({ status }) => status === 'fulfilled'
    ).map(({ value }) => value);
    return [...previouslyResolvedModules, ...fulfilledModules];
  }, []);
  const rejectedModuleNames = Object.keys(rejectedModules);
  const updatedFlatMap = flatModulesToUpdate.filter((mod) => !rejectedModuleNames.includes(mod));
  successfullyLoadedModules = successfullyLoadedModules.reduce(
    (acc, module, i) => ({
      ...acc,
      [updatedFlatMap[i]]: module,
    }),
    {}
  );
  const newModules = getModules().merge(successfullyLoadedModules);
  const nextModules = { ...nextModuleMap.modules };
  // Keep working version of modules if they are in the list of problem modules
  rejectedModuleNames.forEach((module) => {
    if (currentModuleMap.modules) {
      nextModules[module] = currentModuleMap.modules[module];
    } else {
      // If it doesn't exist in the old module map, that means its being deployed for the first time
      // or holocron is initializing modules for the first time. If there is an issue with the
      // module we should exclude it from the module map entirely.
      delete nextModules[module];
    }
  });
  resetModuleRegistry(newModules, { ...nextModuleMap, modules: nextModules });
  const loadedModules = updatedFlatMap.reduce(
    (acc, moduleName) => ({ ...acc, [moduleName]: nextModules[moduleName] }),
    {}
  );

  if (listRejectedModules) {
    return { loadedModules, rejectedModules };
  }
  return loadedModules;
}
