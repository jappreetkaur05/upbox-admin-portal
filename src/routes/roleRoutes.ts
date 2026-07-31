export const INBOUND_ROLES = ['DOCK_RECEIVER', 'UNPACKER', 'PUTAWAY', 'WMS_SUPERVISOR'] as const
export const OUTBOUND_ROLES = ['DOCK_DISPATCHER', 'PACKER', 'PICKER', 'WMS_SUPERVISOR'] as const
export const ALL_FLOOR_ROLES = [...INBOUND_ROLES, 'DOCK_DISPATCHER', 'PACKER', 'PICKER'] as const

export function roleHomePath(roles: string[]): string {
  if (roles.includes('WMS_SUPERVISOR')) return '/inbound/dashboard'
  if (roles.includes('DOCK_RECEIVER')) return '/inbound/dock-receive'
  if (roles.includes('UNPACKER')) return '/inbound/unpack'
  if (roles.includes('PUTAWAY')) return '/inbound/putaway'
  if (roles.includes('DOCK_DISPATCHER')) return '/outbound/fe-checkin'
  if (roles.includes('PACKER')) return '/outbound/packing'
  if (roles.includes('PICKER')) return '/outbound/picking'
  return '/unauthorized'
}

export function outboundRoleHomePath(roles: string[]): string {
  if (roles.includes('WMS_SUPERVISOR')) return '/outbound/dashboard'
  if (roles.includes('PICKER')) return '/outbound/picking'
  if (roles.includes('PACKER')) return '/outbound/packing'
  if (roles.includes('DOCK_DISPATCHER')) return '/outbound/fe-checkin'
  return '/outbound/dashboard'
}
