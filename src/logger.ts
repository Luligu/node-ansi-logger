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

import path from 'path';
import { stringify } from './stringify.js';
import * as fs from 'fs';
import * as os from 'os';

// ANSI color codes and styles are defined here for use in the logger
export const RESET = '[40;0m';
export const BRIGHT = '[1m';
export const DIM = '[2m';
export const NORMAL = '[22m';
export const UNDERLINE = '[4m';
export const UNDERLINEOFF = '[24m';
export const BLINK = '[5m';
export const BLINKOFF = '[25m';
export const REVERSE = '[7m';
export const REVERSEOFF = '[27m';
export const HIDDEN = '[8m';
export const HIDDENOFF = '[28m';
export const CURSORSAVE = '[s';
export const CURSORRESTORE = '[u';

export const BLACK = '[30m';
export const RED = '[31m';
export const GREEN = '[32m';
export const YELLOW = '[33m';
export const BLUE = '[34m';
export const MAGENTA = '[35m';
export const CYAN = '[36m';
export const LIGHT_GREY = '[37m';
export const GREY = '[90m';
export const WHITE = '[97m';

// ANSI color codes short form to use in the logger
export const db = '[38;5;245m'; // Debug 247
export const nf = '[38;5;252m'; // Info 255
export const nt = '[38;5;2m'; // Notice
export const wr = '[38;5;220m'; // Warn 220
export const er = '[38;5;1m'; // Error
export const ft = '[38;5;9m'; // Fatal
export const rs = '[40;0m'; // Reset colors to default foreground and background
export const rk = '[K'; // Erase from cursor

// Used internally by plugins
export const dn = '[38;5;33m'; // Display name device
export const gn = '[38;5;35m'; // Display name group
export const idn = '[48;5;21m[38;5;255m'; // Inverted display name device
export const ign = '[48;5;22m[38;5;255m'; // Inverted display name group
export const zb = '[38;5;207m'; // Zigbee
export const hk = '[38;5;79m'; // Homekit
export const pl = '[32m'; // payload
export const id = '[37;44m'; // id or ieee_address or UUID
export const or = '[38;5;208m'; // history

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
  extLog?: Logger;
  logName?: string;
  logDebug?: boolean; // Deprecated
  logLevel?: LogLevel;
  logWithColors?: boolean;
  logTimestampFormat?: TimestampFormat;
  logCustomTimestampFormat?: string;
}

export type AnsiLoggerCallback = (level: string, time: string, name: string, message: string) => void;

// Initialize the global variables
if (typeof globalThis.__AnsiLoggerCallback__ === 'undefined') globalThis.__AnsiLoggerCallback__ = undefined;
if (typeof globalThis.__AnsiLoggerCallbackLoglevel__ === 'undefined') globalThis.__AnsiLoggerCallbackLoglevel__ = undefined;

if (typeof globalThis.__AnsiLoggerFilePath__ === 'undefined') globalThis.__AnsiLoggerFilePath__ = undefined;
if (typeof globalThis.__AnsiLoggerFileLoglevel__ === 'undefined') globalThis.__AnsiLoggerFileLoglevel__ = undefined;
if (typeof globalThis.__AnsiLoggerFileLogSize__ === 'undefined') globalThis.__AnsiLoggerFileLogSize__ = undefined;

/**
 * AnsiLogger provides a customizable logging utility with ANSI color support.
 * It allows for various configurations such as enabling debug logs, customizing log name, and more.
 */
export class AnsiLogger {
  private _extLog: Logger | undefined;
  private _logName: string;
  private _logFilePath: string | undefined;
  private _logFileSize: number | undefined;
  private _logLevel: LogLevel;
  private _logWithColors: boolean;
  private _logTimestampFormat: TimestampFormat;
  private _logCustomTimestampFormat: string;
  private _logTimeStampColor = '[38;5;245m';
  private _logNameColor = '[38;5;31m';

  private _maxFileSize = 100000000; // 100MB

  private logStartTime: number;

  private callback: AnsiLoggerCallback | undefined = undefined;

