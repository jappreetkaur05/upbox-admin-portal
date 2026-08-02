import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reportsAdminService } from '@/services/reportsAdmin.service'
import type { ExportFormat, InventoryReportKind } from '@/types/reportsAdmin'

const KEY = 'reports-admin'

export function useInventoryReport(kind?: InventoryReportKind, warehouse = 'All warehouses') {
  return useQuery({
    queryKey: [KEY, 'inventory', kind ?? 'all', warehouse],
    queryFn: () => reportsAdminService.listInventory(kind, warehouse),
  })
}

export function useInboundReport(warehouse = 'All warehouses') {
  return useQuery({
    queryKey: [KEY, 'inbound', warehouse],
    queryFn: () => reportsAdminService.listInbound(warehouse),
  })
}

export function useOutboundReport(warehouse = 'All warehouses') {
  return useQuery({
    queryKey: [KEY, 'outbound', warehouse],
    queryFn: () => reportsAdminService.listOutbound(warehouse),
  })
}

export function useOrderReport(warehouse = 'All warehouses') {
  return useQuery({
    queryKey: [KEY, 'orders', warehouse],
    queryFn: () => reportsAdminService.listOrders(warehouse),
  })
}

export function useUserActivity() {
  return useQuery({
    queryKey: [KEY, 'activity'],
    queryFn: () => reportsAdminService.listUserActivity(),
  })
}

export function useExportJobs() {
  return useQuery({
    queryKey: [KEY, 'exports'],
    queryFn: () => reportsAdminService.listExportJobs(),
  })
}

export function useCreateExportJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      reportName: string
      format: ExportFormat
      schedule?: string | null
      email?: string | null
    }) => reportsAdminService.createExportJob(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'exports'] }),
  })
}

export function useMarkExportReady() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reportsAdminService.markExportReady(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'exports'] }),
  })
}

export function useSlaMetrics(warehouse = 'All warehouses') {
  return useQuery({
    queryKey: [KEY, 'sla', warehouse],
    queryFn: () => reportsAdminService.listSla(warehouse),
  })
}

export function useAgeingReport(warehouse = 'All warehouses') {
  return useQuery({
    queryKey: [KEY, 'ageing', warehouse],
    queryFn: () => reportsAdminService.listAgeing(warehouse),
  })
}

export function useDeadStockReport(warehouse = 'All warehouses') {
  return useQuery({
    queryKey: [KEY, 'dead-stock', warehouse],
    queryFn: () => reportsAdminService.listDeadStock(warehouse),
  })
}
