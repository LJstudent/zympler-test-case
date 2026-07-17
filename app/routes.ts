import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/dashboard.tsx"),
  route("old", "routes/old-dashboard.tsx"),
] satisfies RouteConfig;
