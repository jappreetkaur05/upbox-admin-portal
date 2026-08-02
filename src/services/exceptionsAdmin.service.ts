import {
  exceptionAttachments,
  exceptionCases,
  exceptionComments,
} from '@/data/mockExceptionsAdmin'
import type {
  AttachmentKind,
  CourierRejectReason,
  CourierRejectionPayload,
  DamagedSkuAction,
  DamagedSkuPayload,
  DamagedSkuReason,
  ExceptionAttachment,
  ExceptionCase,
  ExceptionComment,
  ExceptionStatus,
  ExceptionType,
  FailedDispatchPayload,
  FailedDispatchReason,
  InventoryMismatchPayload,
  MismatchCause,
  ResolutionStep,
  WrongScanPayload,
} from '@/types/exceptionsAdmin'
import { RESOLUTION_PIPELINE } from '@/types/exceptionsAdmin'

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms))

function nextExceptionId() {
  const n = 1000 + exceptionCases.length + 1
  return `EXC-${n}`
}

function statusForStep(step: ResolutionStep): ExceptionStatus {
  if (step === 'detected') return 'open'
  if (step === 'assigned') return 'assigned'
  if (step === 'investigation' || step === 'corrective_action') return 'investigating'
  if (step === 'manager_approval') return 'pending_approval'
  return 'closed'
}

