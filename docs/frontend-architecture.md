# Frontend architecture

The application is organized by business capability. Keep feature-specific UI,
calculations, formatting, types, loading states, and tests together.

## Ownership

- `app/components/ui`: domain-neutral visual primitives.
- `app/features/energy-data`: workbook loading, source-column mapping, parsing,
  normalization, generic energy types, and generic energy formatting.
- `app/features/overview`: Overview composition and its `grid-compliance`,
  `smart-charging`, and `solar-charging` KPI subfeatures.
- `app/features/system-status`: system-status models, data boundary, components,
  labels, and loading states.
- `app/features/sidebar`: sidebar navigation and asset cards.
- `app/features/assets/grid`: Grid pages, calculations, charts, tables, and
  states.
- `app/features/assets/solar`: Solar data mapping, calculations, KPIs, and
  presentation configuration.
- `app/features/assets/shared`: asset-detail layout, chart, controls, time
  selection and aggregation, tooltip, legend, and interaction building blocks
  shared by implemented asset features.
- `app/layouts`: application-shell composition.
- `app/routes`: thin URL adapters that load route data and render feature entry
  components.

Keep asset business calculations in their owning feature. Add to
`app/features/assets/shared` only when at least two implemented asset features
need the same abstraction with the same responsibility.

Energy-flow colors are semantic rather than asset-specific. Detail features
must import them from `assets/shared/constants/energy-flow-colors.ts` so the
same source or destination keeps the same color on every asset page.

## Dependency direction

Dependencies flow in this direction:

```text
routes
  -> layouts and features
    -> energy-data and established shared asset abstractions
      -> components/ui
```

Generic UI and energy-data modules must not import feature code. Asset features
must not import another asset feature's internals, and Overview subfeatures must
not import one another's internals. Use a feature's `index.ts` when crossing a
feature boundary.

## Working rules

- Keep route modules thin and React components presentational.
- Keep Excel column names inside `energy-data`; expose typed domain models.
- Keep business calculations and feature-specific formatting in the feature
  that gives them meaning.
- Colocate tests with their implementation.
- Prefer shallow, explicit file names over generic helpers or speculative shared
  abstractions.
