/**
 * This file contains the class CustomLogger.
 *
 * @file logger.ts
 * @author Luca Liguori
 * @date 2023-06-01
 * @version 1.8.8
 *
 * All rights reserved.
 *
 */

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
export const db = '\x1b[38;5;247m';                 // Debug
export const nf = '\x1b[38;5;255m';                 // Info
export const wr = '\x1b[38;5;220m';                 // Warn
export const er = '\x1b[38;5;9m';                   // Error
export const rs = '\x1b[40;0m';                     // Reset colors to default foreground and background
export const rk = '\x1b[K';                         // Erase from cursor

// Used internally for: homebridge-mqtt-accessories and matterbridge-mqtt-accessories
export const dn = '\x1b[38;5;33m';                  // Display name device
export const gn = '\x1b[38;5;35m';                  // Display name group
export const idn = '\x1b[48;5;21m\x1b[38;5;255m';   // Inverted display name device
export const ign = '\x1b[48;5;22m\x1b[38;5;255m';   // Inverted display name group
export const zb = '\x1b[38;5;207m';                 // Zigbee
export const hk = '\x1b[38;5;79m';                  // Homekit
export const pl = '\x1b[32m';                       // payload
export const id = '\x1b[37;44m';                    // id or ieee_address or UUID
export const or = '\x1b[38;5;208m';                 // history


/**
 * LogLevel enumeration to specify the logging level.
 */
export const enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug'
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
  warn: (...data: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (...data: any[]) => void;
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
  logDebug?: boolean;
  logWithColors?: boolean;
  logTimestampFormat?: TimestampFormat;
  logCustomTimestampFormat?: string;
}

export type AnsiLoggerCallback = (type: string, subtype: string, message: string) => void;

// Initialize the global variable
globalThis.__AnsiLoggerCallback__ = undefined;

/**
 * AnsiLogger provides a customizable logging utility with ANSI color support.
 * It allows for various configurations such as enabling debug logs, customizing log name, and more.
 */
export class AnsiLogger {
  private logName: string;
  private logTimestampFormat: TimestampFormat;
  private logCustomTimestampFormat: string;
  private hbLog: Logger | undefined;
  private logStartTime: number;
  private logWithColors: boolean;
  private logDebug: boolean;
  private params: AnsiLoggerParams;
  private callback: AnsiLoggerCallback | undefined = undefined;

  /**
   * Constructs a new AnsiLogger instance with optional configuration parameters.
   * @param {AnsiLoggerParams} optionalParams - Configuration options for the logger.
   */
  constructor(optionalParams: AnsiLoggerParams) {

    this.params = Object.assign({
      hbLog: undefined,
      logName: 'NodeAnsiLogger',
      logDebug: true,
      logWithColors: true,
      logTimestampFormat: TimestampFormat.LOCAL_DATE_TIME,
      logCustomTimestampFormat: 'yyyy-MM-dd HH:mm:ss',
    }, optionalParams);

    this.hbLog = this.params.hbLog;
    this.logName = this.params.logName!;
    this.logDebug = this.params.logDebug!;
    this.logWithColors = this.params.logWithColors!;
    this.logTimestampFormat = this.params.logTimestampFormat!;
    this.logCustomTimestampFormat = this.params.logCustomTimestampFormat!;
    this.logStartTime = 0;
  }

  /**
   * Sets the name of the logger.
   * @param {string} name - The new name for the logger.
   */
  public setLogName(name: string): void {
    this.logName = name;
  }

  /**
   * Enables or disables debug logging.
   * @param {boolean} logDebug - Flag to enable or disable debug logging.
   */
  public setLogDebug(logDebug: boolean): void {
    this.logDebug = logDebug;
  }

  /**
   * Enables or disables logging with ANSI colors.
   * @param {boolean} logWithColors - Flag to enable or disable ANSI color logging.
   */
  public setlogWithColors(logWithColors: boolean): void {
    this.logWithColors = logWithColors;
  }

  /**
   * Sets the timestamp format for log messages.
   * @param {TimestampFormat} format - The timestamp format to use.
   */
  public setLogTimestampFormat(format: TimestampFormat): void {
    this.logTimestampFormat = format;
  }

