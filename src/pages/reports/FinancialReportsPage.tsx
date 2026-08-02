import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { reportsAdminService } from '@/services/reportsAdmin.service'
import { formatMoney } from '@/lib/cn'

export function FinancialReportsPage() {
  const snap = reportsAdminService.financialSnapshot()

  const kpis = [
    {
      label: 'Revenue',
      value: snap.revenue,
      to: '/finance/invoices',
      tone: 'text-emerald-700',
    },
    {
      label: 'Customer billing',
      value: snap.customerBilling,
      to: '/finance/customer-billing',
      tone: 'text-sky-800',
    },
    {
      label: 'Outstanding',
      value: snap.outstanding,
      to: '/finance/payments',
      tone: 'text-amber-800',
    },
    {
      label: 'Vendor payments',
      value: snap.vendorPayments,
      to: '/finance/vendor-billing',
      tone: 'text-slate-800',
    },
  ] as const

  return (
    <div>
      <PageHeader
        title="Financial Reports"
        description="Billing, vendor payments, outstanding invoices, revenue, expenses, GST, and P&L."
        actions={
          <Link
            to="/finance/reports"
            className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
          >
            Finance module reports
          </Link>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Link
            key={k.label}
            to={k.to}
            className="surface-panel block p-4 transition hover:ring-2 hover:ring-sky-200"
          >
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{k.label}</p>
            <p className={`mt-1 font-heading text-2xl font-semibold ${k.tone}`}>
              {formatMoney(k.value)}
            </p>
          </Link>
        ))}
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Monthly revenue
          </p>
          <p className="mt-1 font-heading text-xl font-semibold">
            {formatMoney(snap.monthlyRevenue)}
          </p>
        </div>
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
            Operational cost
          </p>
          <p className="mt-1 font-heading text-xl font-semibold">
            {formatMoney(snap.operationalCost)}
          </p>
        </div>
        <div className="surface-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
            Gross margin
          </p>
          <p className="mt-1 font-heading text-xl font-semibold">{snap.grossMarginPct}%</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface-panel p-4">
          <h2 className="font-heading text-base font-semibold">Revenue mix</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Warehouse ops</dt>
              <dd className="font-semibold">{formatMoney(snap.warehouseRevenue)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">
                <Link to="/finance/storage-charges" className="text-sky-700 hover:underline">
                  Storage
                </Link>
              </dt>
              <dd className="font-semibold">{formatMoney(snap.storageRevenue)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">
                <Link to="/finance/pick-pack-charges" className="text-sky-700 hover:underline">
                  Pick & pack
                </Link>
              </dt>
              <dd className="font-semibold">{formatMoney(snap.pickPackRevenue)}</dd>
            </div>
            <div className="flex justify-between border-t pt-2">
              <dt className="text-slate-500">GST collected</dt>
              <dd className="font-semibold">{formatMoney(snap.gstCollected)}</dd>
            </div>
          </dl>
        </section>

        <section className="surface-panel p-4">
          <h2 className="font-heading text-base font-semibold">Profit & loss</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Revenue</dt>
              <dd className="font-semibold text-emerald-800">{formatMoney(snap.revenue)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Expenses (vendor)</dt>
              <dd className="font-semibold text-rose-800">{formatMoney(snap.expenses)}</dd>
            </div>
            <div className="flex justify-between border-t pt-2">
              <dt className="font-semibold text-slate-700">Net</dt>
              <dd
                className={`font-heading text-xl font-semibold ${
                  snap.profit >= 0 ? 'text-emerald-800' : 'text-rose-800'
                }`}
              >
                {formatMoney(snap.profit)}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  )
}
