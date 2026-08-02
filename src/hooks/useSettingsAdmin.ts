import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsAdminService } from '@/services/settingsAdmin.service'
import type {
  BackupType,
  CompanyProfile,
  MasterRecord,
  MasterType,
  MessageTemplate,
  NotificationChannels,
  NotificationRule,
  TaxSetting,
  TemplateChannel,
  UnitOfMeasure,
  WarehouseSetting,
  Webhook,
  ApiSecurityConfig,
  CourierIntegration,
} from '@/types/settingsAdmin'

const KEY = 'settings-admin'

export function useCompanyProfile() {
  return useQuery({
    queryKey: [KEY, 'company'],
    queryFn: () => settingsAdminService.getCompanyProfile(),
  })
}

export function useSaveCompanyProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (p: CompanyProfile) => settingsAdminService.saveCompanyProfile(p),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'company'] }),
  })
}

export function useWarehouseSettings() {
  return useQuery({
    queryKey: [KEY, 'warehouses'],
    queryFn: () => settingsAdminService.listWarehouses(),
  })
}

export function useSaveWarehouse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Omit<WarehouseSetting, 'id'> & { id?: string }) =>
      settingsAdminService.saveWarehouse(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'warehouses'] }),
  })
}

export function useNotificationChannels() {
  return useQuery({
    queryKey: [KEY, 'notify-channels'],
    queryFn: () => settingsAdminService.getNotificationChannels(),
  })
}

export function useNotificationRules() {
  return useQuery({
    queryKey: [KEY, 'notify-rules'],
    queryFn: () => settingsAdminService.listNotificationRules(),
  })
}

export function useSaveNotifications() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { channels: NotificationChannels; rules: NotificationRule[] }) =>
      settingsAdminService.saveNotifications(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [KEY, 'notify-channels'] })
      void qc.invalidateQueries({ queryKey: [KEY, 'notify-rules'] })
    },
  })
}

export function useMessageTemplates(channel?: TemplateChannel) {
  return useQuery({
    queryKey: [KEY, 'templates', channel ?? 'all'],
    queryFn: () => settingsAdminService.listTemplates(channel),
  })
}

export function useSaveTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Omit<MessageTemplate, 'id' | 'version'> & { id?: string }) =>
      settingsAdminService.saveTemplate(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'templates'] }),
  })
}

export function useCourierIntegrations() {
  return useQuery({
    queryKey: [KEY, 'couriers'],
    queryFn: () => settingsAdminService.listCouriers(),
  })
}

export function useUpdateCourier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (a: {
      id: string
      patch: Partial<
        Pick<
          CourierIntegration,
          | 'connected'
          | 'labelPrinting'
          | 'trackingSync'
          | 'pickupEnabled'
          | 'apiKeyMasked'
          | 'services'
        >
      >
    }) => settingsAdminService.updateCourier(a.id, a.patch),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'couriers'] }),
  })
}

export function useApiIntegrations() {
  return useQuery({
    queryKey: [KEY, 'api-integrations'],
    queryFn: () => settingsAdminService.listApiIntegrations(),
  })
}

export function useApiKeys() {
  return useQuery({
    queryKey: [KEY, 'api-keys'],
    queryFn: () => settingsAdminService.listApiKeys(),
  })
}

export function useCreateApiKey() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (a: { name: string; rateLimit: number }) =>
      settingsAdminService.createApiKey(a.name, a.rateLimit),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'api-keys'] }),
  })
}

export function useRevokeApiKey() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => settingsAdminService.revokeApiKey(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'api-keys'] }),
  })
}

export function useWebhooks() {
  return useQuery({
    queryKey: [KEY, 'webhooks'],
    queryFn: () => settingsAdminService.listWebhooks(),
  })
}

export function useSaveWebhook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Omit<Webhook, 'id'> & { id?: string }) =>
      settingsAdminService.saveWebhook(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'webhooks'] }),
  })
}

export function useApiSecurity() {
  return useQuery({
    queryKey: [KEY, 'api-security'],
    queryFn: () => settingsAdminService.getApiSecurity(),
  })
}

export function useSaveApiSecurity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (next: ApiSecurityConfig) => settingsAdminService.saveApiSecurity(next),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'api-security'] }),
  })
}

export function useTaxSetting() {
  return useQuery({
    queryKey: [KEY, 'tax'],
    queryFn: () => settingsAdminService.getTaxSetting(),
  })
}

export function useSaveTaxSetting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (next: TaxSetting) => settingsAdminService.saveTaxSetting(next),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'tax'] }),
  })
}

export function useUnitsOfMeasure() {
  return useQuery({
    queryKey: [KEY, 'uom'],
    queryFn: () => settingsAdminService.listUoms(),
  })
}

export function useSaveUom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Omit<UnitOfMeasure, 'id'> & { id?: string }) =>
      settingsAdminService.saveUom(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'uom'] }),
  })
}

export function useMasterRecords(type?: MasterType) {
  return useQuery({
    queryKey: [KEY, 'masters', type ?? 'all'],
    queryFn: () => settingsAdminService.listMasters(type),
  })
}

export function useCreateMaster() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Omit<MasterRecord, 'id'>) => settingsAdminService.createMaster(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'masters'] }),
  })
}

export function useBackupJobs() {
  return useQuery({
    queryKey: [KEY, 'backups'],
    queryFn: () => settingsAdminService.listBackups(),
  })
}

export function useRunBackup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (type: BackupType) => settingsAdminService.runBackup(type),
    onSuccess: () => void qc.invalidateQueries({ queryKey: [KEY, 'backups'] }),
  })
}

export function useSystemLogs() {
  return useQuery({
    queryKey: [KEY, 'logs'],
    queryFn: () => settingsAdminService.listSystemLogs(),
  })
}
