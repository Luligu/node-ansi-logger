/* eslint-disable no-var */
import { AnsiLoggerCallback } from '../logger.js';

declare global {
  var __AnsiLoggerCallback__: AnsiLoggerCallback | undefined;
}

export {};
