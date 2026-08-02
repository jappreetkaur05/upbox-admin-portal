import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { returnsAdminService } from '@/services/returnsAdmin.service'
import type {
  InspectionChecks,
  InspectionOutcome,
  QcDisposition,
  RefundStatus,
  ReturnDamage,
  ReturnDamageAction,
  ReturnReason,
} from '@/types/returnsAdmin'

const KEY = 'returns-admin'

export function useReturnOrders() {
  return useQuery({ queryKey: [KEY, 'orders'], queryFn: () => returnsAdminService.listOrders() })
}

export function useCreateReturnOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      orderId: string
      customer: string
      sku: string
      name: string
      qty: number
      reason: ReturnReason
    }) => returnsAdminService.createOrder(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [KEY] })
    },
  })
}

export function useReturnInspections() {
  return useQuery({
    queryKey: [KEY, 'inspections'],
    queryFn: () => returnsAdminService.listInspections(),
  })
}

export function useSubmitInspection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      returnId: string
      checks: InspectionChecks
      outcome: InspectionOutcome
      notes: string
    }) => returnsAdminService.submitInspection(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useQcResults() {
  return useQuery({ queryKey: [KEY, 'qc'], queryFn: () => returnsAdminService.listQc() })
}

export function useSetQcDisposition() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (a: { id: string; disposition: QcDisposition }) =>
      returnsAdminService.setDisposition(a.id, a.disposition),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useRestockJobs() {
  return useQuery({ queryKey: [KEY, 'restock'], queryFn: () => returnsAdminService.listRestock() })
}

export function useCompleteRestock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (a: { id: string; locationCode: string }) =>
      returnsAdminService.completeRestock(a.id, a.locationCode),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useReturnDamages() {
  return useQuery({ queryKey: [KEY, 'damage'], queryFn: () => returnsAdminService.listDamages() })
}

export function useUpsertReturnDamage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: Omit<ReturnDamage, 'id' | 'updatedAt'> & { id?: string }) =>
      returnsAdminService.upsertDamage(p),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'damage'] }),
  })
}

export function useUpdateDamageAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (a: { id: string; action: ReturnDamageAction }) =>
      returnsAdminService.updateDamageAction(a.id, a.action),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'damage'] }),
  })
}

export function useRtoCases() {
  return useQuery({ queryKey: [KEY, 'rto'], queryFn: () => returnsAdminService.listRto() })
}

export function useAdvanceRto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => returnsAdminService.advanceRto(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'rto'] }),
  })
}

export function useRefunds() {
  return useQuery({ queryKey: [KEY, 'refunds'], queryFn: () => returnsAdminService.listRefunds() })
}

export function useUpdateRefundStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (a: { id: string; status: RefundStatus }) =>
      returnsAdminService.updateRefundStatus(a.id, a.status),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
