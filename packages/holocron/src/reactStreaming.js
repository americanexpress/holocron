import { createContext, useContext } from 'react';

const ReactStreamingContext = createContext({});

const ModuleContext = createContext();

const useAsyncModuleData = (key) => {
  const { moduleName } = useContext(ModuleContext);
  const streamContext = useContext(ReactStreamingContext);
  const streamedPromise = streamContext[moduleName]?.[key];
  if (
    streamedPromise
      && streamedPromise instanceof Promise
      && !streamedPromise.data
      && !streamedPromise.error
  ) {
    streamedPromise
      .then((data) => {
        streamedPromise.data = data;
      })
      .catch((error) => {
        streamedPromise.error = error;
      });

    throw streamedPromise;
  }
  if (streamedPromise?.error) {
    // The suspense boundary will re-throw this error to be caught by the nearest error boundary
    // https://react.dev/reference/react/Suspense#providing-a-fallback-for-server-errors-and-client-only-content
    throw streamedPromise.error;
  }

  if (streamedPromise?.data) {
    return streamedPromise.data;
  }
  return undefined;
};

export { ReactStreamingContext, ModuleContext, useAsyncModuleData };
