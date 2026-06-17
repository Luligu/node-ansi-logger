import { stringify } from '../src/stringify.js';

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

  test('stringifies a big nested object (50 properties)', () => {
    const big: Record<string, unknown> = {};

    for (let i = 1; i <= 50; i++) {
      const key = `p${String(i).padStart(2, '0')}`;

      if (i % 5 === 0) {
        big[key] = {
          idx: i,
          meta: { even: i % 2 === 0, tag: `t${i}` },
          items: [i, i + 1, { deep: { value: `v${i}`, list: [{ n: i }, { n: i + 1 }] } }],
        };
      } else if (i % 5 === 1) {
        big[key] = [{ id: i, name: `name${i}` }, { flags: [true, false, i % 2 === 0] }];
      } else if (i % 5 === 2) {
        big[key] = {
          arr: [{ a: i }, { b: i * 2 }],
          obj: { x: `x${i}`, y: { z: i } },
        };
      } else if (i % 5 === 3) {
        big[key] = [`s${i}`, { nested: { k: `k${i}`, nums: [i, i * i] } }];
      } else {
        big[key] = { emptyArr: [], emptyObj: {}, nil: null };
      }
    }

    const out = stringify(big);

    expect(out.startsWith('{ ')).toBe(true);
    expect(out.includes('p01:')).toBe(true);
    expect(out.includes('p50:')).toBe(true);
    expect(out.includes("deep: { value: 'v50'")).toBe(true);
    expect(out.includes('list: [ { n: 50 }, { n: 51 } ]')).toBe(true);
    expect(out).toMatchInlineSnapshot(
      `"{ p01: [ { id: 1, name: 'name1' }, { flags: [ true, false, false ] } ], p02: { arr: [ { a: 2 }, { b: 4 } ], obj: { x: 'x2', y: { z: 2 } } }, p03: [ 's3', { nested: { k: 'k3', nums: [ 3, 9 ] } } ], p04: { emptyArr: [  ], emptyObj: {  }, nil: null }, p05: { idx: 5, meta: { even: false, tag: 't5' }, items: [ 5, 6, { deep: { value: 'v5', list: [ { n: 5 }, { n: 6 } ] } } ] }, p06: [ { id: 6, name: 'name6' }, { flags: [ true, false, true ] } ], p07: { arr: [ { a: 7 }, { b: 14 } ], obj: { x: 'x7', y: { z: 7 } } }, p08: [ 's8', { nested: { k: 'k8', nums: [ 8, 64 ] } } ], p09: { emptyArr: [  ], emptyObj: {  }, nil: null }, p10: { idx: 10, meta: { even: true, tag: 't10' }, items: [ 10, 11, { deep: { value: 'v10', list: [ { n: 10 }, { n: 11 } ] } } ] }, p11: [ { id: 11, name: 'name11' }, { flags: [ true, false, false ] } ], p12: { arr: [ { a: 12 }, { b: 24 } ], obj: { x: 'x12', y: { z: 12 } } }, p13: [ 's13', { nested: { k: 'k13', nums: [ 13, 169 ] } } ], p14: { emptyArr: [  ], emptyObj: {  }, nil: null }, p15: { idx: 15, meta: { even: false, tag: 't15' }, items: [ 15, 16, { deep: { value: 'v15', list: [ { n: 15 }, { n: 16 } ] } } ] }, p16: [ { id: 16, name: 'name16' }, { flags: [ true, false, true ] } ], p17: { arr: [ { a: 17 }, { b: 34 } ], obj: { x: 'x17', y: { z: 17 } } }, p18: [ 's18', { nested: { k: 'k18', nums: [ 18, 324 ] } } ], p19: { emptyArr: [  ], emptyObj: {  }, nil: null }, p20: { idx: 20, meta: { even: true, tag: 't20' }, items: [ 20, 21, { deep: { value: 'v20', list: [ { n: 20 }, { n: 21 } ] } } ] }, p21: [ { id: 21, name: 'name21' }, { flags: [ true, false, false ] } ], p22: { arr: [ { a: 22 }, { b: 44 } ], obj: { x: 'x22', y: { z: 22 } } }, p23: [ 's23', { nested: { k: 'k23', nums: [ 23, 529 ] } } ], p24: { emptyArr: [  ], emptyObj: {  }, nil: null }, p25: { idx: 25, meta: { even: false, tag: 't25' }, items: [ 25, 26, { deep: { value: 'v25', list: [ { n: 25 }, { n: 26 } ] } } ] }, p26: [ { id: 26, name: 'name26' }, { flags: [ true, false, true ] } ], p27: { arr: [ { a: 27 }, { b: 54 } ], obj: { x: 'x27', y: { z: 27 } } }, p28: [ 's28', { nested: { k: 'k28', nums: [ 28, 784 ] } } ], p29: { emptyArr: [  ], emptyObj: {  }, nil: null }, p30: { idx: 30, meta: { even: true, tag: 't30' }, items: [ 30, 31, { deep: { value: 'v30', list: [ { n: 30 }, { n: 31 } ] } } ] }, p31: [ { id: 31, name: 'name31' }, { flags: [ true, false, false ] } ], p32: { arr: [ { a: 32 }, { b: 64 } ], obj: { x: 'x32', y: { z: 32 } } }, p33: [ 's33', { nested: { k: 'k33', nums: [ 33, 1089 ] } } ], p34: { emptyArr: [  ], emptyObj: {  }, nil: null }, p35: { idx: 35, meta: { even: false, tag: 't35' }, items: [ 35, 36, { deep: { value: 'v35', list: [ { n: 35 }, { n: 36 } ] } } ] }, p36: [ { id: 36, name: 'name36' }, { flags: [ true, false, true ] } ], p37: { arr: [ { a: 37 }, { b: 74 } ], obj: { x: 'x37', y: { z: 37 } } }, p38: [ 's38', { nested: { k: 'k38', nums: [ 38, 1444 ] } } ], p39: { emptyArr: [  ], emptyObj: {  }, nil: null }, p40: { idx: 40, meta: { even: true, tag: 't40' }, items: [ 40, 41, { deep: { value: 'v40', list: [ { n: 40 }, { n: 41 } ] } } ] }, p41: [ { id: 41, name: 'name41' }, { flags: [ true, false, false ] } ], p42: { arr: [ { a: 42 }, { b: 84 } ], obj: { x: 'x42', y: { z: 42 } } }, p43: [ 's43', { nested: { k: 'k43', nums: [ 43, 1849 ] } } ], p44: { emptyArr: [  ], emptyObj: {  }, nil: null }, p45: { idx: 45, meta: { even: false, tag: 't45' }, items: [ 45, 46, { deep: { value: 'v45', list: [ { n: 45 }, { n: 46 } ] } } ] }, p46: [ { id: 46, name: 'name46' }, { flags: [ true, false, true ] } ], p47: { arr: [ { a: 47 }, { b: 94 } ], obj: { x: 'x47', y: { z: 47 } } }, p48: [ 's48', { nested: { k: 'k48', nums: [ 48, 2304 ] } } ], p49: { emptyArr: [  ], emptyObj: {  }, nil: null }, p50: { idx: 50, meta: { even: true, tag: 't50' }, items: [ 50, 51, { deep: { value: 'v50', list: [ { n: 50 }, { n: 51 } ] } } ] } }"`,
    );
  });
});
