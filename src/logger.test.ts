// logger.test.ts

/* eslint-disable no-console */

jest.unstable_mockModule('node:fs', () => {
  const originalModule = jest.requireActual<typeof import('node:fs')>('node:fs');
  return {
    ...originalModule,

    unlinkSync: jest.fn<typeof unlinkSync>((path: PathLike) => {
      return originalModule.unlinkSync(path);
    }),
    appendFileSync: jest.fn((path: PathOrFileDescriptor, data: string | Uint8Array, options?: WriteFileOptions) => {
      return originalModule.appendFileSync(path, data, options);
    }),
  };
});
const { existsSync, appendFileSync, writeFileSync, unlinkSync } = await import('node:fs');

import path from 'node:path';
import { type PathLike, type PathOrFileDescriptor, type WriteFileOptions } from 'node:fs';

import { jest } from '@jest/globals';

const { AnsiLogger, db, er, ft, LogLevel, nf, nt, rs, TimestampFormat, wr } = await import('./logger.ts');
import type { AnsiLoggerCallback, Logger } from './logger.ts';
import { debugStringify } from './stringify.ts';

// Mocking console.log to test logging output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
let consoleOutput: any[] = [];
let consoleError: any[] = [];
const mockedLog = (...output: any[]) => consoleOutput.push(output);
const mockedError = (...output: any[]) => consoleError.push(output);

beforeAll(() => {
  console.log = mockedLog;
  console.error = mockedError;
});

