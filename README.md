# NodeStorage

CLogger is a lightweight, customizable color logger for Node.js. 

## Features

- Simple and intuitive API for data logging.
- Customizable colors and apperance.
- It is also possible to pass a top level logger (like Homebridge or Matter logger) and CLogger will use it 
instead of console.log()
- Includes also a fully customizable stringify funtions with colors.

## Getting Started

### Prerequisites

- Node.js installed on your machine.
- node-color-logger has no dependencies

### Installation

To get started with CLogger in your package

```bash
npm install node-color-logger
```

# Usage

## Initializing CLogger:

Create an instance of CLogger.

```
import { CLogger, LogLevel } from 'node-color-logger';
```

```
const log = new CLogger(hbLog: Logger | undefined, logName = 'NodeColorLogger', logDebug = true, logWithColors = true,
    logTimestampFormat = TimestampFormat.LOCAL_DATE_TIME, logCustomTimestampFormat = 'yyyy-MM-dd HH:mm:ss');
```

To import the stringify functions
```
import { stringify, payloadStringify, colorStringify, mqttStringify, debugStringify } from 'node-color-logger';
```

## Using the logger:

```
log.debug('Debug message...', ...parameters: any[]);
log.info('Info message...', ...parameters: any[]);
log.warn('Warning message', ...parameters: any[]);
log.error('Error message', ...parameters: any[]);
log(level: LogLevel, message: string, ...parameters: any[])
```

## Using the logger internal timer:
```
log.startTimer(message)
log.stopTimer(message)
```

## Using the stringify function:
```
stringify({...})
colorStringify({...})
```

# Screenshot

![Example Image](Screenshot.png)

# Contributing

Contributions to CLogger are welcome.

# License

This project is licensed under the MIT License - see the LICENSE file for details.