  /**
   * Sets a custom timestamp format for log messages.
   * @param {string} format - The custom timestamp format string.
   */
  public setLogCustomTimestampFormat(format: string): void {
    this.logCustomTimestampFormat = format;
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
  public setCallback(callback: AnsiLoggerCallback | undefined): void{
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
  public setGlobalCallback(callback: AnsiLoggerCallback | undefined): void{
    // AnsiLogger.callback = callback;
    __AnsiLoggerCallback__ = callback;
  }

  /**
   * Gets the global callback function currently used by the logger.
   * @returns {AnsiLoggerCallback | undefined} The callback function that takes three parameters: type, subtype, and message, or undefined if no callback is set.
   */
  public getGlobalCallback(): AnsiLoggerCallback | undefined {
    return __AnsiLoggerCallback__;
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

  private getTimestamp(): string {
    if (this.logStartTime !== 0) {
      const timePassed = Date.now() - this.logStartTime;
      return `Timer:    ${timePassed.toString().padStart(7, ' ')} ms`;
    } else {
      let timestamp: string;
      switch (this.logTimestampFormat) {
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
          // eslint-disable-next-line max-len
          timestamp = `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}:${new Date().getSeconds().toString().padStart(2, '0')}.${new Date().getMilliseconds().toString().padStart(3, '0')}`;
          break;
        case TimestampFormat.CUSTOM:
          timestamp = this.formatCustomTimestamp(new Date(), this.logCustomTimestampFormat);
          break;
      }
      return timestamp;
    }
  }

  /**
   * Logs a message with a specific level (e.g., info, warn, error, debug) and additional parameters.
   * This method formats the log message with ANSI colors based on the log level and other logger settings.
   * It supports dynamic parameters for more detailed and formatted logging.
   *
   * @param {LogLevel} level - The severity level of the log message.
   * @param {string} message - The primary log message to be displayed.
   * @param {...any[]} parameters - Additional parameters to be logged. Supports any number of parameters.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public log(level: LogLevel, message: string, ...parameters: any[]): void {
    const ts = '\x1b[38;5;249m';                 // TimeStamp  White medium
    const ln = '\x1b[38;5;31m';                  // LogName    Cyan

    const s1ln = '\x1b[38;5;0;48;5;31m';         // Highlight  LogName Black on Cyan
    const s2ln = '\x1b[38;5;0;48;5;255m';        // Highlight  LogName Black on White
    const s3ln = '\x1b[38;5;0;48;5;220m';        // Highlight  LogName Black on Yellow
    const s4ln = '\x1b[38;5;0;48;5;9m';          // Highlight  LogName Black on Red

    try {
      if (this.callback !== undefined) {
      // Convert parameters to string and append to message
        const parametersString = parameters.length > 0 ? ' ' + parameters.join(' ') : '';
        message += parametersString;
        this.callback(level, this.logName, message);
      } else if (__AnsiLoggerCallback__ !== undefined) {
      // Convert parameters to string and append to message
        const parametersString = parameters.length > 0 ? ' ' + parameters.join(' ') : '';
        message += parametersString;
        __AnsiLoggerCallback__(this.logName, level, message);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error executing callback:', error);
    }

    if (this.hbLog !== undefined) {
      this.hbLog[level](message, ...parameters);
    } else {
      if (this.logWithColors) {
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
            if (this.logDebug) {
              // eslint-disable-next-line no-console
              console.log(`${rs}${ts}[${this.getTimestamp()}] ${logNameColor}[${this.logName}]${rs}${db}`, message, ...parameters, rs + rk);
            }
            break;
          case LogLevel.INFO:
            // eslint-disable-next-line no-console
            console.log(`${rs}${ts}[${this.getTimestamp()}] ${logNameColor}[${this.logName}]${rs}${nf}`, message, ...parameters, rs + rk);
            break;
          case LogLevel.WARN:
            // eslint-disable-next-line no-console
            console.log(`${rs}${ts}[${this.getTimestamp()}] ${logNameColor}[${this.logName}]${rs}${wr}`, message, ...parameters, rs + rk);
            break;
          case LogLevel.ERROR:
            // eslint-disable-next-line no-console
            console.log(`${rs}${ts}[${this.getTimestamp()}] ${logNameColor}[${this.logName}]${rs}${er}`, message, ...parameters, rs + rk);
            break;
        }
      } else {
        // eslint-disable-next-line no-console
        console.log(`${rs}[${this.getTimestamp()}] [${this.logName}] [${level}] ${message}`, ...parameters);
      }
    }
  }

  /**
   * Logs an informational message. This is a convenience method that delegates to the `log` method with the `LogLevel.INFO` level.
   *
   * @param {string} message - The informational message to log.
   * @param {...any[]} parameters - Additional parameters to be included in the log message. Supports any number of parameters.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public info(message: string, ...parameters: any[]): void {
    this.log(LogLevel.INFO, message, ...parameters);
  }

  /**
   * Logs a warning message. This is a convenience method that delegates to the `log` method with the `LogLevel.WARN` level.
   *
   * @param {string} message - The warning message to log.
   * @param {...any[]} parameters - Additional parameters to be included in the log message. Supports any number of parameters.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public warn(message: string, ...parameters: any[]): void {
    this.log(LogLevel.WARN, message, ...parameters);
  }

  /**
   * Logs an error message. This is a convenience method that delegates to the `log` method with the `LogLevel.ERROR` level.
   *
   * @param {string} message - The error message to log.
   * @param {...any[]} parameters - Additional parameters to be included in the log message. Supports any number of parameters.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public error(message: string, ...parameters: any[]): void {
    this.log(LogLevel.ERROR, message, ...parameters);
  }

  /**
   * Logs a debug message if debug logging is enabled. This is a convenience method that delegates to the `log` method with the `LogLevel.DEBUG` level.
   *
   * @param {string} message - The debug message to log.
   * @param {...any[]} parameters - Additional parameters to be included in the log message. Supports any number of parameters.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public debug(message: string, ...parameters: any[]): void {
    if (this.logDebug) {
      this.log(LogLevel.DEBUG, message, ...parameters);
    }
  }
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

