<h1 align="center">

  [One App is now InnerSource](https://github.com/americanexpress/one-app/issues/1393)

  <hr/>
  
  <img src='https://github.com/americanexpress/holocron/raw/main/holocron.png' alt="Holocron - One Amex" width='50%'/>
</h1>

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

> Holocron contains a set of packages that are used to compose and load React components, enabling the updating and launching of server side rendered user experiences without server restarts.
> This repository is a monorepo managed using **[Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/)** & **[Lerna](https://github.com/lerna/lerna)**.

## 📖 Table of Contents

* [Packages](#-packages)
* [Contributing](#-contributing)

## 📦 Packages

This codebase has the following packages:

| Name                                                                                                      | Description                                                     |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **[holocron](./packages/holocron)**  | This is used for composing and loading your application modules.
| **[holocron-module-register-webpack-plugin](./packages/holocron-module-register-webpack-plugin)**             | This plugin adds the module to registry once its loaded on the page. |
| **[holocron-module-route](./packages/holocron-module-route)**     | This uses **[@americanexpress/one-app-router](https://github.com/americanexpress/one-app-router)** which is a fork of **`react-router@3`**. It extends its `Route` component which uses **`holocron`**'s `loadModule` to dynamically load modules for specified routes. |

## 🏆 Contributing

We welcome Your interest in the American Express Open Source Community on Github.
Any Contributor to any Open Source Project managed by the American Express Open
Source Community must accept and sign an Agreement indicating agreement to the
terms below. Except for the rights granted in this Agreement to American Express
and to recipients of software distributed by American Express, You reserve all
right, title, and interest, if any, in and to Your Contributions. Please [fill
out the Agreement](https://cla-assistant.io/americanexpress/holocron).

Please feel free to open pull requests and see [CONTRIBUTING.md](./CONTRIBUTING.md) for commit formatting details.

## 🗝️ License

Any contributions made under this project will be governed by the [Apache License
2.0](./LICENSE.txt).

## 🗣️ Code of Conduct

This project adheres to the [American Express Community Guidelines](./CODE_OF_CONDUCT.md).
By participating, you are expected to honor these guidelines.
