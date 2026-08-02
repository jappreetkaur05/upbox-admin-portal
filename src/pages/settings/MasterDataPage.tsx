import { useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useCreateMaster, useMasterRecords } from '@/hooks/useSettingsAdmin'
import { MASTER_TYPE_LABELS, type MasterType } from '@/types/settingsAdmin'
import { useToastStore } from '@/store/useToastStore'

const TYPES = Object.keys(MASTER_TYPE_LABELS) as MasterType[]

export function MasterDataPage() {
  const [type, setType] = useState<MasterType>('brand')
  const q = useMasterRecords(type)
  const create = useCreateMaster()
  const toast = useToastStore((s) => s.push)
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', meta: '' })

  return (
    <div>
      <PageHeader
        title="Master Data"
        description="Brands, categories, suppliers, customers, couriers, warehouses, attributes, locations."
        actions={
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => {
              setForm({ name: '', code: '', meta: '' })
              setDrawer(true)
            }}
          >
            Add {MASTER_TYPE_LABELS[type].slice(0, -1).toLowerCase()}
          </button>
        }
      />

      <div className="mb-3 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold ${
              type === t
                ? 'bg-sky-600 text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {MASTER_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      <section className="surface-panel overflow-hidden">
        {q.isLoading ? <LoadingPanel label="Loading master data…" /> : null}
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Meta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(q.data ?? []).map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.code ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{r.meta}</td>
              </tr>
            ))}
            {(q.data ?? []).length === 0 && !q.isLoading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                  No records for this type.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      {drawer ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="font-heading text-lg font-semibold">
                New {MASTER_TYPE_LABELS[type].slice(0, -1).toLowerCase()}
              </h2>
              <button
                type="button"
                className="cursor-pointer text-sm text-slate-500"
                onClick={() => setDrawer(false)}
              >
                Close
              </button>
            </div>
            <div className="flex-1 space-y-3 p-4">
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
                Meta
                <input
                  className="surface-input mt-1 w-full"
                  value={form.meta}
                  onChange={(e) => setForm({ ...form, meta: e.target.value })}
                />
              </label>
            </div>
            <div className="border-t p-4">
              <button
                type="button"
                className="w-full cursor-pointer rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                disabled={create.isPending || !form.name.trim()}
                onClick={() =>
                  create.mutate(
                    {
                      type,
                      name: form.name.trim(),
                      code: form.code.trim() || null,
                      meta: form.meta.trim(),
                    },
                    {
                      onSuccess: () => {
                        toast('Master record created')
                        setDrawer(false)
                      },
                      onError: (e) => toast((e as Error).message, 'error'),
                    },
                  )
                }
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
