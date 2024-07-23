// logger.test.ts
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AnsiLogger, LogLevel } from './logger';

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
    const logger = new AnsiLogger({ logName: 'TestLogger', logWithColors: false });
    logger.info('Test info message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect(consoleOutput[0][0]).toMatch(/\[info\]/);
    expect(consoleOutput[0][0]).toMatch(/Test info message/);
  });

  it('should log an notice message', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logWithColors: false });
    logger.notice('Test notice message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect(consoleOutput[0][0]).toMatch(/\[notice\]/);
    expect(consoleOutput[0][0]).toMatch(/Test notice message/);
  });

  it('should log an warn message', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logWithColors: false });
    logger.warn('Test warn message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect(consoleOutput[0][0]).toMatch(/\[warn\]/);
    expect(consoleOutput[0][0]).toMatch(/Test warn message/);
  });

  it('should log an error message', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logWithColors: false });
    logger.error('Test error message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect(consoleOutput[0][0]).toMatch(/\[error\]/);
    expect(consoleOutput[0][0]).toMatch(/Test error message/);
  });

  it('should log a fatal message', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logWithColors: false });
    logger.fatal('Test fatal message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect(consoleOutput[0][0]).toMatch(/\[fatal\]/);
    expect(consoleOutput[0][0]).toMatch(/Test fatal message/);
  });

  it('should respect log level settings', () => {
    const logger = new AnsiLogger({ logName: 'TestLogger', logWithColors: false });
    logger.log(LogLevel.WARN, 'Test warn message');
    expect(consoleOutput[0][0]).toMatch(/TestLogger/);
    expect(consoleOutput[0][0]).toMatch(/warn/);
    expect(consoleOutput[0][0]).toMatch(/Test warn message/);
  });

  // Add more tests here for other methods like startTimer, stopTimer, setLogName, etc.
});

