// ansi.test.ts

import {
  ansi,
  bgBlack,
  bgBlue,
  bgBrightBlack,
  bgBrightBlue,
  bgBrightCyan,
  bgBrightGreen,
  bgBrightMagenta,
  bgBrightRed,
  bgBrightWhite,
  bgBrightYellow,
  bgCyan,
  bgGreen,
  bgHex,
  bgMagenta,
  bgRed,
  bgRgb,
  bgWhite,
  bgYellow,
  black,
  blue,
  bold,
  brightBlack,
  brightBlue,
  brightCyan,
  brightGreen,
  brightMagenta,
  brightRed,
  brightWhite,
  brightYellow,
  cyan,
  debug,
  dim,
  error,
  fatal,
  gray,
  gray0,
  gray1,
  gray2,
  gray3,
  gray4,
  gray5,
  gray6,
  gray7,
  gray8,
  gray9,
  gray10,
  gray11,
  gray12,
  gray13,
  gray14,
  gray15,
  gray16,
  gray17,
  gray18,
  gray19,
  gray20,
  gray21,
  gray22,
  gray23,
  green,
  hex,
  info,
  inverse,
  italic,
  magenta,
  notice,
  red,
  rgb,
  strikethrough,
  success,
  underline,
  warn,
  white,
  yellow,
} from './ansi.js';

const ESC = '\x1b[';
const FG_RESET = '\x1b[39m';
const BG_RESET = '\x1b[49m';

/*
DO NOT REMOVE - this is a demo of the ansi API in action.
if (process.argv.includes('--demo')) {
  console.log(success`normal success ${error.bold`important error`} back to success`);
  console.log(debug`normal debug ${error.bold`important error`} back to debug`);
  console.log(info`normal info ${error.bold`important error`} back to info`);
  console.log(notice`normal notice ${error.bold`important error`} back to notice`);
  console.log(warn`normal warn ${error.bold`important error`} back to warn`);
  console.log(error`normal error ${error.bold`important error`} back to error`);
  console.log(fatal`normal fatal ${error.bold`important error`} back to fatal`);

  console.log(info`Server ${success.bold`started`} on ${warn.underline`localhost:3000`}`);

  console.log(bgBlue.green`green on blue`);
  console.log(hex('#ff75d1').bold`Pink`);
  console.log(hex('#ff75d1').bgHex('#75b5ff').bold`Pink`);
  console.log(bgRgb(30, 30, 30).cyan` Cyan on dark background `);
  console.log(bgRgb(30, 30, 30).cyan.bold` Cyan bold on dark background `);
  console.log(bgRgb(30, 30, 30).cyan.dim` Cyan dim on dark background `);
  console.log(bgRgb(30, 30, 30).cyan.italic` Cyan italic on dark background `);
  console.log(bgRgb(30, 30, 30).cyan.underline` Cyan underline on dark background `);
}
*/

describe('ansi tagged template', () => {
  test('should return plain text when no styles are applied', () => {
    expect(ansi`hello`).toBe('hello');
  });

  test('should interpolate values correctly', () => {
    const name = 'world';
    const count = 42;
    expect(ansi`hello ${name} count ${count}`).toBe('hello world count 42');
  });

  test('should convert non-string interpolations to string', () => {
    expect(ansi`val ${null} end`).toBe('val null end');
    expect(ansi`val ${undefined} end`).toBe('val undefined end');
    expect(ansi`val ${true} end`).toBe('val true end');
  });
});

describe('text modifier styles', () => {
  test('should apply bold', () => {
    expect(bold`text`).toBe(`${ESC}1mtext${ESC}22m`);
  });

  test('should apply dim', () => {
    expect(dim`text`).toBe(`${ESC}2mtext${ESC}22m`);
  });

  test('should apply italic', () => {
    expect(italic`text`).toBe(`${ESC}3mtext${ESC}23m`);
  });

  test('should apply underline', () => {
    expect(underline`text`).toBe(`${ESC}4mtext${ESC}24m`);
  });

  test('should apply inverse', () => {
    expect(inverse`text`).toBe(`${ESC}7mtext${ESC}27m`);
  });

  test('should apply strikethrough', () => {
    expect(strikethrough`text`).toBe(`${ESC}9mtext${ESC}29m`);
  });
});

