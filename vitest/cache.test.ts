/**
 * @file vitest/cache.test.ts
 * @description Tests for the circular logger cache and global logger integration.
 * @author Luca Liguori
 */

/* oxlint-disable no-console */
/* oxlint-disable unicorn/no-useless-undefined -- Explicit undefined exercises disabled globals and optional log parameters. */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { AnsiLogger, AnsiLoggerCache, type AnsiLoggerCacheMessage, LogLevel, TimestampFormat } from '../src/module.js';

const entry: AnsiLoggerCacheMessage = { level: LogLevel.INFO, time: '2026-10-15T12:00:00.000Z', name: 'Test', message: 'First' };

describe('AnsiLoggerCache', () => {
  test.each([0, 2, 3, 5])('should clear and reuse the original capacity when the buffer contains %s added messages', (count) => {
    const cache = new AnsiLoggerCache(3);
    for (let index = 0; index < count; index++) {
      cache.add({ ...entry, message: String(index) });
    }
    const snapshot = cache.get();
    cache.clear();
    cache.clear();
    expect(cache.get()).toEqual([]);
    const callback = vi.fn();
    cache.replay(callback);
    expect(callback).not.toHaveBeenCalled();
    expect(snapshot).toHaveLength(Math.min(count, 3));

    cache.add(entry);
    expect(cache.get()).toEqual([entry]);
    for (let index = 0; index < 4; index++) {
      cache.add({ ...entry, message: String(index) });
    }
    expect(cache.get()).toEqual([1, 2, 3].map((index) => ({ ...entry, message: String(index) })));
  });

  test('should return and replay no messages when empty', () => {
    const cache = new AnsiLoggerCache();
    const callback = vi.fn();
    expect(cache.get()).toEqual([]);
    cache.replay(callback);
    expect(callback).not.toHaveBeenCalled();
  });

  test.each([0, -1, 1.5, Number.NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1])('should reject invalid capacity %s when constructing', (capacity) => {
    expect(() => new AnsiLoggerCache(capacity)).toThrow(new RangeError('Cache capacity must be a positive safe integer.'));
  });

  test('should retain exactly the latest 200 messages when using default capacity', () => {
    const cache = new AnsiLoggerCache();
    for (let index = 0; index < 405; index++) {
      cache.add({ ...entry, message: String(index) });
    }
    expect(cache.get()).toEqual(Array.from({ length: 200 }, (_, index) => ({ ...entry, message: String(index + 205) })));
  });

  test('should return chronological messages when partially full, full and wrapped repeatedly', () => {
    const cache = new AnsiLoggerCache(3);
    for (let index = 0; index < 8; index++) {
      cache.add({ ...entry, message: String(index) });
      expect(cache.get().map((message) => message.message)).toEqual(Array.from({ length: Math.min(index + 1, 3) }, (_, offset) => String(Math.max(0, index - 2) + offset)));
    }
  });

  test('should overwrite the only entry when capacity is one', () => {
    const cache = new AnsiLoggerCache(1);
    cache.add(entry);
    cache.add({ ...entry, message: 'Second' });
    expect(cache.get()).toEqual([{ ...entry, message: 'Second' }]);
  });

  test('should protect retained messages when inputs or snapshots are mutated', () => {
    const cache = new AnsiLoggerCache();
    const input = { ...entry };
    cache.add(input);
    input.message = 'Changed input';
    const snapshot = cache.get();
    snapshot[0].message = 'Changed snapshot';
    snapshot.pop();
    expect(cache.get()).toEqual([entry]);
  });

  test('should replay an independent ordered snapshot when the callback adds messages', () => {
    const cache = new AnsiLoggerCache(2);
    cache.add(entry);
    cache.add({ ...entry, message: 'Second' });
    const replayed: AnsiLoggerCacheMessage[] = [];
    cache.replay((message) => {
      replayed.push({ ...message });
      message.message = 'Changed replay';
      cache.add({ ...entry, message: 'Added during replay' });
    });
    expect(replayed).toEqual([entry, { ...entry, message: 'Second' }]);
    expect(cache.get()).toEqual(Array.from({ length: 2 }, () => ({ ...entry, message: 'Added during replay' })));
  });

  test('should preserve messages and propagate errors when replay callback throws', () => {
    const cache = new AnsiLoggerCache();
    cache.add(entry);
    const callback = vi.fn();
    cache.replay(callback);
    cache.replay(callback);
    expect(callback.mock.calls).toEqual([[entry], [entry]]);
    const error = new Error('Replay failed');
    expect(() =>
      cache.replay(() => {
        throw error;
      }),
    ).toThrow(error);
    expect(cache.get()).toEqual([entry]);
  });
});

