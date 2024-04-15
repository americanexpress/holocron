import { useDispatch } from 'react-redux';

/** @typedef {import('redux-thunk').ThunkAction} ThunkAction */

/**
 * A class to store promises by domain and key
 *
 * In general, Module code should not interact with the promise store directly,
 *   instead dispatching the below thunks, or using the provided hooks
 */
class PromiseStore {
  #promises = new Map();

  /**
   * @param {string} domain The domain of the promise, should be the module name
   *   if being stored by a module, or the package name if being stored by a package
   * @param {string} key The key of the promise, it is up to the caller to manage key duplication
   * @param {Promise<any>} promise The promise to be stored
   * @returns {void}
   */
  store = (domain, key, promise) => {
    if (!this.#promises[domain]) {
      this.#promises[domain] = new Map();
    }
    this.#promises[domain][key] = promise;
  };

  /**
   * @param {string} domain The domain of the promise, should be the module name
   *   if being stored by a module, or the package name if being stored by a package
   * @param {string} key The key of the promise
   * @returns {Promise<any> | undefined}
   */
  get = (domain, key) => this.#promises?.[domain]?.[key];
}

export default PromiseStore;

// Thunk based access and storage
// the (_, __, { promiseStore }) pattern is to skip the first two arguments of thunks

/**
 * @param {string} domain The domain of the promise, should be the module name
 *   if being stored by a module, or the package name if being stored by a package
 * @param {string} key The key of the promise
 * @returns {ThunkAction<Promise<any> | undefined>}
 *
 * usage: `const promise = dispatch(getStoredPromise('domain', 'key'))`
 */
// eslint-disable-next-line arrow-body-style -- else triggers max-length
export const getStoredPromise = (domain, key) => {
  return (_, __, { promiseStore }) => promiseStore.get(domain, key);
};

/**
 * @param {string} domain The domain of the promise, should be the module name
 *  if being stored by a module, or the package name if being stored by a package
 * @param {string} key The key of the promise, it is up to the caller to manage key duplication
 * @param {Promise<any>} promise The promise to be stored
 * @returns {ThunkAction<void>}
 *
 * usage: `dispatch(storePromise('domain', 'key', fetch('some.url.com')))`
 */
// eslint-disable-next-line arrow-body-style -- else triggers max-length
export const storePromise = (domain, key, promise) => {
  return (_, __, { promiseStore }) => promiseStore.store(domain, key, promise);
};

// Hook based access

// Note: No hook based `storePromise` because promises should only be
// stored during the data phase, not the render phase

/**
 * @param {string} domain The domain of the promise, should be the module name
 *  if being stored by a module, or the package name if being stored by a package
 * @param {string} key The key of the promise, it is up to the caller to manage key duplication
 * @returns {Promise<any> | undefined}
 *
 * usage: `const promise = useStoredPromise('domain', 'key')`
 */
export const useStoredPromise = (domain, key) => {
  const dispatch = useDispatch();
  return dispatch(getStoredPromise(domain, key));
};
