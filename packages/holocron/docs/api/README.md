# 🎛 API

There are some functions that are available on both the client and server, and some that are only
available on the server. We have organized them as such.

- [Universal](#universal)
- [Server](#server)

## Universal

**Contents:**

- [App-level Functions](#app-level-functions)
  - [`createHolocronStore`](#createholocronstore)
- [Holocron Module Configuration](#holocron-module-configuration)
  - [`Module.holocron`](#moduleholocron)
- [Module-level Functions](#module-level-functions)
  - [`RenderModule`](#rendermodule)
  - [`HolocronModule`](#holocronmodule)
  - [`composeModules`](#composemodules)
  - [`loadModule`](#loadmodule)
  - [`holocronModule` HoC (Deprecated)](#holocronmodule-hoc-deprecated)
- [Module Registry](#module-registry)
  - [`registerModule`](#registermodule)
  - [`getModule`](#getmodule)
  - [`getModules`](#getmodules)
  - [`getModuleMap`](#getmodulemap)
  - [`setModuleMap`](#setmodulemap)
- [Selectors](#selectors)
  - [`isLoaded`](#isloaded)
  - [`failedToLoad`](#failedToLoad)
  - [`getLoadError`](#getLoadError)
  - [`isLoading`](#isloading)
  - [`getLoadingPromise`](#getloadingpromise)

### App-level Functions

The below is intended only to be called by your app, not modules.

<!--ONE-DOCS-ID id="createHolocronStore" start-->

#### `createHolocronStore`

Creates the [Redux] store with Holocron compatibility.

##### Arguments

| name | type | required | value |
|---|---|---|---|
| `reducer` | `(state, action) => newState` | `true` | The [Redux reducer] for your application |
| `initialState` | `Immutable.Map` | `false` | The initial state of your [Redux] store |
| `enhancer` | `Function` | `false` | A [Redux enhancer] |
| `localsForBuildInitialState` | `Object` | `false` | Value to pass to [vitruvius]'s `buildInitialState` |
| `extraThunkArguments` | `Object` | `false` | Additional arguments to be passed to [Redux thunks] |

##### Usage

```jsx
import { createHolocronStore } from 'holocron';
import { Provider } from 'react-redux';

const store = createHolocronStore({
  reducer,
  initialState,
  enhancer,
  localsForBuildInitialState,
  extraThunkArguments,
});

hydrate(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

<!--ONE-DOCS-ID end-->

### Holocron Module Configuration

<!--ONE-DOCS-ID id="Module.holocron" start-->

#### `Module.holocron`

The optional `holocron` object set to the parent React Component inside a Holocron Module determines behavior of state management, data loading, and React prop management.

> A `name` property is required if a `reducer` is set otherwise the `reducer` will not be added to the Redux Store.

##### Properties

| name | type | required | value |
|---|---|---|---|
| `name` | `String` | `true` | The name of your Holocron module |
| `reducer` | `(state, action) => newState` | `false` | The Redux reducer to register when your module is loaded. *Requires a `name`* |
| `loadModuleData` | `({ store, fetchClient, ownProps, module }) => Promise` | `false` | A function that fetches data required by your module |
| `shouldModuleReload` | `(oldProps, newProps) => Boolean` | `false` | A function to determine if your `loadModuleData` and or `load` function should be called again |
| `mergeProps` | `(stateProps, dispatchProps, ownProps) => Object` | `false` | Passed down to Redux connect |
| `options` | `Object` | `false` | Additional options |
| `load` *☠️ Deprecated* | `(props) => Promise` or `(props) => (dispatch, getState, ...extra) => Promise` | `false` | A deprecated function that fetches data required by your module. Please use `loadModuleData` instead.

#### Usage

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import { fromJS } from 'immutable';

const HelloWorld = ({
  moduleLoadStatus,
  moduleState: { name },
}) => {
  if (moduleLoadStatus === 'loading') {
    return <h1>Loading...</h1>;
  }
  if (moduleLoadStatus === 'error') {
    return <h1>Error!</h1>;
  }
  return <h1>Hello, {name}!</h1>;
};

HelloWorld.propTypes = {
  moduleState: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
  moduleLoadStatus: PropTypes.oneOf([
    'loading',
    'loaded',
    'error',
  ]),
};

const loadModuleData = ({
  store: { dispatch },
}) => dispatch({ type: 'SET_NAME', name: 'World' });

const shouldModuleReload = (
  oldProps,
  newProps
) => oldProps.moduleState.name !== newProps.moduleState.name;

// This reducer is supplying 'moduleState' in our component
// Note: reducers use immutable.js
const reducer = (state = fromJS({}), action) => {
  switch (action.type) {
    case 'SET_NAME': {
      return state.set('name', action.name);
    }
    default: return state;
  }
};

HelloWorld.holocron = {
  name: 'holocron-hello-world',
  reducer,
  loadModuleData,
  shouldModuleReload,
};

export default HelloWorld;
```

The Holocron Module parent React Components will be provided several props automatically.

| prop name | type | value |
|---|---|---|
| `moduleLoadStatus` | `String` | One of `"loading"`, `"loaded"`, or `"error"`, based on the `load` function |
| `moduleState` | `Object` | The state of the registered reducer after [`.toJS()`] has been called on it |

<!--ONE-DOCS-ID end-->

### Module-level Functions

While these can all be used by the app itself, they will get the most use from modules.

<!--ONE-DOCS-ID id="RenderModule" start-->

#### `RenderModule`

A React component for rendering a Holocron module.

##### Props

| name | type | required | value |
|---|---|---|---|
| `moduleName` | `PropTypes.string` | `true` | The name of the Holocron module to be rendered |
| `props` | `PropTypes.object` | `false` | Props to pass the rendered Holocron module |
| `children` | `PropTypes.node` | `false` | Children passed to the rendered Holocron module |
##### Usage

```jsx
import { RenderModule, composeModules } from 'holocron';

const MyModule = ({ data }) => (
  <div>
    {/* some more JSX */}
    <RenderModule moduleName="sub-module" props={{ data }}>
      <p>Hello, world</p>
    </RenderModule>
  </div>
);

export const loadModuleData = ({ store: { dispatch } }) => dispatch(composeModules([
  { name: 'sub-module' },
]));

MyModule.holocron = {
  name: 'my-module',
  loadModuleData,
};

export default MyModule;
```

<!--ONE-DOCS-ID end-->

<!--ONE-DOCS-ID id="HolocronModule" start-->

#### `HolocronModule`

A React component for rendering a Holocron module with its full life-cycle.
The component will call [`composeModules`](#composemodules) to load in the
Holocron module and [`RenderModule`](#rendermodule) to render it.
When rendering on the server, the `HolocronModule` component expects the
Holocron modules to be preloaded before rendering.

##### Props

| name         | type               | required | value                                           |
|--------------|--------------------|----------|-------------------------------------------------|
| `moduleName` | `PropTypes.string` | `true`   | The name of the Holocron module to be rendered  |
| `fallback`   | `PropTypes.func`   | `false`  | An optional render function called when loading |
| `...props`   | `PropTypes.object` | `false`  | Props to pass the rendered Holocron module      |

##### Usage

```jsx
import React from 'react';
import { HolocronModule } from 'holocron';

const MyModule = ({ data }) => (
  <div>
    {/* some more JSX */}
    <HolocronModule moduleName="sub-module-with-data">
      <p>Hello, world</p>
    </HolocronModule>
  </div>
);

MyModule.holocron = {
  name: 'my-module',
};

export default MyModule;
```

##### Additional Module Props

`HolocronModule` will provide two additional props to your module,
in addition to `moduleLoadStatus` and `moduleState`.

| prop name        | type       | value                                                                                 |
|------------------|------------|---------------------------------------------------------------------------------------|
| `loadModuleData` | `Function` | calls `composeModules` and returns the data configured with `holocron.loadModuleData` |
| `moduleData`     | `Object`   | The data returned from `loadModuleData`                                               |

Both of these props can be used inside of your module to access the data,
and reload the module data on demand.

```jsx
import React from 'react';

export default function MyModule({ moduleData, loadModuleData }) {
  return (
    <div>
      <ComponentDisplayingModuleData data={moduleData} />
      <button type="button" onClick={loadModuleData}>
        Update Module Data
      </button>
    </div>
  );
}

MyModule.holocron = {
  name: 'my-module',
  loadModuleData() {
    return fetch('...').then((res) => res.json());
  },
};
```

> Please note, `moduleData` will be `null` during server side rendering using One App.

##### Integrations

`HolocronModule` can be used in many ways to dynamically include
Holocron modules anywhere within a micro-frontend like One App - this
includes on-demand loading of a Holocron module that is server-side
friendly (and available) when rendering from One App. Let us suppose
we wanted to create a lazy-loading Holocron module to load/render
only when the user has taken a given action like click a button:

```jsx
import React from 'react';
import { HolocronModule as Module } from 'holocron';

export default function MyModule() {
  const [showOtherModule, setShowOtherModule] = React.useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setShowOtherModule(!showOtherModule);
        }}
      >
        Show Other Module
      </button>
      {showOtherModule ? (
        <Module moduleName="other-module" />
      ) : null}
    </div>
  );
}
```

`HolocronModule` also has seamless compatibility with libraries
like `@reach/router` and makes it easy to compose and route modules
all together using a micro-frontend architecture:

```jsx
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from '@reach/router';
import {
  HolocronModule as Module,
  createHolocronStore,
  // setModuleMap,
} from 'holocron';

// make sure to setup your module map before creating the store
// setModuleMap({})

const store = createHolocronStore({ reducer: (state) => state });

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Module path="/" moduleName="entry-module">
          <Module path="/" moduleName="landing-page" />
          <Module path="/stickers/*" moduleName="sticker-book">
            <Module path="/stickers/:stickersId" moduleName="stickers-viewer" />
          </Module>
        </Module>
      </Router>
    </Provider>
  );
}
```

<!--ONE-DOCS-ID end-->

<!--ONE-DOCS-ID id="composeModules" start-->

#### `composeModules`

An action creator that loads Holocron modules and their data.

##### Arguments

| name | type | required | value |
|---|---|---|---|
| `moduleConfigs` | `[{ name, props }]` | `true` | An array of objects containing module names and their props |

##### Usage

```js
import { composeModules } from 'holocron';

export const loadModuleData = ({ store: { dispatch }, ownProps }) => dispatch(composeModules([
  { name: 'some-module', props: { someProp: ownProps.anyProp } },
  { name: 'another-module' },
]));
```

<!--ONE-DOCS-ID end-->

<!--ONE-DOCS-ID id="loadModule" start-->

#### `loadModule`

An action creator that fetches a Holocron module.

##### Arguments

| name | type | required | value |
|---|---|---|---|
| `moduleName` | `String` | `true` | The name of the Holocron module being fetched |

##### Usage

```js
import { loadModule } from 'holocron';

const loadModuleData = ({ store: { dispatch } }) => dispatch(loadModule('my-module'));
```
<!--ONE-DOCS-ID end-->

<!--ONE-DOCS-ID id="holocronModule" start-->

#### `holocronModule (Deprecated)`

> ☠️ Deprecated in favor of [Holocron Module Configuration](#holocron-module-configuration)

A [higher order component (HOC)] for registering a load function and/or reducer with a module. This HOC is only required if the `load` or `reducer` functionality is used.

> A `name` property is required if a `reducer` is set otherwise the `reducer` will not be added to the Redux Store.

##### Arguments

| name | type | required | value |
|---|---|---|---|
| `name` | `String` | `true` | The name of your Holocron module |
| `reducer` | `(state, action) => newState` | `false` | The Redux reducer to register when your module is loaded. *Requires a `name`* |
| `load` *☠️ Deprecated* | `(props) => Promise` or `(props) => (dispatch, getState, ...extra) => Promise` | `false` | A deprecated function that fetches data required by your module. Please use `loadModuleData` instead. |
| `loadModuleData` | `({ store, fetchClient, ownProps, module }) => Promise` | `false` | A function that fetches data required by your module |
| `shouldModuleReload` | `(oldProps, newProps) => Boolean` | `false` | A function to determine if your `loadModuleData` and or `load` function should be called again |
| `mergeProps` | `(stateProps, dispatchProps, ownProps) => Object` | `false` | Passed down to Redux connect |
| `options` | `Object` | `false` | Additional options |

##### Usage

```jsx
import { holocronModule } from 'holocron';
import React from 'react';
import PropTypes from 'prop-types';
import { reducer, fetchData } from '../duck';

const HelloWorld = ({ moduleState: { myData } }) => (
  <h1>
    Hello,
    {myData.name}
  </h1>
);
HelloWorld.propTypes = {
  moduleState: PropTypes.shape({
    myData: PropTypes.string,
  }).isRequired,
};

const load = (props) => (dispatch) => dispatch(fetchData(props.input));
const shouldModuleReload = (oldProps, newProps) => oldProps.input !== newProps.input;
const options = { ssr: true };

export default holocronModule({
  name: 'hello-world',
  reducer,
  load,
  shouldModuleReload,
  options,
})(HelloWorld);
```

Components using this HOC will be provided several props.

| prop name | type | value |
|---|---|---|
| `moduleLoadStatus` | `String` | One of `"loading"`, `"loaded"`, or `"error"`, based on the `load` function |
| `moduleState` | `Object` | The state of the registered reducer after [`.toJS()`] has been called on it |

<!--ONE-DOCS-ID end-->

> The following are low-level APIs unlikely to be needed by most users

### Module Registry

These functions are all related to interactions with the module registry.

<!--ONE-DOCS-ID id="registerModule" start-->

#### `registerModule`

Adds a Holocron module to the registry

##### Arguments

| name | type | required | value |
|---|---|---|---|
| `moduleName` | `String` | `true` | The name of your Holocron module |
| `module` | `Function` | `true` | The Holocron module itself (a React component) |

<!--ONE-DOCS-ID end-->

<!--ONE-DOCS-ID id="getModule" start-->

#### `getModule`

Retrives a Holocron module from the registry

##### Arguments

| name | type | required | value |
|---|---|---|---|
| `moduleName` | `String` | `true` | The name of the Holocron module being requested |
| `altModules` | `Immutable.Map` | `false` | An alternative set of modules to the registry |

##### Usage

```js
import { getModule } from 'holocron';

const Module = getModule(moduleName, altModules);
```

<!--ONE-DOCS-ID end-->

<!--ONE-DOCS-ID id="getModules" start-->

#### `getModules`

Returns all modules in the registry

##### Arguments

_none_

##### Usage

```js
import { getModules } from 'holocron';

const modules = getModules();
```

<!--ONE-DOCS-ID end-->

<!--ONE-DOCS-ID id="getModuleMap" start-->

#### `getModuleMap`

Returns the module map

##### Arguments

_none_

##### Usage

```js
import { getModuleMap } from 'holocron';

const moduleMap = getModuleMap();
```

<!--ONE-DOCS-ID end-->

<!--ONE-DOCS-ID id="setModuleMap" start-->

#### `setModuleMap`

Sets the module map

##### Arguments

| name | type | required | value |
|---|---|---|---|
| `newModuleMap` | `Immutable.Map` | `true` | The new module map to replace the existing one |

##### Usage

```js
import { setModuleMap } from 'holocron';

setModuleMap(newModuleMap);
```

<!--ONE-DOCS-ID end-->

### Selectors

These are all functions that take a module name as the only parameter and return a new function
that accepts the [Redux] state as the only parameter which returns data about the module.

<!--ONE-DOCS-ID id="isLoaded" start-->

#### `isLoaded`

A selector to determine if a Holocron module has been loaded.

##### Arguments

| name | type | required | value |
|---|---|---|---|
| `moduleName` | `String` | `true` | The name of the Holocron module that may be loaded |

##### Usage

```js
import { isLoaded } from 'holocron';

const mapStateToProps = (state) => (
  { myModuleIsLoaded: isLoaded('my-module')(state) }
);
```

<!--ONE-DOCS-ID end-->

<!--ONE-DOCS-ID id="failedToLoad" start-->

#### `failedToLoad`

A selector to determine if a Holocron module failed to load.

##### Arguments

| name | type | required | value |
|---|---|---|---|
| `moduleName` | `String` | `true` | The name of the Holocron module that may have failed to load |

##### Usage

```js
import { failedToLoad } from 'holocron';

const mapStateToProps = (state) => ({
  myModuleFailedToLoad: failedToLoad('my-module')(state),
});
```

<!--ONE-DOCS-ID end-->

<!--ONE-DOCS-ID id="getLoadError" start-->

#### `getLoadError`

A selector to return the error of a Holocron module that failed to load.

##### Arguments

| name | type | required | value |
|---|---|---|---|
| `moduleName` | `String` | `true` | The name of the Holocron module whose load error will be returned |

##### Usage

```js
import { getLoadError } from 'holocron';

const mapStateToProps = (state) => ({
  myModuleLoadError: getLoadError('my-module')(state),
});
```

<!--ONE-DOCS-ID end-->

<!--ONE-DOCS-ID id="isLoading" start-->

#### `isLoading`

A selector to determine if a module is loading.

##### Arguments

| name | type | required | value |
|---|---|---|---|
| `moduleName` | `String` | `true` | The name of the Holocron module that may be loading |

##### Usage

```js
import { isLoading } from 'holocron';

const mapStateToProps = (state) => ({
  myModuleIsLoading: isLoading('my-module')(state),
});
```

<!--ONE-DOCS-ID end-->

<!--ONE-DOCS-ID id="getLoadingPromise" start-->

#### `getLoadingPromise`

A selector to return the promise from a Holocron module being loaded.

##### Arguments

| name | type | required | value |
|---|---|---|---|
| `moduleName` | `String` | `true` | The name of the Holocron module whose loading promise will be returned |

##### Usage

```js
import { getLoadingPromise } from 'holocron';

const mapStateToProps = (state) => ({
  myModuleLoadingPromise: getLoadingPromise('my-module')(state),
});
```

<!--ONE-DOCS-ID end-->

## Server

**Contents:**

- [`updateModuleRegistry`](#updatemoduleregistry)
- [`areModuleEntriesEqual`](#aremoduleentriesequal)

<!--ONE-DOCS-ID id="updateModuleRegistry" start-->

#### `updateModuleRegistry`

Updates the module registry with a new module map.

##### Arguments

| name | type | required | value |
|---|---|---|---|
| `moduleMap` | `Object` | `true` | The new module map |
| `onModuleLoad` | `Function` | `false` | The function to call on every module that is loaded |
| `batchModulesToUpdate` | `modules => Array` | `false` | A function that returns an array of arrays of batches of modules to load |
| `getModulesToUpdate` | `Function` | `false` | A function that returns an array of which modules should be updated |


##### Usage

```js
import { updateModuleRegistry } from 'holocron/server';

const onModuleLoad = ({ module, moduleName }) => {
  if (!isValid(module)) throw new Error(`Module ${moduleName} is invalid`);
  console.info(`Loaded module ${moduleName}`);
};

export default async function updateRegistry() {
  const moduleMapResponse = await fetch(MODULE_MAP_URL);
  const moduleMap = await moduleMapResponse.json();
  await updateModuleRegistry({
    moduleMap,
    onModuleLoad,
  });
}

```

<!--ONE-DOCS-ID end-->

<!--ONE-DOCS-ID id="areModuleEntriesEqual" start-->

#### `areModuleEntriesEqual`

Compares two module map entries to see if they are equal. This is intended for use when providing `getModulesToUpdate` to `updateModulesRegistry`

##### Arguments

| name | type | required | value |
|---|---|---|---|
| `firstModuleEntry` | `Object` | `false` | A module map entry |
| `secondModuleEntry` | `Object` | `false` | Another module map entry |

##### Usage

```js
import { areModuleEntriesEqual } from 'holocron/server';

const getModulesToUpdate = (
  currentModules,
  nextModules
) => Object
  .keys(next)
  .filter(
    (moduleName) => !areModuleEntriesEqual(curr[moduleName], next[moduleName])
        || someOtherLogic(moduleName)
  );
```

<!--ONE-DOCS-ID end-->

[Redux]: https://redux.js.org
[Redux enhancer]: https://redux.js.org/recipes/configuring-your-store#extending-redux-functionality
[Redux reducer]: https://redux.js.org/recipes/structuring-reducers/structuring-reducers
[vitruvius]: http://github.com/americanexpress/vitruvius
[Redux thunks]: https://github.com/reduxjs/redux-thunk
[`.toJS()`]: https://immutable-js.github.io/immutable-js/docs/#/Map/toJS
[higher order component (HOC)]: https://reactjs.org/docs/higher-order-components.html
