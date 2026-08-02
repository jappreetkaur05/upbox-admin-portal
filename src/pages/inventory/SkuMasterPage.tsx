import { useMemo, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useProducts, useSkuMasters, useUpsertSkuMaster } from '@/hooks/useInventoryAdmin'
import { useBrands } from '@/hooks/useInventory'
import { cn } from '@/lib/cn'

export function SkuMasterPage() {
  const skusQ = useSkuMasters()
  const productsQ = useProducts()
  const brandsQ = useBrands()
  const upsert = useUpsertSkuMaster()
  const [q, setQ] = useState('')
  const [brandId, setBrandId] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState({
    id: undefined as string | undefined,
    sku: '',
    productId: '',
    productName: '',
    barcode: '',
    brandId: 'brand-nike',
    category: 'Footwear',
    unit: 'Pair',
    weightKg: 0.8,
    dimensionsCm: '32 × 22 × 12',
    status: 'active' as 'active' | 'inactive',
  })

  const brandName = (id: string) => brandsQ.data?.find((b) => b.id === id)?.name ?? id

  const rows = useMemo(() => {
    let list = skusQ.data ?? []
    const needle = q.trim().toLowerCase()
    if (brandId) list = list.filter((s) => s.brandId === brandId)
    if (needle) {
      list = list.filter(
        (s) =>
          s.sku.toLowerCase().includes(needle) ||
          s.productName.toLowerCase().includes(needle) ||
          s.barcode.includes(needle)
      )
    }
    return list
  }, [skusQ.data, q, brandId])

  const selected = rows.find((r) => r.id === selectedId) ?? rows[0]

  const openCreate = () => {
    const p = productsQ.data?.[0]
    setForm({
      id: undefined,
      sku: '',
      productId: p?.id ?? '',
      productName: p?.name ?? '',
      barcode: '',
      brandId: p?.brandId ?? 'brand-nike',
      category: p?.category ?? 'Footwear',
      unit: 'Pair',
      weightKg: 0.8,
      dimensionsCm: '32 × 22 × 12',
      status: 'active',
    })
    setDrawer(true)
  }

  return (
    <div>
      <PageHeader
        title="SKU Master"
        description="Unique codes for every product variant — size, color, and sellable unit."
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Add SKU
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          className="surface-input min-w-[200px] flex-1 px-3 py-2 text-sm"
          placeholder="Search SKU, product, barcode…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="surface-input cursor-pointer px-3 py-2 text-sm"
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
        >
          <option value="">All brands</option>
          {(brandsQ.data ?? []).map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {skusQ.isLoading ? <LoadingPanel label="Loading SKUs…" /> : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <section className="surface-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Barcode</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className={cn('cursor-pointer hover:bg-sky-50/50', selected?.id === r.id && 'bg-sky-50')}
                    onClick={() => setSelectedId(r.id)}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold">{r.sku}</td>
                    <td className="px-4 py-3 font-medium">{r.productName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.barcode}</td>
                    <td className="px-4 py-3 text-xs">{brandName(r.brandId)}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{r.category}</td>
                    <td className="px-4 py-3 text-xs">{r.unit}</td>
                    <td className="px-4 py-3 text-xs font-semibold capitalize">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {selected ? (
          <aside className="surface-panel p-4 text-sm">
            <p className="font-mono text-xs text-slate-400">{selected.sku}</p>
            <h2 className="font-heading text-lg text-slate-900">{selected.productName}</h2>
            <dl className="mt-3 space-y-2 text-xs">
              <Row k="Barcode" v={selected.barcode} />
              <Row k="Brand" v={brandName(selected.brandId)} />
              <Row k="Category" v={selected.category} />
              <Row k="Unit" v={selected.unit} />
              <Row k="Weight" v={`${selected.weightKg} kg`} />
              <Row k="Dimensions" v={selected.dimensionsCm} />
              <Row k="Status" v={selected.status} />
            </dl>
            <button
              type="button"
              className="mt-4 w-full cursor-pointer rounded-lg border border-slate-300 py-2 text-xs font-semibold"
              onClick={() => {
                setForm({ ...selected, id: selected.id })
                setDrawer(true)
              }}
            >
              Edit
            </button>
          </aside>
        ) : null}
      </div>

      {drawer ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="border-b px-5 py-4 font-heading text-lg">
              {form.id ? 'Edit SKU' : 'Add SKU'}
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              <Field label="SKU code" value={form.sku} onChange={(v) => setForm((f) => ({ ...f, sku: v }))} />
              <label className="block text-xs font-semibold text-slate-600">
                Product
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.productId}
                  onChange={(e) => {
                    const p = productsQ.data?.find((x) => x.id === e.target.value)
                    setForm((f) => ({
                      ...f,
                      productId: e.target.value,
                      productName: p?.name ?? f.productName,
                      brandId: p?.brandId ?? f.brandId,
                      category: p?.category ?? f.category,
                    }))
                  }}
                >
                  {(productsQ.data ?? []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <Field label="Barcode" value={form.barcode} onChange={(v) => setForm((f) => ({ ...f, barcode: v }))} />
              <Field label="Unit" value={form.unit} onChange={(v) => setForm((f) => ({ ...f, unit: v }))} />
              <Field
                label="Dimensions (cm)"
                value={form.dimensionsCm}
                onChange={(v) => setForm((f) => ({ ...f, dimensionsCm: v }))}
              />
            </div>
            <div className="flex gap-2 border-t p-4">
              <button type="button" className="cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold" onClick={() => setDrawer(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
                disabled={upsert.isPending || !form.sku.trim()}
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

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-slate-500">{k}</dt>
      <dd className="font-semibold text-slate-800">{v}</dd>
    </div>
  )
}

function Field(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-xs font-semibold text-slate-600">
      {props.label}
      <input
        className="surface-input mt-1 w-full px-3 py-2 text-sm"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </label>
  )
}
