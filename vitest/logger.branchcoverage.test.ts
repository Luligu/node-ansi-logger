import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { vi } from 'vitest';

import { AnsiLogger, LogLevel, TimestampFormat } from '../src/logger.js';

describe('Logger branch coverage', () => {
  const originalNoColor = process.env.NO_COLOR;
  const originalTsFormat = process.env.NODE_ANSI_LOGGER_TIMESTAMP_FORMAT;

  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy?.mockRestore();

    if (originalNoColor === undefined) delete process.env.NO_COLOR;
    else process.env.NO_COLOR = originalNoColor;

    if (originalTsFormat === undefined) delete process.env.NODE_ANSI_LOGGER_TIMESTAMP_FORMAT;
    else process.env.NODE_ANSI_LOGGER_TIMESTAMP_FORMAT = originalTsFormat;

    (globalThis as any).__AnsiLoggerCallback__ = undefined;
    (globalThis as any).__AnsiLoggerCallbackLoglevel__ = undefined;
    (globalThis as any).__AnsiLoggerFilePath__ = undefined;
    (globalThis as any).__AnsiLoggerFileLoglevel__ = undefined;
    (globalThis as any).__AnsiLoggerFileLogSize__ = undefined;
  });

  test('covers timestamp-format selection branches', () => {
    delete process.env.NODE_ANSI_LOGGER_TIMESTAMP_FORMAT;
    expect(() => new AnsiLogger({ logTimestampFormat: TimestampFormat.ISO })).not.toThrow();

    process.env.NODE_ANSI_LOGGER_TIMESTAMP_FORMAT = '1';
    expect(() => new AnsiLogger({})).not.toThrow();

    process.env.NODE_ANSI_LOGGER_TIMESTAMP_FORMAT = '99';
    expect(() => new AnsiLogger({})).not.toThrow();
  });

  test('covers logFileSize getter branches (undefined vs number)', () => {
    const logger = new AnsiLogger({ logLevel: LogLevel.DEBUG, logWithColors: false });

    expect(logger.logFileSize).toBeUndefined();

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'node-ansi-logger-'));
    const filePath = path.join(tempDir, 'test.log');

    logger.logFilePath = filePath;
    logger.log(LogLevel.INFO, 'hello');

    expect(typeof logger.logFileSize).toBe('number');
    expect((logger.logFileSize ?? 0) > 0).toBe(true);
  });

  test('covers stopTimer branch when timer was never started', () => {
    const logger = new AnsiLogger({ logLevel: LogLevel.DEBUG, logWithColors: false });
    expect(() => logger.stopTimer('nope')).not.toThrow();
  });

  test('covers extLog branch when level is NONE', () => {
    const extLog = { log: vi.fn<(level: string, message: string, ...parameters: unknown[]) => void>() };
    const logger = new AnsiLogger({ extLog: extLog as any, logWithColors: false, logLevel: LogLevel.DEBUG });

    logger.log(LogLevel.NONE, 'should not forward');
    expect(extLog.log).not.toHaveBeenCalled();
  });

  test('covers shouldLog false branch in colored path', () => {
    const logger = new AnsiLogger({ logWithColors: true, logLevel: LogLevel.INFO });

    logger.log(LogLevel.DEBUG, 'filtered');
    expect(consoleLogSpy).not.toHaveBeenCalled();

    logger.log(LogLevel.INFO, 'allowed');
    expect(consoleLogSpy).toHaveBeenCalled();
  });

  test('covers colored-path FATAL shouldLog branches', () => {
    const loggerNo = new AnsiLogger({ logWithColors: true, logLevel: LogLevel.NONE });
    loggerNo.log(LogLevel.FATAL, 'filtered');

    const loggerYes = new AnsiLogger({ logWithColors: true, logLevel: LogLevel.FATAL });
    loggerYes.log(LogLevel.FATAL, 'allowed');

    expect(consoleLogSpy).toHaveBeenCalled();
  });

  test('covers non-colored OR-filter branches (true + false)', () => {
    const loggerInfo = new AnsiLogger({ logWithColors: false, logLevel: LogLevel.WARN });
    loggerInfo.log(LogLevel.INFO, 'should not log');

    const loggerNotice = new AnsiLogger({ logWithColors: false, logLevel: LogLevel.WARN });
    loggerNotice.log(LogLevel.NOTICE, 'should not log');

    const loggerWarn = new AnsiLogger({ logWithColors: false, logLevel: LogLevel.ERROR });
    loggerWarn.log(LogLevel.WARN, 'should not log');

    const loggerError = new AnsiLogger({ logWithColors: false, logLevel: LogLevel.FATAL });
    loggerError.log(LogLevel.ERROR, 'should not log');

    const loggerFatal = new AnsiLogger({ logWithColors: false, logLevel: LogLevel.NONE });
    loggerFatal.log(LogLevel.FATAL, 'should not log');

    const loggerDebugAll = new AnsiLogger({ logWithColors: false, logLevel: LogLevel.DEBUG });
    loggerDebugAll.log(LogLevel.INFO, 'should log');

    expect(consoleLogSpy).toHaveBeenCalled();
  });

  test('covers file-size limit branches (local and global file logger)', () => {
    const huge = 'x'.repeat(1_050_000);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'node-ansi-logger-'));

    const localPath = path.join(tempDir, 'local.log');
    const globalPath = path.join(tempDir, 'global.log');

    const logger = new AnsiLogger({ logLevel: LogLevel.DEBUG, logWithColors: false, maxFileSize: 1_000_000 });

    logger.logFilePath = localPath;
    logger.log(LogLevel.INFO, 'huge', huge);

    (globalThis as any).__AnsiLoggerFilePath__ = globalPath;
    (globalThis as any).__AnsiLoggerFileLogSize__ = 0;
    (globalThis as any).__AnsiLoggerFileLoglevel__ = LogLevel.DEBUG;

    logger.log(LogLevel.INFO, 'huge', huge);

    expect(fs.existsSync(localPath)).toBe(true);
    expect(fs.existsSync(globalPath)).toBe(true);
  });

  test('covers module-global init branches (globals already defined)', async () => {
    (globalThis as any).__AnsiLoggerCallback__ = null;
    (globalThis as any).__AnsiLoggerCallbackLoglevel__ = null;
    (globalThis as any).__AnsiLoggerFilePath__ = null;
    (globalThis as any).__AnsiLoggerFileLoglevel__ = null;
    (globalThis as any).__AnsiLoggerFileLogSize__ = null;

    vi.resetModules();
    await import('../src/logger.js');

    expect((globalThis as any).__AnsiLoggerCallback__).toBeNull();
    expect((globalThis as any).__AnsiLoggerFilePath__).toBeNull();
  });
});
