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

const assert = require('assert');

const mockHttpAgent = jest.fn();
jest.mock('http', () => ({ Agent: mockHttpAgent }));
const mockHttpsAgent = jest.fn();
jest.mock('https', () => ({ Agent: mockHttpsAgent }));
jest.mock('require-from-string', () => jest.fn((str) => {
  if (str instanceof Error) {
    throw str;
  }
  if (typeof str === 'object') {
    return str;
  }
  return { str };
}));

let requireFromString;
let moduleRegistry;

describe('loadModule.node', () => {
  // resetModules and require to allow for changing an env var that is used for a const
  function load({
    fetchText,
    fetchStatus,
    fetchStatusText,
    fetchError,
    moduleToBlockList,
  } = {}) {
    jest.resetModules();

    global.fetch = jest.fn(() => (fetchError ? Promise.reject(fetchError) : Promise.resolve({
      status: fetchStatus || 200,
      statusText: fetchStatusText || 'OK',
      // no one should expect the Spanish Inquisition default
      text: () => Promise.resolve(fetchText || 'the Spanish Inquisition'),
    })));
    requireFromString = require('require-from-string'); // eslint-disable-line global-require
    requireFromString.mockClear();
    moduleRegistry = require('../src/moduleRegistry');
    if (moduleToBlockList) {
      moduleRegistry.addToModuleBlockList(moduleToBlockList);
    }
    return require('../src/loadModule.node.js').default; // eslint-disable-line global-require
  }

  function getSHA(content = 'the Spanish Inquisition') {
    // eslint-disable-next-line global-require
    return require('ssri').fromData(content, { algorithms: ['sha256', 'sha384'] }).toString();
  }

  beforeAll(() => {
    jest.spyOn(console, 'log');
    jest.spyOn(console, 'warn');
    console.log.mockImplementation(() => { });
    console.warn.mockImplementation(() => { });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const { NODE_ENV } = process.env;

  afterEach(() => {
    process.env.NODE_ENV = NODE_ENV;
  });

  describe('invalid moduleName', () => {
    const loadModule = load();
    let assertionError;

    // Storing an actual assertion error here for comparison
    // because they are different on Node 10 & 12
    try {
      assert(false, 'moduleName must be a string');
    } catch (error) {
      assertionError = error;
    }

    it('rejects', () => {
      expect.assertions(1);
      return expect(loadModule(undefined, {
        node: {
          integrity: '1',
          url: 'https://example.com/cdn/my-module/1.0.0/my-module.node.js',
        },
      })).rejects.toEqual(assertionError);
    });

    it('logs', () => {
      expect.assertions(3);
      return loadModule(undefined, { node: { integrity: '1', url: 'https://example.com/cdn/my-module/1.0.0/my-module.node.js' } }).catch(() => {
        expect(console.log).toHaveBeenCalledTimes(2);
        expect(console.log.mock.calls[0][0]).toMatch('Failed to load Holocron module');
        expect(console.log.mock.calls[1][0]).toContain(assertionError.message);
      });
    });
  });

  describe('agent', () => {
    describe('maxSockets', () => {
      afterEach(() => {
        delete process.env.HOLOCRON_SERVER_MAX_SIM_MODULES_FETCH;
      });

      it('defaults to 30', async () => {
        expect.assertions(2);

        delete process.env.HOLOCRON_SERVER_MAX_SIM_MODULES_FETCH;
        const loadModule = load({ fetchStatus: 200 });

        await loadModule('awesome', { node: { integrity: '123', url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } });
        expect(mockHttpsAgent).toHaveBeenCalledTimes(1);
        expect(mockHttpsAgent.mock.calls[0][0]).toHaveProperty('maxSockets', 30);
      });

      it('is configurable by env var HOLOCRON_SERVER_MAX_SIM_MODULES_FETCH', async () => {
        process.env.HOLOCRON_SERVER_MAX_SIM_MODULES_FETCH = 20;
        const loadModule = load({ fetchStatus: 200 });
        await loadModule('awesome', { node: { integrity: '123', url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } });

        expect(mockHttpsAgent).toHaveBeenCalledTimes(1);
        expect(mockHttpsAgent.mock.calls[0][0]).toHaveProperty('maxSockets', 20);
      });

      it('is a number when configured by HOLOCRON_SERVER_MAX_SIM_MODULES_FETCH', async () => {
        process.env.HOLOCRON_SERVER_MAX_SIM_MODULES_FETCH = '20';
        const loadModule = load({ fetchStatus: 200 });
        await loadModule('awesome', { node: { integrity: '123', url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } });

        expect(mockHttpsAgent).toHaveBeenCalledTimes(1);
        expect(mockHttpsAgent.mock.calls[0][0]).toHaveProperty('maxSockets', 20);
      });

      it('uses the default when HOLOCRON_SERVER_MAX_SIM_MODULES_FETCH is not parsable as a number', async () => {
        process.env.HOLOCRON_SERVER_MAX_SIM_MODULES_FETCH = 'Eleven-ish';
        const loadModule = load({ fetchStatus: 200 });
        await loadModule('awesome', { node: { integrity: '123', url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } });

        expect(mockHttpsAgent).toHaveBeenCalledTimes(1);
        expect(mockHttpsAgent.mock.calls[0][0]).toHaveProperty('maxSockets', 30);
      });
    });

    describe('protocol', () => {
      afterEach(() => {
        delete process.env.HOLOCRON_MODULES_PATH;
      });

      it('is an http.Agent when module url is HTTP', async () => {
        const loadModule = load({ fetchStatus: 200 });
        await loadModule('awesome', { node: { integrity: '123', url: 'http://example.com/cdn/awesome/1.0.0/awesome.node.js' } });

        expect(mockHttpAgent).toHaveBeenCalledTimes(1);
        expect(mockHttpsAgent).not.toHaveBeenCalled();
      });

      it('is an https.Agent when module url is HTTPS', async () => {
        const loadModule = load({ fetchStatus: 200 });
        await loadModule('awesome', { node: { integrity: '123', url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } });

        expect(mockHttpsAgent).toHaveBeenCalledTimes(1);
        expect(mockHttpAgent).not.toHaveBeenCalled();
      });
    });
  });

  describe('maxRetries', () => {
    // 1 original request, ${maxRetries} retries
    afterEach(() => {
      delete process.env.HOLOCRON_SERVER_MAX_MODULES_RETRY;
    });

    it('defaults to 3', () => {
      expect.assertions(1);
      delete process.env.HOLOCRON_SERVER_MAX_MODULES_RETRY;
      const loadModule = load({ fetchError: new Error('test error, like a socket disconnect') });

      return loadModule('awesome', { node: { integrity: '123', url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } })
        .catch(() => {
          expect(fetch).toHaveBeenCalledTimes(1 + 3);
        });
    });

    it('is configurable by env var HOLOCRON_SERVER_MAX_MODULES_RETRY', () => {
      expect.assertions(1);
      process.env.HOLOCRON_SERVER_MAX_MODULES_RETRY = 5;
      const loadModule = load({ fetchError: new Error('test error, like a socket disconnect') });

      return loadModule('awesome', { node: { integrity: '123', url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } })
        .catch(() => {
          expect(fetch).toHaveBeenCalledTimes(1 + 5);
        });
    });

    it('uses the default when HOLOCRON_SERVER_MAX_MODULES_RETRY is not parsable as a number', () => {
      expect.assertions(1);
      process.env.HOLOCRON_SERVER_MAX_MODULES_RETRY = 'twelvteen';
      const loadModule = load({ fetchError: new Error('test error, like a socket disconnect') });

      return loadModule('awesome', { node: { integrity: '123', url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } })
        .catch(() => {
          expect(fetch).toHaveBeenCalledTimes(1 + 3);
        });
    });
  });

  describe('loading a module', () => {
    describe('status', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'production';
      });

      it('accepts 200', () => {
        expect.assertions(1);
        const loadModule = load({ fetchStatus: 200 });
        moduleRegistry.addToModuleBlockList = jest.fn();
        return loadModule('awesome', { node: { integrity: getSHA(), url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } })
          .then(() => {
            expect(moduleRegistry.addToModuleBlockList).not.toHaveBeenCalled();
          });
      });

      it('rejects 404', () => {
        expect.assertions(2);
        const loadModule = load({ fetchStatus: 404, fetchStatusText: 'Not Found' });
        moduleRegistry.addToModuleBlockList = jest.fn();
        return loadModule('awesome', { node: { integrity: '123', url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } })
          .catch((err) => {
            expect(err).toHaveProperty('message', 'Not Found');
            expect(moduleRegistry.addToModuleBlockList).toHaveBeenCalledWith('https://example.com/cdn/awesome/1.0.0/awesome.node.js');
          });
      });

      it('rejects 500', () => {
        expect.assertions(2);
        const loadModule = load({ fetchStatus: 500, fetchStatusText: 'Server Error' });
        moduleRegistry.addToModuleBlockList = jest.fn();
        return loadModule('awesome', { node: { integrity: '123', url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } })
          .catch((err) => {
            expect(err).toHaveProperty('message', 'Server Error');
            expect(moduleRegistry.addToModuleBlockList).toHaveBeenCalledWith('https://example.com/cdn/awesome/1.0.0/awesome.node.js');
          });
      });

      it('rejects 502', () => {
        expect.assertions(2);
        const loadModule = load({ fetchStatus: 502, fetchStatusText: 'Bad Gateway' });
        moduleRegistry.addToModuleBlockList = jest.fn();
        return loadModule('awesome', { node: { integrity: '123', url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } })
          .catch((err) => {
            expect(err).toHaveProperty('message', 'Bad Gateway');
            expect(moduleRegistry.addToModuleBlockList).toHaveBeenCalledWith('https://example.com/cdn/awesome/1.0.0/awesome.node.js');
          });
      });
    });

    it('uses an http.Agent if module url is HTTP', () => {
      expect.assertions(3);
      const loadModule = load();

      return loadModule('awesome', { node: { integrity: '123', url: 'http://example.com/cdn/awesome/1.0.0/awesome.node.js' } })
        .then(() => {
          expect(fetch).toHaveBeenCalledTimes(1);
          expect(mockHttpAgent).toHaveBeenCalledTimes(1);
          expect(fetch.mock.calls[0][1]).toHaveProperty('agent', mockHttpAgent.mock.instances[0]);
        });
    });

    it('uses an https.Agent if module url is HTTPS', () => {
      expect.assertions(3);
      const loadModule = load();

      return loadModule('awesome', { node: { integrity: '123', url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } })
        .then(() => {
          expect(fetch).toHaveBeenCalledTimes(1);
          expect(mockHttpsAgent).toHaveBeenCalledTimes(1);
          expect(fetch.mock.calls[0][1]).toHaveProperty('agent', mockHttpsAgent.mock.instances[0]);
        });
    });

    it('retries', () => {
      expect.assertions(6);
      const fetchError = new Error('test error, like a socket disconnect');
      const loadModule = load({ fetchError });

      return loadModule('awesome', { node: { integrity: '123', url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } })
        .catch((err) => {
          // 1 original call, 3 retries
          expect(fetch).toHaveBeenCalledTimes(1 + 3);
          expect(err).toBe(fetchError);
          expect(console.warn).toHaveBeenCalledTimes(3);
          expect(console.warn.mock.calls[0][0]).toMatchSnapshot();
          expect(console.warn.mock.calls[1][0]).toMatchSnapshot();
          expect(console.warn.mock.calls[2][0]).toMatchSnapshot();
        });
    });

    it('loads the code', () => {
      expect.assertions(2);
      const fetchText = 'loads the code';
      const loadModule = load({ fetchText });
      return loadModule('awesome', { node: { integrity: '123', url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } })
        .then(() => {
          expect(requireFromString).toHaveBeenCalled();
          expect(requireFromString.mock.calls[0][0]).toBe(fetchText);
        });
    });

    it('rejects if attempting to load a module that has previously failed to load', () => {
      expect.assertions(2);
      const loadModule = load({ moduleToBlockList: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' });
      return loadModule('awesome', { node: { integrity: '123', url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } }, jest.fn())
        .catch((err) => {
          expect(err).toMatchSnapshot();
          expect(requireFromString).not.toHaveBeenCalled();
        });
    });

    it('resolves with the module', () => {
      const fetchText = 'resolves with the module';
      const loadModule = load({ fetchText });
      expect.assertions(1);
      return expect(loadModule(
        'awesome', { node: { integrity: '123', url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } }
      )).resolves.toEqual({ str: fetchText });
    });

    it('rejects when given invalid JavaScript', async () => {
      expect.assertions(2);
      process.env.NODE_ENV = 'production';
      const fetchText = 'requireFromString throw test';
      const requireFromStringError = new Error('requireFromString throw test');
      const loadModule = load({ fetchText });
      moduleRegistry.addToModuleBlockList = jest.fn();
      requireFromString.mockImplementation(() => { throw requireFromStringError; });
      await expect(
        loadModule('awesome', { node: { integrity: getSHA(fetchText), url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } })
      ).rejects.toBe(requireFromStringError);
      expect(moduleRegistry.addToModuleBlockList).toHaveBeenCalledWith('https://example.com/cdn/awesome/1.0.0/awesome.node.js');
    });

    it('does not add to blocklist if the error has shouldBlockModuleReload as false', () => {
      expect.assertions(1);
      process.env.NODE_ENV = 'production';
      const fetchText = 'requireFromStringError throw test';
      const requireFromStringError = new Error('requireFromString throw test');
      requireFromStringError.shouldBlockModuleReload = false;
      const loadModule = load({ fetchText });
      moduleRegistry.addToModuleBlockList = jest.fn();
      requireFromString.mockImplementation(() => { throw requireFromStringError; });
      return loadModule('awesome', { node: { integrity: getSHA(fetchText), url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } })
        .catch(() => {
          expect(moduleRegistry.addToModuleBlockList).not.toHaveBeenCalled();
        });
    });

    it('does not add to blocklist on fetch error', () => {
      const loadModule = load({ fetchError: new Error('test error, like a socket disconnect') });
      expect.assertions(1);
      moduleRegistry.addToModuleBlockList = jest.fn();
      return loadModule('awesome', { node: { integrity: '123', url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } })
        .catch(() => {
          expect(moduleRegistry.addToModuleBlockList).not.toHaveBeenCalled();
        });
    });
  });

  it('calls onModuleLoad', async () => {
    expect.assertions(1);

    const onModuleLoadConfig = { environmentVariables: [{ name: 'COOL_API_URL', validate: jest.fn() }] };
    const moduleString = { onModuleLoadConfig };
    const loadModule = load({ fetchText: moduleString });
    const mockonModuleLoad = jest.fn();
    await loadModule('awesome', { node: { integrity: '123', url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } }, mockonModuleLoad);

    expect(mockonModuleLoad)
      .toHaveBeenCalledWith({ module: { onModuleLoadConfig }, moduleName: 'awesome' });
  });

  it('handles a missing onModuleLoad when a load validation config is found within the module that is being loaded', async () => {
    expect.assertions(1);

    const onModuleLoadConfig = { environmentVariables: [{ name: 'COOL_API_URL', validate: jest.fn() }] };
    const moduleString = { onModuleLoadConfig };
    const loadModule = load({ fetchText: moduleString });
    await expect(() => loadModule(
      'awesome',
      {
        node: {
          integrity: '123',
          url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js',
        },
      }
    )).not.toThrow();
  });

  it('throws if integrity shas dont match prior to loading the module if NODE_ENV is production', async () => {
    expect.assertions(3);

    process.env.NODE_ENV = 'production';

    const loadModule = load({ fetchStatus: 200 });
    moduleRegistry.addToModuleBlockList = jest.fn();
    await expect(
      loadModule('awesome', { node: { integrity: '123', url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } })
    ).rejects.toThrowErrorMatchingSnapshot();
    expect(moduleRegistry.addToModuleBlockList).toHaveBeenCalledWith('https://example.com/cdn/awesome/1.0.0/awesome.node.js');
    expect(requireFromString).not.toHaveBeenCalled();
  });

  it('resolves with a module if integrity shas match and NODE_ENV is production', async () => {
    expect.assertions(3);
    const integrity = 'sha256-xpUJWQ2B2y83+ddUgMjv7fead5M9tagxnlLhO/2YdKM= sha384-SFXpWQKI4NYS+u6/nkRVZUy/NNbOllh38hDuTre7xFJWsK5lsBZfSq6RN+Ye5tvP';
    process.env.NODE_ENV = 'production';

    const loadModule = load({ fetchStatus: 200, fetchText: 'hello there!' });
    moduleRegistry.addToModuleBlockList = jest.fn();

    await expect(
      loadModule('awesome', { node: { integrity, url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } })
    ).resolves.toEqual({ str: 'hello there!' });
    expect(moduleRegistry.addToModuleBlockList).not.toHaveBeenCalled();
    expect(requireFromString).toHaveBeenCalledWith('hello there!', 'https://example.com/cdn/awesome/1.0.0/awesome.node.js');
  });

  describe('in development ', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    const moduleName = 'broken-dev-module';
    const moduleUrl = `https://example.com/cdn/${moduleName}/1.0.0/${moduleName}.node.js`;

    it('does not validate integrity if NODE_ENV is development', async () => {
      expect.assertions(3);
      const integrity = 'invalid sha!!!';

      const loadModule = load({ fetchStatus: 200, fetchText: 'hello there!' });
      moduleRegistry.addToModuleBlockList = jest.fn();
      await expect(
        loadModule('awesome', { node: { integrity, url: 'https://example.com/cdn/awesome/1.0.0/awesome.node.js' } })
      ).resolves.toEqual({ str: 'hello there!' });
      expect(moduleRegistry.addToModuleBlockList).not.toHaveBeenCalled();
      expect(requireFromString).toHaveBeenCalledWith('hello there!', 'https://example.com/cdn/awesome/1.0.0/awesome.node.js');
    });

    it(`does not add \`${moduleName}\` to block list in development`, async () => {
      expect.assertions(4);

      const requireError = new Error(`err... ${moduleName} failed to load`);
      requireError.shouldBlockModuleReload = false;
      const loadModule = load();
      moduleRegistry.addToModuleBlockList = jest.fn();
      requireFromString.mockImplementation(() => { throw requireError; });

      await expect(
        loadModule(moduleName, { node: { url: moduleUrl } })
      ).rejects.toBe(requireError);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(moduleRegistry.addToModuleBlockList).not.toHaveBeenCalledWith(moduleUrl);
    });

    it(`adds \`${moduleName}\` to block list if \`shouldBlockModuleReload\` is 'true' and in development`, async () => {
      expect.assertions(4);

      const requireError = new Error(`err... ${moduleName} failed to load`);
      requireError.shouldBlockModuleReload = true;
      const loadModule = load();
      moduleRegistry.addToModuleBlockList = jest.fn();
      requireFromString.mockImplementation(() => { throw requireError; });

      await expect(
        loadModule(moduleName, { node: { url: moduleUrl } })
      ).rejects.toBe(requireError);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(moduleRegistry.addToModuleBlockList).toHaveBeenCalledWith(moduleUrl);
    });
  });
});
