/**
 * This file contains the ANSI styling system: a chainable tagged template API for applying ANSI escape codes to terminal output.
 *
 * @file ansi.ts
 * @author Luca Liguori
 * @created 2026-05-12
 * @version 1.0.0
 * @license Apache-2.0
 *
 * Copyright 2026, 2027, 2028 Luca Liguori.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * How it works:
 *
 * Each style is a pair of ANSI escape sequences: an opening code that activates the style and a
 * closing code that restores the terminal default. `createTag()` returns a `Proxy`-wrapped tagged
 * template function. Accessing a named style property (e.g. `.bold`, `.red`) or calling a dynamic
 * color method (`.rgb()`, `.hex()`) accumulates the style into an array and returns a new tag.
 * When the tag is finally called as a template literal, `applyStyles()` wraps the text in the
 * accumulated open/close sequences and re-injects the opening sequences after any nested close
 * codes so that outer styles are automatically restored across nested style boundaries.
 */

/** An ANSI style pair: `[open, close]` escape sequences that wrap styled text. */
export type AnsiStyle = readonly [open: string, close: string];

const CLOSE_FOREGROUND = '\x1b[39m';
const CLOSE_BACKGROUND = '\x1b[49m';

const STYLES = {
  bold: ['\x1b[1m', '\x1b[22m'],
  dim: ['\x1b[2m', '\x1b[22m'],
  italic: ['\x1b[3m', '\x1b[23m'],
  underline: ['\x1b[4m', '\x1b[24m'],
  inverse: ['\x1b[7m', '\x1b[27m'],
  strikethrough: ['\x1b[9m', '\x1b[29m'],

  black: ['\x1b[30m', CLOSE_FOREGROUND],
  red: ['\x1b[31m', CLOSE_FOREGROUND],
  green: ['\x1b[32m', CLOSE_FOREGROUND],
  yellow: ['\x1b[33m', CLOSE_FOREGROUND],
  blue: ['\x1b[34m', CLOSE_FOREGROUND],
  magenta: ['\x1b[35m', CLOSE_FOREGROUND],
  cyan: ['\x1b[36m', CLOSE_FOREGROUND],
  white: ['\x1b[37m', CLOSE_FOREGROUND],

  gray: ['\x1b[90m', CLOSE_FOREGROUND],

  gray0: ['\x1b[38;5;232m', CLOSE_FOREGROUND],
  gray1: ['\x1b[38;5;233m', CLOSE_FOREGROUND],
  gray2: ['\x1b[38;5;234m', CLOSE_FOREGROUND],
  gray3: ['\x1b[38;5;235m', CLOSE_FOREGROUND],
  gray4: ['\x1b[38;5;236m', CLOSE_FOREGROUND],
  gray5: ['\x1b[38;5;237m', CLOSE_FOREGROUND],
  gray6: ['\x1b[38;5;238m', CLOSE_FOREGROUND],
  gray7: ['\x1b[38;5;239m', CLOSE_FOREGROUND],
  gray8: ['\x1b[38;5;240m', CLOSE_FOREGROUND],
  gray9: ['\x1b[38;5;241m', CLOSE_FOREGROUND],
  gray10: ['\x1b[38;5;242m', CLOSE_FOREGROUND],
  gray11: ['\x1b[38;5;243m', CLOSE_FOREGROUND],
  gray12: ['\x1b[38;5;244m', CLOSE_FOREGROUND],
  gray13: ['\x1b[38;5;245m', CLOSE_FOREGROUND],
  gray14: ['\x1b[38;5;246m', CLOSE_FOREGROUND],
  gray15: ['\x1b[38;5;247m', CLOSE_FOREGROUND],
  gray16: ['\x1b[38;5;248m', CLOSE_FOREGROUND],
  gray17: ['\x1b[38;5;249m', CLOSE_FOREGROUND],
  gray18: ['\x1b[38;5;250m', CLOSE_FOREGROUND],
  gray19: ['\x1b[38;5;251m', CLOSE_FOREGROUND],
  gray20: ['\x1b[38;5;252m', CLOSE_FOREGROUND],
  gray21: ['\x1b[38;5;253m', CLOSE_FOREGROUND],
  gray22: ['\x1b[38;5;254m', CLOSE_FOREGROUND],
  gray23: ['\x1b[38;5;255m', CLOSE_FOREGROUND],

  brightBlack: ['\x1b[90m', CLOSE_FOREGROUND],
  brightRed: ['\x1b[91m', CLOSE_FOREGROUND],
  brightGreen: ['\x1b[92m', CLOSE_FOREGROUND],
  brightYellow: ['\x1b[93m', CLOSE_FOREGROUND],
  brightBlue: ['\x1b[94m', CLOSE_FOREGROUND],
  brightMagenta: ['\x1b[95m', CLOSE_FOREGROUND],
  brightCyan: ['\x1b[96m', CLOSE_FOREGROUND],
  brightWhite: ['\x1b[97m', CLOSE_FOREGROUND],

  bgBlack: ['\x1b[40m', CLOSE_BACKGROUND],
  bgRed: ['\x1b[41m', CLOSE_BACKGROUND],
  bgGreen: ['\x1b[42m', CLOSE_BACKGROUND],
  bgYellow: ['\x1b[43m', CLOSE_BACKGROUND],
  bgBlue: ['\x1b[44m', CLOSE_BACKGROUND],
  bgMagenta: ['\x1b[45m', CLOSE_BACKGROUND],
  bgCyan: ['\x1b[46m', CLOSE_BACKGROUND],
  bgWhite: ['\x1b[47m', CLOSE_BACKGROUND],

  bgBrightBlack: ['\x1b[100m', CLOSE_BACKGROUND],
  bgBrightRed: ['\x1b[101m', CLOSE_BACKGROUND],
  bgBrightGreen: ['\x1b[102m', CLOSE_BACKGROUND],
  bgBrightYellow: ['\x1b[103m', CLOSE_BACKGROUND],
  bgBrightBlue: ['\x1b[104m', CLOSE_BACKGROUND],
  bgBrightMagenta: ['\x1b[105m', CLOSE_BACKGROUND],
  bgBrightCyan: ['\x1b[106m', CLOSE_BACKGROUND],
  bgBrightWhite: ['\x1b[107m', CLOSE_BACKGROUND],

  success: ['\x1b[38;5;45m', CLOSE_FOREGROUND],
  debug: ['\x1b[38;5;245m', CLOSE_FOREGROUND],
  info: ['\x1b[38;5;252m', CLOSE_FOREGROUND],
  notice: ['\x1b[38;5;2m', CLOSE_FOREGROUND],
  warn: ['\x1b[38;5;220m', CLOSE_FOREGROUND],
  error: ['\x1b[38;5;1m', CLOSE_FOREGROUND],
  fatal: ['\x1b[38;5;9m', CLOSE_FOREGROUND],
} as const satisfies Record<string, AnsiStyle>;

