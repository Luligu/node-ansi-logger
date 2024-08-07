/* eslint-disable no-console */
/**
 * This file contains the AnsiLogger .
 *
 * @file logger.ts
 * @author Luca Liguori
 * @date 2023-06-01
 * @version 2.0.0
 *
 * Copyright 2023, 2024, 2025 Luca Liguori.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { colorStringify, debugStringify, historyStringify, mqttStringify, payloadStringify } from './stringify.js';

// ANSI color codes and styles are defined here for use in the logger
export const RESET = '\x1b[40;0m';
export const BRIGHT = '\x1b[1m';
export const DIM = '\x1b[2m';
export const NORMAL = '\x1b[22m';
export const UNDERLINE = '\x1b[4m';
export const UNDERLINEOFF = '\x1b[24m';
export const BLINK = '\x1b[5m';
export const BLINKOFF = '\x1b[25m';
export const REVERSE = '\x1b[7m';
export const REVERSEOFF = '\x1b[27m';
export const HIDDEN = '\x1b[8m';
export const HIDDENOFF = '\x1b[28m';
export const CURSORSAVE = '\x1b[s';
export const CURSORRESTORE = '\x1b[u';

export const BLACK = '\x1b[30m';
export const RED = '\x1b[31m';
export const GREEN = '\x1b[32m';
export const YELLOW = '\x1b[33m';
export const BLUE = '\x1b[34m';
export const MAGENTA = '\x1b[35m';
export const CYAN = '\x1b[36m';
export const LIGHT_GREY = '\x1b[37m';
export const GREY = '\x1b[90m';
export const WHITE = '\x1b[97m';

// ANSI color codes short form to use in the logger
export const db = '\x1b[38;5;245m'; // Debug 247
export const nf = '\x1b[38;5;252m'; // Info 255
export const nt = '\x1b[38;5;2m'; // Notice
export const wr = '\x1b[38;5;220m'; // Warn 220
export const er = '\x1b[38;5;1m'; // Error
export const ft = '\x1b[38;5;9m'; // Fatal
export const rs = '\x1b[40;0m'; // Reset colors to default foreground and background
export const rk = '\x1b[K'; // Erase from cursor

// Used internally by plugins
export const dn = '\x1b[38;5;33m'; // Display name device
export const gn = '\x1b[38;5;35m'; // Display name group
export const idn = '\x1b[48;5;21m\x1b[38;5;255m'; // Inverted display name device
export const ign = '\x1b[48;5;22m\x1b[38;5;255m'; // Inverted display name group
export const zb = '\x1b[38;5;207m'; // Zigbee
export const hk = '\x1b[38;5;79m'; // Homekit
export const pl = '\x1b[32m'; // payload
export const id = '\x1b[37;44m'; // id or ieee_address or UUID
export const or = '\x1b[38;5;208m'; // history

/**
 * LogLevel enumeration to specify the logging level.
 */
