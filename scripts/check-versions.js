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

/*
 * Check the versions of node & npm against the package.json "engines" list
 * as this might run on node@0.12.x please don't use ES6
 */
// ES6 features
/* eslint-disable prefer-arrow-callback, prefer-template */

const { exec } = require('child_process');

const { engines } = require('../package.json');

const nodeRange = engines.node;
const npmRange = engines.npm;

// rough, quick parser of semver
function parseVersion(raw) {
  // already a version?
  if (typeof raw !== 'string') {
    return raw;
  }

  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/.exec(raw.trim());
  if (!match) {
    return null;
  }

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4],
  };
}

function parseRange(raw) {
  // already a range?
  if (typeof raw !== 'string') {
    return raw;
  }

  // TODO: translate any "~" "^" etc. to ">=" "<=" etc.
  return raw
    // split by any whitespace
    .split(/[\s\uFEFF\u00A0]+/)
    // split range type and version
    .map(function parseBound(b) {
      const match = /^(>=)(.+)$/.exec(b);
      if (!b) {
        throw new Error('invalid range: ' + b);
      }
      return {
        comparator: match[1],
        version: parseVersion(match[2]),
      };
    });
}

function isHigherVersion(compare, baseline) {
  if (compare.major < baseline.major) {
    return false;
  } if (compare.major === baseline.major && compare.minor < baseline.minor) {
    return false;
  } if (
    compare.major === baseline.major
    && compare.minor === baseline.minor
    && compare.patch < baseline.patch
  ) {
    return false;
  }
  return true;
}

function satisfies(range, version) {
  const bounds = parseRange(range);
  const point = parseVersion(version);

  return bounds.reduce(function doesRangeSatisfyAllRangeBounds(p, c) {
    if (!p) {
      return p;
    }

    const bPoint = c.version;

    switch (c.comparator) {
      case '>=':
        return isHigherVersion(point, bPoint);

      default:
        throw new Error('unimplemented ' + c.comparator);
    }
  }, true);
}

function checkEngine(engine, range, using) {
  if (!satisfies(range, using)) {
    // show the reason for failure to the user
    /* eslint-disable no-console */
    console.error(engine + ' version must be ' + range + ', found ' + using);
    /* eslint-enable no-console */
    /* eslint-disable-next-line unicorn/no-process-exit */
    process.exit(1);
  }
}

// work time
checkEngine('node', nodeRange, process.version);

exec('npm -v', function checkNpmVersion(error, stdout, stderr) {
  if (error) {
    throw error;
  }

  if (stderr) {
    // show the error from running npm
    /* eslint-disable no-console */
    console.error(stderr);
    /* eslint-enable no-console */
    /* eslint-disable-next-line unicorn/no-process-exit */
    process.exit(1);
  }

  checkEngine('npm', npmRange, stdout);
});
