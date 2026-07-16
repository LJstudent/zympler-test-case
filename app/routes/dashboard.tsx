import ContentBlock from "~/components/content-block";
import type { Route } from "./+types/dashboard";
import { Await, type UIMatch } from "react-router";
import telemetry from "~/content/telemetry.json";
import plan from "~/content/plan.json";
import curtailed_solar from "~/content/curtailed_solar.json";
import TimeseriesGraph from "~/components/timeseries-graph";
import { ENERGY_FORMAT, MergedBatteryMeasurementGraph, MergedBatteryStateOfChargeMeasurementGraph, MergedChargerMeasurementGraph, MergedGridMeterMeasurementGraph, MergedMeasurementSourceGraph, MergedMeasurementTargetGraph, MergedSolarWithCurtailmentMeasurementGraph, PERCENTAGE_FORMAT } from "~/utils/graphs";
import { Suspense } from "react";
import { FaArrowRightFromBracket, FaArrowRightToBracket, FaBatteryFull, FaBatteryThreeQuarters, FaBolt, FaChargingStation, FaChartColumn, FaNetworkWired, FaShieldHeart, FaSolarPanel } from "react-icons/fa6";
import { format_intl_number } from "~/utils/functions";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Zympler" },
    { name: "description", content: "Welcome to the Zympler portal!" },
  ];
}

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
const delayedResolve = <T extends unknown>(data: T, ms: number): Promise<T> =>
  delay(ms).then(() => data);

export const loader = async ({ context, request, params }: Route.LoaderArgs) => {
  return {
    telemetry: delayedResolve(telemetry, 1000),
    plan: delayedResolve(plan, 1500),
    curtailed_solar: delayedResolve(curtailed_solar, 2500),

    from_grid: delayedResolve(187_123, 200),
    to_grid: delayedResolve(23_234, 250),

    from_grid_utilization: delayedResolve(0.355, 150),
    to_grid_utilization: delayedResolve(0.168, 75),
  };
}

