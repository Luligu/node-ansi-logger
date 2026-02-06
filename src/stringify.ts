/**
 * This file contains the stringify functions.
 *
 * @file stringify.ts
 * @author Luca Liguori
 * @created 2023-07-23
 * @version 1.4.2
 * @license Apache-2.0
 *
 * Copyright 2024, 2025, 2026 Luca Liguori.
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
 * Stringify the payload as a JSON string with no colors.
 *
 * @param {object} payload - The object to stringify.
 * @returns {string} A JSON string representation of the payload.
 */
export function payloadStringify(payload: unknown): string {
  return stringify(payload, false, 0, 0, 0, 0, 0, 0, '"', '"');
}

/**
 * Stringify the payload as a JSON string with no colors.
 *
 * @param {object} payload - The object to stringify.
 * @returns {string} A JSON string representation of the payload.
 */
export function jsonStringify(payload: unknown): string {
  return stringify(payload, false, 0, 0, 0, 0, 0, 0, '', '"', 2);
}

/**
 * Stringify the payload as a JSON string with colors.
 *
 * @param {object} payload - The object to stringify.
 * @returns {string} A colored JSON string representation of the payload.
 */
export function colorStringify(payload: unknown): string {
  return stringify(payload, true, 69, 252, 2, 3, 6, 168);
}

/**
 * Stringify the payload for history logging with specific colors.
 *
 * @param {object} payload - The object to stringify.
 * @returns {string} A colored JSON string representation of the payload for history.
 */
export function historyStringify(payload: unknown): string {
  return stringify(payload, true, 0, 208, 247, 247, 247, 247);
}

/**
 * Stringify the payload for MQTT with specific colors.
 *
 * @param {object} payload - The object to stringify.
 * @returns {string} A colored JSON string representation of the payload for MQTT.
 */
export function mqttStringify(payload: unknown): string {
  return stringify(payload, true, 69, 245);
}

/**
 * Stringify the payload for debugging with specific colors.
 *
 * @param {object} payload - The object to stringify.
 * @returns {string} A colored JSON string representation of the payload for debugging.
 */
export function debugStringify(payload: unknown): string {
  return stringify(payload, true, 69, 245, 2, 3, 6, 168);
}

/**
 * Stringify the payload with customizable colors and quotes.
 *
 * @param {object} payload - The object to stringify.
 * @param {boolean} enableColors - Whether to enable colors in the output.
 * @param {number} colorPayload - Color for the payload (default: 252).
 * @param {number} colorKey - Color for the keys (default: 250).
 * @param {number} colorString - Color for string values (default: 35).
 * @param {number} colorNumber - Color for number values (default: 220).
 * @param {number} colorBoolean - Color for boolean values (default: 159).
 * @param {number} colorUndefined - Color for undefined values (default: 1).
 * @param {string} keyQuote - Quote character for keys (default: '').
 * @param {string} stringQuote - Quote character for string values (default: "'").
 * @param {number} tab - Number of spaces for indentation (default: 0).
 * @param {number} index - Current index for array elements (default: 0).
 * @param {Set<object>} seenObjects - A set to track already seen objects to prevent circular references.
 * @returns {string} A string representation of the payload with colors and quotes.
 */