afterEach(() => {
  consoleOutput = [];
  consoleError = [];
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('AnsiLogger', () => {
  it('should name the logger', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger' });
    expect(logger.logName).toBe('TestLogger');
  });

  it('should have the default name', () => {
    const logger = new AnsiLogger({});
    expect(logger.logName).toBe('NodeAnsiLogger');
  });

  it('should return now', () => {
    const logger = new AnsiLogger({});
    expect(logger.now()).toBeDefined();
    expect(typeof logger.now()).toBe('string');
  });

  it('should not log a debug message when debug is enabled and logLevel is higher', () => {
    const logger = new AnsiLogger({ logDebug: true, logLevel: LogLevel.INFO });
    expect(logger.logLevel).toBe(LogLevel.INFO);
    expect(logger.logWithColors).toBe(true);
    const color = logger.logNameColor;
    expect(color).toBeDefined();
    logger.logNameColor = 'color';
    expect(logger.logNameColor).toBe('color');
  });

  it('should log a debug message when debug is enabled', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logDebug: true, logWithColors: false });
    expect(logger.logLevel).toBe(LogLevel.DEBUG);
    expect(logger.logWithColors).toBe(false);
    logger.debug('Test debug message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect(consoleOutput[0][0]).toMatch(/\[debug\]/);
    expect(consoleOutput[0][0]).toMatch(/Test debug message/);
  });

  it('should not log a debug message when debug is disabled', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logDebug: false, logWithColors: false });
    expect(logger.logLevel).toBe(LogLevel.INFO);
    expect(logger.logName).toBe('TestLogger');
    expect(logger.logWithColors).toBe(false);
    logger.debug('Test debug message');
    expect(consoleOutput.length).toBe(0);
  });

  it('should log an info message with all logTimestampFormat', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logLevel: LogLevel.DEBUG, logWithColors: false, logTimestampFormat: TimestampFormat.LOCAL_DATE });
    (logger as any)._logTimestampFormat = TimestampFormat.LOCAL_DATE;
    logger.debug('Test info message');
    (logger as any)._logTimestampFormat = TimestampFormat.LOCAL_TIME;
    logger.info('Test info message');
    (logger as any)._logTimestampFormat = TimestampFormat.HOMEBRIDGE;
    logger.notice('Test info message');
    (logger as any)._logTimestampFormat = TimestampFormat.LOCAL_DATE_TIME;
    logger.warn('Test info message');
    (logger as any)._logTimestampFormat = TimestampFormat.ISO;
    logger.error('Test info message');
    (logger as any)._logTimestampFormat = TimestampFormat.TIME_MILLIS;
    logger.fatal('Test info message');
    (logger as any)._logTimestampFormat = TimestampFormat.CUSTOM;
    logger.info('Test info message');
    (logger as any)._logTimestampFormat = 1000;
    logger.info('Test info message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
  });

  it('should log an info message', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logWithColors: false, logTimestampFormat: TimestampFormat.LOCAL_DATE });
    logger.info('Test info message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect(consoleOutput[0][0]).toMatch(/\[info\]/);
    expect(consoleOutput[0][0]).toMatch(/Test info message/);
  });

  it('should log an notice message', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logWithColors: false, logTimestampFormat: TimestampFormat.LOCAL_TIME });
    logger.logLevel = LogLevel.DEBUG;
    logger.notice('Test notice message');
    logger.logLevel = LogLevel.INFO;
    logger.notice('Test notice message');
    logger.logLevel = LogLevel.NOTICE;
    logger.notice('Test notice message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect(consoleOutput[0][0]).toMatch(/\[notice\]/);
    expect(consoleOutput[0][0]).toMatch(/Test notice message/);
  });

  it('should log an warn message', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logWithColors: false, logTimestampFormat: TimestampFormat.LOCAL_DATE_TIME });
    logger.logLevel = LogLevel.DEBUG;
    logger.warn('Test warn message');
    logger.logLevel = LogLevel.INFO;
    logger.warn('Test warn message');
    logger.logLevel = LogLevel.NOTICE;
    logger.warn('Test warn message');
    logger.logLevel = LogLevel.WARN;
    logger.warn('Test warn message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect(consoleOutput[0][0]).toMatch(/\[warn\]/);
    expect(consoleOutput[0][0]).toMatch(/Test warn message/);
  });

  it('should log an error message', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logWithColors: false, logTimestampFormat: TimestampFormat.ISO });
    logger.logLevel = LogLevel.DEBUG;
    logger.error('Test error message');
    logger.logLevel = LogLevel.INFO;
    logger.error('Test error message');
    logger.logLevel = LogLevel.NOTICE;
    logger.error('Test error message');
    logger.logLevel = LogLevel.WARN;
    logger.error('Test error message');
    logger.logLevel = LogLevel.ERROR;
    logger.error('Test error message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect(consoleOutput[0][0]).toMatch(/\[error\]/);
    expect(consoleOutput[0][0]).toMatch(/Test error message/);
  });

  it('should log a fatal message', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logWithColors: false, logTimestampFormat: TimestampFormat.TIME_MILLIS });
    logger.logLevel = LogLevel.DEBUG;
    logger.fatal('Test fatal message');
    logger.logLevel = LogLevel.INFO;
    logger.fatal('Test fatal message');
    logger.logLevel = LogLevel.NOTICE;
    logger.fatal('Test fatal message');
    logger.logLevel = LogLevel.WARN;
    logger.fatal('Test fatal message');
    logger.logLevel = LogLevel.ERROR;
    logger.fatal('Test fatal message');
    logger.logLevel = LogLevel.FATAL;
    logger.fatal('Test fatal message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect(consoleOutput[0][0]).toMatch(/\[fatal\]/);
    expect(consoleOutput[0][0]).toMatch(/Test fatal message/);
  });

  it('should respect log level settings', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logWithColors: false, logTimestampFormat: TimestampFormat.CUSTOM, logCustomTimestampFormat: 'yyyyMMddHHmmss' });
    logger.logName = 'TestLoggerABC';
    expect(logger.logName).toBe('TestLoggerABC');
    logger.log(LogLevel.WARN, 'Test warn message');
    expect(consoleOutput[0][0]).toMatch(/TestLoggerABC/);
    expect(consoleOutput[0][0]).toMatch(/\[warn\]/);
    expect(consoleOutput[0][0]).toMatch(/Test warn message/);
  });

  it('should log a debug message with colors when debug is enabled', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logDebug: true });
    logger.logName = 'TestLoggerABC';
    expect(logger.logName).toBe('TestLoggerABC');
    logger.debug('Test debug message');
    expect(consoleOutput[0][0]).toMatch(/TestLoggerABC/);
    expect((consoleOutput[0][0] as string).includes(db)).toBeTruthy();
    expect(consoleOutput[0][1]).toMatch(/Test debug message/);
  });

  it('should log a debug message with colors when debug is enabled with stars', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logDebug: true });
    logger.logName = 'TestLoggerABC';
    expect(logger.logName).toBe('TestLoggerABC');
    logger.debug('Test debug message');
    expect(consoleOutput[0][0]).toMatch(/TestLoggerABC/);
    expect((consoleOutput[0][0] as string).includes(db)).toBeTruthy();
    expect(consoleOutput[0][1]).toMatch(/Test debug message/);
    logger.info('*Test info message with *');
    logger.info('**Test info message with **');
    logger.info('***Test info message with ***');
    logger.info('****Test info message with ****');
  });

  it('should not log a debug message with colors when debug is not enabled', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logDebug: false });
    logger.debug('Test debug message');
    expect(consoleOutput.length).toBe(0);
  });

  it('should log a debug message with colors when level is debug', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logLevel: LogLevel.DEBUG });
    logger.logWithColors = true;
    expect(logger.logWithColors).toBe(true);
    logger.logCustomTimestampFormat = 'yyyyMMddHHmmss';
    expect(logger.logCustomTimestampFormat).toBe('yyyyMMddHHmmss');
    logger.logTimestampFormat = TimestampFormat.CUSTOM;
    expect(logger.logTimestampFormat).toBe(TimestampFormat.CUSTOM);
    logger.debug('Test debug message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect((consoleOutput[0][0] as string).includes(db)).toBeTruthy();
    expect(consoleOutput[0][1]).toMatch(/Test debug message/);
  });

  it('should not log a debug message with colors when level is not debug', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logLevel: LogLevel.INFO });
    logger.debug('Test debug message');
    expect(consoleOutput.length).toBe(0);
  });

  it('should not log a debug message with colors when level is none', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logLevel: LogLevel.NONE });
    expect(logger.logLevel).toBe(LogLevel.NONE);
    expect((logger as any).shouldLog(LogLevel.NONE)).toBe(false);
    expect((logger as any).shouldLog(LogLevel.DEBUG)).toBe(false);
    expect((logger as any).shouldLog('xyz' as any)).toBe(false);
    expect((logger as any).shouldLog(LogLevel.FATAL)).toBe(false);
    logger.debug('Test debug message');
    expect(consoleOutput.length).toBe(0);
  });

  it('should not log a messages with colors when level higher', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logLevel: LogLevel.NONE });
    expect(logger.logLevel).toBe(LogLevel.NONE);
    logger.debug('Test debug message');
    expect(consoleOutput.length).toBe(0);
    consoleOutput = [];
    logger.logLevel = LogLevel.INFO;
    logger.debug('Test debug message');
    expect(consoleOutput.length).toBe(0);
    logger.logLevel = LogLevel.NOTICE;
    logger.info('Test info message');
    expect(consoleOutput.length).toBe(0);
    logger.logLevel = LogLevel.WARN;
    logger.notice('Test notice message');
    expect(consoleOutput.length).toBe(0);
    logger.logLevel = LogLevel.ERROR;
    logger.warn('Test warn message');
    expect(consoleOutput.length).toBe(0);
    logger.logLevel = LogLevel.FATAL;
    logger.error('Test error message');
    expect(consoleOutput.length).toBe(0);
  });

  it('should log a info message with colors', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logLevel: LogLevel.DEBUG });
    logger.info('Test info message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect((consoleOutput[0][0] as string).includes(nf)).toBeTruthy();
    expect(consoleOutput[0][1]).toMatch(/Test info message/);
  });
  it('should log a notice message with colors', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logLevel: LogLevel.DEBUG });
    logger.notice('Test notice message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect((consoleOutput[0][0] as string).includes(nt)).toBeTruthy();
    expect(consoleOutput[0][1]).toMatch(/Test notice message/);
  });
  it('should log a warn message with colors', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logLevel: LogLevel.DEBUG });
    logger.warn('Test warn message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect((consoleOutput[0][0] as string).includes(wr)).toBeTruthy();
    expect(consoleOutput[0][1]).toMatch(/Test warn message/);
  });
  it('should log a error message with colors', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logLevel: LogLevel.DEBUG });
    logger.error('Test error message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect((consoleOutput[0][0] as string).includes(er)).toBeTruthy();
    expect(consoleOutput[0][1]).toMatch(/Test error message/);
  });
  it('should log a fatal message with colors', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logLevel: LogLevel.DEBUG });
    logger.fatal('Test fatal message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect((consoleOutput[0][0] as string).includes(ft)).toBeTruthy();
    expect(consoleOutput[0][1]).toMatch(/Test fatal message/);
  });
  it('should not log a none message with colors', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logLevel: LogLevel.DEBUG });
    logger.log(LogLevel.NONE, 'Test none message');
    expect(consoleOutput).toHaveLength(0);
  });
  it('should not log a none message without colors', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logLevel: LogLevel.DEBUG, logWithColors: false });
    logger.log(LogLevel.NONE, 'Test none message');
    expect(consoleOutput).toHaveLength(0);
  });
  it('should log timer with colors', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logLevel: LogLevel.DEBUG });
    logger.fatal('Test fatal message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect((consoleOutput[0][0] as string).includes(ft)).toBeTruthy();
    expect(consoleOutput[0][1]).toMatch(/Test fatal message/);

    expect((logger as any).logStartTime).toBe(0);
    logger.startTimer('Test timer');
    expect((logger as any).logStartTime).not.toBe(0);
    logger.stopTimer('Test timer');
    expect((logger as any).logStartTime).toBe(0);
  });
});