describe('AnsiLogger global cache', () => {
  beforeEach(() => {
    vi.stubGlobal('__AnsiLoggerCache__', undefined);
    vi.stubGlobal('__AnsiLoggerCallback__', undefined);
    vi.stubGlobal('__AnsiLoggerCallbackLoglevel__', undefined);
    vi.stubGlobal('__AnsiLoggerFilePath__', undefined);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.useFakeTimers();
    vi.setSystemTime(new Date(entry.time));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('should initialize the cache global as disabled when importing without an existing global', async () => {
    Reflect.deleteProperty(globalThis, '__AnsiLoggerCache__');
    expect(Object.hasOwn(globalThis, '__AnsiLoggerCache__')).toBe(false);
    vi.resetModules();

    await import('../src/logger.js');

    expect(Object.hasOwn(globalThis, '__AnsiLoggerCache__')).toBe(true);
    expect(globalThis.__AnsiLoggerCache__).toBeUndefined();
  });

  test('should preserve an existing cache and its messages when reimporting the logger', async () => {
    const cache = new AnsiLoggerCache();
    cache.add(entry);
    globalThis.__AnsiLoggerCache__ = cache;
    vi.resetModules();

    const { AnsiLogger: ReloadedAnsiLogger } = await import('../src/logger.js');

    expect(globalThis.__AnsiLoggerCache__).toBe(cache);
    expect(cache.get()).toEqual([entry]);
    const logger = new ReloadedAnsiLogger({ logName: entry.name, logTimestampFormat: TimestampFormat.ISO });
    logger.info('After reimport');
    expect(cache.get()).toEqual([entry, { ...entry, message: 'After reimport' }]);
  });

  test('should return the current global cache when configured through the static API or directly', () => {
    expect(AnsiLogger.getGlobalCache()).toBeUndefined();
    const first = new AnsiLoggerCache();
    first.add(entry);
    expect(AnsiLogger.setGlobalCache(first)).toBe(first);
    expect(AnsiLogger.getGlobalCache()).toBe(first);
    expect(globalThis.__AnsiLoggerCache__).toBe(first);

    const second = new AnsiLoggerCache(1);
    expect(AnsiLogger.setGlobalCache(second)).toBe(second);
    expect(AnsiLogger.getGlobalCache()).toBe(second);
    expect(first.get()).toEqual([entry]);
    expect(second.get()).toEqual([]);

    globalThis.__AnsiLoggerCache__ = first;
    expect(AnsiLogger.getGlobalCache()).toBe(first);
    expect(AnsiLogger.setGlobalCache(undefined)).toBeUndefined();
    expect(AnsiLogger.getGlobalCache()).toBeUndefined();
    expect(globalThis.__AnsiLoggerCache__).toBeUndefined();
    expect(first.get()).toEqual([entry]);
  });

  test('should preserve normal logging when caching is disabled or enabled after logger creation', () => {
    const logger = new AnsiLogger({ logName: entry.name, logWithColors: false, logTimestampFormat: TimestampFormat.ISO });
    logger.info('Before');
    const cache = new AnsiLoggerCache();
    AnsiLogger.setGlobalCache(cache);
    logger.info(entry.message);
    AnsiLogger.setGlobalCache(undefined);
    logger.info('After');
    expect(cache.get()).toEqual([entry]);
    expect(console.log).toHaveBeenCalledTimes(3);
    expect(console.log).toHaveBeenNthCalledWith(2, `[${entry.time}] [Test] [info] First`);
  });

  test('should continue caching when the active global cache is cleared', () => {
    const cache = new AnsiLoggerCache();
    AnsiLogger.setGlobalCache(cache);
    const logger = new AnsiLogger({ logName: entry.name, logTimestampFormat: TimestampFormat.ISO });
    logger.info('Before clear');
    cache.clear();
    expect(AnsiLogger.getGlobalCache()).toBe(cache);
    expect(cache.get()).toEqual([]);
    logger.info(entry.message);
    expect(cache.get()).toEqual([entry]);
  });

  test('should cache allowed levels from multiple loggers when sharing a cache', () => {
    const cache = new AnsiLoggerCache();
    globalThis.__AnsiLoggerCache__ = cache;
    const logger = new AnsiLogger({ logName: 'Debug', logLevel: LogLevel.DEBUG, logTimestampFormat: TimestampFormat.ISO });
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.NOTICE, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    for (const level of levels) logger.log(level, level);
    const warnings = new AnsiLogger({ logName: 'Warnings', logLevel: LogLevel.WARN, logTimestampFormat: TimestampFormat.ISO });
    warnings.info('Filtered');
    warnings.warn('Retained');
    warnings.log(LogLevel.NONE, 'Ignored');
    warnings.logLevel = LogLevel.NONE;
    warnings.fatal('Disabled');
    expect(cache.get()).toEqual([
      ...levels.map((level) => ({ ...entry, level, name: 'Debug', message: level })),
      { ...entry, level: LogLevel.WARN, name: 'Warnings', message: 'Retained' },
    ]);
  });

  test('should preserve callback and external output when caching messages with parameters', () => {
    const cache = new AnsiLoggerCache();
    globalThis.__AnsiLoggerCache__ = cache;
    const external = { debug: vi.fn(), info: vi.fn(), notice: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn(), log: vi.fn() };
    const logger = new AnsiLogger({ extLog: external, logName: entry.name, logTimestampFormat: TimestampFormat.ISO });
    const localCallback = vi.fn();
    const globalCallback = vi.fn();
    logger.setCallback(localCallback);
    globalThis.__AnsiLoggerCallback__ = globalCallback;
    globalThis.__AnsiLoggerCallbackLoglevel__ = LogLevel.INFO;
    const message = '\u001b[31mFirst\u001b[0m';
    logger.info(message, 'parameter', 42, null, undefined);
    expect(cache.get()).toEqual([{ ...entry, message: `${message} parameter 42  ` }]);
    expect(external.log).toHaveBeenCalledExactlyOnceWith(LogLevel.INFO, message, 'parameter', 42, null, undefined);
    expect(localCallback).toHaveBeenCalledExactlyOnceWith(LogLevel.INFO, entry.time, entry.name, `${message} parameter 42  `);
    expect(globalCallback).toHaveBeenCalledExactlyOnceWith(LogLevel.INFO, entry.time, entry.name, `${message} parameter 42  `);
  });

  test('should report cache errors and continue output when a parameter cannot be converted', () => {
    const cache = new AnsiLoggerCache();
    globalThis.__AnsiLoggerCache__ = cache;
    const logger = new AnsiLogger({});
    const error = new Error('Cannot stringify');
    const parameter = {
      toString(): string {
        throw error;
      },
    };
    logger.info('Message', parameter);
    expect(cache.get()).toEqual([]);
    expect(console.error).toHaveBeenCalledExactlyOnceWith('Error caching log message:', error);
    expect(console.log).toHaveBeenCalledTimes(1);
  });
});
