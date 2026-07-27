import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from '@/layout/AppShell'
import { InboundRoleRouter } from '@/layout/InboundRoleRouter'
import { OutboundRoleRouter } from '@/layout/OutboundRoleRouter'
import { RequireAuth, RequireInboundRole, RequireOutboundRole } from '@/routes/RequireAuth'
import { LoginPage } from '@/pages/LoginPage'
import { DockReceivePage } from '@/pages/inbound/DockReceivePage'
import { UnpackPage } from '@/pages/inbound/UnpackPage'
import { AssignPutawayPage } from '@/pages/inbound/AssignPutawayPage'
import { PutawayPage } from '@/pages/inbound/PutawayPage'
import { DashboardPage } from '@/pages/inbound/DashboardPage'
import { MyWorkPage } from '@/pages/inbound/MyWorkPage'
import { WorkersPage } from '@/pages/inbound/WorkersPage'
import { WorkerDetailPage } from '@/pages/inbound/WorkerDetailPage'
import { TeamWorkPage } from '@/pages/inbound/TeamWorkPage'
import { WarehouseManagementPage } from '@/pages/warehouse/WarehouseManagementPage'
import { MovesManagementPage } from '@/pages/warehouse/MovesManagementPage'
import { InventoryManagementPage } from '@/pages/inventory/InventoryManagementPage'
import { RackUtilizationPage } from '@/pages/inventory/RackUtilizationPage'
import { IncomingOrdersPage } from '@/pages/inventory/IncomingOrdersPage'
import { OutboundDashboardPage } from '@/pages/outbound/OutboundDashboardPage'
import { OrdersPage } from '@/pages/outbound/OrdersPage'
import { AllocationPage } from '@/pages/outbound/AllocationPage'
import { WavePlanningPage } from '@/pages/outbound/WavePlanningPage'
import { PickListsPage } from '@/pages/outbound/PickListsPage'
import { PickingPage } from '@/pages/outbound/PickingPage'
import { PickExceptionsPage } from '@/pages/outbound/PickExceptionsPage'
import { PackingStationsPage } from '@/pages/outbound/PackingStationsPage'
import { ShippingLabelsPage } from '@/pages/outbound/ShippingLabelsPage'
import { InFieldShipmentsPage } from '@/pages/outbound/InFieldShipmentsPage'
import { RouteBagsPage } from '@/pages/outbound/RouteBagsPage'
import { AssignFePage } from '@/pages/outbound/AssignFePage'
import { FeBayPage } from '@/pages/outbound/FeBayPage'
import { FeLoadPage } from '@/pages/outbound/FeLoadPage'
import { FeCheckInPage } from '@/pages/outbound/FeCheckInPage'
import { ReleaseToFePage } from '@/pages/outbound/ReleaseToFePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 2000 },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate to="/inbound" replace />} />
              <Route path="/inbound" element={<InboundRoleRouter />} />

              <Route
                element={
                  <RequireInboundRole
                    roles={['DOCK_RECEIVER', 'UNPACKER', 'PUTAWAY', 'PICKER', 'PACKER', 'DOCK_DISPATCHER', 'WMS_SUPERVISOR']}
                  />
                }
              >
                <Route path="/inbound/my-work" element={<MyWorkPage />} />
              </Route>

              <Route element={<RequireInboundRole roles={['WMS_SUPERVISOR']} />}>
                <Route path="/inbound/workers" element={<WorkersPage />} />
                <Route path="/inbound/workers/:workerId" element={<WorkerDetailPage />} />
                <Route path="/inbound/team-work" element={<TeamWorkPage />} />
                <Route path="/inbound/assign-putaway" element={<AssignPutawayPage />} />
                <Route path="/inbound/dashboard" element={<DashboardPage />} />
                <Route path="/warehouse" element={<WarehouseManagementPage />} />
                <Route path="/warehouse/moves" element={<MovesManagementPage />} />
                <Route path="/inventory" element={<InventoryManagementPage />} />
                <Route path="/inventory/utilization" element={<RackUtilizationPage />} />
                <Route path="/inventory/incoming" element={<IncomingOrdersPage />} />
              </Route>

              <Route element={<RequireInboundRole roles={['DOCK_RECEIVER', 'WMS_SUPERVISOR']} />}>
                <Route path="/inbound/dock-receive" element={<DockReceivePage />} />
              </Route>
              <Route element={<RequireInboundRole roles={['UNPACKER', 'WMS_SUPERVISOR']} />}>
                <Route path="/inbound/unpack" element={<UnpackPage />} />
              </Route>
              <Route element={<RequireInboundRole roles={['PUTAWAY', 'WMS_SUPERVISOR']} />}>
                <Route path="/inbound/putaway" element={<PutawayPage />} />
              </Route>

              <Route path="/outbound" element={<OutboundRoleRouter />} />
              <Route element={<RequireOutboundRole roles={['WMS_SUPERVISOR']} />}>
                <Route path="/outbound/dashboard" element={<OutboundDashboardPage />} />
                <Route path="/outbound/orders" element={<OrdersPage />} />
                <Route path="/outbound/allocation" element={<AllocationPage />} />
                <Route path="/outbound/waves" element={<WavePlanningPage />} />
                <Route path="/outbound/route-bags" element={<RouteBagsPage />} />
                <Route path="/outbound/assign-fe" element={<AssignFePage />} />
                <Route path="/outbound/fe-bays" element={<FeBayPage />} />
                <Route path="/outbound/fe-load" element={<FeLoadPage />} />
                <Route path="/outbound/fe-checkin" element={<FeCheckInPage />} />
                <Route path="/outbound/release-fe" element={<ReleaseToFePage />} />
                <Route path="/outbound/in-field" element={<InFieldShipmentsPage />} />
                <Route path="/outbound/shipments" element={<InFieldShipmentsPage />} />
              </Route>
              <Route element={<RequireOutboundRole roles={['PICKER', 'WMS_SUPERVISOR']} />}>
                <Route path="/outbound/pick-lists" element={<PickListsPage />} />
                <Route path="/outbound/picking" element={<PickingPage />} />
                <Route path="/outbound/exceptions" element={<PickExceptionsPage />} />
              </Route>
              <Route element={<RequireOutboundRole roles={['PACKER', 'WMS_SUPERVISOR']} />}>
                <Route path="/outbound/packing" element={<PackingStationsPage />} />
                <Route path="/outbound/labels" element={<ShippingLabelsPage />} />
              </Route>
              <Route element={<RequireOutboundRole roles={['DOCK_DISPATCHER', 'WMS_SUPERVISOR']} />}>
                <Route path="/outbound/route-bags" element={<RouteBagsPage />} />
                <Route path="/outbound/assign-fe" element={<AssignFePage />} />
                <Route path="/outbound/fe-bays" element={<FeBayPage />} />
                <Route path="/outbound/fe-load" element={<FeLoadPage />} />
                <Route path="/outbound/fe-checkin" element={<FeCheckInPage />} />
                <Route path="/outbound/release-fe" element={<ReleaseToFePage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
      <h1 className="font-heading text-xl text-slate-900">Unauthorized</h1>
      <p className="text-sm text-slate-600">Your account does not have access to this warehouse screen.</p>
      <a href="/login" className="cursor-pointer text-sm font-semibold text-primary-700 hover:underline">
        Back to login
      </a>
    </div>
  )
}

export default App
