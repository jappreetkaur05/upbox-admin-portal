import type { WorkerRole } from '@/types/inbound'

export function roleJobLabel(role: string): string {
  switch (role) {
    case 'DOCK_RECEIVER':
      return 'Dock · In'
    case 'DOCK_DISPATCHER':
      return 'Dock · Out'
    case 'UNPACKER':
      return 'Unpack'
    case 'PACKER':
      return 'Pack'
    case 'PUTAWAY':
      return 'Putaway'
    case 'PICKER':
      return 'Pick'
    case 'WMS_SUPERVISOR':
      return 'Supervisor'
    default:
      return role
  }
}

export const ASSIGNABLE_JOBS: { value: Exclude<WorkerRole, 'WMS_SUPERVISOR'>; label: string }[] = [
  { value: 'DOCK_RECEIVER', label: 'Dock · Inbound' },
  { value: 'DOCK_DISPATCHER', label: 'Dock · Outbound' },
  { value: 'UNPACKER', label: 'Unpack' },
  { value: 'PACKER', label: 'Pack' },
  { value: 'PUTAWAY', label: 'Putaway' },
  { value: 'PICKER', label: 'Pick' },
]
