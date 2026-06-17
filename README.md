<!-- eslint-disable markdown/no-multiple-h1 -->

# Node ansi logger and stringify

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
- Includes a chainable ANSI tagged template API (`ansi`) for styling terminal strings directly.

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

```typescript
import { AnsiLogger, AnsiLoggerParams, LogLevel } from 'node-ansi-logger';
```

```typescript
const log = new AnsiLogger({ logName: '<your name>' }); // Eventually other params in AnsiLoggerParams
```

To import the stringify functions

```typescript
import { stringify, payloadStringify, colorStringify, mqttStringify, debugStringify } from 'node-ansi-logger';
```

## Using the logger:

```typescript
log.debug('Debug message...', ...parameters);
log.info('Info message...', ...parameters);
log.notice('Notice message...', ...parameters);
log.warn('Warning message', ...parameters);
log.error('Error message', ...parameters);
log.fatal('Fatal message', ...parameters);
log(LogLevel.WARN, 'Warning message', ...parameters);
```

## Using the logger with colors inside the message:

```typescript
log.debug(`Debug message ${YELLOW}with yellow part${db}`, ...);
```

## Using the logger internal timer:

```typescript
log.startTimer('Time sensitive code started');
log.stopTimer('Time sensitive code finished');
```

## Using the stringify function:

```typescript
stringify({...})
colorStringify({...})
```

## Using the ansi tagged template API:

Import the `ansi` root tag or individual named styles:

```typescript
import { bold, red, green, cyan, bgBlue, warn, error, fatal, hex, rgb, bgHex, bgRgb } from 'node-ansi-logger';
```

Apply a single style:

```typescript
console.log(red`Something went wrong`);
console.log(bold`Important message`);
```

Chain multiple styles:

```typescript
console.log(bold.red`Critical error`);
console.log(bgBlue.green`Green on blue`);
console.log(bold.italic.underline`Decorated text`);
```

Use dynamic RGB or hex colors:

```typescript
console.log(rgb(255, 128, 0)`Orange text`);
console.log(hex('#ff75d1').bold`Pink bold`);
console.log(bgRgb(30, 30, 30).cyan`Cyan on dark background`);
console.log(bgHex('#1a1a2e').white`White on dark blue`);
```

Nest styles — outer styles are automatically restored after inner resets:

```typescript
console.log(green`Connected ${bold.red`FAILED`} retrying...`);
console.log(warn`Server ${error.bold`crashed`} restarting`);
```

Use the 24-step grayscale ramp (`gray0` = darkest, `gray23` = lightest):

```typescript
import { gray0, gray8, gray13, gray20, gray23 } from 'node-ansi-logger';

console.log(gray0`Nearly black`);
console.log(gray8`Dark gray`);
console.log(gray13`Mid gray`);
console.log(gray20`Light gray`);
console.log(gray23`Nearly white`);
```

Log-level color exports:

```typescript
import { success, debug, info, notice, warn, error, fatal } from 'node-ansi-logger';

console.log(success`Operation completed`);
console.log(debug`Debug details`);
console.log(fatal`Unrecoverable error`);
```

Mix ansi styles inside AnsiLogger calls:

```typescript
import { AnsiLogger } from 'node-ansi-logger';
import { bold, red, green, cyan, yellow } from 'node-ansi-logger';

const log = new AnsiLogger({ logName: 'MyApp' });

log.info(`Device ${bold.cyan`Kitchen Light`} connected`);
log.warn(`Retry ${yellow`${3}`} of ${yellow`5`} — response timeout`);
log.error(`Failed to reach ${bold`192.168.1.10`}: ${red`connection refused`}`);
log.debug(`State changed: ${green`on`} → ${red`off`}`);
```

# Screenshot

![Example Image](https://github.com/Luligu/node-ansi-logger/blob/main/screenshots/Screenshot.png)

# Contributing

Contributions to AnsiLogger are welcome.

# License

This project is licensed under the MIT License - see the LICENSE file for details.