describe('AnsiLogger external logger', () => {
  it('should name the logger', () => {
    const extLogger = {
      log: (level: string, message: string, parameters: string) => {
        console.log(`${level} ${message} ${parameters}`);
      },
    };
    const logger = new AnsiLogger({ logName: 'TestLogger', extLog: extLogger as Logger });
    logger.info('Test info message');
    expect(logger.logName).toBe('TestLogger');
  });
});

describe('Logger callbacks', () => {
  let originalLocalCallback: AnsiLoggerCallback | undefined;
  let originalGlobalCallback: AnsiLoggerCallback | undefined;

  beforeEach(() => {
    // Reset global.__AnsiLoggerCallback__ before each test
    // global.__AnsiLoggerCallback__ = originalGlobalCallback;
  });

  afterEach(() => {
    // Clean up and restore any global changes
    // global.__AnsiLoggerCallback__ = originalGlobalCallback;
  });

  test('should initialize without global callback', () => {
    expect(AnsiLogger.getGlobalCallback()).toBeUndefined();
  });

  test('should initialize without global callback level', () => {
    expect(AnsiLogger.getGlobalCallbackLevel()).toBe(undefined);
  });

  test('calls instance-specific callback with correct parameters', () => {
    const mockCallback = jest.fn();
    const logger = new AnsiLogger({ logName: 'TestLogger callback' });
    originalLocalCallback = logger.getCallback();
    expect(originalLocalCallback).toBeUndefined();
    logger.setCallback(mockCallback);
    expect(logger.getCallback()).toBe(mockCallback);
    const message = 'test message';
    const level = LogLevel.INFO;
    const parameters = ['param1', 'param2'];
    logger.log(level, message, ...parameters);
    expect(mockCallback).toHaveBeenCalledWith(level, expect.any(String), logger.logName, `${message} ${parameters.join(' ')}`);
    logger.setCallback(originalLocalCallback);
  });

  test('calls global callback with correct parameters when instance-specific callback is not set', () => {
    const mockCallback = jest.fn();
    const logger = new AnsiLogger({ logName: 'TestLogger1 callback' });
    originalGlobalCallback = AnsiLogger.getGlobalCallback();
    expect(originalGlobalCallback).toBeUndefined();
    AnsiLogger.setGlobalCallback(mockCallback);
    expect(AnsiLogger.getGlobalCallback()).toBe(mockCallback);
    const message = 'test message';
    const level = LogLevel.INFO;
    const parameters = ['param1', 'param2'];
    logger.log(level, message, ...parameters);
    expect(mockCallback).toHaveBeenCalledWith(level, expect.any(String), logger.logName, `${message} ${parameters.join(' ')}`);

    const logger2 = new AnsiLogger({ logName: 'TestLogger2 callback' });
    logger2.log(LogLevel.NOTICE, 'Logger2 message');
    expect(AnsiLogger.getGlobalCallback()).toBe(mockCallback);

    AnsiLogger.setGlobalCallback(originalGlobalCallback);
  });
});

