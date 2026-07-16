import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import NavButton from "./components/nav-button";
import { FaBars, FaBell, FaCircleNodes, FaEuroSign, FaLocationDot, FaMoneyBillTrendUp, FaMoon, FaUser, FaWaveSquare } from "react-icons/fa6";
import ZymplerLogo from "./components/zympler-logo";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="min-h-full scroll-smooth subpixel-antialiased js-focus-visible touch-manipulation bg-slate-600">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-full bg-linear-to-b from-slate-700 to-slate-600 text-slate-800">
        <div className="flex flex-col min-h-dvh h-full p-2.5 gap-2.5 md:pb-15">
          {/* top nav */}
          <div className="relative flex justify-between items-stretch gap-2.5">
            <NavButton><FaBars className="flex-none h-4.5 w-4.5" /></NavButton>
            <div className="flex-1 flex justify-center sm:justify-start items-center">
              <div className="h-8 max-w-32 mt-1"><ZymplerLogo /></div>
            </div>
            <NavButton className="md:px-2.5 md:w-auto max-w-64 xl:max-w-96 truncate">
              <FaLocationDot className="flex-none h-4.5 w-4.5" />
              <span className="hidden md:inline truncate text-sm font-medium">Zympler Utrecht</span>
            </NavButton>
            <NavButton><FaBell className="flex-none h-4.5 w-4.5" /></NavButton>
            <NavButton><FaMoon className="flex-none h-4.5 w-4.5" /></NavButton>
            <NavButton><FaUser className="flex-none h-4.5 w-4.5" /></NavButton>
          </div>

          {/* title */}
          <div className="w-full md:w-fit h-10">
            <div className="relative flex items-center justify-center gap-2.5 text-lg lg:text-2xl h-full font-semibold">
              <span className="hidden md:inline h-10 w-10 flex items-center justify-center rounded-sm" />
              <div className="relative flex items-center gap-2.5">
                <span className="max-w-full py-3 text-white">
                  PowerBase
                </span>
                <span className="text-white">\</span>
                <span className="max-w-full py-3 text-white">
                  Dashboard
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex gap-2.5">
            {/* side nav */}
            <div className="hidden md:inline flex-none w-10">
              <div className="flex flex-col gap-2.5 text-white">
                <NavButton active={true}><FaWaveSquare className="flex-none h-4.5 w-4.5" /></NavButton>
                <NavButton><FaMoneyBillTrendUp className="flex-none h-4.5 w-4.5" /></NavButton>
                <NavButton><FaEuroSign className="flex-none h-4.5 w-4.5" /></NavButton>
                <NavButton><FaLocationDot className="flex-none h-4.5 w-4.5" /></NavButton>
                <NavButton><FaCircleNodes className="flex-none h-4.5 w-4.5" /></NavButton>
              </div>
            </div>

            {/* content */}
            <div className="flex-1 flex flex-col gap-2.5 max-w-full min-w-0">
              {children}
            </div>

            {/* context bar */}
            <div className="hidden md:inline flex-none w-10">
            </div>
          </div>
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html >
  );
}

export default function App() {
  return <Outlet />;
}
