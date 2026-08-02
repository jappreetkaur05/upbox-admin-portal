import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { exceptionsAdminService } from '@/services/exceptionsAdmin.service'
import type {
  AttachmentKind,
  CourierRejectReason,
  DamagedSkuAction,
  DamagedSkuReason,
  ExceptionType,
  FailedDispatchReason,
  MismatchCause,
  WrongScanPayload,
} from '@/types/exceptionsAdmin'

const KEY = 'exceptions-admin'

export function useExceptionCases(type?: ExceptionType) {
  return useQuery({
    queryKey: [KEY, 'cases', type ?? 'all'],
    queryFn: () => exceptionsAdminService.listCases(type),
  })
}

export function useCreateMismatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      sku: string
      skuName: string
      expectedQty: number
      actualQty: number
      cause: MismatchCause
      assignee?: string
    }) => exceptionsAdminService.createMismatch(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useCreateDamagedSku() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      sku: string
      skuName: string
      qty: number
      reason: DamagedSkuReason
      action: DamagedSkuAction
      assignee?: string
    }) => exceptionsAdminService.createDamaged(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateDamagedAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (a: { exceptionId: string; action: DamagedSkuAction }) =>
      exceptionsAdminService.updateDamagedAction(a.exceptionId, a.action),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useCreateWrongScan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: WrongScanPayload & { assignee?: string }) =>
      exceptionsAdminService.createWrongScan(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useCreateCourierRejection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      shipmentId: string
      orderId: string
      courier: string
      reason: CourierRejectReason
      assignee?: string
    }) => exceptionsAdminService.createCourierRejection(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useCreateFailedDispatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      orderId: string
      reason: FailedDispatchReason
      assignee?: string
    }) => exceptionsAdminService.createFailedDispatch(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useAssignException() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (a: { exceptionId: string; assignee: string }) =>
      exceptionsAdminService.assignOwner(a.exceptionId, a.assignee),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useSetCorrectiveAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (a: { exceptionId: string; correctiveAction: string }) =>
      exceptionsAdminService.setCorrectiveAction(a.exceptionId, a.correctiveAction),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useAdvanceResolution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (exceptionId: string) => exceptionsAdminService.advanceResolution(exceptionId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useApproveException() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (exceptionId: string) => exceptionsAdminService.approveAndClose(exceptionId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useExceptionComments(exceptionId?: string) {
  return useQuery({
    queryKey: [KEY, 'comments', exceptionId ?? 'all'],
    queryFn: () => exceptionsAdminService.listComments(exceptionId),
  })
}

export function useAddExceptionComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { exceptionId: string; body: string; author?: string }) =>
      exceptionsAdminService.addComment(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useExceptionAttachments(exceptionId?: string) {
  return useQuery({
    queryKey: [KEY, 'attachments', exceptionId ?? 'all'],
    queryFn: () => exceptionsAdminService.listAttachments(exceptionId),
  })
}

export function useAddExceptionAttachment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      exceptionId: string
      name: string
      kind: AttachmentKind
      url?: string
    }) => exceptionsAdminService.addAttachment(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
