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

import { fromJS } from 'immutable';
import loadModule from '../src/loadModule.web';
import { resetModuleRegistry } from '../src/moduleRegistry';

let mockElement;
let map;

jest.spyOn(document, 'createElement').mockImplementation(() => mockElement);
jest.spyOn(document, 'getElementsByTagName').mockImplementation(() => [{ appendChild: () => null }]);
// eslint-disable-next-line no-underscore-dangle
window.__holocron_module_bundle_type__ = 'browser';

describe('loadModule.web', () => {
  beforeEach(() => {
    map = {};
    mockElement = {
      addEventListener: jest.fn((event, cb) => {
        map[event] = cb;
      }),
    };
  });

  it('should add crossorigin to scripts', () => {
    loadModule(
      'my-module',
      fromJS({
        node: {
          url: 'https://example.com/cdn/my-module/1.0.0/my-module.node.js',
          integrity: '123',
        },
        browser: {
          url: 'https://example.com/cdn/my-module/1.0.0/my-module.browser.js',
          integrity: '234',
        },
        legacyBrowser: {
          url: 'https://example.com/cdn/my-module/1.0.0/my-module.legacy.browser.js',
          integrity: '344',
        },
      })
    );
    expect(mockElement.crossOrigin).toBe('anonymous');
  });

  it('should add the correct integrity to scripts if NODE_ENV is production', () => {
    process.env.NODE_ENV = 'production';
    loadModule(
      'my-module',
      fromJS({
        node: {
          url: 'https://example.com/cdn/my-module/1.0.0/my-module.node.js',
          integrity: '123',
        },
        browser: {
          url: 'https://example.com/cdn/my-module/1.0.0/my-module.browser.js',
          integrity: '234',
        },
        legacyBrowser: {
          url: 'https://example.com/cdn/my-module/1.0.0/my-module.legacy.browser.js',
          integrity: '344',
        },
      })
    );
    expect(mockElement.integrity).toBe('234');
  });

  it('should not add integrity to scripts if NODE_ENV is development', () => {
    process.env.NODE_ENV = 'development';

    loadModule(
      'my-module',
      fromJS({
        node: {
          url: 'https://example.com/cdn/my-module/1.0.0/my-module.node.js',
          integrity: '123',
        },
        browser: {
          url: 'https://example.com/cdn/my-module/1.0.0/my-module.browser.js',
          integrity: '234',
        },
        legacyBrowser: {
          url: 'https://example.com/cdn/my-module/1.0.0/my-module.legacy.browser.js',
          integrity: '344',
        },
      })
    );
    expect(mockElement.integrity).toBeUndefined();
  });

  it('should reject with a helpful error when module name is not a string', async () => {
    await expect(
      loadModule(
        NaN,
        fromJS({
          node: {
            url: 'https://example.com/cdn/my-module/1.0.0/my-module.node.js',
            integrity: '123',
          },
          browser: {
            url: 'https://example.com/cdn/my-module/1.0.0/my-module.browser.js',
            integrity: '234',
          },
          legacyBrowser: {
            url: 'https://example.com/cdn/my-module/1.0.0/my-module.legacy.browser.js',
            integrity: '344',
          },
        })
      )
    ).rejects.toMatchSnapshot();
  });

  it('should reject with a helpful error when module data is not an object', async () => {
    await expect(
      loadModule(
        'my-module',
        undefined
      )
    ).rejects.toMatchSnapshot();
  });

  it('should reject with the error on error', () => {
    const loadPromise = loadModule(
      'erroring-module',
      fromJS({
        node: {
          url: 'https://example.com/cdn/erroring-module/1.0.0/erroring-module.node.js',
          integrity: '123',
        },
        browser: {
          url: 'https://example.com/cdn/erroring-module/1.0.0/erroring-module.browser.js',
          integrity: '234',
        },
        legacyBrowser: {
          url: 'https://example.com/cdn/erroring-module/1.0.0/erroring-module.legacy.browser.js',
          integrity: '344',
        },
      })
    );
    const loadError = new Error('failed to load module');
    expect(mockElement.addEventListener.mock.calls[0][0]).toBe('error');
    expect(mockElement.addEventListener.mock.calls[0][1](loadError)).toBeUndefined();
    return expect(loadPromise).rejects.toBe(loadError.message);
  });

  it('should resolve with the module on load', () => {
    const LoadingModule = () => 'hello';
    resetModuleRegistry(
      {
        'loading-module': LoadingModule,
      },
      {
        modules: {
          'loading-module': {
            node: {
              url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.node.js',
              integrity: '123',
            },
            browser: {
              url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js',
              integrity: '234',
            },
            legacyBrowser: {
              url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.legacy.browser.js',
              integrity: '344',
            },
          },
        },
      }
    );
    const loadPromise = loadModule(
      'loading-module',
      fromJS({
        node: {
          url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.node.js',
          integrity: '123',
        },
        browser: {
          url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js',
          integrity: '234',
        },
        legacyBrowser: {
          url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.legacy.browser.js',
          integrity: '344',
        },
      })
    );
    expect(mockElement.addEventListener.mock.calls[1][0]).toBe('load');
    expect(mockElement.addEventListener.mock.calls[1][1]()).toBeUndefined();
    return expect(loadPromise).resolves.toBe(LoadingModule);
  });

  it('should add the module map clientCacheRevision to the script tag src for cache busting purposes if NODE_ENV is production', async () => {
    process.env.NODE_ENV = 'production';
    const LoadingModule = () => 'hello';
    resetModuleRegistry(
      {
        'loading-module': LoadingModule,
      },
      {
        clientCacheRevision: 'key123',
        modules: {
          'loading-module': {
            node: {
              url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.node.js',
              integrity: '123',
            },
            browser: {
              url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js',
              integrity: '234',
            },
            legacyBrowser: {
              url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.legacy.browser.js',
              integrity: '344',
            },
          },
        },
      }
    );
    loadModule(
      'loading-module',
      fromJS({
        node: {
          url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.node.js',
          integrity: '123',
        },
        browser: {
          url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js',
          integrity: '234',
        },
        legacyBrowser: {
          url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.legacy.browser.js',
          integrity: '344',
        },
      })
    );
    expect(mockElement.addEventListener.mock.calls[1][0]).toBe('load');
    expect(mockElement.addEventListener.mock.calls[1][1]()).toBeUndefined();
    expect(mockElement.src).toBe('https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js?clientCacheRevision=key123');
    expect(new URL(mockElement.src).search).toBe('?clientCacheRevision=key123');
  });

  it('should fallback to module map key if it is provided in place of clientCacheRevision', async () => {
    process.env.NODE_ENV = 'production';
    const LoadingModule = () => 'hello';
    resetModuleRegistry(
      {
        'loading-module': LoadingModule,
      },
      {
        key: 'key456',
        modules: {
          'loading-module': {
            node: {
              url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.node.js',
              integrity: '123',
            },
            browser: {
              url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js',
              integrity: '234',
            },
            legacyBrowser: {
              url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.legacy.browser.js',
              integrity: '344',
            },
          },
        },
      }
    );
    loadModule(
      'loading-module',
      fromJS({
        node: {
          url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.node.js',
          integrity: '123',
        },
        browser: {
          url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js',
          integrity: '234',
        },
        legacyBrowser: {
          url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.legacy.browser.js',
          integrity: '344',
        },
      })
    );
    expect(mockElement.addEventListener.mock.calls[1][0]).toBe('load');
    expect(mockElement.addEventListener.mock.calls[1][1]()).toBeUndefined();
    expect(mockElement.src).toBe('https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js?clientCacheRevision=key456');
    expect(new URL(mockElement.src).search).toBe('?clientCacheRevision=key456');
  });

  it('should use clientCacheRevision if key is also provided', async () => {
    process.env.NODE_ENV = 'production';
    const LoadingModule = () => 'hello';
    resetModuleRegistry(
      {
        'loading-module': LoadingModule,
      },
      {
        key: 'key456',
        clientCacheRevision: 'abc',
        modules: {
          'loading-module': {
            node: {
              url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.node.js',
              integrity: '123',
            },
            browser: {
              url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js',
              integrity: '234',
            },
            legacyBrowser: {
              url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.legacy.browser.js',
              integrity: '344',
            },
          },
        },
      }
    );
    loadModule(
      'loading-module',
      fromJS({
        node: {
          url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.node.js',
          integrity: '123',
        },
        browser: {
          url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js',
          integrity: '234',
        },
        legacyBrowser: {
          url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.legacy.browser.js',
          integrity: '344',
        },
      })
    );
    expect(mockElement.addEventListener.mock.calls[1][0]).toBe('load');
    expect(mockElement.addEventListener.mock.calls[1][1]()).toBeUndefined();
    expect(mockElement.src).toBe('https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js?clientCacheRevision=abc');
    expect(new URL(mockElement.src).search).toBe('?clientCacheRevision=abc');
  });

  it('should not add the module map clientCacheRevision to the script tag src for cache busting purposes if NODE_ENV is development', async () => {
    process.env.NODE_ENV = 'development';
    const LoadingModule = () => 'hello';
    resetModuleRegistry(
      {
        'loading-module': LoadingModule,
      },
      {
        clientCacheRevision: 'key123',
        modules: {
          'loading-module': {
            node: {
              url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.node.js',
              integrity: '123',
            },
            browser: {
              url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js',
              integrity: '234',
            },
            legacyBrowser: {
              url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.legacy.browser.js',
              integrity: '344',
            },
          },
        },
      }
    );
    loadModule(
      'loading-module',
      fromJS({
        node: {
          url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.node.js',
          integrity: '123',
        },
        browser: {
          url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js',
          integrity: '234',
        },
        legacyBrowser: {
          url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.legacy.browser.js',
          integrity: '344',
        },
      })
    );
    expect(mockElement.addEventListener.mock.calls[1][0]).toBe('load');
    expect(mockElement.addEventListener.mock.calls[1][1]()).toBeUndefined();
    expect(mockElement.src).toBe('https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js');
    expect(new URL(mockElement.src).search).toBe('');
  });

  it('does not add the module map clientCacheRevision to the script tag src for cache busting purposes when no clientCacheRevision', async () => {
    process.env.NODE_ENV = 'production';
    const LoadingModule = () => 'hello';
    resetModuleRegistry(
      {
        'loading-module': LoadingModule,
      },
      {
        modules: {
          'loading-module': {
            node: {
              url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.node.js',
              integrity: '123',
            },
            browser: {
              url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js',
              integrity: '234',
            },
            legacyBrowser: {
              url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.legacy.browser.js',
              integrity: '344',
            },
          },
        },
      }
    );
    loadModule(
      'loading-module',
      fromJS({
        node: {
          url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.node.js',
          integrity: '123',
        },
        browser: {
          url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js',
          integrity: '234',
        },
        legacyBrowser: {
          url: 'https://example.com/cdn/loading-module/1.0.0/loading-module.legacy.browser.js',
          integrity: '344',
        },
      })
    );
    expect(mockElement.addEventListener.mock.calls[1][0]).toBe('load');
    expect(mockElement.addEventListener.mock.calls[1][1]()).toBeUndefined();
    expect(mockElement.src).toBe('https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js');
    expect(new URL(mockElement.src).search).toBe('');
  });
});
