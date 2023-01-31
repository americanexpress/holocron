import { fromJS } from 'immutable';
import requireFromString from 'require-from-string';

let sharedExternals = fromJS({});

function registerSharedExternal(externalName, external) {
  sharedExternals = sharedExternals.set(externalName, external);
}

async function loadSharedExternal(externalName, url) {
  try {
    const externalResp = await fetch(url);
    const externalString = await externalResp.text();
    const external = requireFromString(externalString, url);
    registerSharedExternal(externalName, external);
    return external;
  } catch (e) {
    console.log(`Error fetching External ${externalName}`, e);
    return null;
  }
}

function getExternal(externalName) {
  if (sharedExternals.get(externalName)) {
    return sharedExternals.get(externalName);
  }
  throw new Error(`${externalName} does not exist!`);
}

export {
  registerSharedExternal,
  loadSharedExternal,
  getExternal,
};
