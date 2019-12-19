# holocron-module-route

[![npm](https://img.shields.io/npm/v/holocron-module-route)](https://www.npmjs.com/package/holocron-module-route)

> This uses **[@americanexpress/one-app-router](https://github.com/americanexpress/one-app-router)** which is a fork of **`react-router@3`**. It extends its `Route` component which uses **`holocron`**'s `loadModule` to dynamically load modules for specified routes.

>In `createModuleRoute`, we check for the `moduleName` prop from the `ModuleRoute`. If `moduleName` exists, we define methods we know **[@americanexpress/one-app-router](https://github.com/americanexpress/one-app-router)** will leverage during
the initialization of routes in the router.

>If `moduleName` exists, `createModuleRoute` will add the methods for `getIndexRoute`, `getChildRoutes`, and `getComponent` to the that route in the route configuration.

## 📖 Table of Contents

* [Usage](#-usage)
* [Available Scripts](#-available-scripts)

## 🤹‍ Usage

### Installation

```bash
npm i holocron-module-route
```

### Usage within your module

Register child routes by adding the property childRoutes to the container component of your Module.

**`src/components/MyModule.jsx`**

``` javascript
import React from 'react';

import childRoutes from '../childRoutes';

function MyModule({ children }) {
  return <div>{children}</div>;
}

MyModule.childRoutes = childRoutes;

export default MyModule;
```

### Child routes

Define your child routes as either a single route, an array of routes or a function that takes the redux store and returns a single route or an array of routes.


**`src/childRoutes.jsx`**

``` javascript
import React from 'react';
import { ModuleRoute } from 'holocron-module-route';

export default function getChildRoutes(store) {
  return (
    <ModuleRoute
      path="my-child-route"
      moduleName="my-child-route-module"
      onEnter={(nextState, replace, callback) => {
        // this is just an example, not really how auth works :P
        !store.getState.isLoggedIn && replace('/login');
        callback();
      }}
    />
  );
}
```

## 📜 Available Scripts

To test out any changes that you've made locally, run `npm pack` then install this within your application.

The scripts below are available to run and use:

**`npm run babel`**

This deletes the current JS files within the `lib` directory and compiles the ECMAScript 6 code within the `src` file to a version of ECMAScript that can run in current browsers using Babel afterwards it copies them to the lib folder.

**`npm run build`**

This runs `npm run babel`

**`npm run prepublish`**

This runs `npm run build`
