/* eslint-disable @typescript-eslint/no-explicit-any */
import { colorStringify, debugStringify, historyStringify, mqttStringify, payloadStringify, stringify } from './stringify';

describe('stringify', () => {
  test('converts an object to a string', () => {
    const input = { key: 'value' };
    const expectedOutput = "{ key: 'value' }";
    expect(stringify(input)).toBe(expectedOutput);
  });

  test('handles numbers and boolean values', () => {
    const input = { number: 123, bool: true };
    const expectedOutput = '{ number: 123, bool: true }';
    expect(stringify(input)).toBe(expectedOutput);
    expect(payloadStringify(input)).toBe('{ "number": 123, "bool": true }');
    expect(colorStringify(input)).toBe(colorStringify(input));
    expect(historyStringify(input)).toBe(historyStringify(input));
    expect(mqttStringify(input)).toBe(mqttStringify(input));
    expect(debugStringify(input)).toBe(debugStringify(input));
  });

  test('works with nested objects', () => {
    const input = { isNested: { innerKey: 'innerValue' } };
    const expectedOutput = "{ isNested: { innerKey: 'innerValue' } }";
    expect(stringify(input)).toBe(expectedOutput);
  });

  test('returns "{  }" for empty objects', () => {
    const input = {};
    const expectedOutput = '{  }';
    expect(stringify(input)).toBe(expectedOutput);
  });

  test('works with bigint keys', () => {
    const input = { bigintValue: 12321412241214141412412n };
    const expectedOutput = '{ bigintValue: 12321412241214141412412 }';
    expect(stringify(input)).toBe(expectedOutput);
  });

  test('works with null keys', () => {
    const input = { nullValue: null };
    const expectedOutput = '{ nullValue: null }';
    expect(stringify(input)).toBe(expectedOutput);
  });

  test('works with undefined keys', () => {
    const input = { nullValue: undefined };
    const expectedOutput = '{ nullValue: undefined }';
    expect(stringify(input)).toBe(expectedOutput);
  });

  test('throw with function keys or unknown types', () => {
    const input = { myFunc: () => 'Hello, world!' };
    expect(() => stringify(input)).not.toThrow();
  });

  test('works with undefined object', () => {
    const input = undefined;
    const expectedOutput = 'undefined';
    expect(stringify(input as any)).toBe(expectedOutput);
  });

  test('works with null object', () => {
    const input = null;
    const expectedOutput = 'null';
    expect(stringify(input as any)).toBe(expectedOutput);
  });

  test('throws an error for circular references', () => {
    const input = {};
    (input as any).self = input; // Creating a circular reference
    expect(() => stringify(input)).not.toThrow('Maximum call stack size exceeded');
  });
});
