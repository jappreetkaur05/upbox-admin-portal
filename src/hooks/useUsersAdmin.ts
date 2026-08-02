import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersAdminService } from '@/services/usersAdmin.service'
import type { WorkerRole } from '@/types/inbound'

export function useTeams() {
  return useQuery({ queryKey: ['users-admin', 'teams'], queryFn: () => usersAdminService.listTeams() })
}

export function useRoleCatalog() {
  return useQuery({ queryKey: ['users-admin', 'roles'], queryFn: () => usersAdminService.listRoles() })
}

export function usePermissionsMatrix() {
  return useQuery({
    queryKey: ['users-admin', 'permissions'],
    queryFn: () => usersAdminService.listPermissions(),
  })
}

export function useTogglePermission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: { role: WorkerRole; permId: string; enabled: boolean }) =>
      usersAdminService.togglePermission(args.role, args.permId, args.enabled),
    onSuccess: (data) => {
      qc.setQueryData(['users-admin', 'permissions'], data)
    },
  })
}

export function useLoginSessions() {
  return useQuery({
    queryKey: ['users-admin', 'logins'],
    queryFn: () => usersAdminService.listLoginSessions(),
  })
}
