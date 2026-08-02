import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import { MockBarcodeBars } from '@/components/barcodes/MockCodePreviews'
import {
  useCreatePrintJob,
  useLabelTemplates,
  useMarkPrinted,
  usePrintJobs,
  useReprintJob,
} from '@/hooks/useBarcodesAdmin'
import { barcodesAdminService } from '@/services/barcodesAdmin.service'
import { LABEL_TYPE_LABELS, type LabelType } from '@/types/barcodesAdmin'
import { cn } from '@/lib/cn'

export function BarcodePrintingPage() {
  const jobsQ = usePrintJobs()
  const tplQ = useLabelTemplates()
  const create = useCreatePrintJob()
  const mark = useMarkPrinted()
  const reprint = useReprintJob()
  const [drawer, setDrawer] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [form, setForm] = useState({
    templateId: '',
    labelType: 'product' as LabelType,
    targets: 'NK-AM-BLK-42',
    copies: 1,
  })

  const activeTemplates = useMemo(
    () => (tplQ.data ?? []).filter((t) => t.status === 'active'),
    [tplQ.data]
  )

  const previewTpl =
    activeTemplates.find((t) => t.id === form.templateId) ?? activeTemplates[0]

  return (
    <div>
      <PageHeader
        title="Barcode Printing"
        description="Print product, rack, bin, and shipment labels. Thermal printers supported in production; this is a mock preview queue."
        actions={
          <div className="flex gap-2">
            <Link
              to="/barcodes/templates"
              className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
            >
              Templates
            </Link>
            <button
              type="button"
              className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => {
                setForm({
                  templateId: activeTemplates[0]?.id ?? '',
                  labelType: 'product',
                  targets: 'NK-AM-BLK-42',
                  copies: 1,
                })
                setDrawer(true)
              }}
            >
              New print job
            </button>
          </div>
        }
      />

      {toast ? (
        <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          {toast}
        </div>
      ) : null}

      {jobsQ.isLoading ? <LoadingPanel label="Loading print jobs…" /> : null}

      <section className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[880px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Label type</th>
                <th className="px-4 py-3">Template</th>
                <th className="px-4 py-3">Targets</th>
                <th className="px-4 py-3">Copies</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(jobsQ.data ?? []).map((j) => (
                <tr key={j.id} className="hover:bg-sky-50/40">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{j.id}</td>
                  <td className="px-4 py-3 text-xs">{LABEL_TYPE_LABELS[j.labelType]}</td>
                  <td className="px-4 py-3 text-xs">
                    {barcodesAdminService.templateName(j.templateId)}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 font-mono text-xs text-slate-600">
                    {j.targets.join(', ')}
                    {j.reprintOf ? (
                      <span className="ml-1 text-[10px] text-amber-700">(reprint)</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 font-semibold">{j.copies}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-lg px-2 py-1 text-xs font-bold capitalize ring-1',
                        j.status === 'printed'
                          ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                          : j.status === 'queued'
                            ? 'bg-amber-50 text-amber-900 ring-amber-200'
                            : 'bg-rose-50 text-rose-800 ring-rose-200'
                      )}
                    >
                      {j.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {j.status === 'queued' ? (
                        <button
                          type="button"
                          className="cursor-pointer text-xs font-semibold text-sky-700 hover:underline"
                          onClick={async () => {
                            await mark.mutateAsync(j.id)
                            setToast('Marked printed (mock thermal)')
                            setTimeout(() => setToast(null), 2000)
                          }}
                        >
                          Mark printed
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="cursor-pointer text-xs font-semibold text-slate-600 hover:underline"
                        onClick={async () => {
                          await reprint.mutateAsync(j.id)
                          setToast('Reprint job queued')
                          setTimeout(() => setToast(null), 2000)
                        }}
                      >
                        Reprint
                      </button>
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
            <div className="border-b px-4 py-3">
              <h3 className="font-heading text-lg font-semibold">New print job</h3>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              <label className="block text-xs font-semibold text-slate-600">
                Label type
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.labelType}
                  onChange={(e) => setForm({ ...form, labelType: e.target.value as LabelType })}
                >
                  {(Object.keys(LABEL_TYPE_LABELS) as LabelType[]).map((k) => (
                    <option key={k} value={k}>
                      {LABEL_TYPE_LABELS[k]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Template
                <select
                  className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
                  value={form.templateId}
                  onChange={(e) => setForm({ ...form, templateId: e.target.value })}
                >
                  {activeTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.size})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Targets (comma-separated)
                <textarea
                  className="surface-input mt-1 w-full px-3 py-2 font-mono text-xs"
                  rows={3}
                  value={form.targets}
                  onChange={(e) => setForm({ ...form, targets: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Copies
                <input
                  type="number"
                  min={1}
                  className="surface-input mt-1 w-full px-3 py-2 text-sm"
                  value={form.copies}
                  onChange={(e) => setForm({ ...form, copies: Number(e.target.value) || 1 })}
                />
              </label>

              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-bold uppercase text-slate-500">Print preview</p>
                <p className="mt-1 text-sm font-semibold">{previewTpl?.name ?? 'No template'}</p>
                <MockBarcodeBars
                  value={form.targets.split(',')[0]?.trim() || 'PREVIEW'}
                  className="mt-2 w-full rounded border bg-white"
                />
                <p className="mt-2 text-[10px] text-slate-500">
                  Individual or bulk labels · reprint damaged labels from the job list
                </p>
              </div>
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
                  const targets = form.targets
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                  if (!form.templateId || targets.length === 0) return
                  await create.mutateAsync({
                    templateId: form.templateId,
                    labelType: form.labelType,
                    targets,
                    copies: form.copies,
                  })
                  setDrawer(false)
                  setToast('Print job queued')
                  setTimeout(() => setToast(null), 2000)
                }}
              >
                Queue print
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
