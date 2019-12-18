# module-register-webpack-plugin

>This plugin adds the module to the registry once its loaded on the page.
>It wraps the contents of a module in an [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE) which registers the module.

## 📖 Table of Contents

* [Usage](#-usage)

## 🤹‍ Usage

### Installation

```bash
npm i holocron-module-register-webpack-plugin
```

### Configurations

Add the plugin to your webpack config

``` javascript

const HolocronModuleRegisterPlugin = require('holocron-module-register-webpack-plugin');
```

Pass the name of the module to the plugin as a parameter within your webpack configuration.

```javascript
const HolocronModuleRegisterPlugin = require('holocron-module-register-webpack-plugin');
const pkg = require('./package.json');

const { name } = pkg;

const webpackOptions = {
  entry: path.join(fixturesPath, 'SomeModule.js'),
  output: {
    path: buildPath,
  },
  plugins: [new HolocronModuleRegisterPlugin('some-module')],
};
```
