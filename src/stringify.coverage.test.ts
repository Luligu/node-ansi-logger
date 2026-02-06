import { stringify } from './stringify.ts';

describe('Stringify coverage (scalars + NO_COLOR)', () => {
  const originalNoColor = process.env.NO_COLOR;

  afterEach(() => {
    if (originalNoColor === undefined) delete process.env.NO_COLOR;
    else process.env.NO_COLOR = originalNoColor;
  });

  test('stringifies scalar payloads (top-level)', () => {
    expect(stringify('abc')).toBe("'abc'");
    expect(stringify(123)).toBe('123');
    expect(stringify(121211111111111211n)).toBe('121211111111111211');
    expect(stringify(true)).toBe('true');
    expect(stringify(() => 'x')).toBe('(function)');
    expect(stringify(Symbol('sym'))).toBe('Symbol(sym)');
  });

  test('NO_COLOR disables colors even if enabled', () => {
    process.env.NO_COLOR = '1';

    const out = stringify({ a: 1 }, true, 69, 245, 2, 3, 6, 168);
    expect(out).toBe('{ a: 1 }');
    expect(out.includes('\x1b[')).toBe(false);
  });
});
