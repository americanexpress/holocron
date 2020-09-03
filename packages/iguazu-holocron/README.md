<h1 align="center">
  <img src='https://github.com/americanexpress/holocron/raw/main/packages/iguazu-holocron/iguazu-holocron.png' alt="Iguazu Holocron - One Amex" width='50%'/>
</h1>

[![npm](https://img.shields.io/npm/v/iguazu-holocron)](https://www.npmjs.com/package/iguazu-holocron)

> This loads Holocron modules using [Iguazu](https://github.com/americanexpress/iguazu), an
> asynchronous data flow solution for React/Redux applications.

## 📖 Table of Contents

* [Usage](#-usage)
* [API](#%EF%B8%8F-api)
* [Further Reading](#-further-reading)
* [Available Scripts](#-available-scripts)

## 🤹‍ Usage

### Installation

```bash
yarn add iguazu iguazu-holocron

# or

npm install --save iguazu iguazu-holocron
```

### Usage within your module

Use `queryModule` if you would like to render a Module as soon as its bundle is loaded.

```jsx

import React from 'react';
import { connectAsync } from 'iguazu';
import { queryModule } from 'iguazu-holocron';

const MyModule = ({ loadStatus, MySubModule }) => {
  if (loadStatus.all === 'loading') {
    return <Loading />;
  }

  return (
    <div>
      <MySubModule />
    </div>
  );
};

const loadDataAsProps = ({ store: { dispatch } }) => ({
  MySubModule: () => dispatch(queryModule('my-sub-module')),
});

export default connectAsync({ loadDataAsProps })(MyModule);

```

Use `queryModuleWithData` if you would like to wait until a Module's Iguazu data dependencies are loaded to render. Any props that are necessary for the Module to decide what data to load should be passed as the second argument.

```jsx
import React from 'react';
import { compose } from 'redux';
import { connectAsync } from 'iguazu';
import { queryModuleWithData } from 'iguazu-holocron';
import { connect } from 'react-redux';

const MyModule = ({ loadStatus, MySubModuleWithData, subModuleProp }) => {
  if (loadStatus.all === 'loading') {
    return <Loading />;
  }

  return (
    <div>
      <MySubModuleWithData subModuleProp={subModuleProp} />
    </div>
  );
};

const getSubModuleProps = (state, ownProps) => { /* return props to be passed to submodule */ };

const loadDataAsProps = ({ store: { dispatch, getState }, ownProps }) => ({
  MySubModuleWithData: () => dispatch(queryModuleWithData('my-sub-module-with-data', getSubModuleProps(getState(), ownProps))),
});

const mapStateToProps = (state, ownProps) => ({
  subModuleProps: getSubModuleProps(state, ownProps),
});

export default compose(
  connectAsync({ loadDataAsProps }),
  connect(mapStateToProps)
)(MyModule);
```

Sometimes a Module may fail to load. If that is the case the data returned from Iguazu Holocron will be an instance of `EmptyModule`.  The helper function `anyAreEmpty` will tell you if any of the Modules you pass to it are an empty Module.

```jsx
import React from 'react';
import { connectAsync } from 'iguazu';
import { queryModule, anyAreEmpty } from 'iguazu-holocron';

const MyModule = ({ loadStatus, SubModuleA, SubModuleB }) => {
  if (loadStatus.all === 'loading') {
    return <Loading />;
  }

  const pageFailedToLoad = anyAreEmpty(SubModuleA, SubModuleB);

  return pageFailedToLoad
    ? <LoadError />
    : (
      <div>
        <SubModuleA />
        <SubModuleB />
      </div>
    );
};

const loadDataAsProps = ({ store: { dispatch } }) => ({
  SubModuleA: () => dispatch(queryModule('sub-module-a')),
  SubModuleB: () => dispatch(queryModule('sub-module-b')),
});

export default connectAsync({ loadDataAsProps })(MyModule);
```


## 🎛️ API

### `queryModule`

An Iguazu adapter for loading a Holocron module.

#### Arguments

| name | type | required | value |
|---|---|---|---|
| `moduleName` | `String` | `true` | The name of the Holocron module to load |

#### Usage

```js
import { connectAsync } from 'iguazu';
import { queryModule } from 'iguazu-holocron';

const MyModule = ({ MyOtherModule }) => (
  <>
    {/* some jsx */}
    <MyOtherModule />
  </>
)

function loadDataAsProps({ store }) {
  return {
    MyOtherModule: () => store.dispatch(queryModule('my-module')),
  };
}

export default connectAsync({ loadDataAsProps })(MyModule);
```

### `queryModuleWithData`

An Iguazu adapter for loading a Holocron module and its data (from the loaded module's own
`loadDataAsProps`).

#### Arguments

| name | type | required | value |
|---|---|---|---|
| `moduleName` | `String` | `true` | The name of the Holocron module to load |
| `moduleProps` | `Object` | `true` | Initial props to pass the module when loading |

#### Usage

```js
import { connectAsync } from 'iguazu';
import { queryModuleWithData } from 'iguazu-holocron';

const MyModule = ({ MyOtherModule, someData }) => (
  <>
    {/* some jsx */}
    <MyOtherModule someData={someData} />
  </>
)

function loadDataAsProps({ store, ownProps }) {
  return {
    MyOtherModule: () => store.dispatch(
      queryModuleWithData('my-module', { someData: ownProps.someData })
    ),
  };
}

export default connectAsync({ loadDataAsProps })(MyModule);
```

### `isEmpty`

`isEmpty` checks to see if the module queried has been loaded or if the module received in props is
still the default empty component.

#### Arguments

| name | type | required | value |
|---|---|---|---|
| `module` | `Function` | `true` | A module that has been loaded by one of the above Iguazu adapters |

#### Usage

```js
import { connectAsync } from 'iguazu';
import { queryModule, isEmpty } from 'iguazu-holocron';

const MyModule = ({ MyOtherModule }) => (
  <>
    {/* some jsx */}
    {isEmpty(MyOtherModule) ? <Spinner /> : <MyOtherModule />}
  </>
)

function loadDataAsProps({ store }) {
  return {
    MyOtherModule: () => store.dispatch(queryModule('my-module')),
  };
}

export default connectAsync({ loadDataAsProps })(MyModule);
```

### `anyAreEmpty`

`anyAreEmpty` taks `n` arguments, all of which are Holocron modules loaded with one of the above
Iguazu adapters. It is used to check if any modules in the argument list are still the default empty
module.

#### Arguments

| name | type | required | value |
|---|---|---|---|
| `module` | `Function` | `true` | A module that has been loaded by one of the above Iguazu adapters |

#### Usage

```js
import { connectAsync } from 'iguazu';
import { queryModule, anyAreEmpty } from 'iguazu-holocron';

const MyModule = ({ MyOtherModule, ThirdModule }) => (
  <>
    {/* some jsx */}
    { anyAreEmpty(MyOtherModule, ThirdModule) ?
      <Spinner /> :
      <MyOtherModule><ThirdModule/></MyOtherModule>
    }
  </>
)

function loadDataAsProps({ store }) {
  return {
    MyOtherModule: () => store.dispatch(queryModule('my-module')),
    ThirdModule: () => store.dispatch(queryModule('third-module')),
  };
}

export default connectAsync({ loadDataAsProps })(MyModule);
```

### `configureIguazuSSR`

`configureIguazuSSR` is a helper for loading data on the server via Iguazu. It does not need to be
called directly, but needs to be attached to the module as the static `loadModuleData` along with
`loadDataAsProps`.

> `loadModuleData` is a module lifecycle hook used by Holocron for data fetching during server
> side rendering.

#### Usage

```js
import { connectAsync } from 'iguazu';
import { queryModule } from 'iguazu-holocron';

const MyModule = ({ data }) => <p>{`Data: ${data}`}</p>)

function loadDataAsProps({ store }) {
  return {
    data: () => store.dispatch(queryData()),
  };
}

MyModule.loadDataAsProps = loadDataAsProps;
MyModule.loadModuleData = configureIguazuSSR;

export default connectAsync({ loadDataAsProps })(MyModule);
```

## 📚 Further Reading

* [Iguazu](https://github.com/americanexpress/iguazu)

## 📜 Available Scripts

To test out any changes that you've made locally, run `yarn pack` then install this within your application.

The scripts below are available to run and use:

**`yarn babel`**

This deletes the current JS files within the `lib` directory and compiles the ECMAScript 6 code within the `src` file to a version of ECMAScript that can run in current browsers using Babel afterwards it copies them to the lib folder.

**`yarn build`**

This runs `yarn babel`

**`yarn prepublish`**

This runs `yarn build`