export const enum LogLevel {
  NONE = '',
  DEBUG = 'debug',
  INFO = 'info',
  NOTICE = 'notice',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * Logger interface for custom loggers that can be passed to AnsiLogger for output instead of console output.
 */
export interface Logger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug: (...data: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: (...data: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notice: (...data: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn: (...data: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (...data: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fatal: (...data: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log: (level: LogLevel, message: string, ...parameters: any[]) => void;
}

/**
 * TimestampFormat enumeration to specify the format of timestamps in log messages.
 */
export const enum TimestampFormat {
  ISO,
  LOCAL_DATE,
  LOCAL_TIME,
  LOCAL_DATE_TIME,
  TIME_MILLIS,
  HOMEBRIDGE,
  CUSTOM,
}

/**
 * Parameters for configuring an AnsiLogger instance.
 */
export interface AnsiLoggerParams {
  hbLog?: Logger;
  logName?: string;
  logDebug?: boolean; // Deprecated
  logLevel?: LogLevel;
  logWithColors?: boolean;
  logTimestampFormat?: TimestampFormat;
  logCustomTimestampFormat?: string;
}

export type AnsiLoggerCallback = (level: string, time: string, name: string, message: string) => void;

// Initialize the global variable
if (typeof globalThis.__AnsiLoggerCallback__ === 'undefined') globalThis.__AnsiLoggerCallback__ = undefined;

/**
 * AnsiLogger provides a customizable logging utility with ANSI color support.
 * It allows for various configurations such as enabling debug logs, customizing log name, and more.
 */
export class AnsiLogger {
  private _hbLog: Logger | undefined;
  private _logName: string;
  private _logLevel: LogLevel;
  private _logWithColors: boolean;
  private _logTimestampFormat: TimestampFormat;
  private _logCustomTimestampFormat: string;

  private logStartTime: number;
  private callback: AnsiLoggerCallback | undefined = undefined;

  /**
   * Constructs a new AnsiLogger instance with optional configuration parameters.
   * @param {AnsiLoggerParams} optionalParams - Configuration options for the logger.
   */
  constructor(params: AnsiLoggerParams) {
    this._hbLog = params.hbLog;
    this._logName = params.logName ?? 'NodeAnsiLogger';
    this._logLevel = params.logLevel ?? (params.logDebug === true ? LogLevel.DEBUG : LogLevel.INFO);
    this._logWithColors = params.logWithColors ?? true;
    this._logTimestampFormat = params.logTimestampFormat ?? TimestampFormat.LOCAL_DATE_TIME;
    this._logCustomTimestampFormat = params.logCustomTimestampFormat ?? 'yyyy-MM-dd HH:mm:ss';

    this.logStartTime = 0;
  }

  /**
   * Gets the name of the logger.
   * @returns {string} The logger name.
   */
  get logName(): string {
    return this._logName;
  }

  /**
   * Sets the log name for the logger.
   * @param {string} name - The logger name to set.
   */
  set logName(name: string) {
    this._logName = name;
  }

  /**
   * Sets the name of the logger.
   * @param {string} name - The new name for the logger.
   * @deprecated Use logName getter and setter instead.
   */
  public setLogName(name: string): void {
    this.logName = name;
  }

  /**
   * Enables or disables debug logging.
   * @param {boolean} logDebug - Flag to enable or disable debug logging.
   * @deprecated Use logLevel getter and setter instead.
   */
  public setLogDebug(logDebug: boolean): void {
    if (logDebug) this.logLevel = LogLevel.DEBUG;
    else this.logLevel = LogLevel.INFO;
  }

  /**
   * Gets the log level of the logger.
   * @returns {LogLevel} The log level.
   */
  get logLevel(): LogLevel {
    return this._logLevel;
  }

  /**
   * Sets the log level for the logger.
   * @param {LogLevel} logLevel - The log level to set.
   */
  set logLevel(logLevel: LogLevel) {
    this._logLevel = logLevel;
  }

  /**
   * Gets the logWithColors flag of the logger.
   * @returns {boolean} The logWithColors parameter.
   */
  get logWithColors(): boolean {
    return this._logWithColors;
  }

  /**
   * Sets the logWithColors flag of the logger.
   * @param {boolean} logWithColors - The logWithColors parameter to set.
   */
  set logWithColors(logWithColors: boolean) {
    this._logWithColors = logWithColors;
  }

  /**
   * Enables or disables logging with ANSI colors.
   * @param {boolean} logWithColors - Flag to enable or disable ANSI color logging.
   * @deprecated Use logWithColors getter and setter instead.
   */
  public setlogWithColors(logWithColors: boolean): void {
    this._logWithColors = logWithColors;
  }

  /**
   * Sets the timestamp format for log messages.
   * @param {TimestampFormat} format - The timestamp format to use.
   */
  public setLogTimestampFormat(format: TimestampFormat): void {
    this._logTimestampFormat = format;
  }

  /**
   * Sets a custom timestamp format for log messages.
   * @param {string} format - The custom timestamp format string.
   */
  public setLogCustomTimestampFormat(format: string): void {
    this._logCustomTimestampFormat = format;
  }

  /**
   * Starts a timer with an optional message.
   * @param {string} message - The message to log when starting the timer.
   */
  public startTimer(message: string): void {
    this.logStartTime = Date.now();
    this.info(`Timer started ${message}`);
  }

  /**
   * Stops the timer started by startTimer and logs the elapsed time.
   * @param {string} message - The message to log along with the elapsed time.
   */
  public stopTimer(message: string): void {
    if (this.logStartTime !== 0) {
      const timePassed = Date.now() - this.logStartTime;
      this.info(`Timer stoppped at ${timePassed} ms ${message}`);
    }
    this.logStartTime = 0;
  }

  /**
   * Sets the callback function to be used by the logger.
   * @param {AnsiLoggerCallback} callback - The callback function that takes three parameters: type, subtype, and message, or undefined if no callback is set.
   */
  public setCallback(callback: AnsiLoggerCallback | undefined): void {
    this.callback = callback;
  }

  /**
   * Gets the callback function currently used by the logger.
   * @returns {AnsiLoggerCallback | undefined} The callback function that takes three parameters: type, subtype, and message, or undefined if no callback is set.
   */
  public getCallback(): AnsiLoggerCallback | undefined {
    return this.callback;
  }

  /**
   * Sets the global callback function to be used by the logger.
   * @param {AnsiLoggerCallback} callback - The callback function that takes three parameters: type, subtype, and message, or undefined if no callback is set.
   */
  public setGlobalCallback(callback: AnsiLoggerCallback | undefined): void {
    __AnsiLoggerCallback__ = callback;
  }

  /**
   * Gets the global callback function currently used by the logger.
   * @returns {AnsiLoggerCallback | undefined} The callback function that takes three parameters: type, subtype, and message, or undefined if no callback is set.
   */
  public getGlobalCallback(): AnsiLoggerCallback | undefined {
    if (__AnsiLoggerCallback__) {
      return __AnsiLoggerCallback__;
    } else {
      return undefined;
    }
  }

  /**
   * Formats a Date object into a custom string format.
   * @param {Date} date - The Date object to format.
   * @param {string} formatString - The string format to use.
   * @returns {string} The formatted date.
   * It only handles years, months, days, hours, minutes, and seconds
   * with this format 'yyyy-MM-dd HH:mm:ss'
   */
  private formatCustomTimestamp(date: Date, formatString: string): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // Replace format tokens with actual values. Add more as needed.
    return formatString
      .replace('yyyy', year.toString())
      .replace('MM', month.toString().padStart(2, '0'))
      .replace('dd', day.toString().padStart(2, '0'))
      .replace('HH', hours.toString().padStart(2, '0'))
      .replace('mm', minutes.toString().padStart(2, '0'))
      .replace('ss', seconds.toString().padStart(2, '0'));
  }

  /**
   * Returns the current timestamp as a string.
   *
   * @returns {string} The current timestamp.
   */
  public now(): string {
    return this.getTimestamp();
  }

  /**
   * Returns the timestamp based on the configured format.
   * If the log start time is set, it returns the time passed since the start time.
   * Otherwise, it returns the current timestamp based on the configured format.
   * @returns {string} The timestamp string.
   */
  private getTimestamp(): string {
    if (this.logStartTime !== 0) {
      const timePassed = Date.now() - this.logStartTime;
      return `Timer:    ${timePassed.toString().padStart(7, ' ')} ms`;
    } else {
      let timestamp: string;
      switch (this._logTimestampFormat) {
        case TimestampFormat.LOCAL_DATE:
          timestamp = new Date().toLocaleDateString();
          break;
        case TimestampFormat.LOCAL_TIME:
          timestamp = new Date().toLocaleTimeString();
          break;
        case TimestampFormat.HOMEBRIDGE:
        case TimestampFormat.LOCAL_DATE_TIME:
          timestamp = new Date().toLocaleString();
          break;
        case TimestampFormat.ISO:
          timestamp = new Date().toISOString();
          break;
        case TimestampFormat.TIME_MILLIS:
          timestamp = `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}:${new Date().getSeconds().toString().padStart(2, '0')}.${new Date().getMilliseconds().toString().padStart(3, '0')}`;
          break;
        case TimestampFormat.CUSTOM:
          timestamp = this.formatCustomTimestamp(new Date(), this._logCustomTimestampFormat);
          break;
      }
      return timestamp;
    }
  }

  /**
   * Logs a message with a specific level (e.g. debug, info, notice, warn, error, fatal) and additional parameters.
   * This method formats the log message with ANSI colors based on the log level and other logger settings.
   * It supports dynamic parameters for more detailed and formatted logging.
   *
   * @param {LogLevel} level - The severity level of the log message.
   * @param {string} message - The primary log message to be displayed.
   * @param {...any[]} parameters - Additional parameters to be logged. Supports any number of parameters.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public log(level: LogLevel, message: string, ...parameters: any[]): void {
    const ts = '\x1b[38;5;245m'; // TimeStamp  White medium
    const ln = '\x1b[38;5;31m'; // LogName    Cyan

    const s1ln = '\x1b[38;5;0;48;5;31m'; // Highlight  LogName Black on Cyan
    const s2ln = '\x1b[38;5;0;48;5;255m'; // Highlight  LogName Black on White
    const s3ln = '\x1b[38;5;0;48;5;220m'; // Highlight  LogName Black on Yellow
    const s4ln = '\x1b[38;5;0;48;5;9m'; // Highlight  LogName Black on Red

    try {
      if (this.callback !== undefined) {
        // Convert parameters to string and append to message
        const parametersString = parameters.length > 0 ? ' ' + parameters.join(' ') : '';
        message += parametersString;
        this.callback(level, this.getTimestamp(), this._logName, message);
      } else if (__AnsiLoggerCallback__ && __AnsiLoggerCallback__ !== undefined) {
        // Convert parameters to string and append to message
        const parametersString = parameters.length > 0 ? ' ' + parameters.join(' ') : '';
        message += parametersString;
        __AnsiLoggerCallback__(level, this.getTimestamp(), this._logName, message);
      }
    } catch (error) {
      console.error('Error executing callback:', error);
    }

    if (this._hbLog !== undefined) {
      if (level !== LogLevel.NONE) {
        this._hbLog.log(level, message, ...parameters);
      }
    } else {
      if (this._logWithColors) {
        let logNameColor = ln;
        if (typeof message !== 'string' || message.startsWith === undefined) {
          logNameColor = ln;
        } else if (message.startsWith('****')) {
          logNameColor = s4ln;
          message = message.slice(4);
        } else if (message.startsWith('***')) {
          logNameColor = s3ln;
          message = message.slice(3);
        } else if (message.startsWith('**')) {
          logNameColor = s2ln;
          message = message.slice(2);
        } else if (message.startsWith('*')) {
          logNameColor = s1ln;
          message = message.slice(1);
        }
        switch (level) {
          case LogLevel.DEBUG:
            if (this._logLevel === LogLevel.DEBUG) {
              console.log(`${rs}${ts}[${this.getTimestamp()}] ${logNameColor}[${this._logName}]${rs}${db}`, message, ...parameters, rs + rk);
            }
            break;
          case LogLevel.INFO:
            if (this._logLevel === LogLevel.DEBUG || this._logLevel === LogLevel.INFO) {
              console.log(`${rs}${ts}[${this.getTimestamp()}] ${logNameColor}[${this._logName}]${rs}${nf}`, message, ...parameters, rs + rk);
            }
            break;
          case LogLevel.NOTICE:
            if (this._logLevel === LogLevel.DEBUG || this._logLevel === LogLevel.INFO || this._logLevel === LogLevel.NOTICE) {
              console.log(`${rs}${ts}[${this.getTimestamp()}] ${logNameColor}[${this._logName}]${rs}${nt}`, message, ...parameters, rs + rk);
            }
            break;
          case LogLevel.WARN:
            if (this._logLevel === LogLevel.DEBUG || this._logLevel === LogLevel.INFO || this._logLevel === LogLevel.NOTICE || this._logLevel === LogLevel.WARN) {
              console.log(`${rs}${ts}[${this.getTimestamp()}] ${logNameColor}[${this._logName}]${rs}${wr}`, message, ...parameters, rs + rk);
            }
            break;
          case LogLevel.ERROR:
            if (
              this._logLevel === LogLevel.DEBUG ||
              this._logLevel === LogLevel.INFO ||
              this._logLevel === LogLevel.NOTICE ||
              this._logLevel === LogLevel.WARN ||
              this._logLevel === LogLevel.ERROR
            ) {
              console.log(`${rs}${ts}[${this.getTimestamp()}] ${logNameColor}[${this._logName}]${rs}${er}`, message, ...parameters, rs + rk);
            }
            break;
          case LogLevel.FATAL:
            if (
              this._logLevel === LogLevel.DEBUG ||
              this._logLevel === LogLevel.INFO ||
              this._logLevel === LogLevel.NOTICE ||
              this._logLevel === LogLevel.WARN ||
              this._logLevel === LogLevel.ERROR ||
              this._logLevel === LogLevel.FATAL
            ) {
              console.log(`${rs}${ts}[${this.getTimestamp()}] ${logNameColor}[${this._logName}]${rs}${ft}`, message, ...parameters, rs + rk);
            }
            break;
          default:
            break;
        }
      } else {
        switch (level) {
          case LogLevel.DEBUG:
            if (this._logLevel === LogLevel.DEBUG) {
              console.log(`${rs}[${this.getTimestamp()}] [${this._logName}] [${level}] ${message}`, ...parameters);
            }
            break;
          case LogLevel.INFO:
            if (this._logLevel === LogLevel.DEBUG || this._logLevel === LogLevel.INFO) {
              console.log(`${rs}[${this.getTimestamp()}] [${this._logName}] [${level}] ${message}`, ...parameters);
            }
            break;
          case LogLevel.NOTICE:
            if (this._logLevel === LogLevel.DEBUG || this._logLevel === LogLevel.INFO || this._logLevel === LogLevel.NOTICE) {
              console.log(`${rs}[${this.getTimestamp()}] [${this._logName}] [${level}] ${message}`, ...parameters);
            }
            break;
          case LogLevel.WARN:
            if (this._logLevel === LogLevel.DEBUG || this._logLevel === LogLevel.INFO || this._logLevel === LogLevel.NOTICE || this._logLevel === LogLevel.WARN) {
              console.log(`${rs}[${this.getTimestamp()}] [${this._logName}] [${level}] ${message}`, ...parameters);
            }
            break;
          case LogLevel.ERROR:
            if (
              this._logLevel === LogLevel.DEBUG ||
              this._logLevel === LogLevel.INFO ||
              this._logLevel === LogLevel.NOTICE ||
              this._logLevel === LogLevel.WARN ||
              this._logLevel === LogLevel.ERROR
            ) {
              console.log(`${rs}[${this.getTimestamp()}] [${this._logName}] [${level}] ${message}`, ...parameters);
            }
            break;
          case LogLevel.FATAL:
            if (
              this._logLevel === LogLevel.DEBUG ||
              this._logLevel === LogLevel.INFO ||
              this._logLevel === LogLevel.NOTICE ||
              this._logLevel === LogLevel.WARN ||
              this._logLevel === LogLevel.ERROR ||
              this._logLevel === LogLevel.FATAL
            ) {
              console.log(`${rs}[${this.getTimestamp()}] [${this._logName}] [${level}] ${message}`, ...parameters);
            }
            break;
          default:
            break;
        }
      }
    }
  }

  /**
   * Logs a debug message if debug logging is enabled. This is a convenience method that delegates to the `log` method with the `LogLevel.DEBUG` level.
   *
   * @param {string} message - The message to log.
   * @param {...any[]} parameters - Additional parameters to be included in the log message. Supports any number of parameters.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public debug(message: string, ...parameters: any[]): void {
    this.log(LogLevel.DEBUG, message, ...parameters);
  }

  /**
   * Logs an informational message. This is a convenience method that delegates to the `log` method with the `LogLevel.INFO` level.
   *
   * @param {string} message - The message to log.
   * @param {...any[]} parameters - Additional parameters to be included in the log message. Supports any number of parameters.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public info(message: string, ...parameters: any[]): void {
    this.log(LogLevel.INFO, message, ...parameters);
  }

  /**
   * Logs a notice message. This is a convenience method that delegates to the `log` method with the `LogLevel.NOTICE` level.
   *
   * @param {string} message - The message to log.
   * @param {...any[]} parameters - Additional parameters to be included in the log message. Supports any number of parameters.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public notice(message: string, ...parameters: any[]): void {
    this.log(LogLevel.NOTICE, message, ...parameters);
  }

  /**
   * Logs a warning message. This is a convenience method that delegates to the `log` method with the `LogLevel.WARN` level.
   *
   * @param {string} message - The message to log.
   * @param {...any[]} parameters - Additional parameters to be included in the log message. Supports any number of parameters.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public warn(message: string, ...parameters: any[]): void {
    this.log(LogLevel.WARN, message, ...parameters);
  }

  /**
   * Logs an error message. This is a convenience method that delegates to the `log` method with the `LogLevel.ERROR` level.
   *
   * @param {string} message - The message to log.
   * @param {...any[]} parameters - Additional parameters to be included in the log message. Supports any number of parameters.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public error(message: string, ...parameters: any[]): void {
    this.log(LogLevel.ERROR, message, ...parameters);
  }

  /**
   * Logs a fatal message. This is a convenience method that delegates to the `log` method with the `LogLevel.FATAL` level.
   *
   * @param {string} message - The message to log.
   * @param {...any[]} parameters - Additional parameters to be included in the log message. Supports any number of parameters.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public fatal(message: string, ...parameters: any[]): void {
    this.log(LogLevel.FATAL, message, ...parameters);
  }
}

if (process.argv.includes('--testAnsiLoggerColors')) {
  for (let i = 0; i < 256; i++) {
    console.log(`\x1b[38;5;${i}mForeground color ${i.toString().padStart(3, ' ')} \x1b[1mbright\x1b[0m`);
  }
  console.log(`${db}Debug message${rs}`);
  console.log(`${nf}Info message${rs}`);
  console.log(`${nt}Notice message${rs}`);
  console.log(`${wr}Warn message${rs}`);
  console.log(`${er}Error message${rs}`);
  console.log(`${ft}Fatal message${rs}`);
  console.log(`${nf}Stringify payload: ${payloadStringify({ number: 1234, string: 'Text', boolean: true, null: null, undefined: undefined })}${rs}`);
  console.log(`${nf}Stringify color: ${colorStringify({ number: 1234, string: 'Text', boolean: true, null: null, undefined: undefined })}${rs}`);
  console.log(`${nf}Stringify history: ${historyStringify({ number: 1234, string: 'Text', boolean: true, null: null, undefined: undefined })}${rs}`);
  console.log(`${nf}Stringify mqtt: ${mqttStringify({ number: 1234, string: 'Text', boolean: true, null: null, undefined: undefined })}${rs}`);
  console.log(
    `${db}Stringify debug: ${debugStringify({ number: 1234, string: 'Text', boolean: true, null: null, undefined: undefined, object: { number: 1234, string: 'Text', boolean: true } })}${rs}`,
  );

  const logger = new AnsiLogger({ logName: 'TestLogger', logLevel: LogLevel.DEBUG, logWithColors: true, logTimestampFormat: TimestampFormat.TIME_MILLIS });
  logger.debug('Debug message');
  logger.info('Info message');
  logger.notice('Notice message');
  logger.warn('Warn message');
  logger.error('Error message');
  logger.fatal('Fatal message');
}

/*
    \x1b[0m - Reset (clear color)
    \x1b[1m - Bold
    \x1b[3m - Italic
    \x1b[4m - Underline
    \x1b[K  - Erase the line from cursor

    \x1b[30m - Black
    \x1b[31m - Red
    \x1b[32m - Green
    \x1b[33m - Yellow
    \x1b[34m - Blue
    \x1b[35m - Magenta
    \x1b[36m - Cyan
    \x1b[37m - White

    \x1b[90-97m - Bright

    \x1b[40m - Black background
    \x1b[41m - Red background
    \x1b[42m - Green background
    \x1b[43m - Yellow background
    \x1b[44m - Blue background
    \x1b[45m - Magenta background
    \x1b[46m - Cyan background
    \x1b[47m - White background

    \x1b[100-107m - Bright background

    \x1b[38;2;255;105;50m // Orange

    RGB foreground
    \x1b[38;2;<R>;<G>;<B>m

    RGB background
    \x1b[48;2;<R>;<G>;<B>m

    256 colors foreground
    \x1b[38;5;<FG COLOR>m

    256 colors background
    \x1b[48;5;<BG COLOR>m
*/
