import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { MockBarcodeBars } from '@/components/barcodes/MockCodePreviews'
import { useGenerateBarcodes, useGeneratedBarcodes } from '@/hooks/useBarcodesAdmin'
import {
  ENTITY_TYPE_LABELS,
  SYMBOLOGY_LABELS,
  type BarcodeEntityType,
  type BarcodeSymbology,
} from '@/types/barcodesAdmin'

export function BarcodeGeneratorPage() {
  const listQ = useGeneratedBarcodes()
  const generate = useGenerateBarcodes()
  const [toast, setToast] = useState<string | null>(null)
  const [form, setForm] = useState({
    entityType: 'sku' as BarcodeEntityType,
    entityRef: 'NK-AM-BLK-42',
    symbology: 'ean13' as BarcodeSymbology,
    count: 1,
  })

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  return (
    <div>
      <PageHeader
        title="Barcode Generator"
        description="Create unique barcodes for products, SKUs, locations, batches, and shipments."
        actions={
          <div className="flex gap-2">
            <Link
              to="/barcodes/templates"
              className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
            >
              Templates
            </Link>
            <Link
              to="/barcodes/printing"
              className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
            >
              Printing
            </Link>
          </div>
        }
      />

      {toast ? (
        <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="surface-panel h-fit space-y-3 p-4">
          <h3 className="font-heading text-sm font-semibold">Generate</h3>
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
            Assign to (SKU / code)
            <input
              className="surface-input mt-1 w-full px-3 py-2 font-mono text-sm"
              value={form.entityRef}
              onChange={(e) => setForm({ ...form, entityRef: e.target.value })}
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Symbology
            <select
              className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
              value={form.symbology}
              onChange={(e) =>
                setForm({ ...form, symbology: e.target.value as BarcodeSymbology })
              }
            >
              {(Object.keys(SYMBOLOGY_LABELS) as BarcodeSymbology[]).map((k) => (
                <option key={k} value={k}>
                  {SYMBOLOGY_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            Count (single or bulk)
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
              showToast(`Generated ${created.length} barcode(s)`)
            }}
          >
            Auto-generate
          </button>
        </aside>

        <section>
          {listQ.isLoading ? <LoadingPanel label="Loading barcodes…" /> : null}
          <div className="surface-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[800px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Preview</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Assigned</th>
                    <th className="px-4 py-3">Symbology</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(listQ.data ?? []).map((b) => (
                    <tr key={b.id} className="hover:bg-sky-50/40">
                      <td className="px-4 py-3">
                        <MockBarcodeBars value={b.value} className="w-36 rounded border" />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{b.value}</td>
                      <td className="px-4 py-3 text-xs">{ENTITY_TYPE_LABELS[b.entityType]}</td>
                      <td className="px-4 py-3 font-mono text-xs text-sky-700">{b.entityRef}</td>
                      <td className="px-4 py-3 text-xs">{SYMBOLOGY_LABELS[b.symbology]}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="cursor-pointer text-xs font-semibold text-sky-700 hover:underline"
                          onClick={() => showToast('Mock download: image / PDF ready')}
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
