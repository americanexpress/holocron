# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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





## [1.2.3](https://github.com/americanexpress/holocron/compare/v1.2.2...v1.2.3) (2022-04-13)


### Bug Fixes

* **ModuleName:** use correct default for old bundler ([#123](https://github.com/americanexpress/holocron/issues/123)) ([f694c0e](https://github.com/americanexpress/holocron/commit/f694c0ec2f1c89d5491e9e4a2c1bcc5cb65ab8fc))





## [1.2.2](https://github.com/americanexpress/holocron/compare/v1.2.1...v1.2.2) (2022-04-11)


### Bug Fixes

* **labeler-workflow:** proper globing ([#119](https://github.com/americanexpress/holocron/issues/119)) ([6b71f71](https://github.com/americanexpress/holocron/commit/6b71f7165308e81e813bb5977e74ca118af1e421))
* **lazy-loading:** fixed webpack filename clashing issue ([#104](https://github.com/americanexpress/holocron/issues/104)) ([fa84f13](https://github.com/americanexpress/holocron/commit/fa84f133886a2ae5bf7f185505e86a059e9ab948))
* **release:** addressed PR comments ([45d0c12](https://github.com/americanexpress/holocron/commit/45d0c1231c9dc355560def8e1ba0f128d5c6edb0))





## [1.2.1](https://github.com/americanexpress/holocron/compare/v1.1.5...v1.2.1) (2022-02-10)


### Bug Fixes

* **updateModuleRegistry:** flatModuleMap contained problem modules ([#95](https://github.com/americanexpress/holocron/issues/95)) ([e7e29be](https://github.com/americanexpress/holocron/commit/e7e29be6549ecf42562d3c53f764fbfbf170befe))





# [1.2.0](https://github.com/americanexpress/holocron/compare/v1.1.5...v1.2.0) (2021-12-16)


### Bug Fixes

* **externals:** mismatched externals caused one-app to fail to start ([#90](https://github.com/americanexpress/holocron/issues/90)) ([fe49f8c](https://github.com/americanexpress/holocron/commit/fe49f8cf82d7e00dd9fac925cd61d23240d92469))





## [1.1.5](https://github.com/americanexpress/holocron/compare/v1.1.1...v1.1.5) (2021-12-02)


### Bug Fixes

* **commitlint:** validate commit message on ci ([347cb74](https://github.com/americanexpress/holocron/commit/347cb74a348ba59786b45f8c6e71630dbfd4fb7a))
* **deps:** move react to peerDeps ([#92](https://github.com/americanexpress/holocron/issues/92)) ([5128617](https://github.com/americanexpress/holocron/commit/5128617d881180d4544bd90a995b6b3ce33813a1))
* **holocron-module:** moduleLoadStatus 'loading' even with no load or loadModuleData ([7b7d2d8](https://github.com/americanexpress/holocron/commit/7b7d2d83516504085608f3385063a460c79d540d))
* **holocronModule:** remove check for initial-state ([#56](https://github.com/americanexpress/holocron/issues/56)) ([76c73b1](https://github.com/americanexpress/holocron/commit/76c73b175802ed199ee74ae8587b30c313fda592))
* **moduleRoute:** correctly catch route props errors ([#76](https://github.com/americanexpress/holocron/issues/76)) ([8497ef5](https://github.com/americanexpress/holocron/commit/8497ef55ac34325f29b59bd190e8a683f7ef316a))
* **moduleRoute:** return promises ([#68](https://github.com/americanexpress/holocron/issues/68)) ([cbaa54d](https://github.com/americanexpress/holocron/commit/cbaa54d5900a998f0a8ef3c1de531f1df04b7798))
* **yarn-lock:** add missing dep update ([#70](https://github.com/americanexpress/holocron/issues/70)) ([023399c](https://github.com/americanexpress/holocron/commit/023399c71e9643a15c9e7c7357f872b7fb527596))


### Reverts

* Revert "chore(release): 1.1.3" (#72) ([43e924c](https://github.com/americanexpress/holocron/commit/43e924c05f98d56215dd28fc401216f7abefa197)), closes [#72](https://github.com/americanexpress/holocron/issues/72)





## [1.1.4](https://github.com/americanexpress/holocron/compare/v1.1.1...v1.1.4) (2021-01-27)


### Bug Fixes

* **holocron-module:** moduleLoadStatus 'loading' even with no load or loadModuleData ([7b7d2d8](https://github.com/americanexpress/holocron/commit/7b7d2d83516504085608f3385063a460c79d540d))
* **holocronModule:** remove check for initial-state ([#56](https://github.com/americanexpress/holocron/issues/56)) ([76c73b1](https://github.com/americanexpress/holocron/commit/76c73b175802ed199ee74ae8587b30c313fda592))
* **moduleRoute:** correctly catch route props errors ([#76](https://github.com/americanexpress/holocron/issues/76)) ([8497ef5](https://github.com/americanexpress/holocron/commit/8497ef55ac34325f29b59bd190e8a683f7ef316a))
* **moduleRoute:** return promises ([#68](https://github.com/americanexpress/holocron/issues/68)) ([cbaa54d](https://github.com/americanexpress/holocron/commit/cbaa54d5900a998f0a8ef3c1de531f1df04b7798))
* **yarn-lock:** add missing dep update ([#70](https://github.com/americanexpress/holocron/issues/70)) ([023399c](https://github.com/americanexpress/holocron/commit/023399c71e9643a15c9e7c7357f872b7fb527596))


### Reverts

* Revert "chore(release): 1.1.3" (#72) ([43e924c](https://github.com/americanexpress/holocron/commit/43e924c05f98d56215dd28fc401216f7abefa197)), closes [#72](https://github.com/americanexpress/holocron/issues/72)





## [1.1.3](https://github.com/americanexpress/holocron/compare/v1.1.1...v1.1.3) (2021-01-21)


### Bug Fixes

* **holocron-module:** moduleLoadStatus 'loading' even with no load or loadModuleData ([7b7d2d8](https://github.com/americanexpress/holocron/commit/7b7d2d83516504085608f3385063a460c79d540d))
* **holocronModule:** remove check for initial-state ([#56](https://github.com/americanexpress/holocron/issues/56)) ([76c73b1](https://github.com/americanexpress/holocron/commit/76c73b175802ed199ee74ae8587b30c313fda592))
* **moduleRoute:** return promises ([#68](https://github.com/americanexpress/holocron/issues/68)) ([cbaa54d](https://github.com/americanexpress/holocron/commit/cbaa54d5900a998f0a8ef3c1de531f1df04b7798))
* **yarn-lock:** add missing dep update ([#70](https://github.com/americanexpress/holocron/issues/70)) ([023399c](https://github.com/americanexpress/holocron/commit/023399c71e9643a15c9e7c7357f872b7fb527596))


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
