import type { WorkerRole } from '@/types/inbound'

export type TeamDept = {
  id: string
  name: string
  description: string
  leadName?: string
  defaultRoles: WorkerRole[]
}

export type RoleCatalogItem = {
  id: string
  role: WorkerRole
  name: string
  description: string
  teamId: string
  status: 'active' | 'deprecated'
}

export type PermissionModule = 'Inbound' | 'Outbound' | 'Inventory' | 'Admin'

export type PermissionDef = {
  id: string
  label: string
  module: PermissionModule
}

export type LoginSession = {
  id: string
  workerId: string
  workerName: string
  role: WorkerRole
  loggedInAt: string
  loggedOutAt: string | null
  device: string
  ip: string
  result: 'success' | 'failed'
}

export const teams: TeamDept[] = [
  {
    id: 'team-receiving',
    name: 'Receiving',
    description: 'Dock inbound receiving and ASN intake',
    leadName: 'Amit Dock',
    defaultRoles: ['DOCK_RECEIVER'],
  },
  {
    id: 'team-unpack',
    name: 'Unpack',
    description: 'Carton open, stage, and damage logging',
    leadName: 'Bina Unpacker',
    defaultRoles: ['UNPACKER'],
  },
  {
    id: 'team-putaway',
    name: 'Putaway',
    description: 'Rack putaway and location placement',
    leadName: 'Ravi Putaway',
    defaultRoles: ['PUTAWAY'],
  },
  {
    id: 'team-picking',
    name: 'Picking',
    description: 'Wave picks and pick exceptions',
    leadName: 'Arjun Pick',
    defaultRoles: ['PICKER'],
  },
  {
    id: 'team-packing',
    name: 'Packing',
    description: 'Pack QC, seal, and label print',
    leadName: 'Kavya Packer',
    defaultRoles: ['PACKER'],
  },
  {
    id: 'team-dispatch',
    name: 'Dispatch',
    description: 'FE check-in, bag assign, and release',
    leadName: 'Deepak Dock Out',
    defaultRoles: ['DOCK_DISPATCHER'],
  },
  {
    id: 'team-ops',
    name: 'Supervisor / Ops',
    description: 'Floor supervision and cross-stream oversight',
    leadName: 'Sara Supervisor',
    defaultRoles: ['WMS_SUPERVISOR'],
  },
]

export const roleCatalog: RoleCatalogItem[] = [
  {
    id: 'role-dock-in',
    role: 'DOCK_RECEIVER',
    name: 'Dock Receiver',
    description: 'Receive inbound cartons at the dock',
    teamId: 'team-receiving',
    status: 'active',
  },
  {
    id: 'role-unpack',
    role: 'UNPACKER',
    name: 'Unpacker',
    description: 'Open cartons and stage products',
    teamId: 'team-unpack',
    status: 'active',
  },
  {
    id: 'role-putaway',
    role: 'PUTAWAY',
    name: 'Putaway',
    description: 'Place products into bin locations',
    teamId: 'team-putaway',
    status: 'active',
  },
  {
    id: 'role-picker',
    role: 'PICKER',
    name: 'Picker',
    description: 'Confirm picks and raise pick exceptions',
    teamId: 'team-picking',
    status: 'active',
  },
  {
    id: 'role-packer',
    role: 'PACKER',
    name: 'Packer',
    description: 'Validate, QC, and print shipping labels',
    teamId: 'team-packing',
    status: 'active',
  },
  {
    id: 'role-dock-out',
    role: 'DOCK_DISPATCHER',
    name: 'Dock Dispatcher',
    description: 'Verify FEs and release route bags',
    teamId: 'team-dispatch',
    status: 'active',
  },
  {
    id: 'role-sup',
    role: 'WMS_SUPERVISOR',
    name: 'WMS Supervisor',
    description: 'Full warehouse oversight and assignment',
    teamId: 'team-ops',
    status: 'active',
  },
]

export const permissionDefs: PermissionDef[] = [
  { id: 'perm-receive', label: 'Receive carton', module: 'Inbound' },
  { id: 'perm-unpack', label: 'Unpack / stage', module: 'Inbound' },
  { id: 'perm-assign-putaway', label: 'Assign putaway', module: 'Inbound' },
  { id: 'perm-putaway', label: 'Complete putaway', module: 'Inbound' },
  { id: 'perm-pick', label: 'Pick confirm', module: 'Outbound' },
  { id: 'perm-pick-exception', label: 'Raise pick exception', module: 'Outbound' },
  { id: 'perm-pack-qc', label: 'Pack QC', module: 'Outbound' },
  { id: 'perm-print-label', label: 'Print shipping label', module: 'Outbound' },
  { id: 'perm-fe-checkin', label: 'FE check-in', module: 'Outbound' },
  { id: 'perm-release-fe', label: 'Release to FE', module: 'Outbound' },
  { id: 'perm-stock-view', label: 'View stock levels', module: 'Inventory' },
  { id: 'perm-stock-adjust', label: 'Inventory adjustment', module: 'Inventory' },
  { id: 'perm-manage-users', label: 'Manage users', module: 'Admin' },
  { id: 'perm-manage-roles', label: 'Manage roles & permissions', module: 'Admin' },
]

