import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { financeAdminService } from '@/services/financeAdmin.service'
import type {
  ApprovalStatus,
  CreditNoteReason,
  InvoiceStatus,
  PaymentStatus,
  PickPackBillingOption,
  PickPackExtra,
  ServiceLine,
  StorageMethod,
  VendorCategory,
} from '@/types/financeAdmin'

const KEY = 'finance-admin'

export function useCustomerBills() {
  return useQuery({ queryKey: [KEY, 'customer-bills'], queryFn: () => financeAdminService.listCustomerBills() })
}

export function useCreateCustomerBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      customer: string
      period: string
      services: ServiceLine[]
      paymentStatus?: PaymentStatus
    }) => financeAdminService.createCustomerBill(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'customer-bills'] }),
  })
}

export function useVendorBills() {
  return useQuery({ queryKey: [KEY, 'vendor-bills'], queryFn: () => financeAdminService.listVendorBills() })
}

export function useCreateVendorBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      vendor: string
      invoiceNumber: string
      category: VendorCategory
      amount: number
      dueDate: string
      poNumber: string
    }) => financeAdminService.createVendorBill(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'vendor-bills'] }),
  })
}

export function useSetVendorApproval() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (a: { id: string; approvalStatus: ApprovalStatus }) =>
      financeAdminService.setVendorApproval(a.id, a.approvalStatus),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'vendor-bills'] }),
  })
}

export function useWarehouseRates() {
  return useQuery({
    queryKey: [KEY, 'wh-rates'],
    queryFn: () => financeAdminService.listWarehouseRates(),
  })
}

export function useUpdateWarehouseRate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (a: { id: string; rate: number; active?: boolean }) =>
      financeAdminService.updateWarehouseRate(a.id, a.rate, a.active),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'wh-rates'] }),
  })
}

export function useStorageCalcs() {
  return useQuery({
    queryKey: [KEY, 'storage'],
    queryFn: () => financeAdminService.listStorageCalcs(),
  })
}

export function useCreateStorageCalc() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      customer: string
      method: StorageMethod
      qty: number
      rate: number
      days: number
    }) => financeAdminService.createStorageCalc(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'storage'] }),
  })
}

export function usePickPackCharges() {
  return useQuery({ queryKey: [KEY, 'pick-pack'], queryFn: () => financeAdminService.listPickPack() })
}

export function useCreatePickPack() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      customer: string
      period: string
      billingOption: PickPackBillingOption
      qty: number
      rate: number
      extras: PickPackExtra[]
    }) => financeAdminService.createPickPack(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'pick-pack'] }),
  })
}

export function useInvoices() {
  return useQuery({ queryKey: [KEY, 'invoices'], queryFn: () => financeAdminService.listInvoices() })
}

export function useGenerateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (billId: string) => financeAdminService.generateInvoiceFromBill(billId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'invoices'] }),
  })
}

export function useSetInvoiceStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (a: { id: string; status: InvoiceStatus }) =>
      financeAdminService.setInvoiceStatus(a.id, a.status),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'invoices'] }),
  })
}

export function usePayments() {
  return useQuery({ queryKey: [KEY, 'payments'], queryFn: () => financeAdminService.listPayments() })
}

export function useUpdatePaymentStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (a: { id: string; status: PaymentStatus }) =>
      financeAdminService.updatePaymentStatus(a.id, a.status),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'payments'] }),
  })
}

export function useCreditNotes() {
  return useQuery({
    queryKey: [KEY, 'credit-notes'],
    queryFn: () => financeAdminService.listCreditNotes(),
  })
}

export function useCreateCreditNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      invoiceNumber: string
      customer: string
      reason: CreditNoteReason
      amount: number
    }) => financeAdminService.createCreditNote(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'credit-notes'] }),
  })
}
