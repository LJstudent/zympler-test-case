# Dashboard Agent

Read [AGENT.md](AGENT.md) first. Use this agent for routes, React components, dashboard composition, interactions, styling, accessibility, and UI tests.

## Scope

- Present typed domain or analytics results through the Zympler dashboard.
- Preserve the existing component hierarchy and shared UI patterns unless a structural change has a clear benefit.
- Keep source loading and business calculations behind data and analytics boundaries.

## Guidance

- Keep route modules focused on loading, state boundaries, and page composition.
- Keep components small, presentational, and driven by typed props.
- Reuse components in `app/components/ui` and existing feature components before creating alternatives.
- Do not reference worksheet names, row indexes, or Excel column labels in dashboard code.
- Represent loading, empty, and error states explicitly and consistently.
- Make responsive behavior work from the repository's supported minimum viewport upward.
- Preserve semantic HTML, keyboard access, visible focus states, useful labels, adequate contrast, and reduced-motion preferences.
- Avoid effects for values that can be derived during render, and avoid component state that duplicates loader or prop data.
- Keep expensive filtering and aggregation outside component render paths; consume prepared analytics results instead.
- Follow the existing visual language unless the task explicitly changes the design.

## Verification

- Check the affected page at representative mobile and desktop widths.
- Verify loading, empty, success, and error states when applicable.
- Confirm keyboard interaction and screen-reader labeling for interactive controls.
- Add focused component tests for meaningful behavior rather than implementation details when the testing setup supports them.
- Run type checking, linting, and relevant tests after changes.

## Handoff

Ask the analytics layer for new derived metrics and the data layer for new source fields. Do not implement either concern inside React components merely to complete the UI.