/** role → set of permission ids allowed */
export let permissionMatrix: Record<WorkerRole, string[]> = {
  DOCK_RECEIVER: ['perm-receive', 'perm-stock-view'],
  UNPACKER: ['perm-unpack', 'perm-stock-view'],
  PUTAWAY: ['perm-putaway', 'perm-stock-view'],
  PICKER: ['perm-pick', 'perm-pick-exception', 'perm-stock-view'],
  PACKER: ['perm-pack-qc', 'perm-print-label', 'perm-stock-view'],
  DOCK_DISPATCHER: ['perm-fe-checkin', 'perm-release-fe', 'perm-stock-view'],
  WMS_SUPERVISOR: permissionDefs.map((p) => p.id),
}

export function setPermissionForRole(role: WorkerRole, permId: string, enabled: boolean) {
  const current = new Set(permissionMatrix[role] ?? [])
  if (enabled) current.add(permId)
  else current.delete(permId)
  permissionMatrix = { ...permissionMatrix, [role]: [...current] }
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString()
}

function daysAgo(d: number, hour = 9): string {
  const t = new Date()
  t.setDate(t.getDate() - d)
  t.setHours(hour, 15 + (d % 3) * 7, 0, 0)
  return t.toISOString()
}

export const loginSessions: LoginSession[] = [
  {
    id: 'ls-1',
    workerId: 'w-sup',
    workerName: 'Sara Supervisor',
    role: 'WMS_SUPERVISOR',
    loggedInAt: hoursAgo(1),
    loggedOutAt: null,
    device: 'Chrome · Windows',
    ip: '10.0.1.12',
    result: 'success',
  },
  {
    id: 'ls-2',
    workerId: 'w-pick-1',
    workerName: 'Arjun Pick',
    role: 'PICKER',
    loggedInAt: hoursAgo(3),
    loggedOutAt: hoursAgo(0.5),
    device: 'Chrome · Android',
    ip: '10.0.2.44',
    result: 'success',
  },
  {
    id: 'ls-3',
    workerId: 'w-pack-1',
    workerName: 'Kavya Packer',
    role: 'PACKER',
    loggedInAt: hoursAgo(4),
    loggedOutAt: null,
    device: 'Edge · Windows',
    ip: '10.0.2.51',
    result: 'success',
  },
  {
    id: 'ls-4',
    workerId: 'w-dock',
    workerName: 'Amit Dock',
    role: 'DOCK_RECEIVER',
    loggedInAt: daysAgo(0, 7),
    loggedOutAt: hoursAgo(2),
    device: 'Chrome · Windows',
    ip: '10.0.1.20',
    result: 'success',
  },
  {
    id: 'ls-5',
    workerId: 'w-unpack',
    workerName: 'Bina Unpacker',
    role: 'UNPACKER',
    loggedInAt: daysAgo(1, 8),
    loggedOutAt: daysAgo(1, 17),
    device: 'Chrome · Windows',
    ip: '10.0.1.33',
    result: 'success',
  },
  {
    id: 'ls-6',
    workerId: 'w-put-1',
    workerName: 'Ravi Putaway',
    role: 'PUTAWAY',
    loggedInAt: daysAgo(1, 8),
    loggedOutAt: daysAgo(1, 16),
    device: 'Firefox · Windows',
    ip: '10.0.1.41',
    result: 'success',
  },
  {
    id: 'ls-7',
    workerId: 'w-pick-2',
    workerName: 'Diya Pick',
    role: 'PICKER',
    loggedInAt: daysAgo(2, 9),
    loggedOutAt: null,
    device: 'Chrome · Android',
    ip: '10.0.2.88',
    result: 'failed',
  },
  {
    id: 'ls-8',
    workerId: 'w-dock-out',
    workerName: 'Deepak Dock Out',
    role: 'DOCK_DISPATCHER',
    loggedInAt: hoursAgo(5),
    loggedOutAt: hoursAgo(1),
    device: 'Chrome · Windows',
    ip: '10.0.1.55',
    result: 'success',
  },
  {
    id: 'ls-9',
    workerId: 'w-put-2',
    workerName: 'Meera Putaway',
    role: 'PUTAWAY',
    loggedInAt: daysAgo(3, 10),
    loggedOutAt: daysAgo(3, 15),
    device: 'Safari · iOS',
    ip: '10.0.3.12',
    result: 'success',
  },
]
