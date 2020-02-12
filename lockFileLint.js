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

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const invalidations = [];
const defaultLockfilePath = `${process.cwd()}/package-lock.json`;
const packagesBasePath = path.join(process.cwd(), 'packages');

const pathsToValidate = [defaultLockfilePath].concat(
  fs
    .readdirSync(packagesBasePath)
    .map(pathName => `${packagesBasePath}/${pathName}`)
    .filter(pathName => fs.statSync(pathName).isDirectory())
    .map(pathName => `${pathName}/package-lock.json`)
);

pathsToValidate.forEach((lockPath) => {
  const { stderr } = spawnSync('./node_modules/.bin/lockfile-lint', [
    '-p',
    lockPath,
    '-t',
    'npm',
    '-a',
    'npm',
    '-o',
    'https:',
    '-c',
    '-i',
  ]);
  const error = stderr.toString();
  if (error) invalidations.push([lockPath, error].join(':\n\n'));
});

if (invalidations.length > 0) {
  process.stderr.write(invalidations.join('\n'));
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
}
