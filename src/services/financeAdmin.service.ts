import {
  creditNotes,
  customerBills,
  invoices,
  payments,
  pickPackCharges,
  storageCalcs,
  vendorBills,
  warehouseChargeRates,
} from '@/data/mockFinanceAdmin'
import type {
  ApprovalStatus,
  CreditNote,
  CreditNoteReason,
  CustomerBill,
  FinanceReportSnapshot,
  Invoice,
  InvoiceStatus,
  Payment,
  PaymentStatus,
  PickPackBillingOption,
  PickPackCharge,
  PickPackExtra,
  ServiceLine,
  StorageChargeCalc,
  StorageMethod,
  VendorBill,
  VendorCategory,
  WarehouseChargeRate,
} from '@/types/financeAdmin'

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms))

export const financeAdminService = {
  async listCustomerBills(): Promise<CustomerBill[]> {
    await delay()
    return [...customerBills]
  },

  async createCustomerBill(input: {
    customer: string
    period: string
    services: ServiceLine[]
    paymentStatus?: PaymentStatus
  }): Promise<CustomerBill> {
    await delay(150)
    const sub = input.services.reduce((s, l) => s + l.amount, 0)
    const taxes = Math.round(sub * 0.18)
    const invoiceNumber = `INV-2026-${8000 + customerBills.length}`
    const row: CustomerBill = {
      id: `cb-${Date.now()}`,
      customer: input.customer,
      invoiceNumber,
      period: input.period,
      services: input.services,
      taxes,
      total: sub + taxes,
      paymentStatus: input.paymentStatus ?? 'pending',
    }
    customerBills.unshift(row)
    return { ...row }
  },

  async listVendorBills(): Promise<VendorBill[]> {
    await delay()
    return [...vendorBills]
  },

  async createVendorBill(input: {
    vendor: string
    invoiceNumber: string
    category: VendorCategory
    amount: number
    dueDate: string
    poNumber: string
  }): Promise<VendorBill> {
    await delay(120)
    const row: VendorBill = {
      id: `vb-${Date.now()}`,
      ...input,
      approvalStatus: 'pending',
    }
    vendorBills.unshift(row)
    return { ...row }
  },

  async setVendorApproval(id: string, approvalStatus: ApprovalStatus): Promise<VendorBill> {
    await delay(100)
    const row = vendorBills.find((v) => v.id === id)
    if (!row) throw new Error('Vendor bill not found')
    row.approvalStatus = approvalStatus
    return { ...row }
  },

  async listWarehouseRates(): Promise<WarehouseChargeRate[]> {
    await delay()
    return [...warehouseChargeRates]
  },

  async updateWarehouseRate(id: string, rate: number, active?: boolean): Promise<WarehouseChargeRate> {
    await delay(100)
    const row = warehouseChargeRates.find((r) => r.id === id)
    if (!row) throw new Error('Rate not found')
    row.rate = rate
    if (active !== undefined) row.active = active
    return { ...row }
  },

  async listStorageCalcs(): Promise<StorageChargeCalc[]> {
    await delay()
    return [...storageCalcs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  async createStorageCalc(input: {
    customer: string
    method: StorageMethod
    qty: number
    rate: number
    days: number
  }): Promise<StorageChargeCalc> {
    await delay(120)
    const row: StorageChargeCalc = {
      id: `sc-${Date.now()}`,
      ...input,
      total: input.qty * input.rate * input.days,
      createdAt: new Date().toISOString(),
    }
    storageCalcs.unshift(row)
    return { ...row }
  },

  async listPickPack(): Promise<PickPackCharge[]> {
    await delay()
    return [...pickPackCharges]
  },

  async createPickPack(input: {
    customer: string
    period: string
    billingOption: PickPackBillingOption
    qty: number
    rate: number
    extras: PickPackExtra[]
  }): Promise<PickPackCharge> {
    await delay(120)
    const extrasAmount = input.extras.length * 500 + (input.extras.includes('custom') ? 800 : 0)
    const row: PickPackCharge = {
      id: `ppc-${Date.now()}`,
      ...input,
      extrasAmount,
      total: input.qty * input.rate + extrasAmount,
    }
    pickPackCharges.unshift(row)
    return { ...row }
  },

  async listInvoices(): Promise<Invoice[]> {
    await delay()
    return [...invoices].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  async generateInvoiceFromBill(billId: string): Promise<Invoice> {
    await delay(150)
    const bill = customerBills.find((b) => b.id === billId)
    if (!bill) throw new Error('Bill not found')
    const existing = invoices.find((i) => i.invoiceNumber === bill.invoiceNumber)
    if (existing) return { ...existing }
    const subtotal = bill.services.reduce((s, l) => s + l.amount, 0)
    const row: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: bill.invoiceNumber,
      customer: bill.customer,
      period: bill.period,
      lines: bill.services.map((s) => ({ description: s.label, amount: s.amount })),
      gstPercent: 18,
      subtotal,
      tax: bill.taxes,
      total: bill.total,
      status: 'draft',
      createdAt: new Date().toISOString(),
    }
    invoices.unshift(row)
    return { ...row }
  },

  async setInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
    await delay(100)
    const row = invoices.find((i) => i.id === id)
    if (!row) throw new Error('Invoice not found')
    if (status === 'reissued') {
      const reissued: Invoice = {
        ...row,
        id: `inv-${Date.now()}`,
        invoiceNumber: `${row.invoiceNumber}-R`,
        status: 'reissued',
        createdAt: new Date().toISOString(),
      }
      row.status = 'cancelled'
      invoices.unshift(reissued)
      return { ...reissued }
    }
    row.status = status
    return { ...row }
  },

  async listPayments(): Promise<Payment[]> {
    await delay()
    return [...payments]
  },

  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment> {
    await delay(100)
    const row = payments.find((p) => p.id === id)
    if (!row) throw new Error('Payment not found')
    row.status = status
    if (status === 'paid') row.paidAt = new Date().toISOString()
    return { ...row }
  },

  async listCreditNotes(): Promise<CreditNote[]> {
    await delay()
    return [...creditNotes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  async createCreditNote(input: {
    invoiceNumber: string
    customer: string
    reason: CreditNoteReason
    amount: number
  }): Promise<CreditNote> {
    await delay(120)
    const row: CreditNote = {
      id: `cn-${Date.now()}`,
      creditNoteNumber: `CN-2026-${20 + creditNotes.length}`,
      ...input,
      status: 'issued',
      createdAt: new Date().toISOString(),
    }
    creditNotes.unshift(row)
    return { ...row }
  },

  reportSnapshot(): FinanceReportSnapshot {
    const customerBillingTotal = customerBills.reduce((s, b) => s + b.total, 0)
    const revenue = invoices
      .filter((i) => i.status === 'paid' || i.status === 'sent')
      .reduce((s, i) => s + i.total, 0)
    const vendorPaymentsTotal = payments
      .filter((p) => p.direction === 'out')
      .reduce((s, p) => s + p.amount, 0)
    const outstanding = payments
      .filter((p) => p.direction === 'in' && (p.status === 'pending' || p.status === 'partial' || p.status === 'overdue'))
      .reduce((s, p) => s + p.amount, 0)
    const storageRevenue = storageCalcs.reduce((s, c) => s + c.total, 0)
    const pickPackRevenue = pickPackCharges.reduce((s, c) => s + c.total, 0)
    const warehouseRevenue =
      warehouseChargeRates.filter((r) => r.active).reduce((s, r) => s + r.rate * 100, 0) +
      storageRevenue * 0.2
    const gstCollected = invoices
      .filter((i) => i.status !== 'cancelled')
      .reduce((s, i) => s + i.tax, 0)
    const expenses = vendorPaymentsTotal
    const profit = revenue - expenses
    return {
      revenue,
      customerBillingTotal,
      vendorPaymentsTotal,
      outstanding,
      warehouseRevenue: Math.round(warehouseRevenue),
      storageRevenue,
      pickPackRevenue,
      gstCollected,
      expenses,
      profit,
    }
  },
}
