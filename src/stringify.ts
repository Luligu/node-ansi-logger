/**
 * This file contains the stringify functions.
 *
 * @file logger.ts
 * @author Luca Liguori
 * @date 2023-07-23
 * @version 1.4.1
 *
 * Copyright 2023, 2024, 2025 Luca Liguori.
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

export function payloadStringify(payload: object): string {
  return stringify(payload, false, 0, 0, 0, 0, 0, 0, '"', '"');
}

export function colorStringify(payload: object): string {
  return stringify(payload, true, 69, 252, 2, 3, 6, 168);
}

export function historyStringify(payload: object): string {
  return stringify(payload, true, 0, 208, 247, 247, 247, 247);
}

export function mqttStringify(payload: object): string {
  return stringify(payload, true, 69, 245);
}

export function debugStringify(payload: object): string {
  return stringify(payload, true, 69, 245, 2, 3, 6, 168);
}

export function stringify(
  payload: object,
  enableColors = false,
  colorPayload = 252,
  colorKey = 250,
  colorString = 35,
  colorNumber = 220,
  colorBoolean = 159,
  colorUndefined = 1,
  keyQuote = '',
  stringQuote = "'",
  seenObjects = new Set<object>(),
): string {
  if (payload === null) return 'null';
  if (payload === undefined) return 'undefined';

  const clr = (color: number) => {
    return enableColors ? `\x1b[38;5;${color}m` : '';
  };
  const reset = () => {
    return enableColors ? '\x1b[0m' : '';
  };

  // Check if the object is already in the seenObjects set
  if (seenObjects.has(payload)) {
    return `${clr(colorUndefined)}[Circular]${reset()}`;
  }
  // Add the current object to the seenObjects set
  seenObjects.add(payload);

  const isArray = Array.isArray(payload);
  let string = `${reset()}${clr(colorPayload)}` + (isArray ? '[ ' : '{ ');
  Object.entries(payload).forEach(([key, value], index) => {
    if (index > 0) {
      string += ', ';
    }
    let newValue = '';
    newValue = value;
    // console.log(typeof newValue, key, value);
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
        newValue = stringify(newValue, enableColors, colorPayload, colorKey, colorString, colorNumber, colorBoolean, colorUndefined, keyQuote, stringQuote, seenObjects);
      } else {
        newValue = '{...}';
      }
    } else {
      throw new Error('Stringify unknown type');
    }
    if (isArray) {
      string += `${newValue}`;
    } else {
      string += `${clr(colorKey)}${keyQuote}${key}${keyQuote}${reset()}: ${newValue}`;
    }
  });

  // Remove the current object from the seenObjects set after processing
  seenObjects.delete(payload);

  return (string += ` ${clr(colorPayload)}` + (isArray ? ']' : '}') + `${reset()}`);
}

// Use with node dist/stringify.js --testStringify to test stringify
/*
if (process.argv.includes('--testStringify')) {
  const obj = {
    number: 1234,
    string: 'Text',
    boolean: true,
    null: null,
    undefined: undefined,
    bigint: 12321412241214141412412n,
    array: [
      1,
      '2',
      true,
      null,
      undefined,
      12321412241214141412412n,
      () => {
        //
      },
    ],
    function: () => {
      //
    },
  };
  // eslint-disable-next-line no-console
  console.log(`Stringify payload: ${payloadStringify(obj)}`);
  // eslint-disable-next-line no-console
  console.log(`Stringify color: ${colorStringify(obj)}`);
  // eslint-disable-next-line no-console
  console.log(`Stringify history: ${historyStringify(obj)}`);
}
*/
