# Iguazu Holocron

[![npm](https://img.shields.io/npm/v/iguazu-holocron)](https://www.npmjs.com/package/iguazu-holocron)

>This loads holocron modules using **`iguazu`**
>Iguazu is an asynchronous data flow solution for React/Redux applications.

## 📖 Table of Contents

* [Usage](#-usage)
* [Further Reading](#-further-reading)
* [Available Scripts](#-available-scripts)

## 🤹‍ Usage

### Installation

```bash
npm i iguazu iguazu-holocron
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

## 📚 Further Reading

* [Iguazu](https://github.com/americanexpress/iguazu)

## 📜 Available Scripts

To test out any changes that you've made locally, run `npm pack` then install this within your application.

The scripts below are available to run and use:

**`npm run babel`**

This deletes the current JS files within the `lib` directory and compiles the ECMAScript 6 code within the `src` file to a version of ECMAScript that can run in current browsers using Babel afterwards it copies them to the lib folder.

**`npm run build`**

This runs `npm run babel`

**`npm run prepublish`**

This runs `npm run build`