export function stringify(
  payload: unknown,
  enableColors = false,
  colorPayload = 252,
  colorKey = 250,
  colorString = 35,
  colorNumber = 220,
  colorBoolean = 159,
  colorUndefined = 1,
  keyQuote = '',
  stringQuote = "'",
  tab = 0,
  index = 0,
  seenObjects = new Set<object>(),
): string {
  if (process.env.NO_COLOR === '1') enableColors = false;
  if (payload === null) return 'null';
  // Let formatScalar handle undefined so it can be covered and colored consistently.

  const clr = (color: number) => {
    return enableColors ? `\x1b[38;5;${color}m` : '';
  };
  const reset = () => {
    return enableColors ? '\x1b[0m' : '';
  };

  const formatScalar = (value: unknown): string => {
    switch (typeof value) {
      case 'undefined':
        return `${clr(colorUndefined)}undefined${reset()}`;
      case 'symbol':
        return `${clr(colorString)}${String(value)}${reset()}`;
      case 'string':
        return `${clr(colorString)}${stringQuote}${value}${stringQuote}${reset()}`;
      case 'number':
        return `${clr(colorNumber)}${value}${reset()}`;
      case 'bigint':
        return `${clr(colorNumber)}${value}${reset()}`;
      case 'boolean':
        return `${clr(colorBoolean)}${value}${reset()}`;
      case 'function':
        return `${clr(colorUndefined)}(function)${reset()}`;
    }

    /* istanbul ignore next */
    return `${clr(colorUndefined)}${String(value)}${reset()}`;
  };

  const isTrackable = typeof payload === 'object' && payload !== null;

  if (!isTrackable) {
    return formatScalar(payload);
  }

  // Check if the object is already in the seenObjects set
  if (seenObjects.has(payload as object)) {
    return `${clr(colorUndefined)}[Circular]${reset()}`;
  }
  // Add the current object to the seenObjects set
  seenObjects.add(payload as object);

  const isArray = Array.isArray(payload);
  let string = `${reset()}${clr(colorPayload)}` + (isArray ? '[' : '{');
  if (tab) {
    string += '\n' + ' '.repeat(tab * (index + 1));
  } else {
    string += ' ';
  }
  Object.entries(payload as Record<string, unknown>).forEach(([key, value], entryIndex) => {
    if (entryIndex > 0) {
      if (tab) string += ',\n' + ' '.repeat(tab * (index + 1));
      else string += ', ';
    }
    let newValue = '';
    // @ts-expect-error -- The type of value is unknown, but we will handle it in the code below
    newValue = value;
    // console.log(typeof newValue, key, value);
    // Unreachable code for typeof, but included for completeness
    /* istanbul ignore else */
    if (value === null) {
      newValue = `${clr(colorUndefined)}null${reset()}`;
    } else if (typeof newValue === 'string') {
      newValue = `${clr(colorString)}${stringQuote}${newValue}${stringQuote}${reset()}`;
    } else if (typeof newValue === 'number') {
      newValue = `${clr(colorNumber)}${newValue}${reset()}`;
    } else if (typeof newValue === 'bigint') {
      newValue = `${clr(colorNumber)}${newValue}${reset()}`;
    } else if (typeof newValue === 'boolean') {
      newValue = `${clr(colorBoolean)}${newValue}${reset()}`;
    } else if (typeof newValue === 'undefined') {
      newValue = `${clr(colorUndefined)}undefined${reset()}`;
    } else if (typeof newValue === 'function') {
      newValue = `${clr(colorUndefined)}(function)${reset()}`;
    } else if (typeof newValue === 'object') {
      if (Object.keys(newValue).length < 100) {
        newValue = stringify(
          newValue,
          enableColors,
          colorPayload,
          colorKey,
          colorString,
          colorNumber,
          colorBoolean,
          colorUndefined,
          keyQuote,
          stringQuote,
          tab,
          index + 1,
          seenObjects,
        );
      } else {
        newValue = '{...}';
      }
    } else if (typeof newValue === 'symbol') {
      newValue = `${clr(colorString)}${String(newValue)}${reset()}`;
    } else {
      throw new Error(`Unsupported type: ${typeof newValue}`);
    }
    if (isArray) {
      string += `${newValue}`;
    } else {
      string += `${clr(colorKey)}${keyQuote}${key}${keyQuote}${reset()}: ${newValue}`;
    }
  });

  // Remove the current object from the seenObjects set after processing
  seenObjects.delete(payload as object);

  if (tab) {
    string += '\n' + ' '.repeat(tab * index);
  } else {
    string += ' ';
  }
  return (string += `${clr(colorPayload)}` + (isArray ? ']' : '}') + `${reset()}`);
}
