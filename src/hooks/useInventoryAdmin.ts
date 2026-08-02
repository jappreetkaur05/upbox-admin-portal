import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inventoryAdminService } from '@/services/inventoryAdmin.service'
import type { AdjustmentReason, DamagedRecord, ProductMaster, SkuMasterRow } from '@/types/inventoryAdmin'

export function useProducts() {
  return useQuery({ queryKey: ['inv-admin', 'products'], queryFn: () => inventoryAdminService.listProducts() })
}

export function useUpsertProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: Omit<ProductMaster, 'id'> & { id?: string }) => inventoryAdminService.upsertProduct(p),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['inv-admin', 'products'] }),
  })
}

export function useSkuMasters() {
  return useQuery({ queryKey: ['inv-admin', 'skus'], queryFn: () => inventoryAdminService.listSkuMasters() })
}

export function useUpsertSkuMaster() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: Omit<SkuMasterRow, 'id'> & { id?: string }) => inventoryAdminService.upsertSkuMaster(p),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['inv-admin', 'skus'] }),
  })
}

export function useBatches() {
  return useQuery({ queryKey: ['inv-admin', 'batches'], queryFn: () => inventoryAdminService.listBatches() })
}

export function useSerials() {
  return useQuery({ queryKey: ['inv-admin', 'serials'], queryFn: () => inventoryAdminService.listSerials() })
}

export function useAdjustments() {
  return useQuery({
    queryKey: ['inv-admin', 'adjustments'],
    queryFn: () => inventoryAdminService.listAdjustments(),
  })
}

export function useCreateAdjustment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      sku: string
      skuName: string
      beforeQty: number
      afterQty: number
      reason: AdjustmentReason
      notes: string
    }) => inventoryAdminService.createAdjustment(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['inv-admin', 'adjustments'] }),
  })
}

export function useDamagedInventory() {
  return useQuery({ queryKey: ['inv-admin', 'damaged'], queryFn: () => inventoryAdminService.listDamaged() })
}

export function useUpsertDamaged() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: Omit<DamagedRecord, 'id' | 'at'> & { id?: string }) =>
      inventoryAdminService.upsertDamaged(p),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['inv-admin', 'damaged'] }),
  })
}

export function useAudits() {
  return useQuery({ queryKey: ['inv-admin', 'audits'], queryFn: () => inventoryAdminService.listAudits() })
}

export function useUpdateAuditLine() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (a: { auditId: string; sku: string; actualQty: number }) =>
      inventoryAdminService.updateAuditLine(a.auditId, a.sku, a.actualQty),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['inv-admin', 'audits'] }),
  })
}

export function useCycleCounts() {
  return useQuery({
    queryKey: ['inv-admin', 'cycle'],
    queryFn: () => inventoryAdminService.listCycleCounts(),
  })
}

export function useRecordCycleCount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (a: { id: string; actualQty: number }) =>
      inventoryAdminService.recordCycleCount(a.id, a.actualQty),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['inv-admin', 'cycle'] }),
  })
}
