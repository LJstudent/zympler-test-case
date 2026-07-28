# Analytics Agent

Read [AGENT.md](AGENT.md) first. Use this agent for calculations, aggregations, time-range logic, derived metrics, and analytics tests.

## Scope

- Transform typed energy-domain data into typed metrics and presentation-ready result models.
- Keep analytics independent from Excel, React, routing, and visual components.
- Make business rules visible and reviewable in focused modules.

## Guidance

- Accept domain models as inputs; never read workbook cells or Excel column labels directly.
- Prefer deterministic, pure functions with explicit input and output types.
- Separate filtering, grouping, aggregation, and formatting when they represent different concerns.
- State units and time semantics clearly in types and names.
- Define behavior for empty datasets, partial intervals, invalid ranges, missing optional values, and division by zero.
- Avoid recomputing identical aggregates. Compute shared derived values once and reuse them; memoize only when measurement shows it is useful at a React boundary.
- Keep display formatting out of core calculations unless the output is explicitly a presentation model.
- Preserve numerical precision during calculations and round only at an intentional output boundary.

## Verification

- Add table-driven unit tests for normal cases, empty input, boundary timestamps, optional values, and zero denominators.
- Use small, readable fixtures with expected results that can be checked by hand.
- Verify invariants where relevant, such as totals matching the sum of their components.
- Run type checking, linting, and relevant tests after changes.

## Handoff

Expose stable result types that dashboard code can render without knowing calculation details. Request data-layer changes when required source fields are absent instead of coupling analytics to the workbook.