  /**
   * Constructs a new AnsiLogger instance with optional configuration parameters.
   * @param {AnsiLoggerParams} optionalParams - Configuration options for the logger.
   */
  constructor(params: AnsiLoggerParams) {
    this._extLog = params.extLog;
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
   * Gets the log name color string of the logger.
   *
   * @returns {string} The log name color string.
   */
  get logNameColor(): string {
    return this._logNameColor;
  }

  /**
   * Sets the log name color string for the logger.
   *
   * @param {string} color - The logger name color string to set.
   */
  set logNameColor(color: string) {
    this._logNameColor = color;
  }

  /**
   * Gets the log timestamp format of the logger.
   * @returns {TimestampFormat} The log timestamp format.
   */
  get logTimestampFormat(): TimestampFormat {
    return this._logTimestampFormat;
  }

  /**
   * Sets the log timestamp format for the logger.
   * @param {TimestampFormat} logTimestampFormat - The log timestamp format to set.
   */
  set logTimestampFormat(logTimestampFormat: TimestampFormat) {
    this._logTimestampFormat = logTimestampFormat;
  }

  /**
   * Gets the custom log timestamp format of the logger.
   * @returns {string} The custom log timestamp format.
   */
  get logCustomTimestampFormat(): string {
    return this._logCustomTimestampFormat;
  }

  /**
   * Sets the custom log timestamp format for the logger.
   * @param {string} logCustomTimestampFormat - The custom log timestamp format to set.
   */
  set logCustomTimestampFormat(logCustomTimestampFormat: string) {
    this._logCustomTimestampFormat = logCustomTimestampFormat;
  }

  /**
   * Gets the file path of the log.
   *
   * @returns {string | undefined} The file path of the log, or undefined if not set.
   */
  get logFilePath(): string | undefined {
    return this._logFilePath;
  }

  /**
   * Sets the file path for logging.
   *
   * @param {string | undefined} filePath - The file path to set for logging.
   */
  set logFilePath(filePath: string | undefined) {
    if (filePath && typeof filePath === 'string' && filePath !== '') {
      // Convert relative path to absolute path
      try {
        this._logFilePath = path.resolve(filePath);
      } catch (error) {
        console.error(`Error resolving log file path ${CYAN}${filePath}${er}: ${error instanceof Error ? error.message : error}`);
        this._logFilePath = undefined;
        this._logFileSize = undefined;
        return;
      }
      // Check if the file exists and unlink
      if (this._logFilePath && fs.existsSync(this._logFilePath)) {
        try {
          fs.unlinkSync(this._logFilePath);
        } catch (error) {
          console.error(`${er}Error unlinking the log file ${CYAN}${this._logFilePath}${er}: ${error instanceof Error ? error.message : error}`);
          this._logFilePath = undefined;
          this._logFileSize = undefined;
          return;
        }
      }
      this._logFileSize = 0;
    } else {
      this._logFilePath = undefined;
      this._logFileSize = undefined;
    }
  }

  /**
   * Gets the size of log file.
   *
   * @returns {number | undefined} The size of log file, or undefined if not set.
   */
  get logFileSize(): number | undefined {
    return this._logFilePath && this._logFileSize ? this._logFileSize : undefined;
  }

  /**
   * Gets the max file size of the file loggers.
   * @returns {number} The current maxFileSize.
   */
  get maxFileSize(): number {
    return this._maxFileSize;
  }

  /**
   * Sets the max file size of the file loggers.
   * @param {number} maxFileSize - The maxFileSize to set.
   */
  set maxFileSize(maxFileSize: number) {
    this._maxFileSize = Math.min(maxFileSize, 100000000); // 100MB
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
   * @param {AnsiLoggerCallback} callback - The callback function.
   */
  public setCallback(callback: AnsiLoggerCallback | undefined): void {
    this.callback = callback;
  }

  /**
   * Gets the callback function currently used by the logger.
   * @returns {AnsiLoggerCallback | undefined} The callback function.
   */
  public getCallback(): AnsiLoggerCallback | undefined {
    return this.callback;
  }

  /**
   * Sets the global callback function to be used by the logger.
   * @param {AnsiLoggerCallback | undefined} callback - The callback function.
   * @param {LogLevel} [callbackLevel=LogLevel.DEBUG]  - The log level of the log file (default LogLevel.DEBUG).
   *
   * @returns {AnsiLoggerCallback | undefined} The path name of the log file.
   */
  static setGlobalCallback(callback: AnsiLoggerCallback | undefined, callbackLevel = LogLevel.DEBUG): AnsiLoggerCallback | undefined {
    __AnsiLoggerCallback__ = callback;
    __AnsiLoggerCallbackLoglevel__ = callbackLevel;
    return __AnsiLoggerCallback__;
  }

  /**
   * Gets the global callback function currently used by the logger.
   * @returns {AnsiLoggerCallback | undefined} The callback function.
   */
  static getGlobalCallback(): AnsiLoggerCallback | undefined {
    if (__AnsiLoggerCallback__) {
      return __AnsiLoggerCallback__;
    } else {
      return undefined;
    }
  }

  /**
   * Gets the global callback log level used by the logger.
   *
   * @returns {LogLevel | undefined} The log level of the global callback.
   */
  static getGlobalCallbackLevel(): LogLevel | undefined {
    if (__AnsiLoggerCallbackLoglevel__) {
      return __AnsiLoggerCallbackLoglevel__;
    } else {
      return undefined;
    }
  }

  /**
   * Sets the global callback log level for the logger.
   *
   * @param {LogLevel} logLevel - The log level to set. Defaults to LogLevel.DEBUG.
   *
   * @returns {LogLevel | undefined} The log level that was set.
   */
  static setGlobalCallbackLevel(logLevel = LogLevel.DEBUG): LogLevel | undefined {
    __AnsiLoggerCallbackLoglevel__ = logLevel;
    return __AnsiLoggerCallbackLoglevel__;
  }

  /**
   * Sets the global logfile to be used by the logger.
   * @param {string} logfilePath - The path name of the log file.
   * @param {LogLevel} logfileLevel - Optional: the log level of the log file. Default LogLevel.DEBUG.
   * @param {boolean} unlink - Optional: whether to unlink (delete) the log file if it exists. Default false.
   *
   * @returns {string | undefined} The absolute path name of the log file.
   */
  static setGlobalLogfile(logfilePath: string | undefined, logfileLevel = LogLevel.DEBUG, unlink = false): string | undefined {
    if (logfilePath && typeof logfilePath === 'string' && logfilePath !== '') {
      // Convert relative path to absolute path
      logfilePath = path.resolve(logfilePath);
      // Check if the file exists and unlink it if requested
      if (unlink && fs.existsSync(logfilePath)) {
        try {
          fs.unlinkSync(logfilePath);
        } catch (error) {
          console.error(`${er}Error unlinking the log file ${CYAN}${logfilePath}${er}: ${error instanceof Error ? error.message : error}`);
        }
      }
      __AnsiLoggerFilePath__ = logfilePath;
      __AnsiLoggerFileLoglevel__ = logfileLevel;
      __AnsiLoggerFileLogSize__ = 0;
      return __AnsiLoggerFilePath__;
    }
    __AnsiLoggerFilePath__ = undefined;
    __AnsiLoggerFileLogSize__ = undefined;
    return undefined;
  }

  /**
   * Gets the global logfile currently used by the logger.
   *
   * @returns {string | undefined} The path name of the log file.
   */
  static getGlobalLogfile(): string | undefined {
    if (__AnsiLoggerFilePath__) {
      return __AnsiLoggerFilePath__;
    } else {
      return undefined;
    }
  }

  /**
   * Gets the global logfile log level used by the loggers.
   *
   * @returns {LogLevel | undefined} The log level of the global logfile.
   */
  static getGlobalLogfileLevel(): LogLevel | undefined {
    if (__AnsiLoggerFileLoglevel__) {
      return __AnsiLoggerFileLoglevel__;
    } else {
      return undefined;
    }
  }

  /**
   * Sets the global logfile log level used by the loggers.
   *
   * @param {LogLevel} logfileLevel - The global logfile log level used by the loggers.
   *
   * @returns {LogLevel | undefined} The log level of the global logfile.
   */
  static setGlobalLogfileLevel(logfileLevel: LogLevel): LogLevel | undefined {
    __AnsiLoggerFileLoglevel__ = logfileLevel;
    return __AnsiLoggerFileLoglevel__;
  }

  /**
   * Determines whether a log message with the given level should be logged based on the configured log level.
   *
   * @param {LogLevel} level - The level of the log message.
   * @param {LogLevel | undefined} configuredLevel - The configured log level.
   *
   * @returns {boolean} A boolean indicating whether the log message should be logged.
   */
  private shouldLog(level: LogLevel, configuredLevel: LogLevel | undefined): boolean {
    switch (level) {
      case LogLevel.NONE:
        return false;
      case LogLevel.DEBUG:
        if (configuredLevel === LogLevel.DEBUG) {
          return true;
        }
        break;
      case LogLevel.INFO:
        if (configuredLevel === LogLevel.DEBUG || configuredLevel === LogLevel.INFO) {
          return true;
        }
        break;
      case LogLevel.NOTICE:
        if (configuredLevel === LogLevel.DEBUG || configuredLevel === LogLevel.INFO || configuredLevel === LogLevel.NOTICE) {
          return true;
        }
        break;
      case LogLevel.WARN:
        if (configuredLevel === LogLevel.DEBUG || configuredLevel === LogLevel.INFO || configuredLevel === LogLevel.NOTICE || configuredLevel === LogLevel.WARN) {
          return true;
        }
        break;
      case LogLevel.ERROR:
        if (
          configuredLevel === LogLevel.DEBUG ||
          configuredLevel === LogLevel.INFO ||
          configuredLevel === LogLevel.NOTICE ||
          configuredLevel === LogLevel.WARN ||
          configuredLevel === LogLevel.ERROR
        ) {
          return true;
        }
        break;
      case LogLevel.FATAL:
        if (
          configuredLevel === LogLevel.DEBUG ||
          configuredLevel === LogLevel.INFO ||
          configuredLevel === LogLevel.NOTICE ||
          configuredLevel === LogLevel.WARN ||
          configuredLevel === LogLevel.ERROR ||
          configuredLevel === LogLevel.FATAL
        ) {
          return true;
        }
        break;
      default:
        return false;
    }
    return false;
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
   * Writes a log message to a file.
   *
   * @param {string} filePath - The path of the file to write the log message to.
   * @param {LogLevel} level - The log level of the message.
   * @param {string} message - The log message.
   * @param {...any[]} parameters - Additional parameters to include in the log message.
   * @returns {number} - The length of the log message including the appended newline character.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private logToFile(filePath: string, level: LogLevel, message: string, ...parameters: any[]): number {
    const parametersString = parameters
      .map((parameter) => {
        if (parameter === null) return 'null';
        if (parameter === undefined) return 'undefined';
        switch (typeof parameter) {
          case 'object':
            return stringify(parameter);
          case 'string':
            return parameter;
          case 'undefined':
            return 'undefined';
          case 'function':
            return '(function)';
          default:
            return parameter.toString();
        }
      })
      .join(' ');

    let messageLog = `[${this.getTimestamp()}] [${this._logName}] [${level}] ` + message + ' ' + parametersString;
    // messageLog = messageLog.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '').replace(/[\t\n\r]/g, '');

    messageLog = messageLog
      // eslint-disable-next-line no-control-regex
      .replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
      .replaceAll('\t', ' ')
      .replaceAll('\r', '')
      .replaceAll('\n', os.EOL);
    fs.appendFileSync(filePath, messageLog + os.EOL);
    return messageLog.length + 1;
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
    const s1ln = '[38;5;0;48;5;31m'; // Highlight  LogName Black on Cyan
    const s2ln = '[38;5;0;48;5;255m'; // Highlight  LogName Black on White
    const s3ln = '[38;5;0;48;5;220m'; // Highlight  LogName Black on Yellow
    const s4ln = '[38;5;0;48;5;9m'; // Highlight  LogName Black on Red

    if (typeof level !== 'string' || level.startsWith === undefined || typeof message !== 'string' || message.startsWith === undefined) {
      return;
    }

    // Local callback
    try {
      if (this.callback !== undefined && this.shouldLog(level, this._logLevel)) {
        // Convert parameters to string and append to message
        const parametersString = parameters.length > 0 ? ' ' + parameters.join(' ') : '';
        const newMessage = message + parametersString;
        this.callback(level, this.getTimestamp(), this._logName, newMessage);
      }
    } catch (error) {
      console.error('Error executing local callback:', error);
    }

    // Global callback
    try {
      if (__AnsiLoggerCallback__ && __AnsiLoggerCallback__ !== undefined && this.shouldLog(level, __AnsiLoggerCallbackLoglevel__)) {
        // Convert parameters to string and append to message
        const parametersString = parameters.length > 0 ? ' ' + parameters.join(' ') : '';
        const newMessage = message + parametersString;
        __AnsiLoggerCallback__(level, this.getTimestamp(), this._logName, newMessage);
      }
    } catch (error) {
      console.error('Error executing global callback:', error);
    }

    // Local file logger
    try {
      if (this.logFilePath !== undefined && this._logFileSize !== undefined && this._logFileSize < this._maxFileSize && this.shouldLog(level, this._logLevel)) {
        const size = this.logToFile(this.logFilePath, level, message, ...parameters);
        this._logFileSize += size;
        if (this._logFileSize >= this._maxFileSize) {
          fs.appendFileSync(this.logFilePath, 'Logging on file has been stoppped because the file size is greater then 100MB.\n');
        }
      }
    } catch (error) {
      console.error(`Error writing to the local log file ${this.logFilePath}:`, error);
    }

    // Global file logger
    try {
      if (
        __AnsiLoggerFilePath__ &&
        __AnsiLoggerFilePath__ !== undefined &&
        __AnsiLoggerFileLogSize__ !== undefined &&
        __AnsiLoggerFileLogSize__ < this._maxFileSize &&
        this.shouldLog(level, __AnsiLoggerFileLoglevel__)
      ) {
        const size = this.logToFile(__AnsiLoggerFilePath__, level, message, ...parameters);
        __AnsiLoggerFileLogSize__ += size;
        if (__AnsiLoggerFileLogSize__ >= this._maxFileSize) {
          fs.appendFileSync(__AnsiLoggerFilePath__, 'Logging on file has been stoppped because the file size is greater then 100MB.\n');
        }
      }
    } catch (error) {
      console.error(`Error writing to the global log file ${__AnsiLoggerFilePath__}:`, error);
    }

    if (this._extLog !== undefined) {
      if (level !== LogLevel.NONE) {
        this._extLog.log(level, message, ...parameters);
      }
    } else {
      if (this._logWithColors) {
        let logNameColor = this._logNameColor;
        if (message.startsWith('****')) {
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
            if (this.shouldLog(level, this._logLevel)) {
              console.log(`${rs}${this._logTimeStampColor}[${this.getTimestamp()}] ${logNameColor}[${this._logName}]${rs}${db}`, message + rs + rk, ...parameters);
            }
            break;
          case LogLevel.INFO:
            if (this.shouldLog(level, this._logLevel)) {
              console.log(`${rs}${this._logTimeStampColor}[${this.getTimestamp()}] ${logNameColor}[${this._logName}]${rs}${nf}`, message + rs + rk, ...parameters);
            }
            break;
          case LogLevel.NOTICE:
            if (this.shouldLog(level, this._logLevel)) {
              console.log(`${rs}${this._logTimeStampColor}[${this.getTimestamp()}] ${logNameColor}[${this._logName}]${rs}${nt}`, message + rs + rk, ...parameters);
            }
            break;
          case LogLevel.WARN:
            if (this.shouldLog(level, this._logLevel)) {
              console.log(`${rs}${this._logTimeStampColor}[${this.getTimestamp()}] ${logNameColor}[${this._logName}]${rs}${wr}`, message + rs + rk, ...parameters);
            }
            break;
          case LogLevel.ERROR:
            if (this.shouldLog(level, this._logLevel)) {
              console.log(`${rs}${this._logTimeStampColor}[${this.getTimestamp()}] ${logNameColor}[${this._logName}]${rs}${er}`, message + rs + rk, ...parameters);
            }
            break;
          case LogLevel.FATAL:
            if (this.shouldLog(level, this._logLevel)) {
              console.log(`${rs}${this._logTimeStampColor}[${this.getTimestamp()}] ${logNameColor}[${this._logName}]${rs}${ft}`, message + rs + rk, ...parameters);
            }
            break;
          default:
            break;
        }
      } else {
        switch (level) {
          case LogLevel.DEBUG:
            if (this._logLevel === LogLevel.DEBUG) {
              console.log(`[${this.getTimestamp()}] [${this._logName}] [${level}] ${message}`, ...parameters);
            }
            break;
          case LogLevel.INFO:
            if (this._logLevel === LogLevel.DEBUG || this._logLevel === LogLevel.INFO) {
              console.log(`[${this.getTimestamp()}] [${this._logName}] [${level}] ${message}`, ...parameters);
            }
            break;
          case LogLevel.NOTICE:
            if (this._logLevel === LogLevel.DEBUG || this._logLevel === LogLevel.INFO || this._logLevel === LogLevel.NOTICE) {
              console.log(`[${this.getTimestamp()}] [${this._logName}] [${level}] ${message}`, ...parameters);
            }
            break;
          case LogLevel.WARN:
            if (this._logLevel === LogLevel.DEBUG || this._logLevel === LogLevel.INFO || this._logLevel === LogLevel.NOTICE || this._logLevel === LogLevel.WARN) {
              console.log(`[${this.getTimestamp()}] [${this._logName}] [${level}] ${message}`, ...parameters);
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
              console.log(`[${this.getTimestamp()}] [${this._logName}] [${level}] ${message}`, ...parameters);
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
              console.log(`[${this.getTimestamp()}] [${this._logName}] [${level}] ${message}`, ...parameters);
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

// Use with node dist/logger.js --testAnsiLoggerColors to test ANSI colors
/*
if (process.argv.includes('--testAnsiLoggerColors')) {
  for (let i = 0; i < 256; i++) {
    console.log(`[38;5;${i}mForeground color ${i.toString().padStart(3, ' ')} [1mbright[0m`);
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
  console.log(
    `${nf}Stringify mqtt: ${mqttStringify({
      number: 1234,
      string: 'Text',
      boolean: true,
      null: null,
      undefined: undefined,
      function: () => {
        //
      },
    })}${rs}`,
  );
  console.log(
    `${db}Stringify debug: ${debugStringify({ number: 1234, string: 'Text', boolean: true, null: null, undefined: undefined, object: { number: 1234, string: 'Text', boolean: true } })}${rs}`,
  );

  const logger = new AnsiLogger({ logName: 'TestLogger', logLevel: LogLevel.DEBUG, logWithColors: true, logTimestampFormat: TimestampFormat.TIME_MILLIS });
  logger.logFilePath = 'test-local.log';
  AnsiLogger.setGlobalLogfile('test-global.log', LogLevel.DEBUG, true);
  logger.debug('Debug message');
  logger.info('Info message');
  logger.notice('Notice message');
  logger.warn('Warn message');
  logger.error('Error message');
  logger.fatal('Fatal message');
  const obj: object = {
    logName: 'TestLogger',
    logLevel: LogLevel.DEBUG,
    logWithColors: true,
    logTimestampFormat: TimestampFormat.TIME_MILLIS,
  };
  logger.log(LogLevel.DEBUG, `Debug message with params: ${rs}\n`, obj);
  logger.log(LogLevel.DEBUG, `Debug message with params: ${rs}\n`, obj, 123, 212121111111111122121n, 'Text', true, null, undefined, () => {
    //
  });
  logger.log(LogLevel.DEBUG, `Debug message with array params: ${rs}\n`, obj, [123, 'abc', { a: 1, b: 2 }], 123, 212121111111111122121n, 'Text', true, null, undefined, () => {
    //
  });
  logger.log(LogLevel.DEBUG, `Debug message without params: ${debugStringify(obj)}`);
}
*/

/*
    [0m - Reset (clear color)
    [1m - Bold
    [3m - Italic
    [4m - Underline
    [K  - Erase the line from cursor

    [30m - Black
    [31m - Red
    [32m - Green
    [33m - Yellow
    [34m - Blue
    [35m - Magenta
    [36m - Cyan
    [37m - White

    [90-97m - Bright

    [40m - Black background
    [41m - Red background
    [42m - Green background
    [43m - Yellow background
    [44m - Blue background
    [45m - Magenta background
    [46m - Cyan background
    [47m - White background

    [100-107m - Bright background

    [38;2;255;105;50m // Orange

    RGB foreground
    [38;2;<R>;<G>;<B>m

    RGB background
    [48;2;<R>;<G>;<B>m

    256 colors foreground
    [38;5;<FG COLOR>m

    256 colors background
    [48;5;<BG COLOR>m
*/
