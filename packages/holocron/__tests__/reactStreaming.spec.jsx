import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies -- monorepo, this is at the root
import { renderHook } from '@testing-library/react';
import { useAsyncModuleData, ReactStreamingContext } from '../src/reactStreaming';
import { ModuleContext } from '../src/holocronModule';

describe('reactStreaming', () => {
  it('exports ReactStreamingContext', () => {
    expect(ReactStreamingContext).toBeDefined();
  });

  describe('useAsyncModuleData', () => {
    /* eslint-disable
      react/display-name,
      react/prop-types,
      react/jsx-no-constructed-context-values -- test component */
    const Providers = ({ moduleName, promise, key }) => ({ children }) => (
      <ReactStreamingContext.Provider value={{ [moduleName]: { [key]: promise } }}>
        <ModuleContext.Provider value={{ moduleName }}>
          {children}
        </ModuleContext.Provider>
      </ReactStreamingContext.Provider>
    /* eslint-enable
      react/display-name,
      react/prop-types,
      react/jsx-no-constructed-context-values -- test component */
    );
    it('should throw a promise if the data is not yet resolved', () => {
      const key = 'test';
      const moduleName = 'testModule';
      const streamedPromise = new Promise(() => {});
      const { result } = renderHook(() => {
        try {
          return useAsyncModuleData(key);
        } catch (promise) {
          return promise;
        }
      }, {
        wrapper: Providers({ moduleName, promise: streamedPromise, key }),
      });
      expect(result.current).toBe(streamedPromise);
    });

    it('should return data once the promise is resolved', () => {
      const key = 'test';
      const moduleName = 'testModule';
      let resolve;
      const streamedPromise = new Promise((res) => { resolve = res; });
      const { result, rerender } = renderHook(() => {
        try {
          return useAsyncModuleData(key);
        } catch (promise) {
          return promise;
        }
      }, {
        wrapper: Providers({ moduleName, promise: streamedPromise, key }),
      });
      resolve();
      streamedPromise.data = 'testData';
      rerender();
      expect(result.current).toBe('testData');
    });

    it('should throw an error if the promise is rejected', () => {
      const key = 'test';
      const moduleName = 'testModule';
      let reject;
      const streamedPromise = new Promise((_, rej) => { reject = rej; });
      const { result, rerender } = renderHook(() => {
        try {
          return useAsyncModuleData(key);
        } catch (error) {
          return error;
        }
      }, {
        wrapper: Providers({ moduleName, promise: streamedPromise, key }),
      });
      reject();
      streamedPromise.error = 'testError';
      rerender();
      expect(result.current).toBe('testError');
    });
    it('should return undefined if there is no promise', () => {
      const key = 'test';
      const moduleName = 'testModule';
      const streamedPromise = undefined;
      const { result } = renderHook(() => {
        try {
          return useAsyncModuleData(key);
        } catch (promise) {
          return promise;
        }
      }, {
        wrapper: Providers({ moduleName, promise: streamedPromise, key }),
      });
      expect(result.current).toBe(undefined);
    });
  });
});
