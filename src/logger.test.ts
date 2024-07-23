// logger.test.ts
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnsiLogger, AnsiLoggerCallback, db, er, ft, LogLevel, nf, nt, TimestampFormat, wr } from './logger';
import { jest } from '@jest/globals';

// Mocking console.log to test logging output
const originalConsoleLog = console.log;
let consoleOutput: any[] = [];
const mockedLog = (...output: any[]) => consoleOutput.push(output);

beforeAll(() => {
  console.log = mockedLog;
});

afterEach(() => {
  consoleOutput = [];
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('AnsiLogger', () => {
  it('should log a debug message when debug is enabled', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logDebug: true, logWithColors: false });
    logger.debug('Test debug message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect(consoleOutput[0][0]).toMatch(/\[debug\]/);
    expect(consoleOutput[0][0]).toMatch(/Test debug message/);
  });

  it('should not log a debug message when debug is disabled', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logDebug: false, logWithColors: false });
    logger.debug('Test debug message');
    expect(consoleOutput.length).toBe(0);
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
    logger.notice('Test notice message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect(consoleOutput[0][0]).toMatch(/\[notice\]/);
    expect(consoleOutput[0][0]).toMatch(/Test notice message/);
  });

  it('should log an warn message', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logWithColors: false, logTimestampFormat: TimestampFormat.LOCAL_DATE_TIME });
    logger.warn('Test warn message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect(consoleOutput[0][0]).toMatch(/\[warn\]/);
    expect(consoleOutput[0][0]).toMatch(/Test warn message/);
  });

  it('should log an error message', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logWithColors: false, logTimestampFormat: TimestampFormat.ISO });
    logger.error('Test error message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect(consoleOutput[0][0]).toMatch(/\[error\]/);
    expect(consoleOutput[0][0]).toMatch(/Test error message/);
  });

  it('should log a fatal message', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logWithColors: false, logTimestampFormat: TimestampFormat.TIME_MILLIS });
    logger.fatal('Test fatal message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect(consoleOutput[0][0]).toMatch(/\[fatal\]/);
    expect(consoleOutput[0][0]).toMatch(/Test fatal message/);
  });

  it('should respect log level settings', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logWithColors: false, logTimestampFormat: TimestampFormat.CUSTOM, logCustomTimestampFormat: 'yyyyMMddHHmmss' });
    logger.setLogName('TestLoggerABC');
    logger.log(LogLevel.WARN, 'Test warn message');
    expect(consoleOutput[0][0]).toMatch(/TestLoggerABC/);
    expect(consoleOutput[0][0]).toMatch(/\[warn\]/);
    expect(consoleOutput[0][0]).toMatch(/Test warn message/);
  });

  it('should log a debug message with colors when debug is enabled', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logDebug: true });
    logger.logName = 'TestLoggerABC';
    expect(logger.logName).toBe('TestLoggerABC');
    logger.setLogName('TestLoggerABC');
    logger.debug('Test debug message');
    expect(consoleOutput[0][0]).toMatch(/TestLoggerABC/);
    expect((consoleOutput[0][0] as string).includes(db)).toBeTruthy();
    expect(consoleOutput[0][1]).toMatch(/Test debug message/);
  });

  it('should not log a debug message with colors when debug is not enabled', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logDebug: false });
    logger.debug('Test debug message');
    expect(consoleOutput.length).toBe(0);
  });

  it('should log a debug message with colors when level is debug', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logLevel: LogLevel.DEBUG });
    logger.setlogWithColors(true);
    logger.setLogCustomTimestampFormat('yyyyMMddHHmmss');
    logger.setLogTimestampFormat(TimestampFormat.CUSTOM);
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
    expect((logger as any).logDebug).toBe(false);
    logger.debug('Test debug message');
    expect(consoleOutput.length).toBe(0);
  });

  it('should not log a messages with colors when level higher', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logLevel: LogLevel.NONE });
    expect(logger.logLevel).toBe(LogLevel.NONE);
    expect((logger as any).logDebug).toBe(false);
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

describe('Logger callbacks', () => {
  let originalLocalCallback: AnsiLoggerCallback | undefined;
  let originalGlobalCallback: AnsiLoggerCallback | undefined;

  beforeEach(() => {
    // Reset global.__AnsiLoggerCallback__ before each test
    // global.__AnsiLoggerCallback__ = originalGlobalCallback;
  });

  test('calls instance-specific callback with correct parameters', () => {
    const mockCallback = jest.fn();
    const logger = new AnsiLogger({ logName: 'TestLogger callback' });
    originalLocalCallback = logger.getCallback();
    expect(originalLocalCallback).toBeUndefined();
    logger.setCallback(mockCallback);
    expect(logger.getCallback()).toBe(mockCallback);
    const message = 'test message';
    const level = LogLevel.INFO; // Assuming LogLevel is an enum or similar for log levels
    const parameters = ['param1', 'param2'];
    logger.log(level, message, ...parameters); // Assuming the method to log is named 'log'
    expect(mockCallback).toHaveBeenCalledWith(level, expect.any(String), logger.logName, `${message} ${parameters.join(' ')}`);
    logger.setCallback(originalLocalCallback);
  });

  test('calls global callback with correct parameters when instance-specific callback is not set', () => {
    const mockCallback = jest.fn();
    const logger = new AnsiLogger({ logName: 'TestLogger callback' });
    originalGlobalCallback = logger.getGlobalCallback();
    expect(originalGlobalCallback).toBeUndefined();
    logger.setGlobalCallback(mockCallback);
    expect(logger.getGlobalCallback()).toBe(mockCallback);
    const message = 'test message';
    const level = LogLevel.INFO; // Assuming LogLevel is an enum or similar for log levels
    const parameters = ['param1', 'param2'];
    logger.log(level, message, ...parameters); // Assuming the method to log is named 'log'
    expect(mockCallback).toHaveBeenCalledWith(level, expect.any(String), logger.logName, `${message} ${parameters.join(' ')}`);
    logger.setGlobalCallback(originalGlobalCallback);
  });

  afterEach(() => {
    // Clean up and restore any global changes
    // global.__AnsiLoggerCallback__ = originalGlobalCallback;
  });
});
