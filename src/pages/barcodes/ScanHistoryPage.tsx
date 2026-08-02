import { useMemo, useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useScanHistory } from '@/hooks/useBarcodesAdmin'
import { SCAN_ACTION_LABELS, type ScanAction } from '@/types/barcodesAdmin'

export function ScanHistoryPage() {
  const histQ = useScanHistory()
  const [q, setQ] = useState('')
  const [action, setAction] = useState('')

  const rows = useMemo(() => {
    let list = histQ.data ?? []
    if (action) list = list.filter((r) => r.action === action)
    const needle = q.trim().toLowerCase()
    if (needle) {
      list = list.filter(
        (r) =>
          r.code.toLowerCase().includes(needle) ||
          r.user.toLowerCase().includes(needle) ||
          r.device.toLowerCase().includes(needle) ||
          r.locationCode.toLowerCase().includes(needle)
      )
    }
    return list
  }, [histQ.data, q, action])

  return (
    <div>
      <PageHeader
        title="Scan History"
        description="Log of barcode and QR scans — receiving, putaway, picking, packing, dispatch, and audit."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          className="surface-input min-w-[200px] flex-1 px-3 py-2 text-sm"
          placeholder="Search code, user, device, location…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="surface-input cursor-pointer px-3 py-2 text-sm"
          value={action}
          onChange={(e) => setAction(e.target.value)}
        >
          <option value="">All actions</option>
          {(Object.keys(SCAN_ACTION_LABELS) as ScanAction[]).map((k) => (
            <option key={k} value={k}>
              {SCAN_ACTION_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      {histQ.isLoading ? <LoadingPanel label="Loading scan history…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Date & time</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-sky-50/40">
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(r.at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium">{r.user}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{r.device}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 font-mono text-xs font-semibold">
                    {r.code}
                  </td>
                  <td className="px-4 py-3 text-xs">{SCAN_ACTION_LABELS[r.action]}</td>
                  <td className="px-4 py-3 font-mono text-xs text-sky-700">{r.locationCode}</td>
                </tr>
              ))}
              {rows.length === 0 && !histQ.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    No scans match.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
