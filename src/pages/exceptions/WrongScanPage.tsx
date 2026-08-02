import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useCreateWrongScan, useExceptionCases } from '@/hooks/useExceptionsAdmin'
import {
  EXCEPTION_STATUS_LABELS,
  WRONG_SCAN_LABELS,
  type WrongScanType,
} from '@/types/exceptionsAdmin'

export function WrongScanPage() {
  const casesQ = useExceptionCases('wrong_scan')
  const create = useCreateWrongScan()
  const [scanType, setScanType] = useState('')
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState({
    scanType: 'wrong_sku' as WrongScanType,
    scannedValue: '',
    expectedValue: '',
    locationCode: 'W.A.R1.B1.3',
    worker: 'Ravi Putaway',
    assignee: '',
  })

  const rows = useMemo(() => {
    let list = casesQ.data ?? []
    if (scanType) list = list.filter((c) => c.wrongScan?.scanType === scanType)
    return list
  }, [casesQ.data, scanType])

  return (
    <div>
      <PageHeader
        title="Wrong Scan"
        description="Barcode scanning errors — wrong SKU, duplicates, invalid or unknown codes."
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
              Log wrong scan
            </button>
          </div>
        }
      />

      <div className="mb-4">
        <select
          className="surface-input cursor-pointer px-3 py-2 text-sm"
          value={scanType}
          onChange={(e) => setScanType(e.target.value)}
        >
          <option value="">All scan types</option>
          {(Object.keys(WRONG_SCAN_LABELS) as WrongScanType[]).map((k) => (
            <option key={k} value={k}>
              {WRONG_SCAN_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      {casesQ.isLoading ? <LoadingPanel label="Loading wrong scans…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Exception</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Scanned</th>
                <th className="px-4 py-3">Expected</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Worker</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-sky-50/40">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{c.exceptionId}</td>
                  <td className="px-4 py-3 text-xs">
                    {c.wrongScan ? WRONG_SCAN_LABELS[c.wrongScan.scanType] : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-rose-700">
                    {c.wrongScan?.scannedValue}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {c.wrongScan?.expectedValue}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{c.wrongScan?.locationCode}</td>
                  <td className="px-4 py-3 text-xs">{c.wrongScan?.worker}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(c.createdAt).toLocaleString()}
                  </td>
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
              <h3 className="font-heading text-lg font-semibold">Log wrong scan</h3>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <label className="block text-xs font-semibold text-slate-600">
                Scan type
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.scanType}
                  onChange={(e) => setForm({ ...form, scanType: e.target.value as WrongScanType })}
                >
                  {(Object.keys(WRONG_SCAN_LABELS) as WrongScanType[]).map((k) => (
                    <option key={k} value={k}>
                      {WRONG_SCAN_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              {(
                [
                  ['scannedValue', 'Scanned value'],
                  ['expectedValue', 'Expected value'],
                  ['locationCode', 'Location'],
                  ['worker', 'Worker'],
                  ['assignee', 'Assignee (optional)'],
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
                    scanType: form.scanType,
                    scannedValue: form.scannedValue,
                    expectedValue: form.expectedValue,
                    locationCode: form.locationCode,
                    worker: form.worker,
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
