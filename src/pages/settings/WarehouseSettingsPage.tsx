import { useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useSaveWarehouse, useWarehouseSettings } from '@/hooks/useSettingsAdmin'
import {
  PICKING_STRATEGY_LABELS,
  PUTAWAY_STRATEGY_LABELS,
  type PickingStrategy,
  type PutawayStrategy,
  type WarehouseSetting,
} from '@/types/settingsAdmin'
import { useToastStore } from '@/store/useToastStore'
import { cn } from '@/lib/cn'

const emptyForm = (): Omit<WarehouseSetting, 'id'> => ({
  name: '',
  code: '',
  defaultLocation: 'A-01-01',
  hours: '08:00–20:00',
  capacity: 5000,
  pickingStrategy: 'fifo',
  putawayStrategy: 'empty_bin',
  multiWarehouse: true,
  autoSlotting: false,
})

export function WarehouseSettingsPage() {
  const q = useWarehouseSettings()
  const save = useSaveWarehouse()
  const toast = useToastStore((s) => s.push)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState<Omit<WarehouseSetting, 'id'> & { id?: string }>(emptyForm())

  const openCreate = () => {
    setForm(emptyForm())
    setDrawer(true)
  }

  const openEdit = (w: WarehouseSetting) => {
    setForm({ ...w })
    setDrawer(true)
  }

  return (
    <div>
      <PageHeader
        title="Warehouse Settings"
        description="Codes, capacity, picking/putaway strategies, and auto-slotting."
        actions={
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={openCreate}
          >
            Add warehouse
          </button>
        }
      />

      {q.isLoading ? <LoadingPanel label="Loading warehouses…" /> : null}

      <div className={cn('grid gap-4', selectedId ? 'lg:grid-cols-[1fr_280px]' : '')}>
        <section className="surface-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[800px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Hours</th>
                  <th className="px-4 py-3 text-right">Capacity</th>
                  <th className="px-4 py-3">Picking</th>
                  <th className="px-4 py-3">Putaway</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(q.data ?? []).map((w) => (
                  <tr
                    key={w.id}
                    className={cn(
                      'cursor-pointer hover:bg-slate-50',
                      selectedId === w.id && 'bg-sky-50',
                    )}
                    onClick={() => setSelectedId(w.id === selectedId ? null : w.id)}
                  >
                    <td className="px-4 py-3 font-medium">{w.name}</td>
                    <td className="px-4 py-3">{w.code}</td>
                    <td className="px-4 py-3 text-slate-600">{w.hours}</td>
                    <td className="px-4 py-3 text-right">{w.capacity.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">{PICKING_STRATEGY_LABELS[w.pickingStrategy]}</td>
                    <td className="px-4 py-3">{PUTAWAY_STRATEGY_LABELS[w.putawayStrategy]}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="cursor-pointer text-xs font-semibold text-sky-700 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEdit(w)
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {selectedId ? (
          <aside className="surface-panel p-4 text-sm">
            {(() => {
              const w = (q.data ?? []).find((x) => x.id === selectedId)
              if (!w) return null
              return (
                <>
                  <h2 className="font-heading text-base font-semibold">{w.name}</h2>
                  <dl className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Default location</dt>
                      <dd className="font-semibold">{w.defaultLocation}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Multi-warehouse</dt>
                      <dd className="font-semibold">{w.multiWarehouse ? 'Yes' : 'No'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Auto slotting</dt>
                      <dd className="font-semibold">{w.autoSlotting ? 'On' : 'Off'}</dd>
                    </div>
                  </dl>
                </>
              )
            })()}
          </aside>
        ) : null}
      </div>

      {drawer ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="font-heading text-lg font-semibold">
                {form.id ? 'Edit warehouse' : 'Add warehouse'}
              </h2>
              <button
                type="button"
                className="cursor-pointer text-sm text-slate-500"
                onClick={() => setDrawer(false)}
              >
                Close
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <label className="block text-xs font-semibold text-slate-600">
                Name
                <input
                  className="surface-input mt-1 w-full"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Code
                <input
                  className="surface-input mt-1 w-full"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Default location
                <input
                  className="surface-input mt-1 w-full"
                  value={form.defaultLocation}
                  onChange={(e) => setForm({ ...form, defaultLocation: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Hours
                <input
                  className="surface-input mt-1 w-full"
                  value={form.hours}
                  onChange={(e) => setForm({ ...form, hours: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Capacity
                <input
                  type="number"
                  className="surface-input mt-1 w-full"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Picking strategy
                <select
                  className="surface-input mt-1 w-full"
                  value={form.pickingStrategy}
                  onChange={(e) =>
                    setForm({ ...form, pickingStrategy: e.target.value as PickingStrategy })
                  }
                >
                  {(Object.keys(PICKING_STRATEGY_LABELS) as PickingStrategy[]).map((k) => (
                    <option key={k} value={k}>
                      {PICKING_STRATEGY_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Putaway strategy
                <select
                  className="surface-input mt-1 w-full"
                  value={form.putawayStrategy}
                  onChange={(e) =>
                    setForm({ ...form, putawayStrategy: e.target.value as PutawayStrategy })
                  }
                >
                  {(Object.keys(PUTAWAY_STRATEGY_LABELS) as PutawayStrategy[]).map((k) => (
                    <option key={k} value={k}>
                      {PUTAWAY_STRATEGY_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.multiWarehouse}
                  onChange={(e) => setForm({ ...form, multiWarehouse: e.target.checked })}
                />
                Multi-warehouse support
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.autoSlotting}
                  onChange={(e) => setForm({ ...form, autoSlotting: e.target.checked })}
                />
                Auto slotting rules
              </label>
            </div>
            <div className="border-t p-4">
              <button
                type="button"
                className="w-full cursor-pointer rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                disabled={save.isPending || !form.name.trim() || !form.code.trim()}
                onClick={() =>
                  save.mutate(form, {
                    onSuccess: () => {
                      toast('Warehouse saved')
                      setDrawer(false)
                    },
                    onError: (e) => toast((e as Error).message, 'error'),
                  })
                }
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
