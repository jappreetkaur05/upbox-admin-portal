import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { warehouseAdminService } from '@/services/warehouseAdmin.service'
import type { CreateWarehouseInput } from '@/data/mockWarehouses'
import type { WarehouseZoneRecord } from '@/types/warehouseAdmin'

export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouse-admin', 'list'],
    queryFn: () => warehouseAdminService.listWarehouses(),
  })
}

export function useWarehouse(id: string | undefined) {
  return useQuery({
    queryKey: ['warehouse-admin', 'one', id],
    queryFn: () => warehouseAdminService.getWarehouse(id!),
    enabled: !!id,
  })
}

export function useCreateWarehouse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateWarehouseInput) => warehouseAdminService.createWarehouse(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['warehouse-admin'] })
    },
  })
}

export function useWarehouseZones(warehouseId?: string) {
  return useQuery({
    queryKey: ['warehouse-admin', 'zones', warehouseId ?? 'all'],
    queryFn: () => warehouseAdminService.listZones(warehouseId),
  })
}

export function useUpsertWarehouseZone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (partial: Omit<WarehouseZoneRecord, 'id'> & { id?: string }) =>
      warehouseAdminService.upsertZone(partial),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['warehouse-admin', 'zones'] })
    },
  })
}

export function useWarehouseAisles(warehouseId?: string) {
  return useQuery({
    queryKey: ['warehouse-admin', 'aisles', warehouseId ?? 'all'],
    queryFn: () => warehouseAdminService.listAisles(warehouseId),
  })
}

export function useWarehouseRacks(warehouseId?: string) {
  return useQuery({
    queryKey: ['warehouse-admin', 'racks', warehouseId ?? 'all'],
    queryFn: () => warehouseAdminService.listRacks(warehouseId),
  })
}
