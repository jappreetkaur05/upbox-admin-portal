import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useUpdateWarehouseRate, useWarehouseRates } from '@/hooks/useFinanceAdmin'
import { formatMoney } from '@/lib/cn'

export function WarehouseChargesPage() {
  const ratesQ = useWarehouseRates()
  const update = useUpdateWarehouseRate()

  return (
    <div>
      <PageHeader
        title="Warehouse Charges"
        description="Operational charge rates billed to customers — receiving, putaway, handling, loading, special storage."
      />

      {ratesQ.isLoading ? <LoadingPanel label="Loading rates…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Charge</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Rate (₹)</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3">Example (×100)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(ratesQ.data ?? []).map((r) => (
                <tr key={r.id} className="hover:bg-sky-50/40">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{r.unit}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      className="surface-input w-24 px-2 py-1.5 text-sm"
                      defaultValue={r.rate}
                      onBlur={async (e) => {
                        const rate = Number(e.target.value) || 0
                        if (rate !== r.rate) await update.mutateAsync({ id: r.id, rate })
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={r.active}
                      onChange={async (e) => {
                        await update.mutateAsync({
                          id: r.id,
                          rate: r.rate,
                          active: e.target.checked,
                        })
                      }}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                    {formatMoney(r.rate * 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