describe('foreground color styles', () => {
  test('should apply black', () => {
    expect(black`text`).toBe(`${ESC}30mtext${FG_RESET}`);
  });

  test('should apply red', () => {
    expect(red`text`).toBe(`${ESC}31mtext${FG_RESET}`);
  });

  test('should apply green', () => {
    expect(green`text`).toBe(`${ESC}32mtext${FG_RESET}`);
  });

  test('should apply yellow', () => {
    expect(yellow`text`).toBe(`${ESC}33mtext${FG_RESET}`);
  });

  test('should apply blue', () => {
    expect(blue`text`).toBe(`${ESC}34mtext${FG_RESET}`);
  });

  test('should apply magenta', () => {
    expect(magenta`text`).toBe(`${ESC}35mtext${FG_RESET}`);
  });

  test('should apply cyan', () => {
    expect(cyan`text`).toBe(`${ESC}36mtext${FG_RESET}`);
  });

  test('should apply white', () => {
    expect(white`text`).toBe(`${ESC}37mtext${FG_RESET}`);
  });

  test('should apply gray', () => {
    expect(gray`text`).toBe(`${ESC}90mtext${FG_RESET}`);
  });
});

describe('grayscale ramp styles', () => {
  test('should apply gray0', () => {
    expect(gray0`text`).toBe(`${ESC}38;5;232mtext${FG_RESET}`);
  });

  test('should apply gray1', () => {
    expect(gray1`text`).toBe(`${ESC}38;5;233mtext${FG_RESET}`);
  });

  test('should apply gray2', () => {
    expect(gray2`text`).toBe(`${ESC}38;5;234mtext${FG_RESET}`);
  });

  test('should apply gray3', () => {
    expect(gray3`text`).toBe(`${ESC}38;5;235mtext${FG_RESET}`);
  });

  test('should apply gray4', () => {
    expect(gray4`text`).toBe(`${ESC}38;5;236mtext${FG_RESET}`);
  });

  test('should apply gray5', () => {
    expect(gray5`text`).toBe(`${ESC}38;5;237mtext${FG_RESET}`);
  });

  test('should apply gray6', () => {
    expect(gray6`text`).toBe(`${ESC}38;5;238mtext${FG_RESET}`);
  });

  test('should apply gray7', () => {
    expect(gray7`text`).toBe(`${ESC}38;5;239mtext${FG_RESET}`);
  });

  test('should apply gray8', () => {
    expect(gray8`text`).toBe(`${ESC}38;5;240mtext${FG_RESET}`);
  });

  test('should apply gray9', () => {
    expect(gray9`text`).toBe(`${ESC}38;5;241mtext${FG_RESET}`);
  });

  test('should apply gray10', () => {
    expect(gray10`text`).toBe(`${ESC}38;5;242mtext${FG_RESET}`);
  });

  test('should apply gray11', () => {
    expect(gray11`text`).toBe(`${ESC}38;5;243mtext${FG_RESET}`);
  });

  test('should apply gray12', () => {
    expect(gray12`text`).toBe(`${ESC}38;5;244mtext${FG_RESET}`);
  });

  test('should apply gray13', () => {
    expect(gray13`text`).toBe(`${ESC}38;5;245mtext${FG_RESET}`);
  });

  test('should apply gray14', () => {
    expect(gray14`text`).toBe(`${ESC}38;5;246mtext${FG_RESET}`);
  });

  test('should apply gray15', () => {
    expect(gray15`text`).toBe(`${ESC}38;5;247mtext${FG_RESET}`);
  });

  test('should apply gray16', () => {
    expect(gray16`text`).toBe(`${ESC}38;5;248mtext${FG_RESET}`);
  });

  test('should apply gray17', () => {
    expect(gray17`text`).toBe(`${ESC}38;5;249mtext${FG_RESET}`);
  });

  test('should apply gray18', () => {
    expect(gray18`text`).toBe(`${ESC}38;5;250mtext${FG_RESET}`);
  });

  test('should apply gray19', () => {
    expect(gray19`text`).toBe(`${ESC}38;5;251mtext${FG_RESET}`);
  });

  test('should apply gray20', () => {
    expect(gray20`text`).toBe(`${ESC}38;5;252mtext${FG_RESET}`);
  });

  test('should apply gray21', () => {
    expect(gray21`text`).toBe(`${ESC}38;5;253mtext${FG_RESET}`);
  });

  test('should apply gray22', () => {
    expect(gray22`text`).toBe(`${ESC}38;5;254mtext${FG_RESET}`);
  });

  test('should apply gray23', () => {
    expect(gray23`text`).toBe(`${ESC}38;5;255mtext${FG_RESET}`);
  });
});

