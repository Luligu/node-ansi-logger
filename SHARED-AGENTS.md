## Shared agent instructions

This repository supplies shared guidance through [AGENTS.md](./AGENTS.md) and [.agents/](./.agents/), the **single source of truth** for agent instructions, rules, and skills. Edit the shared guidance there; the instruction and skill wrappers under `.github/` and `.claude/` point back to it. Those folders also contain other configuration, workflows, and metadata; `.codex/` and `.antigravity/` contain tool-specific configuration. See [.agents/README.md](./.agents/README.md) for the full layout.

| File                                           | Notes                                                                                                        |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `AGENTS.md`                                    | Main project instructions — shared by every agent                                                            |
| `.agents/README.md`                            | Layout and versioning of the shared instructions                                                             |
| `.agents/rules/testing.instructions.md`        | Testing standards for unit tests                                                                             |
| `.agents/skills/verify-agent-context/SKILL.md` | Verify the agent loaded this context — `$verify-agent-context` (Codex), `/verify-agent-context` (all others) |

Shared rules and skills live in `.agents/`; the main instructions live in `AGENTS.md`, which also references `STYLEGUIDE.md`. The template supplies wrappers for Claude Code and Copilot and direct entry points for Codex and Gemini / Antigravity. Loading depends on the client and its configuration; the table describes the repository setup.

| Tool                               | Instructions                                    | Rules                                                 | Skills                                              |
| ---------------------------------- | ----------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| Codex                              | `AGENTS.md` — read natively                     | `.agents/rules/` — linked from `AGENTS.md`, on demand | `.agents/skills/` — native, `$verify-agent-context` |
| Copilot (VS Code and coding agent) | `.github/copilot-instructions.md` → `AGENTS.md` | stubs in `.github/instructions/` — `applyTo` globs    | stub in `.github/skills/` — `/verify-agent-context` |
| Claude Code                        | `CLAUDE.md` imports `AGENTS.md`                 | stubs in `.claude/rules/` — `paths` globs             | stub in `.claude/skills/` — `/verify-agent-context` |
| Gemini / Antigravity               | `GEMINI.md` imports `AGENTS.md`                 | `.agents/rules/` — on demand                          | `.agents/skills/` — native, `/verify-agent-context` |

Repository-local additions in `localAgents.md`, when present, are appended to `AGENTS.md` during upgrade. The other entry points reach them through `AGENTS.md`. Files managed by mb-run are refreshed from its templates on upgrade.

### Copilot instructions

| File                                                   | Notes                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| `.github/copilot-instructions.md`                      | Entry point importing or linking to AGENTS.md                |
| `.github/instructions/testing/testing.instructions.md` | Testing standards — scoped to the test patterns listed below |
| `.github/skills/verify-agent-context/SKILL.md`         | Skill invocable as `/verify-agent-context`                   |

The testing pointers for both Claude Code and Copilot cover `**/*.test.ts`, `**/*.spec.ts`, `**/test/**/*.ts`, `**/vitest/**/*.ts`, and `**/buntest/**/*.ts`.

### Claude instructions

| File                                            | Notes                                                        |
| ----------------------------------------------- | ------------------------------------------------------------ |
| `CLAUDE.md`                                     | Entry point importing or linking to AGENTS.md                |
| `.claude/settings.json`                         | Claude permissions: allow, ask and deny rules                |
| `.claude/rules/testing/testing.instructions.md` | Testing standards — scoped to the test patterns listed below |
| `.claude/skills/verify-agent-context/SKILL.md`  | Skill invocable as `/verify-agent-context`                   |

### Codex instructions

| File                         | Notes                                                             |
| ---------------------------- | ----------------------------------------------------------------- |
| `AGENTS.md`                  | Main project instructions — read directly, no pointer file needed |
| `.codex/config.toml`         | Codex project permissions, approvals, and profiles                |
| `.codex/rules/default.rules` | Codex command allow, prompt, and deny rules                       |

Codex discovers skills in `.agents/skills/`; the skill is invoked as `$verify-agent-context`. Rules in `.agents/rules/` are referenced by `AGENTS.md` and read when relevant; they are not automatically applied by glob.

### Gemini / Antigravity instructions

| File                         | Notes                                                 |
| ---------------------------- | ----------------------------------------------------- |
| `GEMINI.md`                  | Entry point importing or linking to AGENTS.md         |
| `.antigravity/settings.json` | Sandboxing and permissions: allow, ask and deny rules |

The shared rules under `.agents/rules/` apply on demand for the relevant tasks, and `.agents/skills/` is discovered automatically as `/verify-agent-context`.