export const exceptionsAdminService = {
  async listCases(type?: ExceptionType): Promise<ExceptionCase[]> {
    await delay()
    let list = [...exceptionCases]
    if (type) list = list.filter((c) => c.type === type)
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getCase(exceptionId: string): Promise<ExceptionCase | undefined> {
    await delay()
    const row = exceptionCases.find((c) => c.exceptionId === exceptionId)
    return row ? { ...row } : undefined
  },

  async createMismatch(input: {
    sku: string
    skuName: string
    expectedQty: number
    actualQty: number
    cause: MismatchCause
    assignee?: string
  }): Promise<ExceptionCase> {
    await delay(120)
    const difference = input.actualQty - input.expectedQty
    const exceptionId = nextExceptionId()
    const mismatch: InventoryMismatchPayload = {
      sku: input.sku,
      skuName: input.skuName,
      expectedQty: input.expectedQty,
      actualQty: input.actualQty,
      difference,
      cause: input.cause,
    }
    const row: ExceptionCase = {
      id: `ex-${Date.now()}`,
      exceptionId,
      type: 'inventory_mismatch',
      title: `${input.skuName} qty mismatch`,
      status: input.assignee ? 'assigned' : 'open',
      step: input.assignee ? 'assigned' : 'detected',
      assignee: input.assignee ?? null,
      createdAt: new Date().toISOString(),
      correctiveAction: null,
      approvedBy: null,
      mismatch,
    }
    exceptionCases.unshift(row)
    return { ...row }
  },

  async createDamaged(input: {
    sku: string
    skuName: string
    qty: number
    reason: DamagedSkuReason
    action: DamagedSkuAction
    assignee?: string
  }): Promise<ExceptionCase> {
    await delay(120)
    const exceptionId = nextExceptionId()
    const damaged: DamagedSkuPayload = {
      sku: input.sku,
      skuName: input.skuName,
      qty: input.qty,
      reason: input.reason,
      action: input.action,
    }
    const row: ExceptionCase = {
      id: `ex-${Date.now()}`,
      exceptionId,
      type: 'damaged_sku',
      title: `${input.skuName} — ${input.reason}`,
      status: input.assignee ? 'assigned' : 'open',
      step: input.assignee ? 'assigned' : 'detected',
      assignee: input.assignee ?? null,
      createdAt: new Date().toISOString(),
      correctiveAction: null,
      approvedBy: null,
      damaged,
    }
    exceptionCases.unshift(row)
    return { ...row }
  },

  async updateDamagedAction(exceptionId: string, action: DamagedSkuAction): Promise<ExceptionCase> {
    await delay(100)
    const row = exceptionCases.find((c) => c.exceptionId === exceptionId)
    if (!row || !row.damaged) throw new Error('Not found')
    row.damaged = { ...row.damaged, action }
    return { ...row }
  },

  async createWrongScan(input: WrongScanPayload & { assignee?: string }): Promise<ExceptionCase> {
    await delay(120)
    const exceptionId = nextExceptionId()
    const { assignee, ...wrongScan } = input
    const row: ExceptionCase = {
      id: `ex-${Date.now()}`,
      exceptionId,
      type: 'wrong_scan',
      title: `Wrong scan: ${wrongScan.scanType}`,
      status: assignee ? 'assigned' : 'open',
      step: assignee ? 'assigned' : 'detected',
      assignee: assignee ?? null,
      createdAt: new Date().toISOString(),
      correctiveAction: null,
      approvedBy: null,
      wrongScan,
    }
    exceptionCases.unshift(row)
    return { ...row }
  },

  async createCourierRejection(input: {
    shipmentId: string
    orderId: string
    courier: string
    reason: CourierRejectReason
    assignee?: string
  }): Promise<ExceptionCase> {
    await delay(120)
    const exceptionId = nextExceptionId()
    const courier: CourierRejectionPayload = {
      shipmentId: input.shipmentId,
      orderId: input.orderId,
      courier: input.courier,
      reason: input.reason,
    }
    const row: ExceptionCase = {
      id: `ex-${Date.now()}`,
      exceptionId,
      type: 'courier_rejection',
      title: `Courier rejection — ${input.orderId}`,
      status: input.assignee ? 'assigned' : 'open',
      step: input.assignee ? 'assigned' : 'detected',
      assignee: input.assignee ?? null,
      createdAt: new Date().toISOString(),
      correctiveAction: null,
      approvedBy: null,
      courier,
    }
    exceptionCases.unshift(row)
    return { ...row }
  },

  async createFailedDispatch(input: {
    orderId: string
    reason: FailedDispatchReason
    assignee?: string
  }): Promise<ExceptionCase> {
    await delay(120)
    const exceptionId = nextExceptionId()
    const failedDispatch: FailedDispatchPayload = {
      orderId: input.orderId,
      reason: input.reason,
    }
    const row: ExceptionCase = {
      id: `ex-${Date.now()}`,
      exceptionId,
      type: 'failed_dispatch',
      title: `Failed dispatch — ${input.orderId}`,
      status: input.assignee ? 'assigned' : 'open',
      step: input.assignee ? 'assigned' : 'detected',
      assignee: input.assignee ?? null,
      createdAt: new Date().toISOString(),
      correctiveAction: null,
      approvedBy: null,
      failedDispatch,
    }
    exceptionCases.unshift(row)
    return { ...row }
  },

  async assignOwner(exceptionId: string, assignee: string): Promise<ExceptionCase> {
    await delay(100)
    const row = exceptionCases.find((c) => c.exceptionId === exceptionId)
    if (!row) throw new Error('Not found')
    row.assignee = assignee
    if (row.step === 'detected') row.step = 'assigned'
    row.status = statusForStep(row.step)
    return { ...row }
  },

  async setCorrectiveAction(exceptionId: string, correctiveAction: string): Promise<ExceptionCase> {
    await delay(100)
    const row = exceptionCases.find((c) => c.exceptionId === exceptionId)
    if (!row) throw new Error('Not found')
    row.correctiveAction = correctiveAction
    if (
      row.step === 'detected' ||
      row.step === 'assigned' ||
      row.step === 'investigation'
    ) {
      row.step = 'corrective_action'
    }
    row.status = statusForStep(row.step)
    return { ...row }
  },

  async advanceResolution(exceptionId: string): Promise<ExceptionCase> {
    await delay(120)
    const row = exceptionCases.find((c) => c.exceptionId === exceptionId)
    if (!row) throw new Error('Not found')
    const idx = RESOLUTION_PIPELINE.indexOf(row.step)
    if (idx < RESOLUTION_PIPELINE.length - 1) {
      row.step = RESOLUTION_PIPELINE[idx + 1] as ResolutionStep
      row.status = statusForStep(row.step)
      if (row.step === 'closed') row.approvedBy = row.approvedBy ?? 'Sara Supervisor'
    }
    return { ...row }
  },

  async approveAndClose(exceptionId: string, approver = 'Sara Supervisor'): Promise<ExceptionCase> {
    await delay(120)
    const row = exceptionCases.find((c) => c.exceptionId === exceptionId)
    if (!row) throw new Error('Not found')
    row.approvedBy = approver
    row.step = 'closed'
    row.status = 'closed'
    return { ...row }
  },

  async listComments(exceptionId?: string): Promise<ExceptionComment[]> {
    await delay()
    let list = [...exceptionComments]
    if (exceptionId) list = list.filter((c) => c.exceptionId === exceptionId)
    return list.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  },

  async addComment(input: {
    exceptionId: string
    body: string
    author?: string
  }): Promise<ExceptionComment> {
    await delay(100)
    const row: ExceptionComment = {
      id: `cmt-${Date.now()}`,
      exceptionId: input.exceptionId,
      author: input.author ?? 'Sara Supervisor',
      body: input.body,
      at: new Date().toISOString(),
    }
    exceptionComments.unshift(row)
    const ex = exceptionCases.find((c) => c.exceptionId === input.exceptionId)
    if (ex && (ex.step === 'detected' || ex.step === 'assigned')) {
      ex.step = 'investigation'
      ex.status = 'investigating'
    }
    return { ...row }
  },

  async listAttachments(exceptionId?: string): Promise<ExceptionAttachment[]> {
    await delay()
    let list = [...exceptionAttachments]
    if (exceptionId) list = list.filter((a) => a.exceptionId === exceptionId)
    return list.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  },

  async addAttachment(input: {
    exceptionId: string
    name: string
    kind: AttachmentKind
    url?: string
  }): Promise<ExceptionAttachment> {
    await delay(100)
    const row: ExceptionAttachment = {
      id: `att-${Date.now()}`,
      exceptionId: input.exceptionId,
      name: input.name,
      kind: input.kind,
      url: input.url ?? 'https://placehold.co/400x300/e2e8f0/64748b?text=File',
      at: new Date().toISOString(),
    }
    exceptionAttachments.unshift(row)
    return { ...row }
  },
}
