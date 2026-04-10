# Node ansi logger and stringify changelog

[![npm version](https://img.shields.io/npm/v/node-ansi-logger.svg)](https://www.npmjs.com/package/node-ansi-logger)
[![npm downloads](https://img.shields.io/npm/dt/node-ansi-logger.svg)](https://www.npmjs.com/package/node-ansi-logger)
![Node.js CI](https://github.com/Luligu/node-ansi-logger/actions/workflows/build.yml/badge.svg)
![CodeQL](https://github.com/Luligu/node-ansi-logger/actions/workflows/codeql.yml/badge.svg)
[![codecov](https://codecov.io/gh/Luligu/node-ansi-logger/branch/main/graph/badge.svg)](https://codecov.io/gh/Luligu/node-ansi-logger)
[![styled with prettier](https://img.shields.io/badge/styled_with-Prettier-f8bc45.svg?logo=prettier)](https://prettier.io/)
[![linted with eslint](https://img.shields.io/badge/linted_with-ES_Lint-4B32C3.svg?logo=eslint)](https://eslint.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![ESM](https://img.shields.io/badge/ESM-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

---

All notable changes to this project will be documented in this file.

If you like this project and find it useful, please consider giving it a star on [GitHub](https://github.com/Luligu/node-ansi-logger) and sponsoring it.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="120"></a>

## [3.2.1] - 2026-04-10

### Changed

- [package]: Update dependencies.
- [package]: Update actions versions in workflows.
- [package]: Bump package to `automator` v.3.1.5.
- [package]: Bump `typescript` to v.6.0.2.
- [package]: Bump `typescript-eslint` to v.8.58.1.
- [package]: Bump `eslint` to v.10.2.0.
- [package]: Bump `prettier` to v.3.8.2.
- [package]: Add `type checking` script for Jest tests.
- [package]: Add `CODE_OF_CONDUCT.md`.
- [package]: Add `@eslint/json`.
- [package]: Add `@eslint/markdown`.
- [package]: Add `CONTRIBUTING.md`.
- [package]: Add `STYLEGUIDE.md`.
- [package]: Replace `eslint-plugin-import` with `eslint-plugin-simple-import-sort`.
- [devcontainer]: Update `Dev Container` configuration.
- [devcontainer]: Add `postStartCommand` to the Dev Container configuration.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="80"></a>

## [3.2.0] - 2026-02-06

### Added

- [AnsiLoggerParams]: Added logNameColor, logTimeStampColor and maxFileSize.
- [stringify]: Added jsonStringify().
- [constructor]: Added support for environment variable NO_COLOR=1 (https://no-color.org) to set logWithColors.
- [constructor]: Added support for environment variable NODE_ANSI_LOGGER_TIMESTAMP_FORMAT to set logTimestampFormat.
- [constructor]: Added support for environment variable NODE_ANSI_LOGGER_TIMESTAMP_CUSTOM_FORMAT to set logCustomTimestampFormat.
- [constructor]: Added static create(params: AnsiLoggerParams).

### Changed

- [package]: Updated dependencies.
- [package]: Bump to Automator v. 3.0.5.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="80"></a>

<!-- Commented out section
## [1.0.0] - 2025-07-01

### Added

- [Feature 1]: Description of the feature.
- [Feature 2]: Description of the feature.

### Changed

- [Feature 3]: Description of the change.
- [Feature 4]: Description of the change.

### Deprecated

- [Feature 5]: Description of the deprecation.

### Removed

- [Feature 6]: Description of the removal.

### Fixed

- [Bug 1]: Description of the bug fix.
- [Bug 2]: Description of the bug fix.

### Security

- [Security 1]: Description of the security improvement.

<a href="https://www.buymeacoffee.com/luligugithub">
  <img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="80">
</a>

-->
