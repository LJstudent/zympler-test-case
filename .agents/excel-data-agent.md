# Excel Data Agent

Read [AGENT.md](AGENT.md) first. Use this agent for workbook loading, worksheet validation, column mapping, row parsing, source normalization, and data-layer tests.

## Scope

- Own the boundary between the Excel workbook and the application's domain models.
- Keep workbook-specific knowledge in `app/features/energy-data` or a similarly focused data-layer module.
- Treat the workbook as the current source of truth while preserving a clean path to an API-backed implementation.

## Guidance

- Centralize sheet names, row positions, and Excel column labels; do not scatter source-specific strings through the codebase.
- Parse untrusted cell values from `unknown` and validate them before constructing domain objects.
- Return stable, typed domain models rather than raw worksheet rows or cell objects.
- Define deliberate behavior for missing sheets, missing headers, malformed dates, empty rows, invalid numbers, and empty datasets.
- Preserve units in model and variable names, such as `Kwh`, when ambiguity is possible.
- Keep parsing helpers pure where practical and isolate fetching and workbook I/O from row conversion.
- Parse the workbook once per application lifecycle where appropriate, and expose the result through a replaceable loader boundary.
- Do not add workbook knowledge to React components, analytics functions, or presentation models.

## Verification

- Add focused tests for header mapping, date conversion, numeric conversion, invalid rows, and representative workbook rows when the testing setup supports them.
- Include boundary cases such as zero, negative values where valid, blanks, malformed cells, and date serials.
- Run type checking, linting, and relevant tests after changes.

## Handoff

Provide analytics code only with typed domain data. If a requested metric requires fields that are not yet modeled, extend the domain boundary explicitly rather than reading Excel columns from analytics or UI code.
