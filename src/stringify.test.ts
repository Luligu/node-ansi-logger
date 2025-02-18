/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { colorStringify, debugStringify, historyStringify, mqttStringify, payloadStringify, stringify } from './stringify';

describe('Stringify functions', () => {
  const testObject = {
    number: 123,
    string: 'abc',
    boolean: true,
    bigint: 121211111111111211n,
    object: { a: 1, b: 2 },
    function: () => {
      console.log('test');
    },
    nullKey: null,
    undefinedKey: undefined,
  };

  const testArray = [
    123,
    'abc',
    true,
    121211111111111211n,
    { a: 1, b: 2 },
    () => {
      console.log('test');
    },
    null,
    undefined,
  ];

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
    const input = { undefinedValue: undefined };
    const expectedOutput = '{ undefinedValue: undefined }';
    expect(stringify(input)).toBe(expectedOutput);
  });

  test('do not throw with function keys', () => {
    const input = { myFunc: () => 'Hello, world!' };
    expect(() => stringify(input)).not.toThrow();
    expect(stringify(input)).toBe('{ myFunc: (function) }');
  });

  test('works with undefined payload', () => {
    const input = undefined;
    const expectedOutput = 'undefined';
    expect(stringify(input as any)).toBe(expectedOutput);
  });

  test('works with null payload', () => {
    const input = null;
    const expectedOutput = 'null';
    expect(stringify(input as any)).toBe(expectedOutput);
  });

  test('do not throws an error for circular references', () => {
    const input = {};
    (input as any).self = input; // Creating a circular reference
    const expectedOutput = '{ self: [Circular] }';
    expect(() => stringify(input)).not.toThrow();
    expect(() => stringify(input)).not.toThrow('Maximum call stack size exceeded');
    expect(stringify(input)).toBe(expectedOutput);
  });

  test('works with symbol', () => {
    const input = { sym: Symbol('testSymbol') };
    const expectedOutput = '{ sym: Symbol(testSymbol) }';
    expect(stringify(input as any)).toBe(expectedOutput);
  });

  test('works with array', () => {
    const expectedOutput = "[ 123, 'abc', true, 121211111111111211, { a: 1, b: 2 }, (function), null, undefined ]";
    expect(stringify(testArray)).toBe(expectedOutput);
  });

  test('works with a huge array', () => {
    const hugeArray = Array.from({ length: 1000 }, (_, i) => i);
    const expectedOutput = '{ huge: {...} }';
    expect(stringify({ huge: hugeArray })).toBe(expectedOutput);
  });

  test('works with object', () => {
    const expectedOutput =
      "{ number: 123, string: 'abc', boolean: true, bigint: 121211111111111211, object: { a: 1, b: 2 }, function: (function), nullKey: null, undefinedKey: undefined }";
    expect(stringify(testObject)).toBe(expectedOutput);
  });
});
