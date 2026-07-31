import { PageHeader } from '@/layout/PageHeader'
import { Breadcrumbs, StatusBadge } from '@/components/enterprise/OutboundUi'
import { OutboundChrome } from '@/components/enterprise/OutboundChrome'
import { useAllocationRules, useAutoAllocate, useManualAllocate, useOutboundOrders } from '@/hooks/useOutbound'
import { useToastStore } from '@/store/useToastStore'

export function AllocationPage() {
  const rulesQ = useAllocationRules()
  const openQ = useOutboundOrders({ status: 'OPEN' })
  const allocatedQ = useOutboundOrders({ status: 'ALLOCATED' })
  const autoAlloc = useAutoAllocate()
  const manual = useManualAllocate()
  const toast = useToastStore((s) => s.push)

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Outbound' }, { label: 'Allocation' }]} />
      <PageHeader
        title="Allocation"
        description="Reserve inventory locations for open orders before sending them to pick."
        actions={
          <button
            type="button"
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={async () => {
              try {
                const rows = await autoAlloc.mutateAsync(undefined)
                toast(`Auto-allocated ${rows.length} order(s)`)
              } catch (e) {
                toast((e as Error).message, 'error')
              }
            }}
          >
            Run auto allocation
          </button>
        }
      />

      <OutboundChrome
        what="Allocate stock locations to open orders."
        doNow={
          (openQ.data?.length ?? 0)
            ? `${openQ.data!.length} open order(s) need allocation.`
            : 'No open orders — send allocated ones to pick.'
        }
        nextLabel="Next: Send to pick"
        nextTo="/outbound/waves"
      >
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="surface-card p-5 lg:col-span-1">
          <h2 className="font-heading text-base">Allocation rules</h2>
          <ul className="mt-4 space-y-3">
            {(rulesQ.data ?? []).map((r) => (
              <li key={r.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{r.name}</p>
                  <StatusBadge label={r.enabled ? 'On' : 'Off'} tone={r.enabled ? 'green' : 'slate'} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{r.description}</p>
                <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-primary-700">{r.strategy}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface-card p-5 lg:col-span-2">
          <h2 className="font-heading text-base">Open orders — manual zone assignment</h2>
          <div className="mt-4 space-y-3">
            {(openQ.data ?? []).map((o) => (
              <div key={o.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{o.orderNumber}</p>
                    <p className="text-xs text-slate-500">{o.customerName}</p>
                  </div>
                  <StatusBadge label={o.priority} tone="amber" />
                </div>
                <ul className="mt-3 space-y-2">
                  {o.lines.map((l) => (
                    <li key={l.id} className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="min-w-0 flex-1">
                        {l.sku} · {l.name} ×{l.qty}
                      </span>
                      <select
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        defaultValue=""
                        onChange={async (e) => {
                          if (!e.target.value) return
                          try {
                            await manual.mutateAsync({
                              orderId: o.id,
                              lineId: l.id,
                              locationCode: e.target.value,
                            })
                            toast(`Allocated ${l.sku}`)
                          } catch (err) {
                            toast((err as Error).message, 'error')
                          }
                        }}
                      >
                        <option value="">Assign location…</option>
                        <option value="W.A.R1.B1.3">W.A.R1.B1.3</option>
                        <option value="W.A.R2.B1.2">W.A.R2.B1.2</option>
                        <option value="W.A.R3.B1.1">W.A.R3.B1.1</option>
                        <option value="W.B.R1.B2.1">W.B.R1.B2.1</option>
                        <option value="W.B.R2.B1.2">W.B.R2.B1.2</option>
                      </select>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {!openQ.data?.length ? <p className="text-sm text-slate-500">No open orders waiting for allocation.</p> : null}
          </div>

          <h3 className="mt-8 font-heading text-sm text-slate-700">Recently allocated</h3>
          <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
            {(allocatedQ.data ?? []).slice(0, 6).map((o) => (
              <li key={o.id} className="flex justify-between px-3 py-2 text-sm">
                <span>{o.orderNumber}</span>
                <span className="text-slate-500">{o.lines.map((l) => l.allocatedLocationCode).join(', ')}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      </OutboundChrome>
    </div>
  )
}
