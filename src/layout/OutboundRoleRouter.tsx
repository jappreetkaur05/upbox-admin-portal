import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { outboundRoleHomePath } from '@/routes/roleRoutes'

export function OutboundRoleRouter() {
  const roles = useAuthStore((s) => s.user?.roles ?? [])
  return <Navigate to={outboundRoleHomePath(roles)} replace />
}
