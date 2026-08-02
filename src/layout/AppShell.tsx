import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Boxes, ChevronDown, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useWorker } from '@/hooks/useInbound'
import { useEffect, useMemo, useState } from 'react'
import { ToastHost } from '@/components/ui/ToastHost'
import { NAV_SECTIONS, type NavSection } from '@/layout/navConfig'

function sectionContainsPath(section: NavSection, pathname: string): boolean {
  return section.items.some((item) => {
    if (item.end) return pathname === item.to
    return pathname === item.to || pathname.startsWith(`${item.to}/`)
  })
}

export function AppShell() {
  const { user, logout, hasAnyRole } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const workerQ = useWorker(user?.workerId)
  const worker = workerQ.data
  const setUserRoles = useAuthStore((s) => s.setUserRoles)

  useEffect(() => {
    if (!worker || !user) return
    if (worker.role === 'WMS_SUPERVISOR') return
    if (user.userType === 'SUPER_ADMIN') return
    if (user.roles?.[0] !== worker.role) setUserRoles([worker.role])
  }, [worker, user, setUserRoles])

  const isSupervisor = user?.userType === 'SUPER_ADMIN' || hasAnyRole(['WMS_SUPERVISOR'])

  const sections = useMemo(
    () =>
      NAV_SECTIONS.map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (!item.roles) return true
          if (isSupervisor) return true
          return hasAnyRole(item.roles)
        }),
      })).filter((s) => s.items.length > 0),
    [hasAnyRole, isSupervisor]
  )

  const activeSectionId = useMemo(
    () => sections.find((s) => sectionContainsPath(s, location.pathname))?.id ?? null,
    [sections, location.pathname]
  )

  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    if (!activeSectionId) return
    setOpenIds((prev) => {
      if (prev.has(activeSectionId)) return prev
      const next = new Set(prev)
      next.add(activeSectionId)
      return next
    })
  }, [activeSectionId])

  const toggleSection = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-900 text-white">
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-800 px-4 py-4">
          <Boxes className="h-6 w-6 text-primary-400" />
          <div>
            <p className="text-sm font-bold">Upbox WMS</p>
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Admin portal</p>
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
          {sections.map((section) => {
            if (section.linkOnly) {
              const item = section.items[0]
              if (!item) return null
              const Icon = section.icon ?? item.icon
              return (
                <NavLink
                  key={section.id}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{section.label}</span>
                </NavLink>
              )
            }

            const open = openIds.has(section.id)
            const SectionIcon = section.icon
            const sectionActive = activeSectionId === section.id

            return (
              <div key={section.id} className="rounded-lg">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                    sectionActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  aria-expanded={open}
                >
                  {SectionIcon ? <SectionIcon className="h-4 w-4 shrink-0" /> : null}
                  <span className="flex-1 truncate">{section.label}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-0' : '-rotate-90'}`}
                  />
                </button>

                {open ? (
                  <div className="mt-0.5 space-y-0.5 border-l border-slate-700 ml-4 pl-1">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.end}
                          className={({ isActive }) =>
                            `flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-medium transition ${
                              isActive
                                ? 'bg-primary-600 text-white'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                          }
                        >
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="flex-1 truncate">{item.label}</span>
                        </NavLink>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )
          })}
        </nav>

        <div className="shrink-0 border-t border-slate-800 p-3">
          <p className="truncate text-xs font-semibold text-white">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="truncate text-[11px] text-slate-400">{user?.roles?.[0] ?? user?.email}</p>
          {worker?.streams?.length ? (
            <p className="mt-0.5 truncate text-[10px] uppercase tracking-wide text-slate-500">
              {worker.kind} · {worker.streams.join(' + ')}
            </p>
          ) : null}

          <button
            type="button"
            className="mt-3 flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
            onClick={async () => {
              await logout()
              navigate('/login')
            }}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-h-0 min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
      <ToastHost />
    </div>
  )
}