describe('Global file logger', () => {
  let originalFilelog: string | undefined;

  beforeAll(() => {
    originalFilelog = AnsiLogger.getGlobalLogfile();
  });

  beforeEach(() => {
    //
  });

  afterEach(() => {
    //
  });

  afterAll(() => {
    AnsiLogger.setGlobalLogfile(originalFilelog);
  });

  test('should initialize without file logger', () => {
    expect(AnsiLogger.getGlobalLogfile()).toBeUndefined();
  });

  test('should initialize without file logger level', () => {
    expect(AnsiLogger.getGlobalLogfileLevel()).toBe(undefined);
  });

  test('should set the file logger', () => {
    expect(AnsiLogger.setGlobalLogfile('test-global.log')).toBe(path.resolve('test-global.log'));
  });

  test('should set and unlink the file logger', () => {
    expect(AnsiLogger.setGlobalLogfile('test-global.log', LogLevel.DEBUG, true)).toBe(path.resolve('test-global.log'));
    expect(AnsiLogger.getGlobalLogfileLevel()).toBe(LogLevel.DEBUG);
    expect(existsSync('test-global.log')).toBe(false);
  });

  test('should get the file logger', () => {
    expect(AnsiLogger.getGlobalLogfile()).toBe(path.resolve('test-global.log'));
  });

  test('should get the file logger level', () => {
    expect(AnsiLogger.getGlobalCallbackLevel()).toBe(LogLevel.DEBUG);
  });

  test('should set the file logger level', () => {
    expect(AnsiLogger.setGlobalCallbackLevel(LogLevel.INFO)).toBe(LogLevel.INFO);
    expect(AnsiLogger.getGlobalCallbackLevel()).toBe(LogLevel.INFO);
  });

  test('should log to the file logger', () => {
    expect(AnsiLogger.setGlobalLogfile('test-global.log')).toBe(path.resolve('test-global.log'));
    expect(existsSync('test-global.log')).toBe(false);
    const logger = new AnsiLogger({ logName: 'Test global file logger' });
    logger.debug('Test debug message');
    logger.info('Test info message');
    logger.notice('Test notice message');
    logger.warn('Test warn message');
    logger.error('Test error message');
    logger.fatal('Test fatal message');
    expect(existsSync('test-global.log')).toBe(true);
    expect(AnsiLogger.setGlobalLogfile('test-global.log', LogLevel.DEBUG, true)).toBe(path.resolve('test-global.log'));
    expect(AnsiLogger.setGlobalLogfileLevel(LogLevel.DEBUG)).toBe(LogLevel.DEBUG);
    expect(existsSync('test-global.log')).toBe(false);
  });

  test('should log to the file logger with a max file size', () => {
    expect(AnsiLogger.setGlobalLogfile('test-global.log')).toBe(path.resolve('test-global.log'));
    expect(existsSync('test-global.log')).toBe(false);
    const logger = new AnsiLogger({ logName: 'Test global file logger' });
    logger.maxFileSize = 100;
    logger.debug('Test debug message');
    logger.info('Test info message');
    logger.notice('Test notice message');
    logger.warn('Test warn message');
    logger.error('Test error message');
    logger.fatal('Test fatal message');
    expect(existsSync('test-global.log')).toBe(true);
    expect(AnsiLogger.setGlobalLogfile('test-global.log', LogLevel.DEBUG, true)).toBe(path.resolve('test-global.log'));
    expect(AnsiLogger.setGlobalLogfileLevel(LogLevel.DEBUG)).toBe(LogLevel.DEBUG);
    expect(existsSync('test-global.log')).toBe(false);
  });

  test('should log to the file logger different types', () => {
    const logger = new AnsiLogger({ logName: 'Test global file logger' });
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
    expect(existsSync('test-global.log')).toBe(true);
  });

  test('setGlobalLogfile should fail', () => {
    (unlinkSync as jest.Mocked<typeof unlinkSync>).mockImplementationOnce((path: PathLike) => {
      throw new Error('Test error unlinking the log file');
    });
    writeFileSync('test-error.log', 'Test log file content');
    const file = AnsiLogger.setGlobalLogfile('test-error.log', undefined, true);
    expect(file).toContain('test-error.log');
    unlinkSync('test-error.log');
  });

  test('GlobalCallback should fail', () => {
    const spy = jest.spyOn(console, 'error');

    AnsiLogger.setGlobalLogfile('test-error.log', LogLevel.DEBUG, true);
    AnsiLogger.setGlobalCallbackLevel(LogLevel.DEBUG);
    AnsiLogger.setGlobalCallbackLevel();
    expect(AnsiLogger.getGlobalCallbackLevel()).toBe(LogLevel.DEBUG);
    AnsiLogger.setGlobalCallback(() => {
      throw new Error('Test error in global callback');
    });
    const logger = new AnsiLogger({ logName: 'Test global file logger' });
    logger.setCallback(() => {
      throw new Error('Test error in local callback');
    });

    const mock = jest.spyOn(AnsiLogger.prototype as any, 'logToFile').mockImplementation(() => {
      throw new Error('Test error in logToFile');
    });
    logger.logFilePath = 'test-error.log';
    logger.fatal('Test fatal message');

    expect(spy).toHaveBeenCalledTimes(4);
    AnsiLogger.setGlobalCallbackLevel(LogLevel.DEBUG);
    AnsiLogger.setGlobalCallback(undefined);
    mock.mockRestore();
  });
});

