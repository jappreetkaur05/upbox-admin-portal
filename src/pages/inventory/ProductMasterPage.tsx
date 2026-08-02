import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useProducts, useUpsertProduct } from '@/hooks/useInventoryAdmin'
import { useBrands } from '@/hooks/useInventory'
import { inventoryAdminService } from '@/services/inventoryAdmin.service'
import { cn } from '@/lib/cn'

export function ProductMasterPage() {
  const productsQ = useProducts()
  const brandsQ = useBrands()
  const upsert = useUpsertProduct()
  const [q, setQ] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState({
    id: undefined as string | undefined,
    name: '',
    brandId: 'brand-nike',
    category: 'Footwear',
    description: '',
    gstPercent: 18,
    manufacturer: '',
    hsnCode: '',
    status: 'active' as 'active' | 'inactive',
  })

  const brandName = (id: string) => brandsQ.data?.find((b) => b.id === id)?.name ?? id

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return (productsQ.data ?? []).filter(
      (p) =>
        !needle ||
        p.name.toLowerCase().includes(needle) ||
        p.category.toLowerCase().includes(needle) ||
        p.hsnCode.includes(needle)
    )
  }, [productsQ.data, q])

  const selected = rows.find((r) => r.id === selectedId) ?? rows[0]
  const childSkus = selected ? inventoryAdminService.skusForProduct(selected.id) : []

  return (
    <div>
      <PageHeader
        title="Product Master"
        description="Parent products — one product can have many SKUs (size, color, variants)."
        actions={
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => {
              setForm({
                id: undefined,
                name: '',
                brandId: brandsQ.data?.[0]?.id ?? 'brand-nike',
                category: 'Footwear',
                description: '',
                gstPercent: 18,
                manufacturer: '',
                hsnCode: '',
                status: 'active',
              })
              setDrawer(true)
            }}
          >
            Add product
          </button>
        }
      />

      <input
        className="surface-input mb-4 w-full max-w-md px-3 py-2 text-sm"
        placeholder="Search product, category, HSN…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {productsQ.isLoading ? <LoadingPanel label="Loading products…" /> : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedId(p.id)}
              className={cn(
                'cursor-pointer rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm',
                selected?.id === p.id ? 'border-sky-400 bg-sky-50/50' : 'border-slate-200 bg-white'
              )}
            >
              <div className="flex gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500">
                  IMG
                </div>
                <div className="min-w-0">
                  <h2 className="font-heading text-base text-slate-900">{p.name}</h2>
                  <p className="text-xs text-slate-500">
                    {brandName(p.brandId)} · {p.category}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {inventoryAdminService.skusForProduct(p.id).length} SKUs · HSN {p.hsnCode}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {selected ? (
          <aside className="surface-panel p-4">
            <h2 className="font-heading text-lg text-slate-900">{selected.name}</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{selected.description}</p>
            <dl className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between"><dt className="text-slate-500">Brand</dt><dd className="font-semibold">{brandName(selected.brandId)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">GST</dt><dd className="font-semibold">{selected.gstPercent}%</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Manufacturer</dt><dd className="font-semibold">{selected.manufacturer}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">HSN</dt><dd className="font-semibold">{selected.hsnCode}</dd></div>
            </dl>
            <p className="mt-4 text-[11px] font-bold uppercase text-slate-500">SKUs</p>
            <ul className="mt-2 space-y-1">
              {childSkus.map((s) => (
                <li key={s.id} className="rounded-lg bg-slate-50 px-2 py-1.5 font-mono text-xs">
                  {s.sku}
                </li>
              ))}
              {childSkus.length === 0 ? (
                <li className="text-xs text-slate-400">No SKUs yet</li>
              ) : null}
            </ul>
            <Link to="/inventory/sku-master" className="mt-3 inline-block text-xs font-semibold text-sky-700 hover:underline">
              Open SKU Master →
            </Link>
            <button
              type="button"
              className="mt-4 w-full cursor-pointer rounded-lg border border-slate-300 py-2 text-xs font-semibold"
              onClick={() => {
                setForm({ ...selected, id: selected.id })
                setDrawer(true)
              }}
            >
              Edit product
            </button>
          </aside>
        ) : null}
      </div>

      {drawer ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="border-b px-5 py-4 font-heading text-lg">{form.id ? 'Edit product' : 'Add product'}</div>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              <label className="block text-xs font-semibold">Name<input className="surface-input mt-1 w-full px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></label>
              <label className="block text-xs font-semibold">Brand
                <select className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm" value={form.brandId} onChange={(e) => setForm((f) => ({ ...f, brandId: e.target.value }))}>
                  {(brandsQ.data ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </label>
              <label className="block text-xs font-semibold">Category<input className="surface-input mt-1 w-full px-3 py-2 text-sm" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} /></label>
              <label className="block text-xs font-semibold">Description<textarea className="surface-input mt-1 w-full px-3 py-2 text-sm" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></label>
              <label className="block text-xs font-semibold">Manufacturer<input className="surface-input mt-1 w-full px-3 py-2 text-sm" value={form.manufacturer} onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))} /></label>
              <label className="block text-xs font-semibold">HSN<input className="surface-input mt-1 w-full px-3 py-2 text-sm" value={form.hsnCode} onChange={(e) => setForm((f) => ({ ...f, hsnCode: e.target.value }))} /></label>
              <label className="block text-xs font-semibold">GST %<input type="number" className="surface-input mt-1 w-full px-3 py-2 text-sm" value={form.gstPercent} onChange={(e) => setForm((f) => ({ ...f, gstPercent: Number(e.target.value) }))} /></label>
            </div>
            <div className="flex gap-2 border-t p-4">
              <button type="button" className="cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold" onClick={() => setDrawer(false)}>Cancel</button>
              <button type="button" className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white" disabled={!form.name.trim() || upsert.isPending} onClick={async () => { await upsert.mutateAsync(form); setDrawer(false) }}>Save</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
