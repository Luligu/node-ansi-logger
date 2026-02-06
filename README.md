# Node ansi logger and stringify

[![npm version](https://img.shields.io/npm/v/node-ansi-logger.svg)](https://www.npmjs.com/package/node-ansi-logger)
[![npm downloads](https://img.shields.io/npm/dt/node-ansi-logger.svg)](https://www.npmjs.com/package/node-ansi-logger)
![Node.js CI](https://github.com/Luligu/node-ansi-logger/actions/workflows/build.yml/badge.svg)
![CodeQL](https://github.com/Luligu/node-ansi-logger/actions/workflows/codeql.yml/badge.svg)
[![codecov](https://codecov.io/gh/Luligu/node-ansi-logger/branch/main/graph/badge.svg)](https://codecov.io/gh/Luligu/node-ansi-logger)
[![styled with prettier](https://img.shields.io/badge/styled_with-Prettier-f8bc45.svg?logo=prettier)](https://github.com/prettier/prettier)
[![linted with eslint](https://img.shields.io/badge/linted_with-ES_Lint-4B32C3.svg?logo=eslint)](https://github.com/eslint/eslint)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![ESM](https://img.shields.io/badge/ESM-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/api/esm.html)

---

AnsiLogger is a lightweight, customizable color logger for Node.js.

If you like this project and find it useful, please consider giving it a star on [GitHub](https://github.com/Luligu/node-ansi-logger) and sponsoring it.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="120"></a>

## Features

- Simple and intuitive API for data logging.
- No dependencies.
- Customizable colors and apperance.
- Supports environment variable NO_COLOR=1 (https://no-color.org/).
- It is also possible to pass a top level logger (like Homebridge or Matter logger) and AnsiLogger will use it
  for output instead of console.
- Includes also a fully customizable stringify funtion with colors (it is bigint aware and manage circular reference).

## Getting Started

### Prerequisites

- Node.js 20-22-24 installed on your machine.

### Installation

To get started with AnsiLogger in your package

```bash
npm install node-ansi-logger
```

# Usage

## Initializing AnsiLogger:

Create an instance of AnsiLogger.

```
import { AnsiLogger, AnsiLoggerParams, LogLevel } from 'node-ansi-logger';
```

```
const log = new AnsiLogger({logName: '<your name>'}); // Eventually other params in AnsiLoggerParams
```

To import the stringify functions

```
import { stringify, payloadStringify, colorStringify, mqttStringify, debugStringify } from 'node-ansi-logger';
```

## Using the logger:

```
log.debug('Debug message...', ...parameters);
log.info('Info message...', ...parameters);
log.notice('Notice message...', ...parameters);
log.warn('Warning message', ...parameters);
log.error('Error message', ...parameters);
log.fatal('Fatal message', ...parameters);
log(LogLevel.WARN, 'Warning message', ...parameters)
```

## Using the logger with colors inside the message:

```
log.debug(`Debug message ${YELLOW}with yellow part${db}`, ...);
```

## Using the logger internal timer:

```
log.startTimer('Time sensitive code started')
log.stopTimer('Time sensitive code finished')
```

## Using the stringify function:

```
stringify({...})
colorStringify({...})
```

# Screenshot

![Example Image](https://github.com/Luligu/node-ansi-logger/blob/main/screenshots/Screenshot.png)

# Contributing

Contributions to AnsiLogger are welcome.

# License

This project is licensed under the MIT License - see the LICENSE file for details.