describe('bright foreground color styles', () => {
  test('should apply brightBlack', () => {
    expect(brightBlack`text`).toBe(`${ESC}90mtext${FG_RESET}`);
  });

  test('should apply brightRed', () => {
    expect(brightRed`text`).toBe(`${ESC}91mtext${FG_RESET}`);
  });

  test('should apply brightGreen', () => {
    expect(brightGreen`text`).toBe(`${ESC}92mtext${FG_RESET}`);
  });

  test('should apply brightYellow', () => {
    expect(brightYellow`text`).toBe(`${ESC}93mtext${FG_RESET}`);
  });

  test('should apply brightBlue', () => {
    expect(brightBlue`text`).toBe(`${ESC}94mtext${FG_RESET}`);
  });

  test('should apply brightMagenta', () => {
    expect(brightMagenta`text`).toBe(`${ESC}95mtext${FG_RESET}`);
  });

  test('should apply brightCyan', () => {
    expect(brightCyan`text`).toBe(`${ESC}96mtext${FG_RESET}`);
  });

  test('should apply brightWhite', () => {
    expect(brightWhite`text`).toBe(`${ESC}97mtext${FG_RESET}`);
  });
});

describe('background color styles', () => {
  test('should apply bgBlack', () => {
    expect(bgBlack`text`).toBe(`${ESC}40mtext${BG_RESET}`);
  });

  test('should apply bgRed', () => {
    expect(bgRed`text`).toBe(`${ESC}41mtext${BG_RESET}`);
  });

  test('should apply bgGreen', () => {
    expect(bgGreen`text`).toBe(`${ESC}42mtext${BG_RESET}`);
  });

  test('should apply bgYellow', () => {
    expect(bgYellow`text`).toBe(`${ESC}43mtext${BG_RESET}`);
  });

  test('should apply bgBlue', () => {
    expect(bgBlue`text`).toBe(`${ESC}44mtext${BG_RESET}`);
  });

  test('should apply bgMagenta', () => {
    expect(bgMagenta`text`).toBe(`${ESC}45mtext${BG_RESET}`);
  });

  test('should apply bgCyan', () => {
    expect(bgCyan`text`).toBe(`${ESC}46mtext${BG_RESET}`);
  });

  test('should apply bgWhite', () => {
    expect(bgWhite`text`).toBe(`${ESC}47mtext${BG_RESET}`);
  });

  test('should apply bgBrightBlack', () => {
    expect(bgBrightBlack`text`).toBe(`${ESC}100mtext${BG_RESET}`);
  });

  test('should apply bgBrightRed', () => {
    expect(bgBrightRed`text`).toBe(`${ESC}101mtext${BG_RESET}`);
  });

  test('should apply bgBrightGreen', () => {
    expect(bgBrightGreen`text`).toBe(`${ESC}102mtext${BG_RESET}`);
  });

  test('should apply bgBrightYellow', () => {
    expect(bgBrightYellow`text`).toBe(`${ESC}103mtext${BG_RESET}`);
  });

  test('should apply bgBrightBlue', () => {
    expect(bgBrightBlue`text`).toBe(`${ESC}104mtext${BG_RESET}`);
  });

  test('should apply bgBrightMagenta', () => {
    expect(bgBrightMagenta`text`).toBe(`${ESC}105mtext${BG_RESET}`);
  });

  test('should apply bgBrightCyan', () => {
    expect(bgBrightCyan`text`).toBe(`${ESC}106mtext${BG_RESET}`);
  });

  test('should apply bgBrightWhite', () => {
    expect(bgBrightWhite`text`).toBe(`${ESC}107mtext${BG_RESET}`);
  });
});

