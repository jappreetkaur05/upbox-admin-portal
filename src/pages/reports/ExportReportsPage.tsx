import { useState } from 'react'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { useCreateExportJob, useExportJobs, useMarkExportReady } from '@/hooks/useReportsAdmin'
import { EXPORT_FORMAT_LABELS, type ExportFormat } from '@/types/reportsAdmin'
import { useToastStore } from '@/store/useToastStore'
import { cn } from '@/lib/cn'

const STATUS_TONE: Record<string, string> = {
  ready: 'bg-emerald-50 text-emerald-800',
  queued: 'bg-sky-50 text-sky-800',
  scheduled: 'bg-violet-50 text-violet-800',
  failed: 'bg-rose-50 text-rose-800',
}

export function ExportReportsPage() {
  const q = useExportJobs()
  const create = useCreateExportJob()
  const markReady = useMarkExportReady()
  const toast = useToastStore((s) => s.push)
  const [drawer, setDrawer] = useState(false)
  const [form, setForm] = useState({
    reportName: 'Inventory valuation',
    format: 'xlsx' as ExportFormat,
    schedule: '',
    email: '',
  })

  return (
    <div>
      <PageHeader
        title="Export Reports"
        description="Export to Excel, CSV, PDF, or JSON. Schedule and email are mock only."
        actions={
          <button
            type="button"
            className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => setDrawer(true)}
          >
            New export
          </button>
        }
      />

      <section className="surface-panel overflow-hidden">
        {q.isLoading ? <LoadingPanel label="Loading exports…" /> : null}
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Report</th>
                <th className="px-4 py-3">Format</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(q.data ?? []).map((j) => (
                <tr key={j.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{j.reportName}</td>
                  <td className="px-4 py-3">{EXPORT_FORMAT_LABELS[j.format]}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize',
                        STATUS_TONE[j.status],
                      )}
                    >
                      {j.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{j.schedule ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{j.email ?? '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                    {new Date(j.createdAt).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {j.status === 'ready' ? (
                        <>
                          <button
                            type="button"
                            className="cursor-pointer text-xs font-semibold text-sky-700 hover:underline"
                            onClick={() => toast(`Downloaded ${j.reportName} (${j.format})`)}
                          >
                            Download
                          </button>
                          <button
                            type="button"
                            className="cursor-pointer text-xs font-semibold text-sky-700 hover:underline"
                            onClick={() =>
                              toast(`Emailed ${j.reportName} to ${j.email ?? 'ops@upbox.in'}`)
                            }
                          >
                            Email
                          </button>
                        </>
                      ) : null}
                      {j.status === 'queued' || j.status === 'failed' ? (
                        <button
                          type="button"
                          className="cursor-pointer text-xs font-semibold text-emerald-700 hover:underline"
                          onClick={() =>
                            markReady.mutate(j.id, {
                              onSuccess: () => toast('Export marked ready'),
                              onError: (e) => toast((e as Error).message, 'error'),
                            })
                          }
                        >
                          Mark ready
                        </button>
                      ) : null}
                    </div>
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
              <h2 className="font-heading text-lg font-semibold">New export</h2>
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
                Report name
                <input
                  className="surface-input mt-1 w-full"
                  value={form.reportName}
                  onChange={(e) => setForm({ ...form, reportName: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Format
                <select
                  className="surface-input mt-1 w-full"
                  value={form.format}
                  onChange={(e) =>
                    setForm({ ...form, format: e.target.value as ExportFormat })
                  }
                >
                  {(Object.keys(EXPORT_FORMAT_LABELS) as ExportFormat[]).map((f) => (
                    <option key={f} value={f}>
                      {EXPORT_FORMAT_LABELS[f]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Schedule (optional)
                <input
                  className="surface-input mt-1 w-full"
                  placeholder="e.g. Weekly Mon 08:00"
                  value={form.schedule}
                  onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Email (optional)
                <input
                  className="surface-input mt-1 w-full"
                  placeholder="ops@upbox.in"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>
            </div>
            <div className="border-t p-4">
              <button
                type="button"
                className="w-full cursor-pointer rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                disabled={create.isPending || !form.reportName.trim()}
                onClick={() =>
                  create.mutate(
                    {
                      reportName: form.reportName.trim(),
                      format: form.format,
                      schedule: form.schedule.trim() || null,
                      email: form.email.trim() || null,
                    },
                    {
                      onSuccess: () => {
                        toast('Export job created')
                        setDrawer(false)
                      },
                      onError: (e) => toast((e as Error).message, 'error'),
                    },
                  )
                }
              >
                Create export
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
