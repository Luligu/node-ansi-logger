/* eslint-disable no-var */
import { AnsiLoggerCallback, LogLevel } from '../logger.js';

declare global {
  var __AnsiLoggerCallback__: AnsiLoggerCallback | undefined;
  var __AnsiLoggerCallbackLoglevel__: LogLevel | undefined;
  var __AnsiLoggerFilePath__: string | undefined;
  var __AnsiLoggerFileLoglevel__: LogLevel | undefined;
  var __AnsiLoggerFileLogSize__: number | undefined;
}

export {};