type StyleName = keyof typeof STYLES;

export type AnsiTag = ((strings: TemplateStringsArray, ...values: unknown[]) => string) & {
  readonly [K in StyleName]: AnsiTag;
} & {
  hex(color: string): AnsiTag;
  rgb(r: number, g: number, b: number): AnsiTag;
  bgHex(color: string): AnsiTag;
  bgRgb(r: number, g: number, b: number): AnsiTag;
};

/**
 * Reconstructs a tagged template literal.
 *
 * @param {TemplateStringsArray} strings - Template string parts.
 * @param {unknown[]} values - Interpolated values.
 * @returns {string} The reconstructed string.
 */
function joinTemplate(strings: TemplateStringsArray, values: unknown[]): string {
  let output = '';

  for (let i = 0; i < strings.length; i++) {
    output += strings[i];
    if (i < values.length) output += String(values[i]);
  }

  return output;
}

/**
 * Applies ANSI styles while preserving outer styles after nested resets.
 *
 * @param {string} text - Text to decorate.
 * @param {readonly AnsiStyle[]} styles - ANSI style pairs.
 * @returns {string} ANSI-decorated text.
 */
function applyStyles(text: string, styles: readonly AnsiStyle[]): string {
  if ('NO_COLOR' in process.env) return text;

  let output = text;

  for (const [open, close] of styles) {
    output = output.replaceAll(close, close + open);
  }

  const open = styles.map(([start]) => start).join('');
  const close = styles
    .map(([, end]) => end)
    .reverse()
    .join('');

  return open + output + close;
}

/**
 * Normalizes an RGB channel.
 *
 * @param {number} value - RGB channel value.
 * @returns {number} Integer channel between 0 and 255.
 */