describe('Local file logger', () => {
  beforeAll(() => {
    //
  });

  beforeEach(() => {
    jest.clearAllMocks();
    try {
      unlinkSync('test-local.log');
    } catch (error) {
      // console.error(`${er}Error unlinking the log file: ${error instanceof Error ? error.message : error}`);
    }
  });

  afterEach(() => {
    //
  });

  afterAll(() => {
    //
  });

  test('should set the log file', () => {
    const logger = new AnsiLogger({ logName: 'Test local file logger', logLevel: LogLevel.DEBUG });
    logger.logFilePath = '';
    expect(logger.logFilePath).toBe(undefined);
    logger.logFilePath = undefined;
    expect(logger.logFilePath).toBe(undefined);
    logger.logFilePath = 1 as unknown as string;
    expect(logger.logFilePath).toBe(undefined);

    jest.spyOn(path, 'resolve').mockImplementationOnce(() => {
      throw new Error('Test error');
    });
    const spy = jest.spyOn(console, 'error').mockImplementationOnce(() => {
      //
    });
    logger.logFilePath = 'test-local.log';
    expect(logger.logFilePath).toBe(undefined);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(logger.logFilePath).toBe(undefined);
  });

  test('should set the max file size', () => {
    const logger = new AnsiLogger({ logName: 'Test local file logger', logLevel: LogLevel.DEBUG });
    logger.logFilePath = 'test-local.log';
    expect(existsSync('test-local.log')).toBe(false);
    logger.maxFileSize = 1024 * 800 * 1000; // 800 MB
    expect(logger.maxFileSize).toBe(500000000); // 500 MB
    logger.maxFileSize = 1024 * 200 * 1000; // 200 MB
    expect(logger.maxFileSize).toBe(204800000); // 200 MB
    logger.maxFileSize = 1024 * 100 * 1000; // 100 MB
    expect(logger.maxFileSize).toBe(102400000); // 100 MB
    logger.maxFileSize = 1024 * 100; // 100 KB
    expect(logger.maxFileSize).toBe(102400); // 100 KB
    logger.maxFileSize = 100;
    expect(logger.maxFileSize).toBe(100);
    logger.debug('Test debug message');
    logger.info('Test info message');
    logger.notice('Test notice message');
    logger.warn('Test warn message');
    logger.error('Test error message');
    logger.fatal('Test fatal message');
  });

  test('should log to the local file logger', () => {
    const logger = new AnsiLogger({ logName: 'Test local file logger', logLevel: LogLevel.DEBUG });
    logger.logFilePath = 'test-local.log';
    expect(existsSync('test-local.log')).toBe(false);
    logger.debug('Test debug message');
    logger.info('Test info message');
    logger.notice('Test notice message');
    logger.warn('Test warn message');
    logger.error('Test error message');
    logger.fatal('Test fatal message');
    expect(existsSync('test-local.log')).toBe(true);
    logger.logFilePath = 'test-local.log';
    expect(existsSync('test-local.log')).toBe(false);
  });

  test('should log to the local file logger with params', () => {
    const logger = new AnsiLogger({ logName: 'Test local file logger', logLevel: LogLevel.DEBUG });
    logger.logFilePath = 'test-local.log';
    expect(existsSync('test-local.log')).toBe(false);
    logger.debug('Test debug message', { a: 1, b: 2 });
    logger.info('Test info message', 'Text', 123, 212121111111111122121n, true, null, undefined);
    logger.notice('Test notice message', '123', undefined, 'Text', 123, 212121111111111122121n, true, null, undefined);
    logger.warn('Test warn message');
    logger.error('Test error message');
    logger.fatal('Test fatal message');
    expect(existsSync('test-local.log')).toBe(true);
    logger.logFilePath = 'test-local.log';
    expect(existsSync('test-local.log')).toBe(false);
    logger.log(0 as any, 'Test fatal message');
  });

  test('should log to the local file logger different types', () => {
    const logger = new AnsiLogger({ logName: 'Test local file logger', logLevel: LogLevel.DEBUG });
    logger.logFilePath = 'test-local.log';
    expect(existsSync('test-local.log')).toBe(false);
    const obj: object = {
      logName: 'TestLogger',
      logLevel: LogLevel.DEBUG,
      logWithColors: true,
      logTimestampFormat: TimestampFormat.TIME_MILLIS,
    };
    logger.log(LogLevel.DEBUG, `Debug local message with 1 params: ${rs}\n`, obj);
    logger.log(LogLevel.DEBUG, `Debug local message with more params: ${rs}\n`, obj, 123, 212121111111111122121n, 'Text', true, null, undefined);
    logger.log(
      LogLevel.DEBUG,
      `Debug local message with more params and 1 array: ${rs}\n`,
      obj,
      [
        123,
        'abc',
        { a: 1, b: 2 },
        () => {
          console.log('test');
        },
      ],
      123,
      212121111111111122121n,
      'Text',
      true,
      null,
      undefined,
    );
    logger.log(LogLevel.DEBUG, `Debug message without params: ${debugStringify(obj)}`);
    expect(existsSync('test-local.log')).toBe(true);
  });

  test('logFilePath should fail', async () => {
    const logger = new AnsiLogger({ logName: 'Test local file logger', logLevel: LogLevel.DEBUG });
    logger.logFilePath = 123 as unknown as string;
    expect(logger.logFilePath).toBe(undefined);
    expect(logger.logFileSize).toBe(undefined);
    logger.logFilePath = undefined as unknown as string;
    expect(logger.logFilePath).toBe(undefined);
    expect(logger.logFileSize).toBe(undefined);
    logger.logFilePath = '';
    expect(logger.logFilePath).toBe(undefined);
    expect(logger.logFileSize).toBe(undefined);

    (logger as any)._logFilePath = 'xxx';
    (logger as any)._logFileSize = 123;
    expect(logger.logFileSize).toBe(123);
    (logger as any)._logFilePath = undefined;
    (logger as any)._logFileSize = undefined;

    logger.fatal('Test fatal message');
    expect(existsSync('test-local.log')).toBe(false);

    writeFileSync('test-error.log', 'Test log file content');
    (unlinkSync as jest.Mocked<typeof unlinkSync>).mockImplementationOnce((path: PathLike) => {
      throw new Error('Test error unlinking the log file');
    });
    logger.logFilePath = 'test-error.log';
    expect(existsSync('test-error.log')).toBe(true);
    unlinkSync('test-error.log');
  });

  test('should get the file size', () => {
    const logger = new AnsiLogger({ logName: 'Test local file logger', logLevel: LogLevel.DEBUG });
    logger.logFilePath = 'test-local.log';
    expect(existsSync('test-local.log')).toBe(false);
    logger.debug('Test debug message');
    logger.info('Test info message');
    logger.notice('Test notice message');
    logger.warn('Test warn message');
    logger.error('Test error message');
    logger.fatal('Test fatal message');
    const obj: object = {
      logName: 'TestLogger',
      logLevel: LogLevel.DEBUG,
      logWithColors: true,
      logTimestampFormat: TimestampFormat.TIME_MILLIS,
    };
    logger.log(LogLevel.DEBUG, `Debug local message with 1 params object: ${rs}\n`, obj);
    logger.log(LogLevel.DEBUG, `Debug local message with more params: ${rs}\n`, obj, 123, 212121111111111122121n, 'Text', true, null, undefined);
    logger.log(
      LogLevel.DEBUG,
      `Debug local message with more params and array: ${rs}\n`,
      {
        logName: 'TestLogger',
        logLevel: LogLevel.DEBUG,
        logWithColors: true,
        logTimestampFormat: TimestampFormat.TIME_MILLIS,
      },
      [
        123,
        'abc',
        { a: 1, b: 2 },
        () => {
          console.log('test');
        },
      ],
      () => {
        console.log('test');
      },
      123,
      212121111111111122121n,
      'Text',
      true,
      null,
      undefined,
    );
    // expect(logger.logFileSize).toBe(1182); // 1182 bytes on my PC
    expect(existsSync('test-local.log')).toBe(true);
  });
});
