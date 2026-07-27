import { useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { DataTable, type DataColumn } from '@/components/enterprise/DataTable'
import { Breadcrumbs, SideDrawer, StatusBadge } from '@/components/enterprise/OutboundUi'
import { usePickExceptions, useResolveException } from '@/hooks/useOutbound'
import { EXCEPTION_LABELS, type PickException } from '@/types/outbound'
import { useToastStore } from '@/store/useToastStore'

export function PickExceptionsPage() {
  const q = usePickExceptions()
  const resolve = useResolveException()
  const toast = useToastStore((s) => s.push)
  const [active, setActive] = useState<PickException | null>(null)
  const [replacement, setReplacement] = useState('')

  const columns: DataColumn<PickException>[] = [
    { id: 'order', header: 'Order', sortValue: (r) => r.orderNumber, accessor: (r) => <span className="font-semibold">{r.orderNumber}</span> },
    { id: 'sku', header: 'SKU', sortValue: (r) => r.sku, accessor: (r) => r.sku },
    {
      id: 'type',
      header: 'Type',
      sortValue: (r) => r.type,
      accessor: (r) => <StatusBadge label={EXCEPTION_LABELS[r.type]} tone="amber" />,
    },
    {
      id: 'status',
      header: 'Status',
      sortValue: (r) => r.status,
      accessor: (r) => <StatusBadge label={r.status} tone={r.status === 'RESOLVED' ? 'green' : 'red'} />,
    },
    { id: 'by', header: 'Raised by', accessor: (r) => r.raisedBy },
    {
      id: 'at',
      header: 'When',
      sortValue: (r) => +new Date(r.raisedAt),
      accessor: (r) => new Date(r.raisedAt).toLocaleString(),
    },
  ]

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Outbound' }, { label: 'Pick exceptions' }]} />
      <PageHeader
        title="Pick exceptions"
        description="Out of stock, wrong item, damaged, missing inventory, and short-pick replacement workflows."
      />
      <DataTable
        rows={q.data ?? []}
        columns={columns}
        loading={q.isLoading}
        onRowClick={(r) => {
          setActive(r)
          setReplacement(r.sku)
        }}
        searchPlaceholder="Search exceptions…"
      />

      <SideDrawer open={!!active} title="Exception workflow" onClose={() => setActive(null)}>
        {active ? (
          <div className="space-y-4 text-sm">
            <StatusBadge label={EXCEPTION_LABELS[active.type]} tone="amber" />
            <p>
              <span className="text-slate-500">Order</span> · {active.orderNumber}
            </p>
            <p>
              <span className="text-slate-500">SKU</span> · {active.sku}
            </p>
            <p className="rounded-xl bg-slate-50 p-3 text-slate-700">{active.notes}</p>
            {active.status !== 'RESOLVED' ? (
              <>
                <label className="block text-xs font-medium text-slate-600">
                  Replacement SKU
                  <input
                    value={replacement}
                    onChange={(e) => setReplacement(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <button
                  type="button"
                  className="w-full rounded-xl bg-primary-600 py-2.5 font-semibold text-white"
                  onClick={async () => {
                    try {
                      await resolve.mutateAsync({ id: active.id, replacementSku: replacement })
                      toast('Exception resolved')
                      setActive(null)
                    } catch (e) {
                      toast((e as Error).message, 'error')
                    }
                  }}
                >
                  Resolve with replacement
                </button>
              </>
            ) : (
              <p className="text-emerald-700">Already resolved{active.replacementSku ? ` → ${active.replacementSku}` : ''}.</p>
            )}
          </div>
        ) : null}
      </SideDrawer>
    </div>
  )
}