describe('log level styles', () => {
  test('should apply success', () => {
    expect(success`text`).toBe(`${ESC}38;5;45mtext${FG_RESET}`);
  });

  test('should apply debug', () => {
    expect(debug`text`).toBe(`${ESC}38;5;245mtext${FG_RESET}${ESC}38;5;245m`);
  });

  test('should apply info', () => {
    expect(info`text`).toBe(`${ESC}38;5;252mtext${FG_RESET}${ESC}38;5;252m`);
  });

  test('should apply notice', () => {
    expect(notice`text`).toBe(`${ESC}38;5;2mtext${FG_RESET}${ESC}38;5;2m`);
  });

  test('should apply warn', () => {
    expect(warn`text`).toBe(`${ESC}38;5;220mtext${FG_RESET}${ESC}38;5;220m`);
  });

  test('should apply error', () => {
    expect(error`text`).toBe(`${ESC}38;5;1mtext${FG_RESET}${ESC}38;5;1m`);
  });

  test('should apply fatal', () => {
    expect(fatal`text`).toBe(`${ESC}38;5;9mtext${FG_RESET}${ESC}38;5;9m`);
  });
});

describe('style chaining', () => {
  test('should apply bold and red together', () => {
    const result = bold.red`text`;
    expect(result).toBe(`${ESC}1m${ESC}31mtext${FG_RESET}${ESC}22m`);
  });

  test('should apply bgBlue and green together', () => {
    const result = bgBlue.green`text`;
    expect(result).toBe(`${ESC}44m${ESC}32mtext${FG_RESET}${BG_RESET}`);
  });

  test('should apply three styles together', () => {
    const result = bold.italic.underline`text`;
    expect(result).toBe(`${ESC}1m${ESC}3m${ESC}4mtext${ESC}24m${ESC}23m${ESC}22m`);
  });
});

describe('nested style restoration', () => {
  test('should restore outer foreground color after inner color resets it', () => {
    const inner = error`err`;
    const result = red`before ${inner} after`;
    // The inner error ends with FG_RESET (\x1b[39m), which the outer red replaces with FG_RESET + red open
    expect(result).toContain(`${ESC}31m`);
    expect(result).toContain(`${FG_RESET}${ESC}31m`);
    expect(result.endsWith(FG_RESET)).toBe(true);
  });

  test('should restore outer bold after inner bold resets it', () => {
    const inner = bold`inner`;
    const result = bold`outer ${inner} back`;
    // Inner bold ends with \x1b[22m, outer bold replaces it with \x1b[22m\x1b[1m
    expect(result).toContain(`${ESC}22m${ESC}1m`);
    expect(result.startsWith(`${ESC}1m`)).toBe(true);
    expect(result.endsWith(`${ESC}22m`)).toBe(true);
  });

  test('should restore both bold and color after nested reset', () => {
    const inner = error`err`;
    const result = bold.cyan`msg ${inner} back`;
    // bold.cyan close order: FG_RESET then bold_close
    expect(result.startsWith(`${ESC}1m${ESC}36m`)).toBe(true);
    expect(result.endsWith(`${FG_RESET}${ESC}22m`)).toBe(true);
    // After inner error's FG_RESET, cyan should be re-applied
    expect(result).toContain(`${FG_RESET}${ESC}36m`);
  });
});

describe('rgb() method', () => {
  test('should apply foreground RGB color', () => {
    expect(rgb(255, 128, 0)`text`).toBe(`${ESC}38;2;255;128;0mtext${FG_RESET}`);
  });

  test('should clamp RGB channel below 0 to 0', () => {
    expect(rgb(-10, 0, 0)`x`).toBe(`${ESC}38;2;0;0;0mx${FG_RESET}`);
  });

  test('should clamp RGB channel above 255 to 255', () => {
    expect(rgb(300, 0, 0)`x`).toBe(`${ESC}38;2;255;0;0mx${FG_RESET}`);
  });

  test('should round fractional RGB channel values', () => {
    expect(rgb(1.7, 0, 0)`x`).toBe(`${ESC}38;2;2;0;0mx${FG_RESET}`);
    expect(rgb(1.4, 0, 0)`x`).toBe(`${ESC}38;2;1;0;0mx${FG_RESET}`);
  });

  test('should throw TypeError for non-finite RGB channel', () => {
    expect(() => rgb(Infinity, 0, 0)`x`).toThrow(TypeError);
    expect(() => rgb(NaN, 0, 0)`x`).toThrow(TypeError);
  });

  test('should chain rgb with another style', () => {
    const result = bold.rgb(0, 255, 0)`text`;
    expect(result).toBe(`${ESC}1m${ESC}38;2;0;255;0mtext${FG_RESET}${ESC}22m`);
  });
});

