import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useLabelTemplates, useUpsertLabelTemplate } from '@/hooks/useBarcodesAdmin'
import type { LabelElements, LabelSize, LabelTemplate } from '@/types/barcodesAdmin'
import { cn } from '@/lib/cn'

const ELEMENT_KEYS: { key: keyof LabelElements; label: string }[] = [
  { key: 'logo', label: 'Company logo' },
  { key: 'productName', label: 'Product name' },
  { key: 'sku', label: 'SKU' },
  { key: 'barcode', label: 'Barcode' },
  { key: 'qr', label: 'QR code' },
  { key: 'batch', label: 'Batch number' },
  { key: 'price', label: 'Price' },
  { key: 'dates', label: 'Mfg / expiry dates' },
]

const emptyElements = (): LabelElements => ({
  logo: true,
  productName: true,
  sku: true,
  barcode: true,
  qr: false,
  batch: false,
  price: false,
  dates: false,
})

export function LabelTemplatesPage() {
  const tplQ = useLabelTemplates()
  const upsert = useUpsertLabelTemplate()
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState({
    id: undefined as string | undefined,
    name: '',
    size: 'medium' as LabelSize,
    elements: emptyElements(),
    status: 'active' as 'active' | 'inactive',
  })

  const openEdit = (t?: LabelTemplate) => {
    if (t) {
      setForm({
        id: t.id,
        name: t.name,
        size: t.size,
        elements: { ...t.elements },
        status: t.status,
      })
    } else {
      setForm({
        id: undefined,
        name: '',
        size: 'medium',
        elements: emptyElements(),
        status: 'active',
      })
    }
    setDrawer(true)
  }

  return (
    <div>
      <PageHeader
        title="Label Templates"
        description="Customizable layouts for barcode and QR labels — logo, SKU, batch, dates, and more."
        actions={
          <div className="flex gap-2">
            <Link
              to="/barcodes/printing"
              className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
            >
              Printing
            </Link>
            <button
              type="button"
              className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => openEdit()}
            >
              New template
            </button>
          </div>
        }
      />

      {tplQ.isLoading ? <LoadingPanel label="Loading templates…" /> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {(tplQ.data ?? []).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => openEdit(t)}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-sky-300 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-heading text-base text-slate-900">{t.name}</h2>
              <span
                className={cn(
                  'rounded-lg px-2 py-0.5 text-[10px] font-bold ring-1',
                  t.status === 'active'
                    ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                    : 'bg-slate-100 text-slate-500 ring-slate-200'
                )}
              >
                {t.status}
              </span>
            </div>
            <p className="mt-1 text-xs capitalize text-slate-500">Size: {t.size}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {ELEMENT_KEYS.filter((e) => t.elements[e.key]).map((e) => (
                <span
                  key={e.key}
                  className="rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800"
                >
                  {e.label}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {drawer ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="border-b px-4 py-3">
              <h3 className="font-heading text-lg font-semibold">
                {form.id ? 'Edit template' : 'New template'}
              </h3>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <label className="block text-xs font-semibold text-slate-600">
                Name
                <input
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Size
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value as LabelSize })}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Status
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as 'active' | 'inactive' })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <p className="text-xs font-semibold text-slate-600">Elements</p>
              <div className="space-y-2">
                {ELEMENT_KEYS.map(({ key, label }) => (
                  <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.elements[key]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          elements: { ...form.elements, [key]: e.target.checked },
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 border-t px-4 py-3">
              <button
                type="button"
                className="cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold"
                onClick={() => setDrawer(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
                disabled={!form.name.trim()}
                onClick={async () => {
                  await upsert.mutateAsync(form)
                  setDrawer(false)
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
