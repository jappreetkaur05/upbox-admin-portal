import { Link, useLocation } from 'react-router-dom'
import { Construction } from 'lucide-react'
import { PageHeader } from '@/layout/PageHeader'
import { NAV_SECTIONS } from '@/layout/navConfig'

function labelForPath(pathname: string): { title: string; section?: string } {
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (pathname === item.to) {
        return { title: item.label, section: section.label }
      }
    }
  }
  return { title: 'Coming soon' }
}

export function PlaceholderPage(props?: { title?: string; description?: string }) {
  const location = useLocation()
  const fromNav = labelForPath(location.pathname)
  const title = props?.title ?? fromNav.title
  const description =
    props?.description ??
    `${title} will be available here. Navigation is wired; full UI is planned for a later pass.`

  return (
    <div>
      <PageHeader
        title={title}
        description={fromNav.section ? `${fromNav.section} · placeholder` : 'Placeholder'}
      />
      <div className="surface-panel flex flex-col items-start gap-4 p-6 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <Construction className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-600">{description}</p>
        </div>
        <Link
          to="/dashboard"
          className="cursor-pointer text-sm font-semibold text-primary-700 hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
