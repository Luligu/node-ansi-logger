/**
 * @file src/cache.ts
 * @description Circular message cache for AnsiLogger.
 * @author Luca Liguori
 * @created 2026-10-15
 * @version 3.3.2
 * @license Apache-2.0
 *
 * Copyright 2026 Luca Liguori.
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

import type { LogLevel } from './logger.js';

/**
 * A cached log message with its original level, timestamp and logger name.
 */
export interface AnsiLoggerCacheMessage {
  level: LogLevel;
  time: string;
  name: string;
  message: string;
}

/**
 * Stores the most recent log messages in a fixed-capacity circular buffer.
 */
export class AnsiLoggerCache {
  readonly #capacity: number;
  readonly #messages: AnsiLoggerCacheMessage[] = [];
  #next = 0;

  /**
   * Creates an empty message cache.
   *
   * @param {number} capacity - Maximum number of messages to retain; defaults to 200.
   * @throws {RangeError} If capacity is not a positive safe integer.
   */
  constructor(capacity = 200) {
    if (!Number.isSafeInteger(capacity) || capacity <= 0) {
      throw new RangeError('Cache capacity must be a positive safe integer.');
    }
    this.#capacity = capacity;
  }

  /**
   * Adds a message, overwriting the oldest message when the cache is full.
   *
   * @param {AnsiLoggerCacheMessage} entry - Message to copy into the cache.
   * @returns {void}
   */
  public add(entry: AnsiLoggerCacheMessage): void {
    this.#messages[this.#next] = { ...entry };
    this.#next = (this.#next + 1) % this.#capacity;
  }

  /**
   * Removes all retained messages without changing capacity or disabling caching.
   *
   * @returns {void}
   */
  public clear(): void {
    this.#messages.length = 0;
    this.#next = 0;
  }

  /**
   * Returns a snapshot of cached messages from oldest to newest.
   *
   * @returns {AnsiLoggerCacheMessage[]} Copies of all retained messages.
   */
  public get(): AnsiLoggerCacheMessage[] {
    return [...this.#messages.slice(this.#next), ...this.#messages.slice(0, this.#next)].map((entry) => ({ ...entry }));
  }

  /**
   * Replays a snapshot from oldest to newest without consuming the cache.
   *
   * @param {(entry: AnsiLoggerCacheMessage) => void} callback - Receives each cached message; thrown errors propagate to the caller.
   * @returns {void}
   */
  public replay(callback: (entry: AnsiLoggerCacheMessage) => void): void {
    for (const entry of this.get()) {
      callback(entry);
    }
  }
}
