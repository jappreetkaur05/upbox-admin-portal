import {
  apiIntegrations,
  apiKeys,
  apiSecurity,
  backupJobs,
  companyProfile,
  courierIntegrations,
  masterRecords,
  messageTemplates,
  notificationChannels,
  notificationRules,
  systemLogs,
  taxSetting,
  unitsOfMeasure,
  warehouseSettings,
  webhooks,
} from '@/data/mockSettingsAdmin'
import type {
  ApiIntegration,
  ApiKey,
  ApiSecurityConfig,
  BackupJob,
  BackupType,
  CompanyProfile,
  CourierIntegration,
  MasterRecord,
  MasterType,
  MessageTemplate,
  NotificationChannels,
  NotificationRule,
  SettingsDashboardSnapshot,
  SystemLogEntry,
  TaxSetting,
  TemplateChannel,
  UnitOfMeasure,
  WarehouseSetting,
  Webhook,
} from '@/types/settingsAdmin'

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms))

export const settingsAdminService = {
  dashboardSnapshot(): SettingsDashboardSnapshot {
    return {
      companyName: companyProfile.name,
      warehousesActive: warehouseSettings.length,
      couriersConnected: courierIntegrations.filter((c) => c.connected).length,
      emailTemplates: messageTemplates.filter((t) => t.channel === 'email').length,
      smsTemplates: messageTemplates.filter((t) => t.channel === 'sms').length,
      apiIntegrations: apiIntegrations.length,
      gstActive: taxSetting.gstActive,
      lastBackupLabel: 'Today 02:00 AM',
      systemHealth: 'healthy',
    }
  },

  async getCompanyProfile(): Promise<CompanyProfile> {
    await delay()
    return { ...companyProfile }
  },

  async saveCompanyProfile(next: CompanyProfile): Promise<CompanyProfile> {
    await delay(120)
    Object.assign(companyProfile, next)
    return { ...companyProfile }
  },

  async listWarehouses(): Promise<WarehouseSetting[]> {
    await delay()
    return [...warehouseSettings]
  },

  async saveWarehouse(
    input: Omit<WarehouseSetting, 'id'> & { id?: string },
  ): Promise<WarehouseSetting> {
    await delay(120)
    if (input.id) {
      const row = warehouseSettings.find((w) => w.id === input.id)
      if (!row) throw new Error('Warehouse not found')
      Object.assign(row, input)
      return { ...row }
    }
    const row: WarehouseSetting = {
      id: `wh-${Date.now()}`,
      name: input.name,
      code: input.code,
      defaultLocation: input.defaultLocation,
      hours: input.hours,
      capacity: input.capacity,
      pickingStrategy: input.pickingStrategy,
      putawayStrategy: input.putawayStrategy,
      multiWarehouse: input.multiWarehouse,
      autoSlotting: input.autoSlotting,
    }
    warehouseSettings.unshift(row)
    return { ...row }
  },

  async getNotificationChannels(): Promise<NotificationChannels> {
    await delay()
    return { ...notificationChannels }
  },

  async listNotificationRules(): Promise<NotificationRule[]> {
    await delay()
    return notificationRules.map((r) => ({ ...r, channels: [...r.channels] }))
  },

  async saveNotifications(input: {
    channels: NotificationChannels
    rules: NotificationRule[]
  }): Promise<void> {
    await delay(120)
    Object.assign(notificationChannels, input.channels)
    notificationRules.splice(
      0,
      notificationRules.length,
      ...input.rules.map((r) => ({ ...r, channels: [...r.channels] })),
    )
  },

  async listTemplates(channel?: TemplateChannel): Promise<MessageTemplate[]> {
    await delay()
    let rows = messageTemplates.map((t) => ({ ...t, variables: [...t.variables] }))
    if (channel) rows = rows.filter((t) => t.channel === channel)
    return rows
  },

  async saveTemplate(
    input: Omit<MessageTemplate, 'id' | 'version'> & { id?: string },
  ): Promise<MessageTemplate> {
    await delay(120)
    if (input.id) {
      const row = messageTemplates.find((t) => t.id === input.id)
      if (!row) throw new Error('Template not found')
      Object.assign(row, {
        ...input,
        version: row.version + 1,
        variables: [...input.variables],
      })
      return { ...row, variables: [...row.variables] }
    }
    const row: MessageTemplate = {
      id: `tpl-${Date.now()}`,
      channel: input.channel,
      name: input.name,
      subject: input.subject,
      body: input.body,
      variables: [...input.variables],
      language: input.language,
      version: 1,
    }
    messageTemplates.unshift(row)
    return { ...row, variables: [...row.variables] }
  },

  async listCouriers(): Promise<CourierIntegration[]> {
    await delay()
    return courierIntegrations.map((c) => ({ ...c, services: [...c.services] }))
  },

  async updateCourier(
    id: string,
    patch: Partial<
      Pick<
        CourierIntegration,
        'connected' | 'labelPrinting' | 'trackingSync' | 'pickupEnabled' | 'apiKeyMasked' | 'services'
      >
    >,
  ): Promise<CourierIntegration> {
    await delay(100)
    const row = courierIntegrations.find((c) => c.id === id)
    if (!row) throw new Error('Courier not found')
    Object.assign(row, patch)
    return { ...row, services: [...row.services] }
  },

  async listApiIntegrations(): Promise<ApiIntegration[]> {
    await delay()
    return [...apiIntegrations]
  },

  async listApiKeys(): Promise<ApiKey[]> {
    await delay()
    return [...apiKeys]
  },

  async createApiKey(name: string, rateLimit: number): Promise<ApiKey> {
    await delay(120)
    const suffix = Math.random().toString(16).slice(2, 6)
    const row: ApiKey = {
      id: `ak-${Date.now()}`,
      name,
      keyMasked: `upb_live_••••••••••••${suffix}`,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      rateLimit,
    }
    apiKeys.unshift(row)
    return { ...row }
  },

  async revokeApiKey(id: string): Promise<void> {
    await delay(80)
    const i = apiKeys.findIndex((k) => k.id === id)
    if (i >= 0) apiKeys.splice(i, 1)
  },

  async listWebhooks(): Promise<Webhook[]> {
    await delay()
    return webhooks.map((w) => ({ ...w, events: [...w.events] }))
  },

  async saveWebhook(input: Omit<Webhook, 'id'> & { id?: string }): Promise<Webhook> {
    await delay(100)
    if (input.id) {
      const row = webhooks.find((w) => w.id === input.id)
      if (!row) throw new Error('Webhook not found')
      Object.assign(row, { ...input, events: [...input.events] })
      return { ...row, events: [...row.events] }
    }
    const row: Webhook = {
      id: `whk-${Date.now()}`,
      url: input.url,
      events: [...input.events],
      active: input.active,
    }
    webhooks.unshift(row)
    return { ...row, events: [...row.events] }
  },

  async getApiSecurity(): Promise<ApiSecurityConfig> {
    await delay()
    return { ...apiSecurity }
  },

  async saveApiSecurity(next: ApiSecurityConfig): Promise<ApiSecurityConfig> {
    await delay(100)
    Object.assign(apiSecurity, next)
    return { ...apiSecurity }
  },

  async getTaxSetting(): Promise<TaxSetting> {
    await delay()
    return {
      ...taxSetting,
      categories: taxSetting.categories.map((c) => ({ ...c })),
      hsnSamples: taxSetting.hsnSamples.map((h) => ({ ...h })),
    }
  },

  async saveTaxSetting(next: TaxSetting): Promise<TaxSetting> {
    await delay(120)
    taxSetting.gstActive = next.gstActive
    taxSetting.cgst = next.cgst
    taxSetting.sgst = next.sgst
    taxSetting.igst = next.igst
    taxSetting.reverseCharge = next.reverseCharge
    taxSetting.categories = next.categories.map((c) => ({ ...c }))
    taxSetting.hsnSamples = next.hsnSamples.map((h) => ({ ...h }))
    return this.getTaxSetting()
  },

  async listUoms(): Promise<UnitOfMeasure[]> {
    await delay()
    return [...unitsOfMeasure]
  },

  async saveUom(input: Omit<UnitOfMeasure, 'id'> & { id?: string }): Promise<UnitOfMeasure> {
    await delay(100)
    if (input.isDefault) {
      for (const u of unitsOfMeasure) {
        if (u.kind === input.kind) u.isDefault = false
      }
    }
    if (input.id) {
      const row = unitsOfMeasure.find((u) => u.id === input.id)
      if (!row) throw new Error('UOM not found')
      Object.assign(row, input)
      return { ...row }
    }
    const row: UnitOfMeasure = {
      id: `uom-${Date.now()}`,
      code: input.code,
      name: input.name,
      kind: input.kind,
      isDefault: input.isDefault,
      conversionToBase: input.conversionToBase,
    }
    unitsOfMeasure.unshift(row)
    return { ...row }
  },

  async listMasters(type?: MasterType): Promise<MasterRecord[]> {
    await delay()
    let rows = [...masterRecords]
    if (type) rows = rows.filter((r) => r.type === type)
    return rows
  },

  async createMaster(input: Omit<MasterRecord, 'id'>): Promise<MasterRecord> {
    await delay(100)
    const row: MasterRecord = { id: `md-${Date.now()}`, ...input }
    masterRecords.unshift(row)
    return { ...row }
  },

  async listBackups(): Promise<BackupJob[]> {
    await delay()
    return [...backupJobs]
  },

  async runBackup(type: BackupType): Promise<BackupJob> {
    await delay(150)
    const row: BackupJob = {
      id: `bk-${Date.now()}`,
      type,
      status: 'completed',
      createdAt: new Date().toISOString(),
      encrypted: true,
      location: `s3://upbox-backups/${type}-${Date.now()}`,
    }
    backupJobs.unshift(row)
    return { ...row }
  },

  async listSystemLogs(): Promise<SystemLogEntry[]> {
    await delay()
    return [...systemLogs]
  },
}
