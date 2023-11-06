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

const { exec } = require('child_process');
// This regex was obtained from https://semver.org/ test it out here https://regex101.com/r/vkijKf/1/
/* eslint-disable-next-line unicorn/no-unsafe-regex -- setup for lerna */
const regex = /^chore\(release\): (0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][\dA-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][\dA-Za-z-]*))*))?(?:\+([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?$/gm;
const commitMessage = process.argv[2]; // This is the commit message
if (commitMessage != null && regex.test(commitMessage)) {
  exec('yarn lerna:publish').stderr.pipe(process.stderr);
}
