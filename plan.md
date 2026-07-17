# Zympler dashboard implementation plan

## Current project structure

- `app/root.tsx` owns the document shell and currently also renders the complete legacy navigation chrome.
- `app/routes.ts` declares a single React Router index route.
- `app/routes/dashboard.tsx` is the current dashboard route. It loads local telemetry/plan JSON with simulated server delays and renders status, measurement, grid, battery, charger, and solar blocks.
- `app/components/` contains the legacy shell building blocks, logo, content blocks, number animation, and chart components.
- `app/content/` contains the local dashboard data used by the current route.
- `app/utils/` contains graph definitions, types, constants, colours, and formatters.
- `app/app.css` uses Tailwind CSS v4 with an inline `@theme` configuration. It already defines Zympler azure (`#003ed0`) and mint (`#00ffa6`) colour scales and the Poppins font.
- The project uses React 19 and React Router 7.13 in framework mode with SSR enabled.

## Relevant existing components and routes

- The root route currently points to `app/routes/dashboard.tsx`.
- The current dashboard uses `FaSolarPanel`, `FaChargingStation`, and `FaBatteryFull` from `react-icons/fa6`; the new cards will reuse these icons.
- `ZymplerLogo`, `NavButton`, and the navigation structure currently in `app/root.tsx` are part of the legacy presentation.

## Preserving the old dashboard

- Move the current dashboard route module to `app/routes/old-dashboard.tsx` without changing its loader, charts, content, or status blocks.
- Extract the existing navigation, title, side rail, and content wrapper from the root document into a focused `LegacyDashboardShell` component.
- Render the preserved route inside that shell at `/old`. This avoids duplicating the large dashboard implementation and keeps its appearance and behavior as close as possible to the original.
- Keep `app/root.tsx` as the shared document/SSR boundary so both routes support direct navigation and refresh.

## Proposed routing structure

- `/` -> `app/routes/dashboard.tsx`: new system-status dashboard.
- `/old` -> `app/routes/old-dashboard.tsx`: preserved original dashboard inside the legacy shell.
- Declare both with React Router route config helpers in `app/routes.ts`; do not inspect `window.location`.

## Proposed component structure

- `app/routes/dashboard.tsx`: page composition, metadata, and the single isolated simulated loading state.
- `app/components/dashboard/section-heading.tsx`: semantic section heading with flexible CSS border lines.
- `app/components/dashboard/system-status-card.tsx`: reusable, accessible card driven by typed data.
- `app/components/dashboard/system-status-card-skeleton.tsx`: loading placeholder matching the final card proportions.
- `app/components/legacy-dashboard-shell.tsx`: preserved navigation and layout chrome.
- `app/components/ui/tooltip.tsx` and `app/components/ui/skeleton.tsx`: only the shadcn/ui primitives needed in this phase.
- `app/data/system-status.ts`: shared system identifier/type and the three typed card records.

## Styling approach

- Continue using Tailwind CSS v4 and the existing Poppins font and brand colour tokens.
- Add the secondary brand blue (`#bdd2ff`) to the existing Tailwind theme and use transparent azure, mint, and secondary-blue variants for borders, glows, and background details.
- Build a restrained technical background with layered CSS gradients, fine borders, rounded cards, and soft shadows. Keep text contrast high and avoid unrelated accent colours.
- Keep route-specific layout in page/components rather than adding a separate large stylesheet.

## Animation approach

- Use Tailwind/CSS transitions for card hover, a subtle status-dot pulse, skeleton shimmer, and card entrance.
- Centralize the prototype loading delay in the route module and clear its single timer during effect cleanup.
- Add `motion-reduce` variants so status, skeleton, entrance, and hover motion are disabled or reduced when requested by the user.

## Responsive design approach

- Constrain the content to a readable maximum width with responsive page padding.
- Use a one-column grid on phones, two columns on medium/tablet widths, and three columns on large screens.
- Let section-heading rules flex and shrink so they never force horizontal overflow.
- Keep card padding, touch targets, and typography comfortable at all breakpoints.

## Accessibility considerations

- Preserve a logical `h1` then `h2` hierarchy and use a semantic `section` labelled by its heading.
- Include visible `Online` text in addition to the coloured indicator.
- Mark system icons decorative because the adjacent system name supplies the same information.
- Use a real button as each tooltip trigger, with an accessible label, visible focus styling, and mouse/keyboard tooltip behavior.
- Respect reduced-motion preferences and maintain strong foreground/background contrast.

## Dependency changes

- Add `@radix-ui/react-tooltip`, the accessible primitive used by the shadcn/ui Tooltip component.
- Add a minimal `components.json` shadcn/ui configuration for this Tailwind v4/TypeScript repository.
- Do not add Lucide because existing project icons cover all system and info-icon needs.

## Implementation checklist

- [x] Preserve the existing dashboard as the `/old` route.
- [x] Extract and retain the legacy application shell.
- [x] Add the `/` route and typed system-status data.
- [x] Add the shadcn/ui Tooltip and Skeleton primitives only.
- [x] Build the responsive section heading, skeleton, and reusable system card.
- [x] Add centralized loading and reduced-motion-friendly reveal behavior.
- [x] Add brand-secondary styling and route-specific dashboard visuals.
- [x] Format the repository.
- [x] Run ESLint and TypeScript validation.
- [x] Confirm that no test command is currently declared in `package.json`.
- [x] Run a production build and manually verify `/` and `/old`.

## Logical next steps

After the visual direction is approved, the next iteration should connect system health to real data and add an energy-flow overview. That section can summarize live production, charging, storage, and grid exchange while reusing the same card, loading, accessibility, and responsive conventions established here.
