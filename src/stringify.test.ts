// stringify.test.ts

/* eslint-disable no-console */

import { colorStringify, debugStringify, historyStringify, jsonStringify, mqttStringify, payloadStringify, stringify } from './stringify.ts';

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

  test('converts an object to a string with eol', () => {
    const input = { key: 'value' };
    const expectedOutput = `{\n  key: "value"\n}`;

    expect(jsonStringify(input)).toBe(expectedOutput);
  });

  test('handles numbers and boolean values', () => {
    const input = { number: 123, bool: true };
    const expectedOutput = '{ number: 123, bool: true }';
    expect(stringify(input)).toBe(expectedOutput);
    expect(payloadStringify(input)).toBe('{ "number": 123, "bool": true }');
    expect(colorStringify(input)).toBe(colorStringify(input));
    expect(historyStringify(input)).toBe(historyStringify(input));
    expect(mqttStringify(input)).toBe(mqttStringify(input));

    const clr = (color: number) => {
      return `\x1b[38;5;${color}m`;
    };
    const reset = () => {
      return '\x1b[0m';
    };
    expect(debugStringify(input)).toBe(
      `${reset()}${clr(69)}{ ${clr(245)}number${reset()}: ${clr(3)}123${reset()}, ${clr(245)}bool${reset()}: ${clr(6)}true${reset()} ${clr(69)}}${reset()}`,
    );

    expect(jsonStringify(input)).toBe('{\n  number: 123,\n  bool: true\n}');
  });

  test('works with nested objects', () => {
    const input = { isNested: { innerKey: 'innerValue' } };
    const expectedOutput = "{ isNested: { innerKey: 'innerValue' } }";
    expect(stringify(input)).toBe(expectedOutput);

    expect(jsonStringify(input)).toBe('{\n  isNested: {\n    innerKey: "innerValue"\n  }\n}');
  });

  test('returns "{  }" for empty objects', () => {
    const input = {};
    const expectedOutput = '{  }';
    expect(stringify(input)).toBe(expectedOutput);

    expect(jsonStringify(input)).toBe('{\n  \n}');
  });

  test('works with bigint keys', () => {
    const input = { bigintValue: 12321412241214141412412n };
    const expectedOutput = '{ bigintValue: 12321412241214141412412 }';
    expect(stringify(input)).toBe(expectedOutput);

    expect(jsonStringify(input)).toBe('{\n  bigintValue: 12321412241214141412412\n}');
  });

  test('works with null keys', () => {
    const input = { nullValue: null };
    const expectedOutput = '{ nullValue: null }';
    expect(stringify(input)).toBe(expectedOutput);
    expect(jsonStringify(input)).toBe('{\n  nullValue: null\n}');
  });

  test('works with undefined keys', () => {
    const input = { undefinedValue: undefined };
    const expectedOutput = '{ undefinedValue: undefined }';
    expect(stringify(input)).toBe(expectedOutput);
    expect(jsonStringify(input)).toBe('{\n  undefinedValue: undefined\n}');
  });

  test('do not throw with function keys', () => {
    const input = { myFunc: () => 'Hello, world!' };
    expect(() => stringify(input)).not.toThrow();
    expect(stringify(input)).toBe('{ myFunc: (function) }');
    expect(jsonStringify(input)).toBe('{\n  myFunc: (function)\n}');
  });

  test('works with undefined payload', () => {
    const input = undefined;
    const expectedOutput = 'undefined';
    expect(stringify(input as any)).toBe(expectedOutput);
    expect(jsonStringify(input as any)).toBe('undefined');
  });

  test('works with null payload', () => {
    const input = null;
    const expectedOutput = 'null';
    expect(stringify(input as any)).toBe(expectedOutput);
    expect(jsonStringify(input as any)).toBe('null');
  });

  test('do not throws an error for circular references', () => {
    const input = {};
    (input as any).self = input; // Creating a circular reference
    const expectedOutput = '{ self: [Circular] }';
    expect(() => JSON.stringify(input)).toThrow();
    expect(() => stringify(input)).not.toThrow();
    expect(() => stringify(input)).not.toThrow('Maximum call stack size exceeded');
    expect(stringify(input)).toBe(expectedOutput);
    expect(jsonStringify(input)).toBe('{\n  self: [Circular]\n}');
  });

  test('works with symbol', () => {
    const input = { sym: Symbol('testSymbol') };
    const expectedOutput = '{ sym: Symbol(testSymbol) }';
    expect(stringify(input as any)).toBe(expectedOutput);
    expect(jsonStringify(input as any)).toBe('{\n  sym: Symbol(testSymbol)\n}');
  });

  test('works with array', () => {
    const expectedOutput = "[ 123, 'abc', true, 121211111111111211, { a: 1, b: 2 }, (function), null, undefined ]";
    expect(stringify(testArray)).toBe(expectedOutput);
    expect(jsonStringify(testArray)).toBe('[\n  123,\n  "abc",\n  true,\n  121211111111111211,\n  {\n    a: 1,\n    b: 2\n  },\n  (function),\n  null,\n  undefined\n]');
  });

  test('works with a huge array', () => {
    const hugeArray = Array.from({ length: 1000 }, (_, i) => i);
    const expectedOutput = '{ huge: {...} }';
    expect(stringify({ huge: hugeArray })).toBe(expectedOutput);
    expect(jsonStringify({ huge: hugeArray })).toBe('{\n  huge: {...}\n}');
  });

  test('works with object', () => {
    const expectedOutput =
      "{ number: 123, string: 'abc', boolean: true, bigint: 121211111111111211, object: { a: 1, b: 2 }, function: (function), nullKey: null, undefinedKey: undefined }";
    expect(stringify(testObject)).toBe(expectedOutput);
    expect(jsonStringify(testObject)).toBe(
      '{\n  number: 123,\n  string: "abc",\n  boolean: true,\n  bigint: 121211111111111211,\n  object: {\n    a: 1,\n    b: 2\n  },\n  function: (function),\n  nullKey: null,\n  undefinedKey: undefined\n}',
    );
  });
});
