<h1 align="center">
  <img src='https://github.com/americanexpress/holocron/raw/master/packages/holocron-module-route/holocron-module-route.png' alt="Holocron Module Route - One Amex" width='50%'/>
</h1>

[![npm](https://img.shields.io/npm/v/holocron-module-route)](https://www.npmjs.com/package/holocron-module-route)

> This uses **[@americanexpress/one-app-router](https://github.com/americanexpress/one-app-router)**
> which is a fork of **`react-router@3`**. It extends its `Route` component which uses
> **`holocron`**'s `loadModule` to dynamically load modules for specified routes.

> In `createModuleRoute`, we check for the `moduleName` prop from the `ModuleRoute`. If `moduleName`
> exists, we define methods we know **[@americanexpress/one-app-router](https://github.com/americanexpress/one-app-router)**
> will leverage during the initialization of routes in the router.

> If `moduleName` exists, `createModuleRoute` will add the methods for `getIndexRoute`,
> `getChildRoutes`, and `getComponent` to the that route in the route configuration.

## 📖 Table of Contents

* [Usage](#-usage)
* [API](#%EF%B8%8F-api)
* [Available Scripts](#-available-scripts)

## 🤹‍ Usage

### Installation

```bash
npm install --save holocron-module-route
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

Define your child routes as either a single route, an array of routes or a function that takes the
redux store and returns a single route or an array of routes.


**`src/childRoutes.jsx`**

``` javascript
import React from 'react';
import ModuleRoute from 'holocron-module-route';

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

## 🎛️ API

<!--ONE-DOCS-ID id="ModuleRoute" start-->

### `ModuleRoute`

`ModuleRoute` extends [`one-app-router`](https://github.com/americanexpress/one-app-router)'s
[`Route`](https://github.com/americanexpress/one-app-router/blob/master/docs/API.md#route). It has
all the functionality of `Route`, with the addition of loading a
[holocron module](https://github.com/americanexpress/one-app#modules) instead of a component.

#### Extended [`Route`](https://github.com/americanexpress/one-app-router/blob/master/docs/API.md#route) Props

| name | type | required | value |
|---|---|---|---|
| `moduleName` | `String` | `false` | The name of the Holocron module to render when the route is matched |

#### Usage

```js
const myRoutes = [
  <ModuleRoute path="some-path" moduleName="someModule" />
];
```

<!--ONE-DOCS-ID end-->

#### Module Lifecycle Hooks

These are a few statics that can be attached to modules loaded as `ModuleRoute`s.

<!--ONE-DOCS-ID id="childRoutes" start-->

##### `childRoutes`

While child routes can be defined by nesting, frequently a module will need to load its own child
routes rather than relying on its parent to define them.

`childRoutes` can be an array of routes, a single route, or a function that accepts the Redux store
as a single parameter and returns either an array of routes or a single route.

###### As an Array:

```jsx
const MyModule = () => {/* jsx */};

MyModule.childRoutes = [
  <ModuleRoute path="some-path" moduleName="someModule" />,
  <ModuleRoute path="another-path" moduleName="anotherModule" />
];
```

###### As a single route:

```jsx
const MyModule = () => {/* jsx */};

MyModule.childRoutes = <ModuleRoute path="some-path" moduleName="someModule" />;
```

###### As a function:

**Arguments**

| name | type | value |
|---|---|---|
| `store` | `Object` | [Redux store](https://redux.js.org/basics/store/) |

**Usage:**

```jsx
const MyModule = () => {/* jsx */};

MyModule.childRoutes = (store) => (
  <ModuleRoute
    path="some-path"
    title={store.getState().get('pageTitle')}
    onEnter={authenticate}
    moduleName="someModule"
  />
);
```

<!--ONE-DOCS-ID end-->

<!--ONE-DOCS-ID id="onEnterRouteHook" start-->

##### `onEnterRouteHook`

When setting `ModuleRoutes`, you may set an `onEnter` hook as a prop on the `<ModuleRoute />`
itself. However, it is often useful for the module being loded to define its on `onEnter` hook. We
can do so via `onEnterRouteHook`. `onEnterRouteHook` can take one, two, or three arguments, with
different behavior for each.

**One Argument**

When using only one argument, `onEnterRouteHook` will receive the [Redux store](https://redux.js.org/basics/store/)
an must return an `onEnter` hook, which has the same API as [defined in `one-app-router`](https://github.com/americanexpress/one-app-router/blob/master/docs/API.md#onenternextstate-replace-callback).

| name | type | value |
|---|---|---|
| `store` | `Object` | Redux store |

**Two or Three Arguments**

When using two or three arguments, the API is the same as the `onEnter` in `one-app-router`, where
the first two arguments are `nextState` and `replace` and the optional third argument is a callback,
which, when used, will block the transition until it is called. See the
[`one-app-router` documentation](https://github.com/americanexpress/one-app-router/blob/master/docs/API.md#onenternextstate-replace-callback)
for more details.

| name | type | value |
|---|---|---|
| `nextState` | `Object` | Next router state |
| `replace` | `Function` | Redirects to another path |
| `callback` | `Function` | Blocks route transition until called |

**Usage**

```jsx
const MyModule = () => {/* jsx */};

MyModule.onEnterRouteHook = (store) => (nextState, replace, callback) => {
  store.dispatch(authenticate()).then(() => {
    if (!store.getState().isAuthenticated) replace('/login');
    callback();
  });
}
```

<!--ONE-DOCS-ID end-->

<!--ONE-DOCS-ID id="moduleRoutePrefetch" start-->

### `moduleRoutePrefetch`

`moduleRoutePrefetch` can be used to prefetch the modules and data for any route. It is a
[Redux Thunk](https://redux.js.org/advanced/async-actions/) action creator.

#### Arguments

| name | type | required | value |
|---|---|---|---|
| `routes` | `Object` | `true` | Routes as given by [`one-app-router`](https://github.com/americanexpress/one-app-router) to its routes |
| `location` | `String` | `true` | Route to be prefetched |

#### Usage

```jsx
const PrefetchLink = ({ routes, location, prefetch }) => (
  <Link to={location} onMouseOver={() => prefetch(location)}>
    { children }
  </Link>
);

const mapDispatchToProps = (dispatch, { router: { routes } = { routes: [] } }) => ({
  prefetch: (location) => dispatch(moduleRoutePrefetch({ location, routes })),
});

export default connect(null, mapDispatchToProps)(PrefetchLink);
```

<!--ONE-DOCS-ID end-->

## 📜 Available Scripts

To test out any changes that you've made locally, run `npm pack` then install this within your
application.

The scripts below are available to run and use:

**`npm run babel`**

This deletes the current JS files within the `lib` directory and compiles the ECMAScript 6 code
within the `src` file to a version of ECMAScript that can run in current browsers using Babel
afterwards it copies them to the lib folder.

**`npm run build`**

This runs `npm run babel`

**`npm run prepublish`**

This runs `npm run build`
