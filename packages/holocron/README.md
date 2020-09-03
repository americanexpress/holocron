<h1 align="center">
  <img src='https://github.com/americanexpress/holocron/raw/main/holocron.png' alt="Holocron - One Amex" width='50%'/>
</h1>

[![npm](https://img.shields.io/npm/v/holocron)](https://www.npmjs.com/package/holocron)

> Use this to compose and load your application modules.

## 📖 Table of Contents

* [Features](#-features)
* [API](#%EF%B8%8F-api)
* [Available Scripts](#-available-scripts)

## ✨ Features

### How it works

#### Module Registry

Holocron maintains an in-memory registry of Modules that can be updated dynamically without
requiring a server restart. The idea is that an application can update Holocron's module registry
whenever a new Holocron Module is to be added to the application's runtime. The end result is an
application that can have React components updated/added to it at runtime.

#### Holocron store

After the server is initialized the holocron store is created within `createHolocronStore`, this
extends the Redux store and adds the reducers of your module to the store.

#### Compose modules

Once the modules to render are retrieved we dispatch  `composeModules` to get the data for these
modules, this data is needed for rendering.

## 🎛️ API

Check out the [API reference guide](./docs/api/README.md).

## 📜 Available Scripts

To test out any changes that you've made locally, run `yarn pack` then install this within your
application.

The scripts below are available to run and use:

**`yarn prebuild`**

This removes any existing files generated during the build process and ensures that any new build is
clean.

**`yarn build`**

This deletes the current generated JS files within the directory and compiles the ECMAScript 6 code
within the `src` file to a version of ECMAScript that can run in current browsers using Babel
afterwards it copies them to the lib folder.

**`yarn prepublish`**

This runs `yarn build`

**`yarn watch:build`**

This watches for any changes in the  `src` folder and runs `yarn build` if any changes are
detected.
