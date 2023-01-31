function getExternal(externalName) {
  const formattedExternalName = externalName.replace(/-/g, '_');
  const globalExternalVar = `__holocron_external_${formattedExternalName}`;
  if (window[globalExternalVar]) {
    return window[globalExternalVar];
  }
  throw new Error(`Unable to find external ${externalName}`);
}

export default getExternal;
