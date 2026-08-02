import { useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { WarehouseScopeBar } from '@/components/warehouse/WarehouseScopeBar'
import { useUpsertWarehouseZone, useWarehouseZones } from '@/hooks/useWarehouseAdmin'
import { useWarehouseScope } from '@/hooks/useWarehouseScope'
import {
  ZONE_PURPOSE_COLORS,
  ZONE_PURPOSE_LABELS,
  type ZonePurpose,
} from '@/types/warehouseAdmin'
import { cn } from '@/lib/cn'

const PURPOSES = Object.keys(ZONE_PURPOSE_LABELS) as ZonePurpose[]

export function WarehouseZonesPage() {
  const { warehouseId, warehouse } = useWarehouseScope()
  const zonesQ = useWarehouseZones(warehouseId)
  const upsert = useUpsertWarehouseZone()
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState({
    id: undefined as string | undefined,
    code: '',
    name: '',
    purpose: 'packing' as ZonePurpose,
    workDescription: '',
    status: 'active' as 'active' | 'inactive',
  })

  const zones = zonesQ.data ?? []

  const openCreate = () => {
    setForm({
      id: undefined,
      code: '',
      name: '',
      purpose: 'packing',
      workDescription: '',
      status: 'active',
    })
    setDrawer(true)
  }

  const onSave = async () => {
    if (!warehouseId || !form.name.trim() || !form.code.trim()) return
    await upsert.mutateAsync({
      id: form.id,
      warehouseId,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      purpose: form.purpose,
      workDescription: form.workDescription.trim() || ZONE_PURPOSE_LABELS[form.purpose],
      status: form.status,
      aisleCount: 0,
      capacityPercent: 0,
    })
    setDrawer(false)
  }

  return (
    <div>
      <PageHeader
        title="Warehouse Zones"
        description={`Zones for ${warehouse?.name ?? 'selected warehouse'} — each with a unique work purpose.`}
        actions={
          <button
            type="button"
            onClick={openCreate}
            className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            Add zone
          </button>
        }
      />

      <WarehouseScopeBar />

      {zonesQ.isLoading ? <LoadingPanel label="Loading zones…" /> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {zones.map((z) => (
          <button
            key={z.id}
            type="button"
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-sm"
            onClick={() => {
              setForm({
                id: z.id,
                code: z.code,
                name: z.name,
                purpose: z.purpose,
                workDescription: z.workDescription,
                status: z.status,
              })
              setDrawer(true)
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-[11px] text-slate-400">{z.code}</p>
                <h2 className="font-heading text-base text-slate-900">{z.name}</h2>
              </div>
              <span
                className={cn(
                  'rounded-lg px-2 py-1 text-[10px] font-bold ring-1',
                  ZONE_PURPOSE_COLORS[z.purpose]
                )}
              >
                {ZONE_PURPOSE_LABELS[z.purpose]}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{z.workDescription}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-md bg-slate-50 px-2 py-1 font-medium text-slate-600">
                {z.aisleCount} aisles
              </span>
              <span className="rounded-md bg-slate-50 px-2 py-1 font-semibold text-slate-800">
                {z.capacityPercent}% cap
              </span>
              <span
                className={cn(
                  'rounded-md px-2 py-1 font-bold',
                  z.status === 'active' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'
                )}
              >
                {z.status}
              </span>
            </div>
          </button>
        ))}
        {zones.length === 0 && !zonesQ.isLoading ? (
          <p className="col-span-full py-8 text-center text-sm text-slate-500">
            No zones for this warehouse.
          </p>
        ) : null}
      </div>

      {drawer ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="font-heading text-lg">{form.id ? 'Edit zone' : 'Add zone'}</h3>
              <p className="text-xs text-slate-500">{warehouse?.name}</p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              <label className="block text-xs font-semibold text-slate-600">
                Code
                <input
                  className="surface-input mt-1 w-full px-3 py-2 font-mono text-sm"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Name
                <input
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Work purpose
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.purpose}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, purpose: e.target.value as ZonePurpose }))
                  }
                >
                  {PURPOSES.map((p) => (
                    <option key={p} value={p}>
                      {ZONE_PURPOSE_LABELS[p]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Work done here
                <textarea
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  rows={3}
                  value={form.workDescription}
                  onChange={(e) => setForm((f) => ({ ...f, workDescription: e.target.value }))}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Status
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value as 'active' | 'inactive' }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>
            <div className="flex gap-2 border-t border-slate-100 p-4">
              <button
                type="button"
                className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold"
                onClick={() => setDrawer(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                disabled={upsert.isPending}
                onClick={() => void onSave()}
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