function channel(value: number): number {
  if (!Number.isFinite(value)) {
    throw new TypeError(`RGB channel must be finite. Received: ${value}`);
  }

  return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * Converts a hex color to RGB channels.
 *
 * @param {string} color - Hex color in #RGB, RGB, #RRGGBB, or RRGGBB format.
 * @returns {readonly [number, number, number]} RGB tuple.
 */
function hexToRgb(color: string): readonly [number, number, number] {
  const match = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(color.trim());

  if (!match) {
    throw new TypeError(`Invalid hex color: ${color}`);
  }

  const value = match[1].length === 3 ? [...match[1]].map((char) => char + char).join('') : match[1];

  return [Number.parseInt(value.slice(0, 2), 16), Number.parseInt(value.slice(2, 4), 16), Number.parseInt(value.slice(4, 6), 16)];
}

/**
 * Creates a foreground RGB ANSI style.
 *
 * @param {number} r - Red channel.
 * @param {number} g - Green channel.
 * @param {number} b - Blue channel.
 * @returns {AnsiStyle} ANSI style pair.
 */
function rgbStyle(r: number, g: number, b: number): AnsiStyle {
  return [`\x1b[38;2;${channel(r)};${channel(g)};${channel(b)}m`, CLOSE_FOREGROUND];
}

/**
 * Creates a background RGB ANSI style.
 *
 * @param {number} r - Red channel.
 * @param {number} g - Green channel.
 * @param {number} b - Blue channel.
 * @returns {AnsiStyle} ANSI style pair.
 */
function bgRgbStyle(r: number, g: number, b: number): AnsiStyle {
  return [`\x1b[48;2;${channel(r)};${channel(g)};${channel(b)}m`, CLOSE_BACKGROUND];
}

/**
 * Creates a chainable ANSI tagged template function.
 *
 * @param {readonly AnsiStyle[]} styles - Accumulated ANSI styles.
 * @returns {AnsiTag} Chainable ANSI tag.
 */
function createTag(styles: readonly AnsiStyle[] = []): AnsiTag {
  const tag = ((strings: TemplateStringsArray, ...values: unknown[]): string => {
    return applyStyles(joinTemplate(strings, values), styles);
  }) as AnsiTag;

  return new Proxy(tag, {
    get(target, prop: string | symbol): unknown {
      if (typeof prop !== 'string') {
        return Reflect.get(target, prop);
      }

      if (prop in STYLES) {
        return createTag([...styles, STYLES[prop as StyleName]]);
      }

      if (prop === 'rgb') {
        return (r: number, g: number, b: number): AnsiTag => createTag([...styles, rgbStyle(r, g, b)]);
      }

      if (prop === 'hex') {
        return (color: string): AnsiTag => createTag([...styles, rgbStyle(...hexToRgb(color))]);
      }

      if (prop === 'bgRgb') {
        return (r: number, g: number, b: number): AnsiTag => createTag([...styles, bgRgbStyle(r, g, b)]);
      }

      if (prop === 'bgHex') {
        return (color: string): AnsiTag => createTag([...styles, bgRgbStyle(...hexToRgb(color))]);
      }

      return Reflect.get(target, prop);
    },
  });
}

/** Root chainable ANSI tag — all styles and dynamic color methods are accessible from it. */
export const ansi = createTag();

export const {
  // Text modifiers — bold, dim, italic, underline, inverse, strikethrough
  bold,
  dim,
  italic,
  underline,
  inverse,
  strikethrough,

  // Standard foreground colors (ANSI 30–37)
  black,
  red,
  green,
  yellow,
  blue,
  magenta,
  cyan,
  white,

  // Bright black alias and 24-step grayscale ramp (256-color indices 232–255)
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

  // Bright foreground colors (ANSI 90–97)
  brightBlack,
  brightRed,
  brightGreen,
  brightYellow,
  brightBlue,
  brightMagenta,
  brightCyan,
  brightWhite,

  // Standard background colors (ANSI 40–47)
  bgBlack,
  bgRed,
  bgGreen,
  bgYellow,
  bgBlue,
  bgMagenta,
  bgCyan,
  bgWhite,

  // Bright background colors (ANSI 100–107)
  bgBrightBlack,
  bgBrightRed,
  bgBrightGreen,
  bgBrightYellow,
  bgBrightBlue,
  bgBrightMagenta,
  bgBrightCyan,
  bgBrightWhite,

  // Log-level semantic colors (256-color)
  success,
  debug,
  info,
  notice,
  warn,
  error,
  fatal,

  // Dynamic true-color methods — call with color arguments, then use as a tag
  hex,
  rgb,
  bgHex,
  bgRgb,
} = ansi;
