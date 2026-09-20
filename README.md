# Node ansi logger and stringify

[![npm version](https://img.shields.io/npm/v/node-ansi-logger.svg)](https://www.npmjs.com/package/node-ansi-logger)
[![npm downloads](https://img.shields.io/npm/dt/node-ansi-logger.svg)](https://www.npmjs.com/package/node-ansi-logger)
![Node.js CI](https://github.com/Luligu/node-ansi-logger/actions/workflows/build.yml/badge.svg)
![CodeQL](https://github.com/Luligu/node-ansi-logger/actions/workflows/codeql.yml/badge.svg)
[![codecov](https://codecov.io/gh/Luligu/node-ansi-logger/branch/main/graph/badge.svg)](https://codecov.io/gh/Luligu/node-ansi-logger)
[![tested with Vitest](https://img.shields.io/badge/tested_with-Vitest-6E9F18.svg?logo=vitest&logoColor=white)](https://vitest.dev)
[![styled with Oxc](https://img.shields.io/badge/styled_with-Oxc-9BE4E0.svg?logo=oxc&logoColor=white)](https://oxc.rs/docs/guide/usage/formatter.html)
[![linted with Oxc](https://img.shields.io/badge/linted_with-Oxc-9BE4E0.svg?logo=oxc&logoColor=white)](https://oxc.rs/docs/guide/usage/linter.html)
[![TypeScript Native](https://img.shields.io/badge/TypeScript_Native-3178C6?logo=typescript&logoColor=white)](https://github.com/microsoft/typescript-go)
[![ESM](https://img.shields.io/badge/ESM-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

---

AnsiLogger is a lightweight, customizable color logger for Node.js.

If you like this project and find it useful, please consider giving it a star on [GitHub](https://github.com/Luligu/node-ansi-logger) and sponsoring it.

<a href="https://www.buymeacoffee.com/luligugithub"><img src="https://matterbridge.io/assets/bmc-button.svg" alt="Buy me a coffee" width="120"></a>

## Features

- Simple and intuitive API for data logging.
- No dependencies.
- Customizable colors and apperance.
- Supports environment variable NO_COLOR=1 (https://no-color.org/).
- It is also possible to pass a top level logger (like Homebridge or Matter logger) and AnsiLogger will use it
  for output instead of console.
- Includes also a fully customizable stringify funtion with colors (it is bigint aware and manage circular reference).
- Includes a chainable ANSI tagged template API (`ansi`) for styling terminal strings directly.

## Getting Started

### Prerequisites

- Node.js 20-22-24 installed on your machine.

### Installation

To get started with AnsiLogger in your package

```bash
npm install node-ansi-logger
```

# Usage

## Initializing AnsiLogger:

Create an instance of AnsiLogger.

```typescript
import { AnsiLogger, AnsiLoggerParams, LogLevel } from 'node-ansi-logger';
```

```typescript
const log = new AnsiLogger({ logName: '<your name>' }); // Eventually other params in AnsiLoggerParams
```

To import the stringify functions

```typescript
import { stringify, payloadStringify, colorStringify, mqttStringify, debugStringify } from 'node-ansi-logger';
```

## Using the logger:

```typescript
log.debug('Debug message...', ...parameters);
log.info('Info message...', ...parameters);
log.notice('Notice message...', ...parameters);
log.warn('Warning message', ...parameters);
log.error('Error message', ...parameters);
log.fatal('Fatal message', ...parameters);
log(LogLevel.WARN, 'Warning message', ...parameters);
```

## Using the logger with colors inside the message:

```typescript
log.debug(`Debug message ${YELLOW}with yellow part${db}`, ...);
```

## Using the logger internal timer:

```typescript
log.startTimer('Time sensitive code started');
log.stopTimer('Time sensitive code finished');
```

## Using the stringify function:

```typescript
stringify({...})
colorStringify({...})
```

## Using the ansi tagged template API:

Import the `ansi` root tag or individual named styles:

```typescript
import { bold, red, green, cyan, bgBlue, warn, error, fatal, hex, rgb, bgHex, bgRgb } from 'node-ansi-logger';
```

Apply a single style:

```typescript
console.log(red`Something went wrong`);
console.log(bold`Important message`);
```

Chain multiple styles:

```typescript
console.log(bold.red`Critical error`);
console.log(bgBlue.green`Green on blue`);
console.log(bold.italic.underline`Decorated text`);
```

Use dynamic RGB or hex colors:

```typescript
console.log(rgb(255, 128, 0)`Orange text`);
console.log(hex('#ff75d1').bold`Pink bold`);
console.log(bgRgb(30, 30, 30).cyan`Cyan on dark background`);
console.log(bgHex('#1a1a2e').white`White on dark blue`);
```

Nest styles — outer styles are automatically restored after inner resets:

```typescript
console.log(green`Connected ${bold.red`FAILED`} retrying...`);
console.log(warn`Server ${error.bold`crashed`} restarting`);
```

Use the 24-step grayscale ramp (`gray0` = darkest, `gray23` = lightest):

```typescript
import { gray0, gray8, gray13, gray20, gray23 } from 'node-ansi-logger';

console.log(gray0`Nearly black`);
console.log(gray8`Dark gray`);
console.log(gray13`Mid gray`);
console.log(gray20`Light gray`);
console.log(gray23`Nearly white`);
```

Log-level color exports:

```typescript
import { success, debug, info, notice, warn, error, fatal } from 'node-ansi-logger';

console.log(success`Operation completed`);
console.log(debug`Debug details`);
console.log(fatal`Unrecoverable error`);
```

Mix ansi styles inside AnsiLogger calls:

```typescript
import { AnsiLogger } from 'node-ansi-logger';
import { bold, red, green, cyan, yellow } from 'node-ansi-logger';

const log = new AnsiLogger({ logName: 'MyApp' });

log.info(`Device ${bold.cyan`Kitchen Light`} connected`);
log.warn(`Retry ${yellow`${3}`} of ${yellow`5`} — response timeout`);
log.error(`Failed to reach ${bold`192.168.1.10`}: ${red`connection refused`}`);
log.debug(`State changed: ${green`on`} → ${red`off`}`);
```

# Screenshot

![Example Image](https://github.com/Luligu/node-ansi-logger/blob/main/screenshots/Screenshot.png)

## Repository toolchain

> **Note:** This repository uses a new toolchain. It replaces the traditional TypeScript / ESLint / Prettier / Jest stack with a faster and lighter setup.

- **No `typescript 6.x` package** — replaced by [TypeScript Native 7.x](https://github.com/microsoft/typescript-go).
- **No ESLint, no Prettier** — replaced by the [oxc](https://oxc.rs) stack: [oxlint](https://oxc.rs/docs/guide/usage/linter.html) for linting and [oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) for formatting.
- **No Jest** — replaced by [Vitest](https://vitest.dev), which is much faster and natively supports ESM without extra configuration.
- **Far fewer development dependencies** — the number of installed packages drops from **~600** to **~75**. A clean install is much faster.
- **Much faster linting and formatting** — oxlint and oxfmt run in a fraction of the time required by the ESLint / Prettier pipeline.
- **Much faster builds** — tsgo compiles the project in a fraction of the time required by the standard `tsc` build.
- **Editor support** — use the VS Code extensions for tsgo and oxc to get the same experience in the editor.

## Shared agent instructions

All coding agents read the same guidance. [AGENTS.md](./AGENTS.md) and [.agents/](./.agents/) are the **single source of truth**; everything under `.github/`, `.claude/`, `.codex/` and `.antigravity/` are pointers and mirrors. Edit `.agents/` (or `AGENTS.md`), never the copies. See [.agents/README.md](./.agents/README.md) for the full layout.

| File                                           | Notes                                                                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `AGENTS.md`                                    | Main project instructions — shared by every agent                                                            |
| `.agents/README.md`                            | Layout and versioning of the shared instructions                                                             |
| `.agents/rules/testing.instructions.md`        | Testing standards for unit tests                                                                             |
| `.agents/skills/verify-agent-context/SKILL.md` | Verify the agent loaded this context — `$verify-agent-context` (Codex), `/verify-agent-context` (all others) |

Content lives only in `.agents/`. The per-agent folders exist because each tool discovers rules and skills from its own hardcoded location, so they hold stubs that point back here — except where the tool reads `.agents/` natively.

| Tool                               | Instructions                                    | Rules                                                 | Skills                                              |
| ---------------------------------- | ----------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| Codex                              | `AGENTS.md` — read natively                     | `.agents/rules/` — linked from `AGENTS.md`, on demand | `.agents/skills/` — native, `$verify-agent-context` |
| Copilot (VS Code and coding agent) | `.github/copilot-instructions.md` → `AGENTS.md` | stubs in `.github/instructions/` — `applyTo` globs    | stub in `.github/skills/` — `/verify-agent-context` |
| Claude Code                        | `CLAUDE.md` imports `AGENTS.md`                 | stubs in `.claude/rules/` — `paths` globs             | stub in `.claude/skills/` — `/verify-agent-context` |
| Gemini / Antigravity               | `GEMINI.md` imports `AGENTS.md`                 | `.agents/rules/` — on demand                          | `.agents/skills/` — native, `/verify-agent-context` |

### Copilot instructions

| File                                                   | Notes                                        |
| ------------------------------------------------------ | -------------------------------------------- |
| `.github/copilot-instructions.md`                      | Pointer to AGENTS.md — always loaded         |
| `.github/instructions/testing/testing.instructions.md` | Testing standards — scoped to `**/*.test.ts` |
| `.github/skills/verify-agent-context/SKILL.md`         | Skill invocable as `/verify-agent-context`   |

### Claude instructions

| File                                            | Notes                                         |
| ----------------------------------------------- | --------------------------------------------- |
| `CLAUDE.md`                                     | Pointer to AGENTS.md — always loaded          |
| `.claude/settings.json`                         | Claude permissions: allow, ask and deny rules |
| `.claude/rules/testing/testing.instructions.md` | Testing standards — scoped to `**/*.test.ts`  |
| `.claude/skills/verify-agent-context/SKILL.md`  | Skill invocable as `/verify-agent-context`    |

### Codex instructions

| File                         | Notes                                                             |
| ---------------------------- | ----------------------------------------------------------------- |
| `AGENTS.md`                  | Main project instructions — read directly, no pointer file needed |
| `.codex/config.toml`         | Codex project permissions, approvals, and profile                 |
| `.codex/rules/default.rules` | Codex command allow, prompt, and deny rules                       |

Codex reads the shared rules and skills from `.agents/` directly; the skill is invoked as `$verify-agent-context`.

### Gemini / Antigravity instructions

| File                         | Notes                                                 |
| ---------------------------- | ----------------------------------------------------- |
| `GEMINI.md`                  | Pointer to AGENTS.md — always loaded                  |
| `.antigravity/settings.json` | Sandboxing and permissions: allow, ask and deny rules |

The shared rules under `.agents/rules/` apply on demand for the relevant tasks, and `.agents/skills/` is discovered automatically as `/verify-agent-context`.

# Contributing

Contributions to AnsiLogger are welcome.

# License

This project is licensed under the MIT License - see the LICENSE file for details.
