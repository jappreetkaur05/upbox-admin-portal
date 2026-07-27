import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeftRight,
  Boxes,
  ChartColumn,
  ClipboardList,
  FileText,
  Inbox,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Package,
  PackageCheck,
  PackageOpen,
  PackageSearch,
  Percent,
  ScanBarcode,
  ShieldCheck,
  Truck,
  UserCheck,
  Users,
  Warehouse,
  Waves,
  Container,
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useWorker } from '@/hooks/useInbound'
import { ALL_FLOOR_ROLES } from '@/routes/roleRoutes'
import { useEffect } from 'react'
import { ToastHost } from '@/components/ui/ToastHost'

type NavItem = {
  to: string
  label: string
  icon: typeof Truck
  roles?: string[]
  end?: boolean
}

type NavSection = { id: string; label: string; items: NavItem[] }

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'inbound',
    label: 'Inbound',
    items: [
      { to: '/inbound/dashboard', label: 'Overview', icon: LayoutDashboard, roles: ['WMS_SUPERVISOR'] },
      { to: '/inbound/dock-receive', label: 'Dock Receiving', icon: Truck, roles: ['DOCK_RECEIVER', 'WMS_SUPERVISOR'] },
      { to: '/inbound/unpack', label: 'Unpack', icon: PackageOpen, roles: ['UNPACKER', 'WMS_SUPERVISOR'] },
      { to: '/inbound/assign-putaway', label: 'Assign putaway', icon: UserCheck, roles: ['WMS_SUPERVISOR'] },
      { to: '/inbound/putaway', label: 'Putaway', icon: Package, roles: ['PUTAWAY', 'WMS_SUPERVISOR'] },
    ],
  },
  {
    id: 'outbound',
    label: 'Outbound',
    items: [
      { to: '/outbound/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['WMS_SUPERVISOR'] },
      { to: '/outbound/orders', label: 'Orders', icon: ListOrdered, roles: ['WMS_SUPERVISOR'] },
      { to: '/outbound/allocation', label: 'Allocation', icon: ScanBarcode, roles: ['WMS_SUPERVISOR'] },
      { to: '/outbound/waves', label: 'Wave planning', icon: Waves, roles: ['WMS_SUPERVISOR'] },
      { to: '/outbound/pick-lists', label: 'Pick lists', icon: ClipboardList, roles: ['PICKER', 'WMS_SUPERVISOR'] },
      { to: '/outbound/picking', label: 'Picking', icon: PackageCheck, roles: ['PICKER', 'WMS_SUPERVISOR'] },
      { to: '/outbound/exceptions', label: 'Exceptions', icon: AlertTriangle, roles: ['PICKER', 'WMS_SUPERVISOR'] },
      { to: '/outbound/packing', label: 'Packing', icon: PackageOpen, roles: ['PACKER', 'WMS_SUPERVISOR'] },
      { to: '/outbound/labels', label: 'Shipping labels', icon: FileText, roles: ['PACKER', 'WMS_SUPERVISOR'] },
      { to: '/outbound/route-bags', label: 'Route bags', icon: Boxes, roles: ['WMS_SUPERVISOR', 'DOCK_DISPATCHER'] },
      { to: '/outbound/assign-fe', label: 'Assign FE', icon: UserCheck, roles: ['WMS_SUPERVISOR', 'DOCK_DISPATCHER'] },
      { to: '/outbound/fe-bays', label: 'FE bays', icon: Warehouse, roles: ['WMS_SUPERVISOR', 'DOCK_DISPATCHER'] },
      { to: '/outbound/fe-load', label: 'FE load', icon: Container, roles: ['WMS_SUPERVISOR', 'DOCK_DISPATCHER'] },
      { to: '/outbound/fe-checkin', label: 'FE check-in', icon: ShieldCheck, roles: ['WMS_SUPERVISOR', 'DOCK_DISPATCHER'] },
      { to: '/outbound/release-fe', label: 'Release to FE', icon: Truck, roles: ['WMS_SUPERVISOR', 'DOCK_DISPATCHER'] },
      { to: '/outbound/in-field', label: 'In-field', icon: PackageSearch, roles: ['WMS_SUPERVISOR'] },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    items: [
      { to: '/inventory', label: 'Stock', icon: PackageSearch, roles: ['WMS_SUPERVISOR'], end: true },
      { to: '/inventory/utilization', label: 'Utilization', icon: Percent, roles: ['WMS_SUPERVISOR'] },
      { to: '/inventory/incoming', label: 'Incoming', icon: Inbox, roles: ['WMS_SUPERVISOR'] },
      { to: '/warehouse', label: 'Locations', icon: Warehouse, roles: ['WMS_SUPERVISOR'], end: true },
      { to: '/warehouse/moves', label: 'Moves', icon: ArrowLeftRight, roles: ['WMS_SUPERVISOR'] },
    ],
  },
  {
    id: 'shared',
    label: 'Team',
    items: [
      { to: '/inbound/workers', label: 'Workers', icon: Users, roles: ['WMS_SUPERVISOR'] },
      { to: '/inbound/team-work', label: 'Team work', icon: ClipboardList, roles: ['WMS_SUPERVISOR'] },
      { to: '/inbound/my-work', label: 'My work', icon: ChartColumn, roles: [...ALL_FLOOR_ROLES] },
    ],
  },
]

export function AppShell() {
  const { user, logout, hasAnyRole } = useAuthStore()
  const navigate = useNavigate()
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

  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (!item.roles) return true
      if (isSupervisor) return true
      return hasAnyRole(item.roles)
    }),
  })).filter((s) => s.items.length > 0)

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

        <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto p-3 scrollbar-thin">
          {sections.map((section) => (
            <div key={section.id}>
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
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
                      <span className="flex-1 truncate">{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
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
