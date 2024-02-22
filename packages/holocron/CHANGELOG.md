# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.10.2](https://github.com/americanexpress/holocron/compare/holocron@1.10.1...holocron@1.10.2) (2024-02-22)


### Bug Fixes

* **holocron:** revert redux react-redux peer deps ([#175](https://github.com/americanexpress/holocron/issues/175)) ([fca187c](https://github.com/americanexpress/holocron/commit/fca187cf7e0306699dc699b67357c751f6a12a5b))





## [1.10.1](https://github.com/americanexpress/holocron/compare/holocron@1.10.0...holocron@1.10.1) (2024-02-22)


### Bug Fixes

* **holocron:** redux-thunk peer dep breaking ([#174](https://github.com/americanexpress/holocron/issues/174)) ([ec22bf2](https://github.com/americanexpress/holocron/commit/ec22bf2d61313dd587605cf6fd93155111ca1f84))





# [1.10.0](https://github.com/americanexpress/holocron/compare/holocron@1.9.2...holocron@1.10.0) (2024-02-21)


### Features

* prepare for react 18 and redux 5 ([#172](https://github.com/americanexpress/holocron/issues/172)) ([19d0755](https://github.com/americanexpress/holocron/commit/19d075578e129e2c1affccc9c3da18e815c3f5fa))





## [1.9.2](https://github.com/americanexpress/holocron/compare/holocron@1.9.1...holocron@1.9.2) (2023-11-16)


### Bug Fixes

* **loadModule:** only register required fallbacks ([#165](https://github.com/americanexpress/holocron/issues/165)) ([5170769](https://github.com/americanexpress/holocron/commit/5170769bf3f3b3ae7e69e68ebb198c70cb2dd16c))





## [1.9.1](https://github.com/americanexpress/holocron/compare/holocron@1.9.0...holocron@1.9.1) (2023-11-08)


### Bug Fixes

* **externals:** use browser and node integrity values ([#162](https://github.com/americanexpress/holocron/issues/162)) ([5a836b9](https://github.com/americanexpress/holocron/commit/5a836b94123c22df090da96a91628eb8e91a0cdd))





# 1.9.0 (2023-10-25)



## 1.8.2 (2023-09-18)


### Bug Fixes

* **loadModule:** missing getTenantRootModule ([#152](https://github.com/americanexpress/holocron/issues/152)) ([55daa5d](https://github.com/americanexpress/holocron/commit/55daa5db67a6e3b7e4055fcb882fcae17be55efc))



## 1.8.1 (2023-08-24)


### Bug Fixes

* **externalRegistry:** prevent undefined entries ([#150](https://github.com/americanexpress/holocron/issues/150)) ([0676c06](https://github.com/americanexpress/holocron/commit/0676c06c656eb2eca35f10cf74ca072c3bd45a6f))
* **RenderModule:** check module loaded state before rendering ([#149](https://github.com/americanexpress/holocron/issues/149)) ([ac729f2](https://github.com/americanexpress/holocron/commit/ac729f2e836b5c0bea19c7733920149f7398cf96))



# 1.8.0 (2023-08-18)


### Features

* **compose:** add console error ([#148](https://github.com/americanexpress/holocron/issues/148)) ([d9977d7](https://github.com/americanexpress/holocron/commit/d9977d731e1c5829eb0253ac0ef33bb1e5424fbd))
* **externals-registry:** manage module external dependencies ([#143](https://github.com/americanexpress/holocron/issues/143)) ([f66aebf](https://github.com/americanexpress/holocron/commit/f66aebfe192d88cf10e3f2a0ea4ec6911a8b8a29))



# 1.7.0 (2023-03-27)


### Features

* **updateModuleRegistry:** allow rejected modules to be listed ([#140](https://github.com/americanexpress/holocron/issues/140)) ([fd2a468](https://github.com/americanexpress/holocron/commit/fd2a468bea8775796ac36f6ddd4d2fa61a1b140e))
* **updateModuleRegistry:** include reason for rejection ([#141](https://github.com/americanexpress/holocron/issues/141)) ([a2cd2f8](https://github.com/americanexpress/holocron/commit/a2cd2f83210c7fbc4a8e58ec4c506c5ef28cb531))



# 1.6.0 (2023-03-14)


### Features

* **holocronModule:** add mapStateToProps to holocron api ([#138](https://github.com/americanexpress/holocron/issues/138)) ([80194db](https://github.com/americanexpress/holocron/commit/80194dbd0e7b5380e5749de2fa4d256d8b281894))



# 1.5.0 (2023-03-07)


### Features

* **compose:** allow modules to abort composeModules ([#137](https://github.com/americanexpress/holocron/issues/137)) ([5cad922](https://github.com/americanexpress/holocron/commit/5cad922a1bdf3483c487610440f6ab5a7a3cb8d5))



# 1.4.0 (2023-02-15)


### Features

* **holocronModuleWrapper:** make moduleState opt out ([f247e7f](https://github.com/americanexpress/holocron/commit/f247e7fb06a65541c8de77e618f518b26e9e7d25))



# 1.3.0 (2022-06-07)


### Features

* **forceLoadModule:** expose loadModule function for browsers ([#124](https://github.com/americanexpress/holocron/issues/124)) ([2d0fee6](https://github.com/americanexpress/holocron/commit/2d0fee60633eca1a604f9f9dd11da2ca1d0d964d))



## 1.2.2 (2022-04-11)


### Bug Fixes

* **release:** addressed PR comments ([45d0c12](https://github.com/americanexpress/holocron/commit/45d0c1231c9dc355560def8e1ba0f128d5c6edb0))



## 1.2.1 (2022-02-11)


### Bug Fixes

* **updateModuleRegistry:** flatModuleMap contained problem modules ([#95](https://github.com/americanexpress/holocron/issues/95)) ([e7e29be](https://github.com/americanexpress/holocron/commit/e7e29be6549ecf42562d3c53f764fbfbf170befe))



# 1.2.0 (2021-12-16)


### Bug Fixes

* **externals:** mismatched externals caused one-app to fail to start ([#90](https://github.com/americanexpress/holocron/issues/90)) ([fe49f8c](https://github.com/americanexpress/holocron/commit/fe49f8cf82d7e00dd9fac925cd61d23240d92469))



## 1.1.5 (2021-12-02)


### Bug Fixes

* **deps:** move react to peerDeps ([#92](https://github.com/americanexpress/holocron/issues/92)) ([5128617](https://github.com/americanexpress/holocron/commit/5128617d881180d4544bd90a995b6b3ce33813a1))
* **holocron-module:** moduleLoadStatus 'loading' even with no load or loadModuleData ([7b7d2d8](https://github.com/americanexpress/holocron/commit/7b7d2d83516504085608f3385063a460c79d540d))
* **holocronModule:** remove check for initial-state ([#56](https://github.com/americanexpress/holocron/issues/56)) ([76c73b1](https://github.com/americanexpress/holocron/commit/76c73b175802ed199ee74ae8587b30c313fda592))


### Reverts

* Revert "chore(release): 1.1.3" (#72) ([43e924c](https://github.com/americanexpress/holocron/commit/43e924c05f98d56215dd28fc401216f7abefa197)), closes [#72](https://github.com/americanexpress/holocron/issues/72)



## 1.1.1 (2020-09-16)


### Bug Fixes

* **holocron:** ignore block list in development ([c21f5a4](https://github.com/americanexpress/holocron/commit/c21f5a4ce540255be01d002b0fddee94b4e06a14))
* **holocron:** initial state check ([af88adb](https://github.com/americanexpress/holocron/commit/af88adbc61251e1446a62e6cca212250a166e945))
* **holocron/load:** prevent rebuilding without reducer ([9fd4161](https://github.com/americanexpress/holocron/commit/9fd4161c26235171bbac910ee5aaeb82b9a62fa8))
* **vulnerability/lerna:** update to fix security vulnerability ([#3](https://github.com/americanexpress/holocron/issues/3)) ([570a0b8](https://github.com/americanexpress/holocron/commit/570a0b80885ac67b0a2a5e039913f7bd53f16afb))


### Features

* **holocron-config:** added holocron module config ([af45613](https://github.com/americanexpress/holocron/commit/af4561392d220f7dce25f6c5f577cae85a7ad3ed))
* **loadModule:** optional cache bust key ([#11](https://github.com/americanexpress/holocron/issues/11)) ([bf1bc27](https://github.com/americanexpress/holocron/commit/bf1bc277bf571497818505f09073528941b5f868))
* **loadModule:** rename "key" to "clientCacheRevision" ([#20](https://github.com/americanexpress/holocron/issues/20)) ([1880972](https://github.com/americanexpress/holocron/commit/188097210b9722df4fa02d2081cb004367d53387))



# 1.0.0 (2019-12-18)


### Features

* **all:** initial oss release ([e39a7b0](https://github.com/americanexpress/holocron/commit/e39a7b0035d1e79f51fd2cb449bdc2d431a86490))





## [1.8.2](https://github.com/americanexpress/holocron/compare/v1.8.1...v1.8.2) (2023-09-18)


### Bug Fixes

* **loadModule:** missing getTenantRootModule ([#152](https://github.com/americanexpress/holocron/issues/152)) ([55daa5d](https://github.com/americanexpress/holocron/commit/55daa5db67a6e3b7e4055fcb882fcae17be55efc))





## [1.8.1](https://github.com/americanexpress/holocron/compare/v1.8.0...v1.8.1) (2023-08-24)


### Bug Fixes

* **externalRegistry:** prevent undefined entries ([#150](https://github.com/americanexpress/holocron/issues/150)) ([0676c06](https://github.com/americanexpress/holocron/commit/0676c06c656eb2eca35f10cf74ca072c3bd45a6f))
* **RenderModule:** check module loaded state before rendering ([#149](https://github.com/americanexpress/holocron/issues/149)) ([ac729f2](https://github.com/americanexpress/holocron/commit/ac729f2e836b5c0bea19c7733920149f7398cf96))





# [1.8.0](https://github.com/americanexpress/holocron/compare/v1.7.0...v1.8.0) (2023-08-18)


### Features

* **compose:** add console error ([#148](https://github.com/americanexpress/holocron/issues/148)) ([d9977d7](https://github.com/americanexpress/holocron/commit/d9977d731e1c5829eb0253ac0ef33bb1e5424fbd))
* **externals-registry:** manage module external dependencies ([#143](https://github.com/americanexpress/holocron/issues/143)) ([f66aebf](https://github.com/americanexpress/holocron/commit/f66aebfe192d88cf10e3f2a0ea4ec6911a8b8a29))





# [1.7.0](https://github.com/americanexpress/holocron/compare/v1.6.0...v1.7.0) (2023-03-27)


### Features

* **updateModuleRegistry:** allow rejected modules to be listed ([#140](https://github.com/americanexpress/holocron/issues/140)) ([fd2a468](https://github.com/americanexpress/holocron/commit/fd2a468bea8775796ac36f6ddd4d2fa61a1b140e))
* **updateModuleRegistry:** include reason for rejection ([#141](https://github.com/americanexpress/holocron/issues/141)) ([a2cd2f8](https://github.com/americanexpress/holocron/commit/a2cd2f83210c7fbc4a8e58ec4c506c5ef28cb531))





# [1.6.0](https://github.com/americanexpress/holocron/compare/v1.5.0...v1.6.0) (2023-03-14)


### Features

* **holocronModule:** add mapStateToProps to holocron api ([#138](https://github.com/americanexpress/holocron/issues/138)) ([80194db](https://github.com/americanexpress/holocron/commit/80194dbd0e7b5380e5749de2fa4d256d8b281894))





# [1.5.0](https://github.com/americanexpress/holocron/compare/v1.4.0...v1.5.0) (2023-03-07)


### Features

* **compose:** allow modules to abort composeModules ([#137](https://github.com/americanexpress/holocron/issues/137)) ([5cad922](https://github.com/americanexpress/holocron/commit/5cad922a1bdf3483c487610440f6ab5a7a3cb8d5))





# [1.4.0](https://github.com/americanexpress/holocron/compare/v1.3.0...v1.4.0) (2023-02-15)


### Features

* **holocronModuleWrapper:** make moduleState opt out ([f247e7f](https://github.com/americanexpress/holocron/commit/f247e7fb06a65541c8de77e618f518b26e9e7d25))





# [1.3.0](https://github.com/americanexpress/holocron/compare/v1.2.3...v1.3.0) (2022-06-07)


### Features

* **forceLoadModule:** expose loadModule function for browsers ([#124](https://github.com/americanexpress/holocron/issues/124)) ([2d0fee6](https://github.com/americanexpress/holocron/commit/2d0fee60633eca1a604f9f9dd11da2ca1d0d964d))





## [1.2.2](https://github.com/americanexpress/holocron/compare/v1.2.1...v1.2.2) (2022-04-11)


### Bug Fixes

* **release:** addressed PR comments ([45d0c12](https://github.com/americanexpress/holocron/commit/45d0c1231c9dc355560def8e1ba0f128d5c6edb0))





## [1.2.1](https://github.com/americanexpress/holocron/compare/v1.1.5...v1.2.1) (2022-02-10)


### Bug Fixes

* **updateModuleRegistry:** flatModuleMap contained problem modules ([#95](https://github.com/americanexpress/holocron/issues/95)) ([e7e29be](https://github.com/americanexpress/holocron/commit/e7e29be6549ecf42562d3c53f764fbfbf170befe))





# [1.2.0](https://github.com/americanexpress/holocron/compare/v1.1.5...v1.2.0) (2021-12-16)


### Bug Fixes

* **externals:** mismatched externals caused one-app to fail to start ([#90](https://github.com/americanexpress/holocron/issues/90)) ([fe49f8c](https://github.com/americanexpress/holocron/commit/fe49f8cf82d7e00dd9fac925cd61d23240d92469))





## [1.1.5](https://github.com/americanexpress/holocron/compare/v1.1.1...v1.1.5) (2021-12-02)


### Bug Fixes

* **deps:** move react to peerDeps ([#92](https://github.com/americanexpress/holocron/issues/92)) ([5128617](https://github.com/americanexpress/holocron/commit/5128617d881180d4544bd90a995b6b3ce33813a1))
* **holocron-module:** moduleLoadStatus 'loading' even with no load or loadModuleData ([7b7d2d8](https://github.com/americanexpress/holocron/commit/7b7d2d83516504085608f3385063a460c79d540d))
* **holocronModule:** remove check for initial-state ([#56](https://github.com/americanexpress/holocron/issues/56)) ([76c73b1](https://github.com/americanexpress/holocron/commit/76c73b175802ed199ee74ae8587b30c313fda592))


### Reverts

* Revert "chore(release): 1.1.3" (#72) ([43e924c](https://github.com/americanexpress/holocron/commit/43e924c05f98d56215dd28fc401216f7abefa197)), closes [#72](https://github.com/americanexpress/holocron/issues/72)





## [1.1.4](https://github.com/americanexpress/holocron/compare/v1.1.1...v1.1.4) (2021-01-27)


### Bug Fixes

* **holocron-module:** moduleLoadStatus 'loading' even with no load or loadModuleData ([7b7d2d8](https://github.com/americanexpress/holocron/commit/7b7d2d83516504085608f3385063a460c79d540d))
* **holocronModule:** remove check for initial-state ([#56](https://github.com/americanexpress/holocron/issues/56)) ([76c73b1](https://github.com/americanexpress/holocron/commit/76c73b175802ed199ee74ae8587b30c313fda592))


### Reverts

* Revert "chore(release): 1.1.3" (#72) ([43e924c](https://github.com/americanexpress/holocron/commit/43e924c05f98d56215dd28fc401216f7abefa197)), closes [#72](https://github.com/americanexpress/holocron/issues/72)





## [1.1.3](https://github.com/americanexpress/holocron/compare/v1.1.1...v1.1.3) (2021-01-21)


### Bug Fixes

* **holocron-module:** moduleLoadStatus 'loading' even with no load or loadModuleData ([7b7d2d8](https://github.com/americanexpress/holocron/commit/7b7d2d83516504085608f3385063a460c79d540d))
* **holocronModule:** remove check for initial-state ([#56](https://github.com/americanexpress/holocron/issues/56)) ([76c73b1](https://github.com/americanexpress/holocron/commit/76c73b175802ed199ee74ae8587b30c313fda592))


### Reverts

* Revert "chore(release): 1.1.3" (#72) ([43e924c](https://github.com/americanexpress/holocron/commit/43e924c05f98d56215dd28fc401216f7abefa197)), closes [#72](https://github.com/americanexpress/holocron/issues/72)





## [1.1.2](https://github.com/americanexpress/holocron/compare/v1.1.1...v1.1.2) (2020-10-01)


### Bug Fixes

* **holocronModule:** remove check for initial-state ([#56](https://github.com/americanexpress/holocron/issues/56)) ([76c73b1](https://github.com/americanexpress/holocron/commit/76c73b175802ed199ee74ae8587b30c313fda592))





# [1.1.1](https://github.com/americanexpress/holocron/compare/v1.1.0...v1.1.1) (2020-09-15)


### Bug Fixes

* **holocron:** ignore block list in development ([c21f5a4](https://github.com/americanexpress/holocron/commit/c21f5a4ce540255be01d002b0fddee94b4e06a14))
* **holocron:** initial state check ([af88adb](https://github.com/americanexpress/holocron/commit/af88adbc61251e1446a62e6cca212250a166e945))
* **holocron/load:** prevent rebuilding without reducer ([9fd4161](https://github.com/americanexpress/holocron/commit/9fd4161c26235171bbac910ee5aaeb82b9a62fa8))


# [1.1.0](https://github.com/americanexpress/holocron/compare/v1.0.0...v1.1.0) (2020-03-27)


### Bug Fixes

* **vulnerability/lerna:** update to fix security vulnerability ([#3](https://github.com/americanexpress/holocron/issues/3)) ([570a0b8](https://github.com/americanexpress/holocron/commit/570a0b80885ac67b0a2a5e039913f7bd53f16afb))


### Features

* **holocron-config:** added holocron module config ([af45613](https://github.com/americanexpress/holocron/commit/af4561392d220f7dce25f6c5f577cae85a7ad3ed))
* **loadModule:** optional cache bust key ([#11](https://github.com/americanexpress/holocron/issues/11)) ([bf1bc27](https://github.com/americanexpress/holocron/commit/bf1bc277bf571497818505f09073528941b5f868))
* **loadModule:** rename "key" to "clientCacheRevision" ([#20](https://github.com/americanexpress/holocron/issues/20)) ([1880972](https://github.com/americanexpress/holocron/commit/188097210b9722df4fa02d2081cb004367d53387))
