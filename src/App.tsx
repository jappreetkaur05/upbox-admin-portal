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
import { MovesManagementPage } from '@/pages/warehouse/MovesManagementPage'
import { WarehouseListPage } from '@/pages/warehouse/WarehouseListPage'
import { WarehouseCreatePage } from '@/pages/warehouse/WarehouseCreatePage'
import { WarehouseZonesPage } from '@/pages/warehouse/WarehouseZonesPage'
import { WarehouseAislesPage } from '@/pages/warehouse/WarehouseAislesPage'
import { WarehouseRacksPage } from '@/pages/warehouse/WarehouseRacksPage'
import { WarehouseMappingPage } from '@/pages/warehouse/WarehouseMappingPage'
import { WarehouseStatusPage } from '@/pages/warehouse/WarehouseStatusPage'
import { InventoryManagementPage } from '@/pages/inventory/InventoryManagementPage'
import { RackUtilizationPage } from '@/pages/inventory/RackUtilizationPage'
import { IncomingOrdersPage } from '@/pages/inventory/IncomingOrdersPage'
import { InventoryDashboardPage } from '@/pages/inventory/InventoryDashboardPage'
import { SkuMasterPage } from '@/pages/inventory/SkuMasterPage'
import { ProductMasterPage } from '@/pages/inventory/ProductMasterPage'
import { InventoryAdjustmentPage } from '@/pages/inventory/InventoryAdjustmentPage'
import { BatchLotPage } from '@/pages/inventory/BatchLotPage'
import { SerialNumberPage } from '@/pages/inventory/SerialNumberPage'
import { ExpiryManagementPage } from '@/pages/inventory/ExpiryManagementPage'
import { InventoryAuditPage } from '@/pages/inventory/InventoryAuditPage'
import { CycleCountPage } from '@/pages/inventory/CycleCountPage'
import { DamagedInventoryPage } from '@/pages/inventory/DamagedInventoryPage'
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
import { GlobalDashboardPage } from '@/pages/GlobalDashboardPage'
import { RolesPage } from '@/pages/users/RolesPage'
import { PermissionsPage } from '@/pages/users/PermissionsPage'
import { TeamsPage } from '@/pages/users/TeamsPage'
import { ActivityLogsPage } from '@/pages/users/ActivityLogsPage'
import { ActivityLogDetailPage } from '@/pages/users/ActivityLogDetailPage'
import { LoginHistoryPage } from '@/pages/users/LoginHistoryPage'
import { ReturnOrdersPage } from '@/pages/returns/ReturnOrdersPage'
import { ReturnInspectionPage } from '@/pages/returns/ReturnInspectionPage'
import { QualityCheckPage } from '@/pages/returns/QualityCheckPage'
import { RestockInventoryPage } from '@/pages/returns/RestockInventoryPage'
import { ReturnDamagePage } from '@/pages/returns/ReturnDamagePage'
import { RtoProcessingPage } from '@/pages/returns/RtoProcessingPage'
import { RefundStatusPage } from '@/pages/returns/RefundStatusPage'
import { ReturnReportsPage } from '@/pages/returns/ReturnReportsPage'
import { InventoryMismatchPage } from '@/pages/exceptions/InventoryMismatchPage'
import { DamagedSkuExceptionPage } from '@/pages/exceptions/DamagedSkuExceptionPage'
import { WrongScanPage } from '@/pages/exceptions/WrongScanPage'
import { CourierRejectionPage } from '@/pages/exceptions/CourierRejectionPage'
import { FailedDispatchPage } from '@/pages/exceptions/FailedDispatchPage'
import { ExceptionCommentsPage } from '@/pages/exceptions/ExceptionCommentsPage'
import { ExceptionAttachmentsPage } from '@/pages/exceptions/ExceptionAttachmentsPage'
import { ResolutionWorkflowPage } from '@/pages/exceptions/ResolutionWorkflowPage'
import { BarcodeGeneratorPage } from '@/pages/barcodes/BarcodeGeneratorPage'
import { QrGeneratorPage } from '@/pages/barcodes/QrGeneratorPage'
import { BarcodePrintingPage } from '@/pages/barcodes/BarcodePrintingPage'
import { LabelTemplatesPage } from '@/pages/barcodes/LabelTemplatesPage'
import { ScanHistoryPage } from '@/pages/barcodes/ScanHistoryPage'
import { ScannerSettingsPage } from '@/pages/barcodes/ScannerSettingsPage'
import { CustomerBillingPage } from '@/pages/finance/CustomerBillingPage'
import { VendorBillingPage } from '@/pages/finance/VendorBillingPage'
import { WarehouseChargesPage } from '@/pages/finance/WarehouseChargesPage'
import { StorageChargesPage } from '@/pages/finance/StorageChargesPage'
import { PickPackChargesPage } from '@/pages/finance/PickPackChargesPage'
import { InvoiceManagementPage } from '@/pages/finance/InvoiceManagementPage'
import { PaymentTrackingPage } from '@/pages/finance/PaymentTrackingPage'
import { CreditNotesPage } from '@/pages/finance/CreditNotesPage'
import { FinanceReportsPage } from '@/pages/finance/FinanceReportsPage'
import { InventoryReportsPage } from '@/pages/reports/InventoryReportsPage'
import { InboundReportsPage } from '@/pages/reports/InboundReportsPage'
import { OutboundReportsPage } from '@/pages/reports/OutboundReportsPage'
import { OrderReportsPage } from '@/pages/reports/OrderReportsPage'
import { WarehousePerformancePage } from '@/pages/reports/WarehousePerformancePage'
import { UserActivityPage } from '@/pages/reports/UserActivityPage'
import { FinancialReportsPage } from '@/pages/reports/FinancialReportsPage'
import { KpiDashboardPage } from '@/pages/reports/KpiDashboardPage'
import { ExportReportsPage } from '@/pages/reports/ExportReportsPage'
import { SlaDashboardsPage } from '@/pages/reports/SlaDashboardsPage'
import { AgeingReportsPage } from '@/pages/reports/AgeingReportsPage'
import { DeadStockPage } from '@/pages/reports/DeadStockPage'
import { CompanyProfilePage } from '@/pages/settings/CompanyProfilePage'
import { WarehouseSettingsPage } from '@/pages/settings/WarehouseSettingsPage'
import { NotificationSettingsPage } from '@/pages/settings/NotificationSettingsPage'
import { EmailSmsTemplatesPage } from '@/pages/settings/EmailSmsTemplatesPage'
import { CourierIntegrationsPage } from '@/pages/settings/CourierIntegrationsPage'
import { ApiSettingsPage } from '@/pages/settings/ApiSettingsPage'
import { TaxSettingsPage } from '@/pages/settings/TaxSettingsPage'
import { UnitsOfMeasurePage } from '@/pages/settings/UnitsOfMeasurePage'
import { MasterDataPage } from '@/pages/settings/MasterDataPage'
import { BackupRestorePage } from '@/pages/settings/BackupRestorePage'
import { SystemLogsPage } from '@/pages/settings/SystemLogsPage'

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
                    roles={[
                      'DOCK_RECEIVER',
                      'UNPACKER',
                      'PUTAWAY',
                      'PICKER',
                      'PACKER',
                      'DOCK_DISPATCHER',
                      'WMS_SUPERVISOR',
                    ]}
                  />
                }
              >
                <Route path="/inbound/my-work" element={<MyWorkPage />} />
              </Route>

              <Route element={<RequireInboundRole roles={['WMS_SUPERVISOR']} />}>
                <Route path="/dashboard" element={<GlobalDashboardPage />} />
                <Route path="/inbound/workers" element={<WorkersPage />} />
                <Route path="/inbound/workers/:workerId" element={<WorkerDetailPage />} />
                <Route path="/inbound/team-work" element={<TeamWorkPage />} />
                <Route path="/inbound/assign-putaway" element={<AssignPutawayPage />} />
                <Route path="/inbound/dashboard" element={<DashboardPage />} />
                <Route path="/warehouse" element={<Navigate to="/warehouse/racks" replace />} />
                <Route path="/warehouse/list" element={<WarehouseListPage />} />
                <Route path="/warehouse/create" element={<WarehouseCreatePage />} />
                <Route path="/warehouse/zones" element={<WarehouseZonesPage />} />
                <Route path="/warehouse/aisles" element={<WarehouseAislesPage />} />
                <Route path="/warehouse/racks" element={<WarehouseRacksPage />} />
                <Route path="/warehouse/mapping" element={<WarehouseMappingPage />} />
                <Route path="/warehouse/status" element={<WarehouseStatusPage />} />
                <Route path="/warehouse/moves" element={<MovesManagementPage />} />
                <Route path="/inventory" element={<InventoryManagementPage />} />
                <Route path="/inventory/dashboard" element={<InventoryDashboardPage />} />
                <Route path="/inventory/sku-master" element={<SkuMasterPage />} />
                <Route path="/inventory/product-master" element={<ProductMasterPage />} />
                <Route path="/inventory/adjustment" element={<InventoryAdjustmentPage />} />
                <Route path="/inventory/batch-lot" element={<BatchLotPage />} />
                <Route path="/inventory/serial" element={<SerialNumberPage />} />
                <Route path="/inventory/expiry" element={<ExpiryManagementPage />} />
                <Route path="/inventory/audit" element={<InventoryAuditPage />} />
                <Route path="/inventory/cycle-count" element={<CycleCountPage />} />
                <Route path="/inventory/damaged" element={<DamagedInventoryPage />} />
                <Route path="/inventory/utilization" element={<RackUtilizationPage />} />
                <Route path="/inventory/incoming" element={<IncomingOrdersPage />} />
                <Route path="/users/roles" element={<RolesPage />} />
                <Route path="/users/permissions" element={<PermissionsPage />} />
                <Route path="/users/teams" element={<TeamsPage />} />
                <Route path="/users/activity-logs" element={<ActivityLogsPage />} />
                <Route path="/users/activity-logs/:workerId" element={<ActivityLogDetailPage />} />
                <Route path="/users/login-history" element={<LoginHistoryPage />} />
                <Route path="/returns/orders" element={<ReturnOrdersPage />} />
                <Route path="/returns/inspection" element={<ReturnInspectionPage />} />
                <Route path="/returns/qc" element={<QualityCheckPage />} />
                <Route path="/returns/restock" element={<RestockInventoryPage />} />
                <Route path="/returns/damage" element={<ReturnDamagePage />} />
                <Route path="/returns/rto" element={<RtoProcessingPage />} />
                <Route path="/returns/refunds" element={<RefundStatusPage />} />
                <Route path="/returns/reports" element={<ReturnReportsPage />} />
                <Route path="/exceptions/inventory-mismatch" element={<InventoryMismatchPage />} />
                <Route path="/exceptions/damaged-sku" element={<DamagedSkuExceptionPage />} />
                <Route path="/exceptions/wrong-scan" element={<WrongScanPage />} />
                <Route path="/exceptions/courier-rejection" element={<CourierRejectionPage />} />
                <Route path="/exceptions/failed-dispatch" element={<FailedDispatchPage />} />
                <Route path="/exceptions/comments" element={<ExceptionCommentsPage />} />
                <Route path="/exceptions/attachments" element={<ExceptionAttachmentsPage />} />
                <Route path="/exceptions/resolution" element={<ResolutionWorkflowPage />} />
                <Route path="/barcodes/generator" element={<BarcodeGeneratorPage />} />
                <Route path="/barcodes/qr-generator" element={<QrGeneratorPage />} />
                <Route path="/barcodes/printing" element={<BarcodePrintingPage />} />
                <Route path="/barcodes/templates" element={<LabelTemplatesPage />} />
                <Route path="/barcodes/scan-history" element={<ScanHistoryPage />} />
                <Route path="/barcodes/scanner-settings" element={<ScannerSettingsPage />} />
                <Route path="/finance/customer-billing" element={<CustomerBillingPage />} />
                <Route path="/finance/vendor-billing" element={<VendorBillingPage />} />
                <Route path="/finance/warehouse-charges" element={<WarehouseChargesPage />} />
                <Route path="/finance/storage-charges" element={<StorageChargesPage />} />
                <Route path="/finance/pick-pack-charges" element={<PickPackChargesPage />} />
                <Route path="/finance/invoices" element={<InvoiceManagementPage />} />
                <Route path="/finance/payments" element={<PaymentTrackingPage />} />
                <Route path="/finance/credit-notes" element={<CreditNotesPage />} />
                <Route path="/finance/reports" element={<FinanceReportsPage />} />
                <Route path="/reports/inventory" element={<InventoryReportsPage />} />
                <Route path="/reports/inbound" element={<InboundReportsPage />} />
                <Route path="/reports/outbound" element={<OutboundReportsPage />} />
                <Route path="/reports/orders" element={<OrderReportsPage />} />
                <Route
                  path="/reports/warehouse-performance"
                  element={<WarehousePerformancePage />}
                />
                <Route path="/reports/user-activity" element={<UserActivityPage />} />
                <Route path="/reports/financial" element={<FinancialReportsPage />} />
                <Route path="/reports/kpi" element={<KpiDashboardPage />} />
                <Route path="/reports/export" element={<ExportReportsPage />} />
                <Route path="/reports/sla" element={<SlaDashboardsPage />} />
                <Route path="/reports/ageing" element={<AgeingReportsPage />} />
                <Route path="/reports/dead-stock" element={<DeadStockPage />} />
                <Route path="/settings/company-profile" element={<CompanyProfilePage />} />
                <Route path="/settings/warehouse" element={<WarehouseSettingsPage />} />
                <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
                <Route path="/settings/email-sms" element={<EmailSmsTemplatesPage />} />
                <Route path="/settings/courier" element={<CourierIntegrationsPage />} />
                <Route path="/settings/api" element={<ApiSettingsPage />} />
                <Route path="/settings/tax" element={<TaxSettingsPage />} />
                <Route path="/settings/uom" element={<UnitsOfMeasurePage />} />
                <Route path="/settings/master-data" element={<MasterDataPage />} />
                <Route path="/settings/backup" element={<BackupRestorePage />} />
                <Route path="/settings/system-logs" element={<SystemLogsPage />} />
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
