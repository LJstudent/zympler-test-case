import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/dashboard.tsx"),
  route("overview/grid-compliance", "routes/grid-compliance.tsx"),
  route("assets/solar", "routes/solar-details.tsx"),
  route("assets/battery", "routes/battery-details.tsx"),
] satisfies RouteConfig;
