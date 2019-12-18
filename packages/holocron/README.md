# holocron

>Use this to compose and load your application modules.

## 📖 Table of Contents

* [Features](#-features)
* [API](#-api)
* [Available Scripts](#-available-scripts)

## ✨ Features

### How it works

#### Module Registry

Holocron maintains an in-memory registry of Modules that can be updated dynamically without requiring a server restart.
The idea is that an application can update Holocron's module registry whenever a new Holocron Module is to be added to the application's runtime. The end result is an application that can have React components updated/added to it at runtime.

#### Holocron store

After the server is initialized the holocron store is created within `createHolocronStore`, this extends the redux store and adds the reducers of your module to the store.

#### Compose modules

Once the modules to render are retrieved we dispatch  `composeModules` to get the data for these modules, this data is needed for rendering.

## 🎛️ API

Click [here](./API.md) for the API reference guide.

## 📜 Available Scripts

To test out any changes that you've made locally, run `npm pack` then install this within your application.

The scripts below are available to run and use:
  
**`npm run prebuild`**

This removes any existing files generated during the build process and ensures that any new build is clean.

**`npm run build`**

This deletes the current generated JS files within the directory and compiles the ECMAScript 6 code within the `src` file to a version of ECMAScript that can run in current browsers using Babel afterwards it copies them to the lib folder.

**`npm run prepublish`**

This runs `npm run build`

**`npm run watch:build`**

This watches for any changes in the  `src` folder and runs `npm run build` if any changes are detected.
