# Project Agent

Read this document before consulting a specialized agent.

This document defines the repository-wide engineering principles that apply to every change.

Specialized agents add task-specific guidance, but they must never override the rules in this document or the architectural boundaries defined by the Zympler Architecture Guardian.

---

## Project Overview

- This repository is a frontend test case for the Zympler dashboard.
- Optimize for maintainability, readability, reviewability, and future extensibility.
- The Excel workbook is currently the single source of truth.
- Keep the data-source boundary replaceable so that an API can take over with minimal changes to the rest of the application.
- The application uses a feature-based architecture.
- Every file must have one clear architectural owner.

---

## Mandatory Architecture Governance

Consult the **Zympler Architecture Guardian** before making changes that affect:

- folder structure
- file placement
- feature boundaries
- shared components
- shared hooks
- shared types
- shared utilities
- module dependencies
- imports between features
- architectural abstractions
- moving or renaming files
- structural refactoring

Feature-specific code must remain inside its owning feature unless reuse has already been proven.

Never create feature folders under global `components`.

Preferred:

```text
src/app/features/grid/components/
src/app/features/charger/components/
src/app/features/battery/components/
src/app/features/solar/components/
```

Forbidden:

```text
src/app/components/grid/
src/app/components/charger/
src/app/components/battery/
src/app/components/solar/
```

---

## Architecture Principles

- Prefer a feature-based architecture.
- Organize code by domain ownership.
- Keep business logic outside React components.
- Separate parsing, analytics, domain logic and presentation.
- Keep feature-specific code close to its owner.
- Avoid premature abstractions.
- Shared modules must never import feature modules.
- Features must not import another feature's internals.

---

## TypeScript

- Use strict TypeScript.
- Never use `any`.
- Prefer explicit types.
- Keep domain models independent from Excel shapes.
- Keep feature-specific types inside their owning feature.

---

## React

- Keep components small and composable.
- Separate rendering from calculations.
- Reuse UI primitives before creating new ones.
- Handle loading, empty and error states consistently.

---

## Data Layer

- Excel parsing belongs in the data layer.
- Never expose Excel column names to UI components.
- Convert workbook rows into typed domain models.
- Components should depend only on domain models.

---

## Performance

- Avoid duplicate calculations.
- Parse the workbook only once.
- Prefer pure functions.
- Keep expensive work outside rendering.

---

## Code Quality

- Follow ESLint and Prettier.
- Keep functions focused.
- Use descriptive names.
- Avoid overengineering.
- Keep diffs reviewable.

---

## Testing

- Test parsing separately from analytics.
- Test analytics separately from UI.
- Prefer testing pure business logic.

---

## Git Workflow

Never:

- git add
- git commit
- git push
- git merge
- git rebase
- git reset --hard

Leave all changes uncommitted for review.

---

## AI Workflow

Before implementation:

1. Identify the owning feature.
2. Inspect existing code.
3. Determine the correct architectural layer.
4. Consult the Architecture Guardian.
5. Consult task-specific agents.
6. Explain planned file placement.
7. Leave Git uncommitted.

Do not repeat existing architectural mistakes simply for consistency.

---

## Specialized Agents

1. Zympler Architecture Guardian
2. Excel Data Agent
3. Analytics Agent
4. Dashboard Agent

The Architecture Guardian is authoritative for:

- ownership
- file placement
- dependency direction
- module boundaries
- architecture audits

The task-specific agents decide implementation details inside those boundaries.

---

## Final Audit

Before finishing any task verify:

- every file has one owner
- feature code lives inside its feature
- no feature folders exist under global components
- no shared module imports a feature
- Excel column names never reach React components
- business logic stays outside UI
- no Git commit was created
