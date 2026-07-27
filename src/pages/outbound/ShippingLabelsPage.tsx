import { useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { DataTable, type DataColumn } from '@/components/enterprise/DataTable'
import { Breadcrumbs, StatusBadge } from '@/components/enterprise/OutboundUi'
import { useGenerateLabel, useOutboundOrders, usePrintLabel, useShippingLabels } from '@/hooks/useOutbound'
import { COURIER_LABELS, type CourierCode, type ShippingLabel } from '@/types/outbound'
import { useToastStore } from '@/store/useToastStore'

export function ShippingLabelsPage() {
  const labelsQ = useShippingLabels()
  const readyQ = useOutboundOrders({ status: 'READY' })
  const packedQ = useOutboundOrders({ status: 'PACKED' })
  const generate = useGenerateLabel()
  const print = usePrintLabel()
  const toast = useToastStore((s) => s.push)
  const [courier, setCourier] = useState<CourierCode>('UPBOX')
  const candidates = [...(packedQ.data ?? []), ...(readyQ.data ?? [])]

  const handlePrint = async (label: ShippingLabel, reprint = false) => {
    try {
      await print.mutateAsync(label.id)
      toast(reprint ? `Reprinted · ${label.trackingNumber}` : `Printed · ${label.trackingNumber}`)
      window.print()
    } catch (e) {
      toast((e as Error).message, 'error')
    }
  }

  const columns: DataColumn<ShippingLabel>[] = [
    { id: 'order', header: 'Order', sortValue: (r) => r.orderNumber, accessor: (r) => <span className="font-semibold">{r.orderNumber}</span> },
    { id: 'track', header: 'Tracking', sortValue: (r) => r.trackingNumber, accessor: (r) => <span className="font-mono text-xs">{r.trackingNumber}</span> },
    { id: 'courier', header: 'Courier', accessor: (r) => COURIER_LABELS[r.courier] },
    { id: 'barcode', header: 'Barcode', accessor: (r) => <span className="font-mono text-xs">{r.barcode}</span> },
    {
      id: 'printCount',
      header: 'Print count',
      sortValue: (r) => r.printCount,
      accessor: (r) => <span className="font-semibold">{r.printCount}</span>,
    },
    {
      id: 'printed',
      header: 'Last printed',
      sortValue: (r) => (r.printedAt ? +new Date(r.printedAt) : 0),
      accessor: (r) => (r.printedAt ? new Date(r.printedAt).toLocaleString() : '—'),
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: (r) => (
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            className="rounded-lg bg-primary-600 px-2.5 py-1 text-xs font-semibold text-white"
            onClick={() => void handlePrint(r, false)}
          >
            Print
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold"
            onClick={() => void handlePrint(r, true)}
          >
            Reprint
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Outbound' }, { label: 'Shipping labels' }]} />
      <PageHeader title="Shipping labels" description="Tracking numbers, barcodes, print counts, and courier selection." />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <section className="surface-card space-y-3 p-4 lg:col-span-1">
          <h2 className="font-heading text-sm">Generate label</h2>
          <label className="block text-xs font-medium">
            Courier
            <select value={courier} onChange={(e) => setCourier(e.target.value as CourierCode)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
              {Object.entries(COURIER_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <ul className="max-h-56 space-y-2 overflow-auto">
            {candidates.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-2 py-2 text-sm">
                <span>{o.orderNumber}</span>
                <button
                  type="button"
                  className="rounded-lg bg-primary-600 px-2.5 py-1 text-xs font-semibold text-white"
                  onClick={async () => {
                    try {
                      const lbl = await generate.mutateAsync({ orderId: o.id, courier })
                      toast(`Label ${lbl.trackingNumber}`)
                    } catch (e) {
                      toast((e as Error).message, 'error')
                    }
                  }}
                >
                  Generate
                </button>
              </li>
            ))}
            {!candidates.length ? <p className="text-xs text-slate-500">No packed/ready orders.</p> : null}
          </ul>
        </section>

        <div className="lg:col-span-2 space-y-4">
          <DataTable rows={labelsQ.data ?? []} columns={columns} loading={labelsQ.isLoading} searchPlaceholder="Search labels…" />
          <div className="grid gap-3 sm:grid-cols-2">
            {(labelsQ.data ?? []).slice(0, 2).map((lbl) => (
              <div key={lbl.id} className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-slate-500">{COURIER_LABELS[lbl.courier]}</p>
                <p className="mt-2 font-heading text-lg">{lbl.orderNumber}</p>
                <p className="mt-3 font-mono text-sm tracking-widest">{lbl.barcode}</p>
                <div className="mx-auto mt-3 flex h-20 w-20 items-center justify-center rounded-lg bg-slate-900 text-[10px] text-white">
                  QR
                  <br />
                  mock
                </div>
                <p className="mt-2 font-mono text-xs text-slate-600">{lbl.trackingNumber}</p>
                <p className="mt-1 text-xs text-slate-500">Printed {lbl.printCount}×</p>
                <StatusBadge label="Printable" tone="green" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