describe('bgRgb() method', () => {
  test('should apply background RGB color', () => {
    expect(bgRgb(30, 30, 30)`text`).toBe(`${ESC}48;2;30;30;30mtext${BG_RESET}`);
  });

  test('should clamp background RGB channels', () => {
    expect(bgRgb(-1, 300, 128)`x`).toBe(`${ESC}48;2;0;255;128mx${BG_RESET}`);
  });

  test('should throw TypeError for non-finite background RGB channel', () => {
    expect(() => bgRgb(0, Infinity, 0)`x`).toThrow(TypeError);
  });
});

describe('hex() method', () => {
  test('should apply foreground color from 6-digit hex with hash', () => {
    expect(hex('#ff0000')`text`).toBe(`${ESC}38;2;255;0;0mtext${FG_RESET}`);
  });

  test('should apply foreground color from 6-digit hex without hash', () => {
    expect(hex('00ff00')`text`).toBe(`${ESC}38;2;0;255;0mtext${FG_RESET}`);
  });

  test('should apply foreground color from 3-digit hex with hash', () => {
    expect(hex('#f00')`text`).toBe(`${ESC}38;2;255;0;0mtext${FG_RESET}`);
  });

  test('should apply foreground color from 3-digit hex without hash', () => {
    expect(hex('0f0')`text`).toBe(`${ESC}38;2;0;255;0mtext${FG_RESET}`);
  });

  test('should be case-insensitive for hex input', () => {
    expect(hex('#FF8800')`x`).toBe(hex('#ff8800')`x`);
  });

  test('should throw TypeError for invalid hex color', () => {
    expect(() => hex('invalid')`x`).toThrow(TypeError);
    expect(() => hex('#gg0000')`x`).toThrow(TypeError);
    expect(() => hex('#12345')`x`).toThrow(TypeError);
  });

  test('should chain hex with another style', () => {
    const result = bold.hex('#ff0000')`text`;
    expect(result).toBe(`${ESC}1m${ESC}38;2;255;0;0mtext${FG_RESET}${ESC}22m`);
  });
});

describe('bgHex() method', () => {
  test('should apply background color from 6-digit hex with hash', () => {
    expect(bgHex('#0000ff')`text`).toBe(`${ESC}48;2;0;0;255mtext${BG_RESET}`);
  });

  test('should apply background color from 3-digit hex', () => {
    expect(bgHex('#00f')`text`).toBe(`${ESC}48;2;0;0;255mtext${BG_RESET}`);
  });

  test('should throw TypeError for invalid hex color', () => {
    expect(() => bgHex('zzzzzz')`x`).toThrow(TypeError);
  });

  test('should chain bgHex with foreground style', () => {
    const result = hex('#ff75d1').bgHex('#75b5ff').bold`Pink`;
    expect(result).toContain(`${ESC}38;2;`);
    expect(result).toContain(`${ESC}48;2;`);
    expect(result).toContain(`${ESC}1m`);
  });
});

describe('ansi proxy fallthrough', () => {
  test('should return undefined for unknown non-string properties accessed via symbol', () => {
    const sym = Symbol('test');
    // Accessing a symbol prop falls through to Reflect.get; the function has no such prop
    expect((ansi as unknown as Record<symbol, unknown>)[sym]).toBeUndefined();
  });

  test('should return undefined for unknown string properties', () => {
    // Accessing an unknown string prop (not a style name, not rgb/hex/bgRgb/bgHex)
    // falls through to the final Reflect.get branch
    expect((ansi as unknown as Record<string, unknown>)['unknownProp']).toBeUndefined();
  });
});

describe('NO_COLOR', () => {
  const ESC = '\x1b[';

  beforeEach(() => {
    process.env['NO_COLOR'] = '';
  });

  afterEach(() => {
    delete process.env['NO_COLOR'];
  });

  test('should return plain text when NO_COLOR is set', () => {
    expect(ansi.red`hello`).toBe('hello');
  });

  test('should return plain text for chained styles when NO_COLOR is set', () => {
    expect(ansi.bold.cyan`world`).toBe('world');
  });

  test('should return plain text for rgb() when NO_COLOR is set', () => {
    expect(ansi.rgb(255, 0, 0)`red`).toBe('red');
  });

  test('should return styled text after NO_COLOR is unset', () => {
    delete process.env['NO_COLOR'];
    expect(ansi.red`hello`).toBe(`${ESC}31mhello${ESC}39m`);
  });
});
