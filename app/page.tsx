const metrics = [
  { label: "Total Items", value: "128", change: "+12 this week" },
  { label: "Active Status", value: "96", change: "75% of total" },
  { label: "Pending Review", value: "18", change: "4 need attention" },
];

const items = [
  {
    id: "PRD-1042",
    title: "Wireless Noise-Canceling Headphones",
    status: "Active",
    createdAt: "2026-03-12",
  },
  {
    id: "PRD-1043",
    title: "Ergonomic Standing Desk Converter",
    status: "Pending",
    createdAt: "2026-03-18",
  },
  {
    id: "PRD-1044",
    title: "Smart Home Thermostat Hub",
    status: "Active",
    createdAt: "2026-03-22",
  },
  {
    id: "PRD-1045",
    title: "Portable Espresso Maker Kit",
    status: "Draft",
    createdAt: "2026-03-28",
  },
];

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Draft: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export default function Home() {
  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Amarel</p>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              Product Management Dashboard
            </h1>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          >
            <span aria-hidden="true" className="text-base leading-none">
              +
            </span>
            Add Item
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Summary
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <article
                key={metric.label}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-medium text-slate-500">
                  {metric.label}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                  {metric.value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{metric.change}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Items</h2>
              <p className="text-sm text-slate-500">
                Recent products in your catalog
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-5 py-3.5 font-semibold text-slate-600"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3.5 font-semibold text-slate-600"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3.5 font-semibold text-slate-600"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3.5 font-semibold text-slate-600"
                    >
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-slate-500">
                        {item.id}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {item.title}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[item.status]}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                        {item.createdAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
