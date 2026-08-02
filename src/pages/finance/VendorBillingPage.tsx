import { useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import {
  useCreateVendorBill,
  useSetVendorApproval,
  useVendorBills,
} from '@/hooks/useFinanceAdmin'
import {
  VENDOR_CATEGORY_LABELS,
  type ApprovalStatus,
  type VendorCategory,
} from '@/types/financeAdmin'
import { cn, formatMoney } from '@/lib/cn'

export function VendorBillingPage() {
  const billsQ = useVendorBills()
  const create = useCreateVendorBill()
  const approve = useSetVendorApproval()
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState({
    vendor: '',
    invoiceNumber: 'VR-',
    category: 'materials' as VendorCategory,
    amount: 10000,
    dueDate: '2026-08-20',
    poNumber: 'PO-',
  })

  return (
    <div>
      <PageHeader
        title="Vendor Billing"
        description="Bills from vendors — rent, materials, courier, maintenance. Track dues and approvals."
        actions={
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => setDrawer(true)}
          >
            Record vendor bill
          </button>
        }
      />

      {billsQ.isLoading ? <LoadingPanel label="Loading vendor bills…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">PO</th>
                <th className="px-4 py-3">Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(billsQ.data ?? []).map((b) => (
                <tr key={b.id} className="hover:bg-sky-50/40">
                  <td className="px-4 py-3 font-medium">{b.vendor}</td>
                  <td className="px-4 py-3 font-mono text-xs">{b.invoiceNumber}</td>
                  <td className="px-4 py-3 text-xs">{VENDOR_CATEGORY_LABELS[b.category]}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatMoney(b.amount)}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {new Date(b.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-sky-700">{b.poNumber}</td>
                  <td className="px-4 py-3">
                    <select
                      className="surface-input cursor-pointer px-2 py-1.5 text-xs"
                      value={b.approvalStatus}
                      onChange={async (e) => {
                        await approve.mutateAsync({
                          id: b.id,
                          approvalStatus: e.target.value as ApprovalStatus,
                        })
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
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
              <h3 className="font-heading text-lg font-semibold">Record vendor bill</h3>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {(
                [
                  ['vendor', 'Vendor'],
                  ['invoiceNumber', 'Invoice number'],
                  ['poNumber', 'PO number'],
                  ['dueDate', 'Due date (YYYY-MM-DD)'],
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
                Category
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as VendorCategory })
                  }
                >
                  {(Object.keys(VENDOR_CATEGORY_LABELS) as VendorCategory[]).map((k) => (
                    <option key={k} value={k}>
                      {VENDOR_CATEGORY_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Amount
                <input
                  type="number"
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })}
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
                className={cn(
                  'cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white'
                )}
                onClick={async () => {
                  await create.mutateAsync(form)
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
