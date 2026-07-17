import {
  FaBars,
  FaBell,
  FaCircleNodes,
  FaEuroSign,
  FaLocationDot,
  FaMoneyBillTrendUp,
  FaMoon,
  FaUser,
  FaWaveSquare,
} from "react-icons/fa6";

import NavButton from "./nav-button";
import ZymplerLogo from "./zympler-logo";

export default function LegacyDashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-linear-to-b from-slate-700 to-slate-600 text-slate-800">
      <div className="flex min-h-dvh flex-col gap-2.5 p-2.5 md:pb-15">
        <header className="relative flex items-stretch justify-between gap-2.5">
          <NavButton>
            <FaBars className="h-4.5 w-4.5 flex-none" />
          </NavButton>
          <div className="flex flex-1 items-center justify-center sm:justify-start">
            <div className="mt-1 h-8 max-w-32">
              <ZymplerLogo />
            </div>
          </div>
          <NavButton className="max-w-64 truncate md:w-auto md:px-2.5 xl:max-w-96">
            <FaLocationDot className="h-4.5 w-4.5 flex-none" />
            <span className="hidden truncate text-sm font-medium md:inline">Zympler Utrecht</span>
          </NavButton>
          <NavButton>
            <FaBell className="h-4.5 w-4.5 flex-none" />
          </NavButton>
          <NavButton>
            <FaMoon className="h-4.5 w-4.5 flex-none" />
          </NavButton>
          <NavButton>
            <FaUser className="h-4.5 w-4.5 flex-none" />
          </NavButton>
        </header>

        <div className="h-10 w-full md:w-fit">
          <div className="relative flex h-full items-center justify-center gap-2.5 text-lg font-semibold lg:text-2xl">
            <span className="hidden h-10 w-10 items-center justify-center rounded-sm md:flex" />
            <div className="relative flex items-center gap-2.5 text-white">
              <span className="max-w-full py-3">PowerBase</span>
              <span aria-hidden="true">\</span>
              <span className="max-w-full py-3">Dashboard</span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 gap-2.5">
          <nav aria-label="Dashboard sections" className="hidden w-10 flex-none md:block">
            <div className="flex flex-col gap-2.5 text-white">
              <NavButton active={true}>
                <FaWaveSquare className="h-4.5 w-4.5 flex-none" />
              </NavButton>
              <NavButton>
                <FaMoneyBillTrendUp className="h-4.5 w-4.5 flex-none" />
              </NavButton>
              <NavButton>
                <FaEuroSign className="h-4.5 w-4.5 flex-none" />
              </NavButton>
              <NavButton>
                <FaLocationDot className="h-4.5 w-4.5 flex-none" />
              </NavButton>
              <NavButton>
                <FaCircleNodes className="h-4.5 w-4.5 flex-none" />
              </NavButton>
            </div>
          </nav>

          <main className="flex min-w-0 max-w-full flex-1 flex-col gap-2.5">{children}</main>
          <div aria-hidden="true" className="hidden w-10 flex-none md:block" />
        </div>
      </div>
    </div>
  );
}
