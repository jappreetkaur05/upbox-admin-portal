import { Link } from 'react-router-dom'

export function OutboundStepGuide(props: {
  what: string
  doNow: string
  nextLabel?: string
  nextTo?: string
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3 rounded-xl border border-primary-200 bg-primary-50/60 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{props.what}</p>
        <p className="mt-0.5 text-xs text-slate-600">{props.doNow}</p>
      </div>
      {props.nextTo && props.nextLabel ? (
        <Link
          to={props.nextTo}
          className="shrink-0 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
        >
          {props.nextLabel}
        </Link>
      ) : null}
    </div>
  )
}
