import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import {
  useAddExceptionAttachment,
  useExceptionAttachments,
  useExceptionCases,
} from '@/hooks/useExceptionsAdmin'
import {
  ATTACHMENT_KIND_LABELS,
  type AttachmentKind,
} from '@/types/exceptionsAdmin'

export function ExceptionAttachmentsPage() {
  const attQ = useExceptionAttachments()
  const casesQ = useExceptionCases()
  const add = useAddExceptionAttachment()
  const [q, setQ] = useState('')
  const [form, setForm] = useState({
    exceptionId: '',
    name: '',
    kind: 'photo' as AttachmentKind,
  })

  const rows = useMemo(() => {
    let list = attQ.data ?? []
    const needle = q.trim().toLowerCase()
    if (needle) {
      list = list.filter(
        (a) =>
          a.exceptionId.toLowerCase().includes(needle) ||
          a.name.toLowerCase().includes(needle)
      )
    }
    return list
  }, [attQ.data, q])

  return (
    <div>
      <PageHeader
        title="Attachments"
        description="Photos, invoices, reports, and courier documents linked to exceptions."
        actions={
          <Link
            to="/exceptions/resolution"
            className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
          >
            Resolution
          </Link>
        }
      />

      <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div>
          <input
            className="surface-input mb-3 w-full px-3 py-2 text-sm"
            placeholder="Filter by exception or file name…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {attQ.isLoading ? <LoadingPanel label="Loading attachments…" /> : null}
          <section className="surface-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Exception</th>
                    <th className="px-4 py-3">File</th>
                    <th className="px-4 py-3">Kind</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((a) => (
                    <tr key={a.id} className="hover:bg-sky-50/40">
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{a.exceptionId}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{a.name}</td>
                      <td className="px-4 py-3 text-xs">{ATTACHMENT_KIND_LABELS[a.kind]}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(a.at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-sky-700 hover:underline"
                        >
                          Open
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="surface-panel h-fit p-4">
          <h3 className="font-heading text-sm font-semibold">Mock upload</h3>
          <label className="mt-3 block text-xs font-semibold text-slate-600">
            Exception
            <select
              className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
              value={form.exceptionId}
              onChange={(e) => setForm({ ...form, exceptionId: e.target.value })}
            >
              <option value="">Select…</option>
              {(casesQ.data ?? []).map((c) => (
                <option key={c.id} value={c.exceptionId}>
                  {c.exceptionId}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-xs font-semibold text-slate-600">
            File name
            <input
              className="surface-input mt-1 w-full px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="damage-photo.jpg"
            />
          </label>
          <label className="mt-3 block text-xs font-semibold text-slate-600">
            Kind
            <select
              className="surface-input mt-1 w-full cursor-pointer px-3 py-2 text-sm"
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value as AttachmentKind })}
            >
              {(Object.keys(ATTACHMENT_KIND_LABELS) as AttachmentKind[]).map((k) => (
                <option key={k} value={k}>
                  {ATTACHMENT_KIND_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="mt-3 w-full cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            disabled={!form.exceptionId || !form.name.trim()}
            onClick={async () => {
              await add.mutateAsync({
                exceptionId: form.exceptionId,
                name: form.name.trim(),
                kind: form.kind,
              })
              setForm({ ...form, name: '' })
            }}
          >
            Add attachment
          </button>
        </aside>
      </div>
    </div>
  )
}
