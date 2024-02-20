import { getModuleName } from './holocronModule';

// TODO remove this public holocronModule in next major version
export default function holocronModule(holocronConfig = {}) {
  return function addHolocronConfig(WrappedComponent) {
    // eslint-disable-next-line no-console -- console necissary for error logging
    console.warn(`'holocronModule' has been deprecated in favor of the Holocron Config API. Please migrate to Holocron Config API in ${getModuleName(WrappedComponent)}.`);
    // Need to pass through to the new Holocron Config API
    // eslint-disable-next-line no-param-reassign -- reassign with new config api
    WrappedComponent.holocron = holocronConfig;
    return WrappedComponent;
  };
}
