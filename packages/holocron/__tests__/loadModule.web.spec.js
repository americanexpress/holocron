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
import { setRequiredExternalsRegistry } from '../src/externalRegistry';

let mockElement;
let errorWhenLoadingScript;

const createElementSpy = jest
  .spyOn(document, 'createElement')
  .mockImplementation(() => mockElement);
jest
  .spyOn(document, 'getElementsByTagName')
  .mockImplementation(() => [{ appendChild: () => null }]);
// eslint-disable-next-line no-underscore-dangle
window.__holocron_module_bundle_type__ = 'browser';

const eventListenerMock = jest.fn((event, cb) => {
  if (errorWhenLoadingScript && event === 'error') {
    cb(errorWhenLoadingScript);
  }
  if (!errorWhenLoadingScript && event === 'load') {
    cb();
  }
});

describe('loadModule.web', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    errorWhenLoadingScript = undefined;
    mockElement = {
      addEventListener: eventListenerMock,
    };
  });

  it('should add crossorigin to scripts', async () => {
    await loadModule(
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

  it('should add the correct integrity to scripts if NODE_ENV is production', async () => {
    process.env.NODE_ENV = 'production';
    await loadModule(
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

  it('should not add integrity to scripts if NODE_ENV is development', async () => {
    process.env.NODE_ENV = 'development';

    await loadModule(
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
        Number.NaN,
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
    await expect(loadModule('my-module', undefined)).rejects.toMatchSnapshot();
  });

  it('rejects with error when script errors', async () => {
    errorWhenLoadingScript = new Error('failed to load module');

    try {
      await loadModule(
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
    } catch (error) {
      expect(error).toBe(errorWhenLoadingScript.message);
    }
  });

  it('should resolve with the module on load', async () => {
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
    const loadingModule = await loadModule(
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
    return expect(loadingModule).toBe(LoadingModule);
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
    await loadModule(
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
    expect(mockElement.src).toBe(
      'https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js?clientCacheRevision=key123'
    );
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

    await loadModule(
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

    expect(mockElement.src).toBe(
      'https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js?clientCacheRevision=key456'
    );
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
    await loadModule(
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

    expect(mockElement.src).toBe(
      'https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js?clientCacheRevision=abc'
    );
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
    await loadModule(
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
    expect(mockElement.src).toBe(
      'https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js'
    );
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
    await loadModule(
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
    expect(mockElement.src).toBe(
      'https://example.com/cdn/loading-module/1.0.0/loading-module.browser.js'
    );
    expect(new URL(mockElement.src).search).toBe('');
  });

  describe('when module requires fallbacks', () => {
    let mockElementFirst;
    let mockElementSecond;
    let mockElementThird;

    beforeAll(() => {
      setRequiredExternalsRegistry({
        'my-module': {
          'this-dep': {
            filename: 'this-dep.js',
            semanticRange: '^2.2.0',
            integrity: '321',
            version: '2.3.1',
          },
          'that-dep': {
            filename: 'that-dep.js',
            semanticRange: '^2.2.0',
            integrity: '123',
            version: '2.3.1',
          },
        },
      });
    });

    beforeEach(() => {
      mockElementFirst = { addEventListener: eventListenerMock };
      mockElementSecond = { addEventListener: eventListenerMock };
      mockElementThird = { addEventListener: eventListenerMock };

      resetModuleRegistry(
        {
          'my-module': () => 'hello',
        },
        {
          modules: {
            'my-module': {
              baseUrl: 'https://example.com/cdn/my-module/1.0.0/',
              browser: {
                url: 'https://example.com/cdn/my-module/1.0.0/my-module.browser.js',
                integrity: '234',
              },
            },
          },
        }
      );
    });

    it('creates scripts for modules externals', async () => {
      createElementSpy
        .mockImplementationOnce(() => mockElementFirst)
        .mockImplementationOnce(() => mockElementSecond)
        .mockImplementationOnce(() => mockElementThird);

      await loadModule(
        'my-module',
        fromJS({
          browser: {
            url: 'https://example.com/cdn/my-module/1.0.0/my-module.browser.js',
            integrity: '234',
          },
        })
      );

      expect(mockElementFirst.src).toBe('https://example.com/cdn/my-module/1.0.0/this-dep.browser.js');
      expect(mockElementSecond.src).toBe('https://example.com/cdn/my-module/1.0.0/that-dep.browser.js');
      expect(mockElementThird.src).toBe(
        'https://example.com/cdn/my-module/1.0.0/my-module.browser.js'
      );
    });

    it('waits for fallback scripts to finish loading before loading module script', async () => {
      let finallyLoadSlowScript;
      const slowMockElement = {
        addEventListener: (event, cb) => {
          if (event === 'load') {
            finallyLoadSlowScript = cb;
          }
        },
      };
      createElementSpy
        .mockImplementationOnce(() => mockElementFirst)
        .mockImplementationOnce(() => slowMockElement)
        .mockImplementationOnce(() => mockElementThird);

      const loadModulePromise = loadModule(
        'my-module',
        fromJS({
          browser: {
            url: 'https://example.com/cdn/my-module/1.0.0/my-module.browser.js',
            integrity: '234',
          },
        })
      );

      expect(createElementSpy).toHaveBeenCalledTimes(2);
      expect(mockElementThird.src).toBeUndefined();
      finallyLoadSlowScript();
      await loadModulePromise;
      expect(createElementSpy).toHaveBeenCalledTimes(3);
      expect(mockElementThird.src).toBe(
        'https://example.com/cdn/my-module/1.0.0/my-module.browser.js'
      );
    });
  });
});
