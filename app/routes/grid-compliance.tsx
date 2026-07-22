import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

import { Card } from "~/components/ui/card";

export default function GridComplianceDetails() {
  return (
    <main className="min-h-dvh bg-white p-4 sm:p-6">
      <Card className="mx-auto max-w-3xl p-6 shadow-panel sm:p-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-brand-blue hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to overview
        </Link>
        <h1 className="mt-8 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
          Grid compliance
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Detailed grid-capacity timelines and violation analysis will be added here.
        </p>
      </Card>
    </main>
  );
}
