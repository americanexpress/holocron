<!--ONE-DOCS-METADATA title="Holocron Hooks API" tags="documentation,api,holocron,hooks" author="One Amex Team" -->

# Holocron hooks

## TOC

- [Quick Start](#quick-start)
  - [Installing](#installing)
  - [Importing](#importing)
  - [Example](#example)
- [API](#api)
  - [Hooks and Components](#hooks-and-components)
    - [`useHolocron`](#useholocron)
    - [`Holocron`](#holocron)
    - [`useHolocronContext`](#useholocroncontext)
    - [`HolocronContext`](#holocroncontext)
  - [Runtime](#runtime)
    - [`store`](#store)
    - [`registry`](#registry)
- [Features](#features)

## Quick Start

### Installing

*`npm`*
```bash
npm install holocron
```

*`yarn`*
```bash
yarn add holocron
```

### Importing

*`esm`*
```js
import {
  useHolocron,
  useHolocronContext,
  Holocron,
  HolocronContext,
} from 'holocron';
```

*`cjs`*
```js
const {
  useHolocron,
  useHolocronContext,
  Holocron,
  HolocronContext,
} = require('holocron');
```

### Example

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { renderToString } from 'react-dom/server';

import { fromJS } from 'immutable';
import appDucks from '@americanexpress/one-app-ducks';
import combineReducers from '@americanexpress/vitruvius/immutable';
import { createTimeoutFetch } from '@americanexpress/fetch-enhancers';

import {
  Holocron,
  useHolocronContext,
  holocronModule,
  getModule,
  getModules,
  getModuleMap,
  registerModule,
} from 'holocron';

// TODO: placeholder HolocronModule
export function HolocronModule({ children, ...props }) {
  const { registry } = useHolocronContext();
  return React.useMemo(
    () => registry.getModule(props.name) || holocronModule(props)(() => children),
    [props, registry]
  );
}

export function App({ children, localsForBuildInitialState }) {
  // include extra modules to the ones already defined
  const modules = getModules().merge(fromJS({
    'my-module': () => <p>Hi there!</p>,
  }));

  const moduleMap = getModuleMap().merge(fromJS({
    modules: {
      'dev-module': {
        node: {
          url: 'https://example.com/cdn/dev-module/1.0.0/dev-module.node.js',
          integrity: '123',
        },
        browser: {
          url: 'https://example.com/cdn/dev-module/1.0.0/dev-module.browser.js',
          integrity: '234',
        },
      },
    },
  }));

  return (
    <Holocron
      reducer={combineReducers(appDucks)}
      localsForBuildInitialState={{ localsForBuildInitialState }}
      extraThunkArguments={{
        fetchClient: createTimeoutFetch(6e3)(fetch),
      }}
      holocronModules={modules}
      holocronModuleMap={moduleMap}
    >
      <HolocronModule
        name="my-root-module-demo"
      >
        {/* You can design a root wrapper for other modules */}
        {children}
      </HolocronModule>
      {/* or use dynamically added modules */}
      <HolocronModule
        name="dev-module"
      >
        <HolocronModule
          name="my-module"
        />
      </HolocronModule>
    </Holocron>
  );
}

export function renderBrowser() {
  ReactDOM.render(<App />, document.body);
}

export function renderServer(localState) {
  if (!getModule('dev-module')) registerModule('dev-module', ({ children }) => children);
  return renderToString(<App localsForBuildInitialState={localState} />);
}
```

## API

### Hooks and Components

<!--ONE-DOCS-ID id="holocron/hooks/useHolocron" start-->

#### `useHolocron`

The root of a Holocron render tree; wraps Holocron modules and children
in [Redux Provider] and [HolocronContext].

##### Arguments

| name | type | required | value |
|---|---|---|---|
| `reducer` | `(state, action) => newState` | `false` | The [Redux reducer] for your application |
| `initialState` | `Immutable.Map` | `false` | The initial state of your [Redux] store |
| `enhancer` | `Function` | `false` | A [Redux enhancer] |
| `localsForBuildInitialState` | `Object` | `false` | Value to pass to [vitruvius]'s `buildInitialState` |
| `extraThunkArguments` | `Object` | `false` | Additional arguments to be passed to [Redux thunks] |
| `holocronModuleMap` | `Immutable.Map` | `false` | Holocron module map; a collection of `modules` names and their meta data, per bundle type |
| `holocronModules` | `Immutable.Map` | `false` | Holocron modules that will be preloaded on the registry |
| `blockedModules` | `Immutable.Map` | `false` | Holocron modules to block from loading |

##### Usage

> *`useHolocron` returns a component to be rendered in React components.*
> *Nothing will take effect otherwise if you do not mount child nodes*
> *within the returned component.*

```jsx
import React from 'react';
import { useHolocron } from 'holocron';

export default function MyRoot({ children }) {
  /* please make sure to place as early in the component hierarchy as possible */
  const Holocron = useHolocron({
    /* pass config as an object */
    reducer: (state) => state,
  });
  /* gain access to the latest holocron state */
  const { state, registry } = Holocron.getContext();
  /* decide where you would like to mount Holocron */
  return (
    <Holocron
      /* pass config as a prop too */
      reducer={(_) => _}
    >
      {/* make sure to render HolocronModules here */}
      {children}
    </Holocron>
  );
}
```

<!--ONE-DOCS-ID end-->

<!--ONE-DOCS-ID id="holocron/hooks/Holocron" start-->

#### `Holocron`

A declarative wrapper for [`useHolocron`](#useholocron) that can configure Holocron  via props.

##### Arguments

| name | type | required | value |
|---|---|---|---|
| `reducer` | `(state, action) => newState` | `false` | The [Redux reducer] for your application |
| `initialState` | `Immutable.Map` | `false` | The initial state of your [Redux] store |
| `enhancer` | `Function` | `false` | A [Redux enhancer] |
| `localsForBuildInitialState` | `Object` | `false` | Value to pass to [vitruvius]'s `buildInitialState` |
| `extraThunkArguments` | `Object` | `false` | Additional arguments to be passed to [Redux thunks] |
| `holocronModuleMap` | `Immutable.Map` | `false` | Holocron module map; a collection of `modules` names and their meta data, per bundle type |
| `holocronModules` | `Immutable.Map` | `false` | Holocron modules that will be preloaded on the registry |
| `blockedModules` | `Immutable.Map` | `false` | Holocron modules to block from loading |

##### Example

```jsx
import React from 'react';
import { Holocron, holocronModule, getModules } from 'holocron';

const PreviewModule = holocronModule({
  name: 'preview-module',
})(
  // [make the magic happen here]
  ({ children }) => children
);

export default function MyRoot({ children }) {
  return (
    <Holocron
      /* pass config as props */
      reducer={(state) => state}
      holocronModules={
        getModules().merge(
          fromJS({
            // eslint-disable-next-line no-shadow
            'preview-module': PreviewModule,
          })
        )
      }
    >
      {children}
    </Holocron>
  );
}
```

<!--ONE-DOCS-ID end-->

<!--ONE-DOCS-ID id="holocron/hooks/useHolocronContext" start-->

#### `useHolocronContext`

Returns the given `holocron` context within the rendered tree.

##### Example

```jsx
import React, { useEffect } from 'react';
import { useHolocronContext, Holocron } from 'holocron';

const Child = () => {
  const { store, registry } = useHolocronContext();
  useEffect(async () => {
    console.log(store, registry);
  }, []);
  return null;
};

export default function MyRoot() {
  return (
    <Holocron>
      <Child />
    </Holocron>
  );
}
```

<!--ONE-DOCS-ID end-->

<!--ONE-DOCS-ID id="holocron/hooks/HolocronContext" start-->

#### `HolocronContext`

The Holocron [Context] - consuming this context is equivalent to `useHolocronContext` hook.

##### Example

```jsx
import React, { useEffect } from 'react';
import { Holocron, HolocronContext } from 'holocron';

const Child = () => {
  const { store, registry } = React.useContext(HolocronContext);
  useEffect(async () => {
    console.log(store, registry);
  }, []);
  return null;
};

export default function MyRoot() {
  return (
    <Holocron>
      <Child />
    </Holocron>
  );
}
```
<!--ONE-DOCS-ID end-->

### Runtime

<!--ONE-DOCS-ID id="holocron/hooks/runtime/registry" start-->

#### `registry`
Contains the `registry` state (`modules`, etc) and pre-loaded actions to update itself.
##### Usage

```jsx
function Module() {
  const {
    registry: {
      // immutable state
      modules,
      moduleMap,
      blocked,
      // actions
      getModule,
      getModules,
      getModuleMap,
      setModuleMap,
      getBlockedModules,
      isModuleBlocked,
      blockModule,
      resetRegistry,
    },
  } = useHolocronContext();
}
```
<!--ONE-DOCS-ID end-->

<!--ONE-DOCS-ID id="holocron/hooks/runtime/store" start-->

#### `store`

The Holocron store being used.

##### Usage

```jsx
function Module() {
  const {
    store: {
      getState,
      dispatch,
      rebuildReducer,
      modules,
    },
  } = useHolocronContext();
}
```
<!--ONE-DOCS-ID end-->

## Features

* [x] Holocron - [React] [Context] based [hooks] and components
* [ ] Holocron Module
* [ ] Holocron Layers
* [ ] Holocron Static Rendering
* [ ] Holocron life-cycle hooks

### Goals

- Create a React Hooks API which returns a Component for declarative composition
- Give holocron and modules a lifecycle and context which can be observed by consumers
- Support multiple `Holocron` roots and module maps, simultaneously
- Transition capabilities of a Holocron module to the runtime (resilience - with external dependencies)
- Loading data can be done on demand and is saved as `moduleData` which can be used ubiquitously to
fetch any data
- Design `Holocron` to be easily encapsulated (wrapped in WebComponent, CDN script, `node` package, etc)
- Provide Holocron modules many facets for enhancing - input driven through "layers" and props/config
- Register "layers" that wrap at a given `Holocron` root or for a Module (plugins, decorators,
boundaries, perf, intl, etc)
- Support HMR and other DX needs out of the box
- Support SSR with Holocron server tooling in the future
- Support multiple loader types down the line (script, module type, dynamic imports, node, etc)

#### Composing Holocron Modules + Layers

To make re-usable and data-driven Holocron modules, we can
reconfigure the module via props (which overrides default config).

Module creators can design and document patterns for re-usability - configuring a holocron module
via props allows modifying the default config, making for a re-usable holocron module.

Layers are components that wrap a Holocron Module and can be used to enhance the module.
In the example below, they're used to enhance the Holocron tree and decorate modules in batch
and with individual layers.

```jsx
import React from 'react';
import { Holocron, HolocronModule } from 'holocron';

const app = (
  <Holocron
    store={{ /* provide your own */ }}
    /* or configure a holocron store */
    reducer={(state) => state}
    /* enhance holocron */
    layers={{
      enhancers: [ThemeProviderLayer],
      modules: [
        AnalyticsLayer,
        ProfilingLayer,
        ErrorBoundaryLayer,
      ],
    }}
  >
    <HolocronModule
      /* initialize and configure */
      moduleName="ui-view"
      /* load in data used by the module */
      loadModuleData={({ fetchClient }) => fetchClient('/configs/layout.json')}
    >
      <HolocronModule
        moduleName="main-content"
        loadModuleData={({ fetchClient }) => Promise.all([
          fetchClient(`/blog.md?href=${window.location.href}`),
          fetchClient(`/language.json?locale=${window.navigator.language}`),
        ])}
        shouldModuleReload={() => { /* decide whether to reload the data or not */ }}
        /* enhance your module */
        layers={[
          IntlLayer(({ moduleData }) => {
            const [, langData = {}] = moduleData || [];
            return langData;
          }),
        ]}
      />
      <HolocronModule
        moduleName="ad-box"
        layers={[
          AuthorizeThirdPartyLayer('ad-box'),
          AnalyticsLayer,
        ]}
        /* pass in props */
        selection={['featured']}
      />
    </HolocronModule>
  </Holocron>
);
```

#### Holocron Module State & Context

The Holocron Module API gives us not just the module state but actions
to perform on demand like `loadModuleData` (if we want to invalidate for example)
and its result as `moduleData` with `moduleLoadStatus` to indicate status.

*`src/components/OtherModule.jsx`*
```jsx
import React from 'react';
import {
  registerModule,
  useHolocronModule,
} from 'holocron';

export function MyOtherHolocronModule(props) {
  const HolocronModule = useHolocronModule({
    name: 'my-other-module',
  });
  const {
    holocronLoadStatus,
    moduleLoadStatus,
    moduleState,
    moduleConfig,
    moduleData,
    loadModuleData,
  } = HolocronModule.getContext();
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <HolocronModule {...props} />;
}

registerModule('my-other-module', MyOtherHolocronModule);
```

*`src/components/index.jsx`*
```jsx
import React from 'react';

export function MyHolocronModule({
  holocronLoadStatus,
  moduleLoadStatus,
  moduleState,
  moduleConfig,
  moduleData,
  loadModuleData,
  ...ownProps
}) {
  return null;
}

MyHolocronModule.holocron = {
  name: 'my-module',
};
```

#### Rendering on the Server Side

Rendering on the server side can be url driven as we will see in the example below.
We can use search params to render a given array of `modules` and the `moduleMap` to use,
each Holocron module rendered with the provided props attributed to the given module.

We are also using `composeModule` to preload module data and write the `initialState`
of the server side request.

*`src/server/rendering.js`*
```jsx
import React from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import {
  Holocron,
  HolocronModule,
  createHolocronStore,
  composeModules,
} from 'holocron';

export async function renderHolocronFragment({
  modules,
  moduleStore,
  moduleMap,
}) {
  const store = createHolocronStore((state) => state);

  // we can preload data on the server by composing the given modules
  await store.dispatch(composeModules(modules));

  const appHtml = renderToString(
    <Holocron
      ssr={true}
      store={store}
      holocronModules={moduleStore}
      holocronModuleMap={moduleMap}
    >
      {React.Children.toArray(
        modules.map(({ name, ...props }) => (
          <HolocronModule
            name={name}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
          />
        ))
      )}
    </Holocron>
  );

  return (
    <React.Fragment>
      <script
        id="initial-state"
        dangerouslySetInnerHtml={{
          __html: `window.__INITIAL_STATE__ = ${JSON.stringify(store.getState())};`,
        }}
      />
      <div
        id="root"
        dangerouslySetInnerHtml={{
          __html: appHtml,
        }}
      />
      <script src="/app.js" />
    </React.Fragment>
  );
}

export function renderDocument({ lang, title, content }) {
  return renderToStaticMarkup(
    <html lang={lang}>
      <head>
        <title>{title}</title>
      </head>
      <body>{content}</body>
    </html>
  );
}
```

#### Serverless with multiple Module Maps

Given we have a configurable dictionary of module map names and their url,
we are able to load up a selected module and load in the modules needed
for a single SSR request. If used with serverless, consider data like module
maps that can be cached (and updated) and places to hydrate with the cached
data in your serverless function.

Let's re-use the [previous renderer](#rendering-on-the-server-side) and use it
in the example below.

*`src/server/index.js`*
```jsx
import { renderDocument, renderHolocronFragment } from './rendering.js';

// preloading persistent serializable data could save on network calls
const moduleMaps = new Map();
// should total to the modules needed per render,
// while only caching to a given 'size' limit or memory limit (as modules vary in size)
const modulesInMemory = new Map();

const moduleMapDictionary = {
  // can be configurable
  'my-default-map': 'https://example.com/module-maps/default.json',
};

// for async operations in grabbing the given resources,
// it's worth looking into dedicated CDNs

async function getModuleMap(moduleMapName = 'my-default-map') {
  // get module map or fetch it if need be
}

async function getModulesForModuleMap(modules, moduleMap) {
  // get module from modulesInMemory map or download it
}

export default async function htmlMiddlewareFn(req, res) {
  const {
    // eg '[{"name":"my-module"}]'
    modules: modulesRaw,
    moduleMap: moduleMapName = 'my-default-map',
    lang = 'en-us',
    title = 'My SSR Holocron App',
  } = req.params;

  const modules = JSON.parse(modulesRaw) || [];
  const moduleMap = await getModuleMap(moduleMapName);
  const moduleStore = await getModulesForModuleMap(modules, moduleMap);

  res.type('html').send(
    '<!DOCTYPE html>'.concat(
      renderDocument({
        lang,
        title,
        content: await renderHolocronFragment({
          modules,
          moduleStore,
          moduleMap,
        }),
      })
    )
  );
}
```

#### Holocron Module Life Cycle

Giving authors tools to tap into the Holocron life cycle will give more granular
control over when something happens.
With the help of `react` Context, we can subscribe to data loading life cycle
for a  Holocron module. Using event hooks, we can subscribe anywhere within a
Holocron modules' render tree and tap into its changes.

```jsx
import React from 'react';
import {
  onModuleLoaded,
  onModuleLoading,
  onModuleLoadFailed,
  onHolocronInit,
} from 'holocron';

export default function MyHolocronModule({ moduleData, loadModuleData }) {
  // event hooks can be used to invoke
  onModuleLoadFailed((error) => {
    console.log('Ohh no, something went wrong', error);
  });
  onModuleLoaded((data) => {
    console.log('Yay, module has loaded successfully', data, data === moduleData);
  });
  onModuleLoading((promise) => {
    console.log('Still loading the data...', promise);
  });
  onHolocronInit(({ store, registry }) => {
    // do something before rendering starts
  });

  React.useEffect(() => {
    if (global.BROWSER) loadModuleData();
  }, []);

  return null;
}

MyHolocronModule.holocron = {
  name: 'my-module',
  loadModuleData: () => Promise.resolve('data'),
};
```

##### Render Static Content + Server Tooling

Rendering should not be limited to html markup; static text rendering
will be safe to use both as a regular React component (if not root) and with `render`.

```jsx
import React from 'react';
import { StaticRouter, StaticModule, render } from 'holocron';

export function renderStaticRoutes(req, res, next) {
  const result = render(
    <StaticRouter
      location={req.url}
    >
      <StaticModule
        path="/robots.txt"
        render={() => 'robots.txt'}
      />

      {/* include other static modules */}

      {MyModule.router}
    </StaticRouter>
  );

  if (result) res.type(result.type).send(result.body);
  else next();
}
```

##### Node Hierarchy

Looking at the big picture, we can see holocron and a tree of holocron modules.

```jsx
(
  <Holocron>
    <HolocronModule />
    <HolocronModule />
    <HolocronLayer>
      <HolocronModule />
      <HolocronModule />
      <HolocronModule />
    </HolocronLayer>
  </Holocron>
);
```