import { useMemo, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useCreateReturnOrder, useReturnOrders } from '@/hooks/useReturnsAdmin'
import {
  RETURN_REASON_LABELS,
  RETURN_STATUS_LABELS,
  type ReturnOrderStatus,
  type ReturnReason,
} from '@/types/returnsAdmin'
import { cn } from '@/lib/cn'

export function ReturnOrdersPage() {
  const ordersQ = useReturnOrders()
  const create = useCreateReturnOrder()
  const [q, setQ] = useState('')
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState({
    orderId: '',
    customer: '',
    sku: 'NK-AM-BLK-42',
    name: 'Nike Air Max Black 42',
    qty: 1,
    reason: 'size_mismatch' as ReturnReason,
  })

  const rows = useMemo(() => {
    let list = ordersQ.data ?? []
    const needle = q.trim().toLowerCase()
    if (reason) list = list.filter((r) => r.reason === reason)
    if (status) list = list.filter((r) => r.status === status)
    if (needle) {
      list = list.filter(
        (r) =>
          r.returnId.toLowerCase().includes(needle) ||
          r.orderId.toLowerCase().includes(needle) ||
          r.customer.toLowerCase().includes(needle)
      )
    }
    return list
  }, [ordersQ.data, q, reason, status])

  const selected = rows.find((r) => r.id === selectedId) ?? null

  return (
    <div>
      <PageHeader
        title="Return Orders"
        description="Customer return requests from initiation until completion."
        actions={
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            onClick={() => {
              setForm({
                orderId: 'ORD-',
                customer: '',
                sku: 'NK-AM-BLK-42',
                name: 'Nike Air Max Black 42',
                qty: 1,
                reason: 'size_mismatch',
              })
              setDrawer(true)
            }}
          >
            New return
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          className="surface-input min-w-[200px] flex-1 px-3 py-2 text-sm"
          placeholder="Search return, order, customer…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="surface-input cursor-pointer px-3 py-2 text-sm"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          <option value="">All reasons</option>
          {(Object.keys(RETURN_REASON_LABELS) as ReturnReason[]).map((k) => (
            <option key={k} value={k}>
              {RETURN_REASON_LABELS[k]}
            </option>
          ))}
        </select>
        <select
          className="surface-input cursor-pointer px-3 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {(Object.keys(RETURN_STATUS_LABELS) as ReturnOrderStatus[]).map((k) => (
            <option key={k} value={k}>
              {RETURN_STATUS_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      {ordersQ.isLoading ? <LoadingPanel label="Loading returns…" /> : null}

      <div className={cn('grid gap-4', selected ? 'lg:grid-cols-[1fr_300px]' : '')}>
        <section className="surface-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Return ID</th>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Products</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => {
                  const qty = r.lines.reduce((s, l) => s + l.qty, 0)
                  const products = r.lines.map((l) => l.name).join(', ')
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedId(r.id === selectedId ? null : r.id)}
                      className={cn(
                        'cursor-pointer hover:bg-sky-50/50',
                        selected?.id === r.id && 'bg-sky-50'
                      )}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{r.returnId}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.orderId}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{r.customer}</td>
                      <td className="max-w-[220px] truncate px-4 py-3 text-xs text-slate-600">
                        {products}
                      </td>
                      <td className="px-4 py-3 font-semibold">{qty}</td>
                      <td className="px-4 py-3 text-xs text-slate-700">
                        {RETURN_REASON_LABELS[r.reason]}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                          {RETURN_STATUS_LABELS[r.status]}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {rows.length === 0 && !ordersQ.isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                      No returns match.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        {selected ? (
          <aside className="surface-panel p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Details</p>
            <h2 className="mt-1 font-heading text-lg text-slate-900">{selected.returnId}</h2>
            <p className="font-mono text-xs text-slate-500">{selected.orderId}</p>
            <dl className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Customer</dt>
                <dd className="font-semibold">{selected.customer}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Reason</dt>
                <dd className="font-semibold text-right">{RETURN_REASON_LABELS[selected.reason]}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Status</dt>
                <dd className="font-semibold">{RETURN_STATUS_LABELS[selected.status]}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Source</dt>
                <dd className="font-semibold capitalize">{selected.source}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <p className="text-[11px] font-bold uppercase text-slate-500">Lines</p>
              <ul className="mt-2 space-y-2">
                {selected.lines.map((l) => (
                  <li key={l.sku} className="rounded-lg border border-slate-200 px-3 py-2 text-xs">
                    <p className="font-semibold text-slate-900">{l.name}</p>
                    <p className="font-mono text-slate-500">
                      {l.sku} · qty {l.qty}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        ) : null}
      </div>

      {drawer ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="border-b px-4 py-3">
              <h3 className="font-heading text-lg font-semibold">New return order</h3>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {(
                [
                  ['orderId', 'Original order ID'],
                  ['customer', 'Customer'],
                  ['sku', 'SKU'],
                  ['name', 'Product name'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block text-xs font-semibold text-slate-600">
                  {label}
                  <input
                    className="surface-input mt-1 w-full px-3 py-2 text-sm"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                </label>
              ))}
              <label className="block text-xs font-semibold text-slate-600">
                Quantity
                <input
                  type="number"
                  min={1}
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  value={form.qty}
                  onChange={(e) => setForm({ ...form, qty: Number(e.target.value) || 1 })}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Reason
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value as ReturnReason })}
                >
                  {(Object.keys(RETURN_REASON_LABELS) as ReturnReason[]).map((k) => (
                    <option key={k} value={k}>
                      {RETURN_REASON_LABELS[k]}
                    </option>
                  ))}
                </select>
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
                  await create.mutateAsync(form)
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
