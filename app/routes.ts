import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/dashboard.tsx"),
  route("overview/grid-compliance", "routes/grid-compliance.tsx"),
] satisfies RouteConfig;
