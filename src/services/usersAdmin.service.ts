import { workers } from '@/data/mockInbound'
import {
  loginSessions,
  permissionDefs,
  permissionMatrix,
  roleCatalog,
  setPermissionForRole,
  teams,
  type LoginSession,
  type PermissionDef,
  type RoleCatalogItem,
  type TeamDept,
} from '@/data/mockUsersAdmin'
import type { WarehouseWorker, WorkerRole } from '@/types/inbound'

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms))

export const usersAdminService = {
  async listTeams(): Promise<TeamDept[]> {
    await delay()
    return teams
  },

  async listRoles(): Promise<RoleCatalogItem[]> {
    await delay()
    return roleCatalog
  },

  async listPermissions(): Promise<{ defs: PermissionDef[]; matrix: Record<WorkerRole, string[]> }> {
    await delay()
    return { defs: permissionDefs, matrix: { ...permissionMatrix } }
  },

  async togglePermission(role: WorkerRole, permId: string, enabled: boolean) {
    await delay(80)
    setPermissionForRole(role, permId, enabled)
    return { defs: permissionDefs, matrix: { ...permissionMatrix } }
  },

  async listLoginSessions(): Promise<LoginSession[]> {
    await delay()
    return [...loginSessions].sort(
      (a, b) => new Date(b.loggedInAt).getTime() - new Date(a.loggedInAt).getTime()
    )
  },

  teamName(teamId: string): string {
    return teams.find((t) => t.id === teamId)?.name ?? teamId
  },

  workersOnRole(role: WorkerRole): WarehouseWorker[] {
    return workers.filter((w) => w.role === role)
  },

  workersOnTeam(teamId: string): WarehouseWorker[] {
    return workers.filter((w) => w.teamId === teamId)
  },
}
