import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { MockQrTile } from '@/components/barcodes/MockCodePreviews'
import { useGenerateQrs, useGeneratedQrs } from '@/hooks/useBarcodesAdmin'
import {
  ENTITY_TYPE_LABELS,
  type BarcodeEntityType,
  type QrMode,
} from '@/types/barcodesAdmin'

export function QrGeneratorPage() {
  const listQ = useGeneratedQrs()
  const generate = useGenerateQrs()
  const [toast, setToast] = useState<string | null>(null)
  const [form, setForm] = useState({
    entityType: 'sku' as BarcodeEntityType,
    entityRef: 'NK-AM-BLK-42',
    payload: 'sku:NK-AM-BLK-42|details:Nike Air Max Black 42',
    mode: 'static' as QrMode,
    count: 1,
  })

  return (
    <div>
      <PageHeader
        title="QR Code Generator"
        description="Encode SKU, batch, location, shipment, or tracking URL into printable QR codes."
        actions={
          <Link
            to="/barcodes/printing"
            className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
          >
            Print labels
          </Link>
        }
      />

      {toast ? (
        <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="surface-panel h-fit space-y-3 p-4">
          <h3 className="font-heading text-sm font-semibold">Generate QR</h3>
          <label className="block text-xs font-semibold text-slate-600">
            Entity type
            <select
              className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
              value={form.entityType}
              onChange={(e) =>
                setForm({ ...form, entityType: e.target.value as BarcodeEntityType })
              }
            >
              {(Object.keys(ENTITY_TYPE_LABELS) as BarcodeEntityType[]).map((k) => (
                <option key={k} value={k}>
                  {ENTITY_TYPE_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Entity ref
            <input
              className="surface-input mt-1 w-full px-3 py-2 font-mono text-sm"
              value={form.entityRef}
              onChange={(e) => setForm({ ...form, entityRef: e.target.value })}
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Payload
            <textarea
              className="surface-input mt-1 w-full px-3 py-2 font-mono text-xs"
              rows={4}
              value={form.payload}
              onChange={(e) => setForm({ ...form, payload: e.target.value })}
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Mode
            <select
              className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
              value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value as QrMode })}
            >
              <option value="static">Static</option>
              <option value="dynamic">Dynamic</option>
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Count
            <input
              type="number"
              min={1}
              max={20}
              className="surface-input mt-1 w-full px-3 py-2 text-sm"
              value={form.count}
              onChange={(e) => setForm({ ...form, count: Number(e.target.value) || 1 })}
            />
          </label>
          <button
            type="button"
            className="w-full cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={async () => {
              const created = await generate.mutateAsync(form)
              setToast(`Generated ${created.length} QR code(s)`)
              setTimeout(() => setToast(null), 2200)
            }}
          >
            Generate QR
          </button>
        </aside>

        <section>
          {listQ.isLoading ? <LoadingPanel label="Loading QR codes…" /> : null}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {(listQ.data ?? []).map((q) => (
              <div key={q.id} className="surface-panel flex gap-3 p-4">
                <MockQrTile payload={q.payload} />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs font-semibold text-slate-900">{q.entityRef}</p>
                  <p className="mt-1 truncate text-[11px] text-slate-500" title={q.payload}>
                    {q.payload}
                  </p>
                  <p className="mt-2 text-[10px] font-bold uppercase text-slate-400">
                    {q.mode} · {ENTITY_TYPE_LABELS[q.entityType]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
