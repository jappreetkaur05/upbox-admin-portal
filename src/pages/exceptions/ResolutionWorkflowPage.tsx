import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/layout/PageHeader'
import { LoadingPanel } from '@/components/common/UpboxLoading'
import {
  useAddExceptionAttachment,
  useAddExceptionComment,
  useAdvanceResolution,
  useApproveException,
  useAssignException,
  useExceptionAttachments,
  useExceptionCases,
  useExceptionComments,
  useSetCorrectiveAction,
} from '@/hooks/useExceptionsAdmin'
import {
  EXCEPTION_STATUS_LABELS,
  EXCEPTION_TYPE_LABELS,
  RESOLUTION_PIPELINE,
  RESOLUTION_STEP_LABELS,
  type ResolutionStep,
} from '@/types/exceptionsAdmin'
import { cn } from '@/lib/cn'

export function ResolutionWorkflowPage() {
  const casesQ = useExceptionCases()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [assignee, setAssignee] = useState('Sara Supervisor')
  const [action, setAction] = useState('')
  const [comment, setComment] = useState('')
  const [attName, setAttName] = useState('')

  const assign = useAssignException()
  const setCorrective = useSetCorrectiveAction()
  const advance = useAdvanceResolution()
  const approve = useApproveException()
  const addComment = useAddExceptionComment()
  const addAtt = useAddExceptionAttachment()

  const openRows = useMemo(
    () => (casesQ.data ?? []).filter((c) => c.status !== 'closed'),
    [casesQ.data]
  )

  const selected =
    (casesQ.data ?? []).find((c) => c.id === selectedId) ??
    openRows[0] ??
    (casesQ.data ?? [])[0] ??
    null

  const commentsQ = useExceptionComments(selected?.exceptionId)
  const attQ = useExceptionAttachments(selected?.exceptionId)

  return (
    <div>
      <PageHeader
        title="Resolution Workflow"
        description="Detect → assign → investigate → correct → approve → close."
        actions={
          <div className="flex gap-2">
            <Link
              to="/exceptions/comments"
              className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
            >
              Comments
            </Link>
            <Link
              to="/exceptions/attachments"
              className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-50"
            >
              Attachments
            </Link>
          </div>
        }
      />

      {casesQ.isLoading ? <LoadingPanel label="Loading exceptions…" /> : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        <section className="surface-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Exception</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Step</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(casesQ.data ?? []).map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => {
                      setSelectedId(c.id)
                      setAssignee(c.assignee ?? 'Sara Supervisor')
                      setAction(c.correctiveAction ?? '')
                    }}
                    className={cn(
                      'cursor-pointer hover:bg-sky-50/50',
                      selected?.id === c.id && 'bg-sky-50'
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{c.exceptionId}</td>
                    <td className="px-4 py-3 text-xs">{EXCEPTION_TYPE_LABELS[c.type]}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-xs text-slate-700">
                      {c.title}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-amber-900">
                      {RESOLUTION_STEP_LABELS[c.step]}
                    </td>
                    <td className="px-4 py-3 text-xs">{c.assignee ?? '—'}</td>
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

        {selected ? (
          <aside className="surface-panel flex max-h-[calc(100vh-8rem)] flex-col overflow-hidden">
            <div className="border-b px-4 py-3">
              <p className="text-[11px] font-bold uppercase text-slate-500">
                {EXCEPTION_TYPE_LABELS[selected.type]}
              </p>
              <h2 className="font-mono text-lg font-semibold">{selected.exceptionId}</h2>
              <p className="text-xs text-slate-600">{selected.title}</p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin">
              <ol className="space-y-1.5">
                {RESOLUTION_PIPELINE.map((step: ResolutionStep, i) => {
                  const cur = RESOLUTION_PIPELINE.indexOf(selected.step)
                  const done = i <= cur
                  return (
                    <li
                      key={step}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-xs',
                        done
                          ? 'border-sky-200 bg-sky-50 font-semibold text-sky-900'
                          : 'border-slate-100 text-slate-400'
                      )}
                    >
                      {i + 1}. {RESOLUTION_STEP_LABELS[step]}
                    </li>
                  )
                })}
              </ol>

              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  Assign owner
                  <input
                    className="surface-input mt-1 w-full px-3 py-2 text-sm"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="mt-2 w-full cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                  onClick={() =>
                    assign.mutate({ exceptionId: selected.exceptionId, assignee: assignee.trim() })
                  }
                >
                  Save assignee
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  Corrective action
                  <textarea
                    className="surface-input mt-1 w-full px-3 py-2 text-sm"
                    rows={2}
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="mt-2 w-full cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                  disabled={!action.trim()}
                  onClick={() =>
                    setCorrective.mutate({
                      exceptionId: selected.exceptionId,
                      correctiveAction: action.trim(),
                    })
                  }
                >
                  Save action
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  Add comment
                  <textarea
                    className="surface-input mt-1 w-full px-3 py-2 text-sm"
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="mt-2 w-full cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                  disabled={!comment.trim()}
                  onClick={async () => {
                    await addComment.mutateAsync({
                      exceptionId: selected.exceptionId,
                      body: comment.trim(),
                    })
                    setComment('')
                  }}
                >
                  Post comment
                </button>
                <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-xs text-slate-600">
                  {(commentsQ.data ?? []).slice(0, 4).map((c) => (
                    <li key={c.id} className="rounded border border-slate-100 px-2 py-1">
                      <span className="font-semibold">{c.author}:</span> {c.body}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  Add attachment name
                  <input
                    className="surface-input mt-1 w-full px-3 py-2 text-sm"
                    value={attName}
                    onChange={(e) => setAttName(e.target.value)}
                    placeholder="photo.jpg"
                  />
                </label>
                <button
                  type="button"
                  className="mt-2 w-full cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                  disabled={!attName.trim()}
                  onClick={async () => {
                    await addAtt.mutateAsync({
                      exceptionId: selected.exceptionId,
                      name: attName.trim(),
                      kind: 'photo',
                    })
                    setAttName('')
                  }}
                >
                  Attach
                </button>
                <p className="mt-1 text-[11px] text-slate-500">
                  {(attQ.data ?? []).length} attachment(s)
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t px-4 py-3">
              {selected.step !== 'closed' ? (
                <button
                  type="button"
                  className="cursor-pointer rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => advance.mutate(selected.exceptionId)}
                >
                  Advance step
                </button>
              ) : null}
              {selected.step === 'manager_approval' || selected.step === 'corrective_action' ? (
                <button
                  type="button"
                  className="cursor-pointer rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900"
                  onClick={() => approve.mutate(selected.exceptionId)}
                >
                  Manager approve & close
                </button>
              ) : null}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  )
}
