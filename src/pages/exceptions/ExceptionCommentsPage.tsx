import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import {
  useAddExceptionComment,
  useExceptionCases,
  useExceptionComments,
} from '@/hooks/useExceptionsAdmin'
import { EXCEPTION_TYPE_LABELS } from '@/types/exceptionsAdmin'

export function ExceptionCommentsPage() {
  const commentsQ = useExceptionComments()
  const casesQ = useExceptionCases()
  const add = useAddExceptionComment()
  const [q, setQ] = useState('')
  const [form, setForm] = useState({ exceptionId: '', body: '' })

  const typeById = useMemo(() => {
    const map = new Map<string, string>()
    for (const c of casesQ.data ?? []) {
      map.set(c.exceptionId, EXCEPTION_TYPE_LABELS[c.type])
    }
    return map
  }, [casesQ.data])

  const rows = useMemo(() => {
    let list = commentsQ.data ?? []
    const needle = q.trim().toLowerCase()
    if (needle) {
      list = list.filter(
        (c) =>
          c.exceptionId.toLowerCase().includes(needle) ||
          c.body.toLowerCase().includes(needle) ||
          c.author.toLowerCase().includes(needle)
      )
    }
    return list
  }, [commentsQ.data, q])

  return (
    <div>
      <PageHeader
        title="Comments"
        description="Staff notes on every exception — investigation updates and follow-ups."
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
            placeholder="Filter by exception, author, text…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {commentsQ.isLoading ? <LoadingPanel label="Loading comments…" /> : null}
          <section className="surface-panel divide-y divide-slate-100 overflow-hidden">
            {rows.map((c) => (
              <div key={c.id} className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono font-semibold text-sky-800">{c.exceptionId}</span>
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
                    {typeById.get(c.exceptionId) ?? 'Exception'}
                  </span>
                  <span className="text-slate-400">{new Date(c.at).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm text-slate-800">{c.body}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{c.author}</p>
              </div>
            ))}
            {rows.length === 0 && !commentsQ.isLoading ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">No comments match.</p>
            ) : null}
          </section>
        </div>

        <aside className="surface-panel h-fit p-4">
          <h3 className="font-heading text-sm font-semibold">Add comment</h3>
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
                  {c.exceptionId} — {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-xs font-semibold text-slate-600">
            Note
            <textarea
              className="surface-input mt-1 w-full px-3 py-2 text-sm"
              rows={4}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Awaiting supplier response…"
            />
          </label>
          <button
            type="button"
            className="mt-3 w-full cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            disabled={!form.exceptionId || !form.body.trim()}
            onClick={async () => {
              await add.mutateAsync({ exceptionId: form.exceptionId, body: form.body.trim() })
              setForm({ exceptionId: form.exceptionId, body: '' })
            }}
          >
            Post comment
          </button>
        </aside>
      </div>
    </div>
  )
}
