# Project Agent

Read this document before consulting a specialized agent. It defines the repository-wide engineering principles that apply to every change.

## Project Overview

- This repository is a frontend test case for the Zympler dashboard.
- Optimize for maintainability, readability, and future extensibility.
- The Excel workbook is currently the single source of truth.
- Keep the data-source boundary replaceable so that an API can take over with minimal changes to the rest of the application.

## Architecture Principles

- Prefer a feature-based architecture.
- Keep business logic outside React components.
- Keep parsing, analytics, and presentation separated.
- Prefer reusable modules over duplicated code.
- Avoid unnecessary abstractions.
- Keep the project easy for new developers to understand.

## TypeScript

- Use strict TypeScript and do not use `any`.
- Prefer explicit types, especially at module boundaries.
- Prefer interfaces for shared models.
- Keep domain models stable and independent from source-specific data shapes.

## React

- Keep components presentational, small, and composable.
- Avoid deeply nested component structures.
- Reuse existing UI components before adding new ones.
- Handle loading, empty, and error states consistently.

## Data Layer

- Keep Excel parsing in the data layer.
- Never expose Excel column names to dashboard components.
- Convert source data into typed domain models at the data boundary.
- Cache parsed datasets where appropriate.

## Performance

- Avoid unnecessary renders and duplicate calculations.
- Do not parse the workbook multiple times.
- Prefer pure functions.
- Keep expensive work outside React rendering.

## Code Quality

- Follow the repository's ESLint and Prettier configuration.
- Keep functions focused and code readable.
- Avoid premature optimization and overengineering.
- Do not introduce unnecessary dependencies.

## Testing

- Reuse the existing testing setup.
- Add focused unit tests where appropriate.
- Test parsing and business logic separately from UI behavior.

## AI Workflow

Always inspect the existing code before making structural changes. Prefer extending established patterns over introducing new ones, and avoid rewriting working code unless there is a clear benefit.

When adding functionality:

1. Reuse the existing architecture.
2. Keep changes minimal.
3. Preserve backward compatibility where practical.

## Specialized Agents

Consult only the specialized guidance relevant to the work. This general agent intentionally does not repeat its implementation-level instructions.

- [Excel Data Agent](excel-data-agent.md)
- [Analytics Agent](analytics-agent.md)
- [Dashboard Agent](dashboard-agent.md)
