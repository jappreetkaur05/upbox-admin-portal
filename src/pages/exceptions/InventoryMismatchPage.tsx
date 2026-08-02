import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useCreateMismatch, useExceptionCases } from '@/hooks/useExceptionsAdmin'
import {
  EXCEPTION_STATUS_LABELS,
  MISMATCH_CAUSE_LABELS,
  type ExceptionStatus,
  type MismatchCause,
} from '@/types/exceptionsAdmin'
import { cn } from '@/lib/cn'

export function InventoryMismatchPage() {
  const casesQ = useExceptionCases('inventory_mismatch')
  const create = useCreateMismatch()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState({
    sku: 'NK-AM-BLK-42',
    skuName: 'Nike Air Max Black 42',
    expectedQty: 50,
    actualQty: 47,
    cause: 'picking_mistake' as MismatchCause,
    assignee: '',
  })

  const rows = useMemo(() => {
    let list = casesQ.data ?? []
    if (status) list = list.filter((c) => c.status === status)
    const needle = q.trim().toLowerCase()
    if (needle) {
      list = list.filter(
        (c) =>
          c.exceptionId.toLowerCase().includes(needle) ||
          c.mismatch?.sku.toLowerCase().includes(needle) ||
          c.mismatch?.skuName.toLowerCase().includes(needle)
      )
    }
    return list
  }, [casesQ.data, q, status])

  return (
    <div>
      <PageHeader
        title="Inventory Mismatch"
        description="Differences between system and physical inventory."
        actions={
          <div className="flex gap-2">
            <Link
              to="/exceptions/resolution"
              className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
            >
              Resolution
            </Link>
            <button
              type="button"
              className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => setDrawer(true)}
            >
              Log mismatch
            </button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          className="surface-input min-w-[200px] flex-1 px-3 py-2 text-sm"
          placeholder="Search exception, SKU…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="surface-input cursor-pointer px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {(Object.keys(EXCEPTION_STATUS_LABELS) as ExceptionStatus[]).map((k) => (
            <option key={k} value={k}>
              {EXCEPTION_STATUS_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      {casesQ.isLoading ? <LoadingPanel label="Loading mismatches…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Exception</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3 text-right">Expected</th>
                <th className="px-4 py-3 text-right">Actual</th>
                <th className="px-4 py-3 text-right">Diff</th>
                <th className="px-4 py-3">Cause</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-sky-50/40">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{c.exceptionId}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{c.mismatch?.skuName}</p>
                    <p className="font-mono text-[10px] text-sky-700">{c.mismatch?.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{c.mismatch?.expectedQty}</td>
                  <td className="px-4 py-3 text-right font-semibold">{c.mismatch?.actualQty}</td>
                  <td
                    className={cn(
                      'px-4 py-3 text-right font-bold',
                      (c.mismatch?.difference ?? 0) < 0 ? 'text-rose-700' : 'text-emerald-700'
                    )}
                  >
                    {c.mismatch?.difference}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {c.mismatch ? MISMATCH_CAUSE_LABELS[c.mismatch.cause] : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{c.assignee ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold ring-1 ring-slate-200">
                      {EXCEPTION_STATUS_LABELS[c.status]}
                    </span>
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
            <div className="border-b px-4 py-3">
              <h3 className="font-heading text-lg font-semibold">Log inventory mismatch</h3>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <label className="block text-xs font-semibold text-slate-600">
                SKU
                <input
                  className="surface-input mt-1 w-full px-3 py-2 font-mono text-sm"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Product name
                <input
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  value={form.skuName}
                  onChange={(e) => setForm({ ...form, skuName: e.target.value })}
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-semibold text-slate-600">
                  Expected
                  <input
                    type="number"
                    className="surface-input mt-1 w-full px-3 py-2 text-sm"
                    value={form.expectedQty}
                    onChange={(e) => setForm({ ...form, expectedQty: Number(e.target.value) || 0 })}
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-600">
                  Actual
                  <input
                    type="number"
                    className="surface-input mt-1 w-full px-3 py-2 text-sm"
                    value={form.actualQty}
                    onChange={(e) => setForm({ ...form, actualQty: Number(e.target.value) || 0 })}
                  />
                </label>
              </div>
              <label className="block text-xs font-semibold text-slate-600">
                Cause
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.cause}
                  onChange={(e) => setForm({ ...form, cause: e.target.value as MismatchCause })}
                >
                  {(Object.keys(MISMATCH_CAUSE_LABELS) as MismatchCause[]).map((k) => (
                    <option key={k} value={k}>
                      {MISMATCH_CAUSE_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Assign user (optional)
                <input
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  value={form.assignee}
                  onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                  placeholder="Sara Supervisor"
                />
              </label>
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
                onClick={async () => {
                  await create.mutateAsync({
                    ...form,
                    assignee: form.assignee.trim() || undefined,
                  })
                  setDrawer(false)
                }}
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
