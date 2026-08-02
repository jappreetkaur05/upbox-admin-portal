import { useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useSaveUom, useUnitsOfMeasure } from '@/hooks/useSettingsAdmin'
import type { UnitOfMeasure, UomKind } from '@/types/settingsAdmin'
import { useToastStore } from '@/store/useToastStore'

const KINDS: UomKind[] = ['count', 'weight', 'volume', 'length']

export function UnitsOfMeasurePage() {
  const q = useUnitsOfMeasure()
  const save = useSaveUom()
  const toast = useToastStore((s) => s.push)
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState<Omit<UnitOfMeasure, 'id'> & { id?: string }>({
    code: '',
    name: '',
    kind: 'count',
    isDefault: false,
    conversionToBase: 1,
  })

  const openCreate = () => {
    setForm({ code: '', name: '', kind: 'count', isDefault: false, conversionToBase: 1 })
    setDrawer(true)
  }

  const openEdit = (u: UnitOfMeasure) => {
    setForm({ ...u })
    setDrawer(true)
  }

  return (
    <div>
      <PageHeader
        title="Units of Measurement"
        description="Standardize count, weight, volume, and length units with conversions."
        actions={
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={openCreate}
          >
            Add unit
          </button>
        }
      />

      <section className="surface-panel overflow-hidden">
        {q.isLoading ? <LoadingPanel label="Loading UOMs…" /> : null}
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Kind</th>
                <th className="px-4 py-3 text-right">To base</th>
                <th className="px-4 py-3">Default</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(q.data ?? []).map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-medium">{u.code}</td>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 capitalize">{u.kind}</td>
                  <td className="px-4 py-3 text-right">{u.conversionToBase}</td>
                  <td className="px-4 py-3">
                    {u.isDefault ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                        Default
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="cursor-pointer text-xs font-semibold text-sky-700 hover:underline"
                      onClick={() => openEdit(u)}
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

      {drawer ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="font-heading text-lg font-semibold">
                {form.id ? 'Edit unit' : 'Add unit'}
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
                Code
                <input
                  className="surface-input mt-1 w-full"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Name
                <input
                  className="surface-input mt-1 w-full"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Kind
                <select
                  className="surface-input mt-1 w-full"
                  value={form.kind}
                  onChange={(e) => setForm({ ...form, kind: e.target.value as UomKind })}
                >
                  {KINDS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Conversion to base
                <input
                  type="number"
                  step="any"
                  className="surface-input mt-1 w-full"
                  value={form.conversionToBase}
                  onChange={(e) =>
                    setForm({ ...form, conversionToBase: Number(e.target.value) })
                  }
                />
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                />
                Default for this kind
              </label>
            </div>
            <div className="border-t p-4">
              <button
                type="button"
                className="w-full cursor-pointer rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                disabled={save.isPending || !form.code.trim() || !form.name.trim()}
                onClick={() =>
                  save.mutate(form, {
                    onSuccess: () => {
                      toast('Unit saved')
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