export default function Home({ loaderData, actionData, params, matches }: Route.ComponentProps & { matches: UIMatch[] }) {
  const {
    telemetry,
    plan,
    curtailed_solar,

    from_grid,
    to_grid,

    from_grid_utilization,
    to_grid_utilization,
  } = loaderData;

  return (
    <>
      <ContentBlock>
        <h2 className="flex gap-2.5 items-center text-xl font-medium"><FaShieldHeart className="h-5 w-5" />Status</h2>
        <span className="font-medium flex flex-col gap-1">
          <span className="text-sm text-slate-400">Assets</span>
          <span>13 / 15 healthy</span>
        </span>
      </ContentBlock>

      <ContentBlock>
        <h2 className="flex gap-2.5 items-center text-xl font-medium"><FaChartColumn className="h-5 w-5" />Measurements</h2>

        <Suspense>
          <Await resolve={from_grid}>
            {(from_grid) => (
              <span className="font-medium flex flex-col gap-1">
                <span className="text-sm text-slate-400">Take</span>
                <span>{format_intl_number(from_grid, ENERGY_FORMAT)}</span>
              </span>
            )}
          </Await>
        </Suspense>

        <Suspense>
          <Await resolve={to_grid}>
            {(to_grid) => (
              <span className="font-medium flex flex-col gap-1">
                <span className="text-sm text-slate-400">Feed-in</span>
                <span>{format_intl_number(to_grid, ENERGY_FORMAT)}</span>
              </span>
            )}
          </Await>
        </Suspense>
      </ContentBlock>

      <ContentBlock>
        <h2 className="flex gap-2.5 items-center text-xl font-medium"><FaNetworkWired className="h-5 w-5" />Grid connection</h2>

        <Suspense>
          <Await resolve={from_grid_utilization}>
            {(from_grid_utilization) => (
              <span className="font-medium flex flex-col gap-1">
                <span className="text-sm text-slate-400">Take utilization</span>
                <span>{format_intl_number(from_grid_utilization, PERCENTAGE_FORMAT)}</span>
              </span>
            )}
          </Await>
        </Suspense>

        <Suspense>
          <Await resolve={to_grid_utilization}>
            {(to_grid_utilization) => (
              <span className="font-medium flex flex-col gap-1">
                <span className="text-sm text-slate-400">Feed-in utilization</span>
                <span>{format_intl_number(to_grid_utilization, PERCENTAGE_FORMAT)}</span>
              </span>
            )}
          </Await>
        </Suspense>
      </ContentBlock>

      <ContentBlock>
        <h2 className="flex gap-2.5 items-center text-xl font-medium"><FaArrowRightFromBracket className="h-5 w-5" />Source</h2>
        <Suspense>
          <Await resolve={telemetry}>
            {(telemetry) => (
              <Await resolve={plan}>
                {(plan) => (
                  <TimeseriesGraph
                    graph={MergedMeasurementSourceGraph()}
                    data={telemetry}
                    forecast_data={plan}
                    x_property_name="interval.start"
                  />
                )}
              </Await>
            )}
          </Await>
        </Suspense>
      </ContentBlock>

      <ContentBlock>
        <h2 className="flex gap-2.5 items-center text-xl font-medium"><FaArrowRightToBracket className="h-5 w-5" />Target</h2>
        <Suspense>
          <Await resolve={telemetry}>
            {(telemetry) => (
              <Await resolve={plan}>
                {(plan) => (
                  <TimeseriesGraph
                    graph={MergedMeasurementTargetGraph()}
                    data={telemetry}
                    forecast_data={plan}
                    x_property_name="interval.start"
                  />
                )}
              </Await>
            )}
          </Await>
        </Suspense>
      </ContentBlock>

      <ContentBlock>
        <h2 className="flex gap-2.5 items-center text-xl font-medium"><FaBolt className="h-5 w-5" />Grid</h2>
        <Suspense>
          <Await resolve={telemetry}>
            {(telemetry) => (
              <Await resolve={plan}>
                {(plan) => (
                  <TimeseriesGraph
                    graph={MergedGridMeterMeasurementGraph()}
                    data={telemetry}
                    forecast_data={plan}
                    x_property_name="interval.start"
                  />
                )}
              </Await>
            )}
          </Await>
        </Suspense>
      </ContentBlock>

      <ContentBlock>
        <h2 className="flex gap-2.5 items-center text-xl font-medium"><FaBatteryFull className="h-5 w-5" />Batteries</h2>
        <Suspense>
          <Await resolve={telemetry}>
            {(telemetry) => (
              <Await resolve={plan}>
                {(plan) => (
                  <TimeseriesGraph
                    graph={MergedBatteryMeasurementGraph()}
                    data={telemetry}
                    forecast_data={plan}
                    x_property_name="interval.start"
                  />
                )}
              </Await>
            )}
          </Await>
        </Suspense>
      </ContentBlock>

      <ContentBlock>
        <h2 className="flex gap-2.5 items-center text-xl font-medium"><FaBatteryThreeQuarters className="h-5 w-5" />Batteries State of Charge</h2>
        <Suspense>
          <Await resolve={telemetry}>
            {(telemetry) => (
              <Await resolve={plan}>
                {(plan) => (
                  <TimeseriesGraph
                    graph={MergedBatteryStateOfChargeMeasurementGraph()}
                    data={telemetry}
                    forecast_data={plan}
                    x_property_name="interval.start"
                  />
                )}
              </Await>
            )}
          </Await>
        </Suspense>
      </ContentBlock>

      <ContentBlock>
        <h2 className="flex gap-2.5 items-center text-xl font-medium"><FaChargingStation className="h-5 w-5" />Chargers</h2>
        <Suspense>
          <Await resolve={telemetry}>
            {(telemetry) => (
              <Await resolve={plan}>
                {(plan) => (
                  <TimeseriesGraph
                    graph={MergedChargerMeasurementGraph()}
                    data={telemetry}
                    forecast_data={plan}
                    x_property_name="interval.start"
                  />
                )}
              </Await>
            )}
          </Await>
        </Suspense>
      </ContentBlock>


      <ContentBlock>
        <h2 className="flex gap-2.5 items-center text-xl font-medium"><FaSolarPanel className="h-5 w-5" />Solar</h2>
        <Suspense>
          <Await resolve={curtailed_solar}>
            {(curtailed_solar) => (
              <Await resolve={plan}>
                {(plan) => (
                  <TimeseriesGraph
                    graph={MergedSolarWithCurtailmentMeasurementGraph()}
                    data={curtailed_solar}
                    forecast_data={plan}
                    x_property_name="interval.start"
                  />
                )}
              </Await>
            )}
          </Await>
        </Suspense>
      </ContentBlock>


    </>
  )
}
