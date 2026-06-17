import { jsonStringify, stringify } from './stringify.js';

describe('Stringify edge cases', () => {
  const makeObjectWithNKeys = (n: number) => {
    return Object.fromEntries(Array.from({ length: n }, (_, i) => [`k${i}`, i]));
  };

  test('does not mark shared (non-circular) references as circular', () => {
    const shared = { a: 1 };
    const input = { x: shared, y: shared };

    expect(stringify(input)).toBe('{ x: { a: 1 }, y: { a: 1 } }');
    expect(jsonStringify(input)).toBe('{\n  x: {\n    a: 1\n  },\n  y: {\n    a: 1\n  }\n}');
  });

  test('stringifies sparse arrays using only existing entries', () => {
    const arr: any[] = [];
    arr[2] = 'x';
    arr[5] = undefined;

    expect(stringify(arr as any)).toBe("[ 'x', undefined ]");
    expect(jsonStringify(arr as any)).toBe('[\n  "x",\n  undefined\n]');
  });

  test('handles strings with newlines and quotes without throwing', () => {
    const input = { text: 'line1\nline2 "quoted" \'single\'' };

    expect(stringify(input as any)).toBe("{ text: 'line1\nline2 \"quoted\" 'single'' }");
    expect(jsonStringify(input as any)).toBe('{\n  text: "line1\nline2 "quoted" \'single\'"\n}');
  });

  test('treats Date objects as plain objects (no enumerable keys)', () => {
    const input = { when: new Date(0) };

    expect(stringify(input as any)).toBe('{ when: {  } }');
    expect(jsonStringify(input as any)).toBe('{\n  when: {\n    \n  }\n}');
  });

  test('abbreviates nested objects with 100+ keys', () => {
    const big = makeObjectWithNKeys(100);
    const input = { big };

    expect(stringify(input as any)).toBe('{ big: {...} }');
    expect(jsonStringify(input as any)).toBe('{\n  big: {...}\n}');
  });

  test('abbreviates big objects at deeper indentation (jsonStringify)', () => {
    const big = makeObjectWithNKeys(150);
    const input = { outer: { big } };

    expect(stringify(input as any)).toBe('{ outer: { big: {...} } }');
    expect(jsonStringify(input as any)).toBe('{\n  outer: {\n    big: {...}\n  }\n}');
  });
});
