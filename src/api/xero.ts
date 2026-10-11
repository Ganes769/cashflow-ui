import { apiClient, ApiError } from './client'
import {
  DB_TEST_PATH,
  XERO_CONTACTS_PATH,
  XERO_INVOICES_PATH,
  XERO_SETUP_PATH,
  XERO_STATUS_PATH,
  XERO_SYNC_PATH,
  XERO_SYNCED_CONTACTS_PATH,
  XERO_SYNCED_INVOICES_PATH,
  XERO_WEBHOOK_EVENTS_PATH,
} from './config'
import { fetchSanitizedAuthorizeUrl, startXeroLogin } from './auth'
import type {
  DbTest,
  XeroContactsResponse,
  XeroInvoicesResponse,
  XeroLastSync,
  XeroSetup,
  XeroStatus,
  XeroSyncResponse,
  XeroSyncedContactsResponse,
  XeroSyncedInvoicesResponse,
  XeroWebhookEventsResponse,
} from './types'

const LONG_PULL = { timeout: 120_000 }
const SYNC_WAIT_MS = 180_000

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

async function fetchStatus(): Promise<XeroStatus> {
  const { data } = await apiClient.get<XeroStatus>(XERO_STATUS_PATH, {
    headers: { Accept: 'application/json' },
  })
  return data
}

function assertSyncOk(last: XeroLastSync | null | undefined): XeroLastSync {
  if (!last) throw new ApiError('Sync finished but the API did not return sync details.', 502)
  if (last.status === 'error' || last.error) {
    throw new ApiError(last.error ?? 'Xero sync failed.', 502)
  }
  return last
}

export const xeroApi = {
  /** GET /xero/login/url — never call GET /xero/login from the SPA (it redirects). */
  loginUrl: fetchSanitizedAuthorizeUrl,
  status: fetchStatus,
  setup: async (): Promise<XeroSetup> => {
    const { data } = await apiClient.get<XeroSetup>(XERO_SETUP_PATH)
    return data
  },
  startLogin: startXeroLogin,
  contacts: async (page = 1, pageSize = 100): Promise<XeroContactsResponse> => {
    const { data } = await apiClient.get<XeroContactsResponse>(XERO_CONTACTS_PATH, {
      params: { page, page_size: pageSize },
      ...LONG_PULL,
    })
    return data
  },
  contactsAll: async (): Promise<XeroContactsResponse> => {
    const pageSize = 100
    const contacts = []
    for (let page = 1; page <= 20; page += 1) {
      const batch = await xeroApi.contacts(page, pageSize)
      contacts.push(...(batch.contacts ?? []))
      if ((batch.contacts?.length ?? 0) < pageSize) break
    }
    return { count: contacts.length, contacts }
  },
  invoices: async (page = 1, pageSize = 100): Promise<XeroInvoicesResponse> => {
    const { data } = await apiClient.get<XeroInvoicesResponse>(XERO_INVOICES_PATH, {
      params: { page, page_size: pageSize },
      ...LONG_PULL,
    })
    return data
  },
  invoicesAll: async (): Promise<XeroInvoicesResponse> => {
    const pageSize = 100
    const invoices = []
    for (let page = 1; page <= 20; page += 1) {
      const batch = await xeroApi.invoices(page, pageSize)
      invoices.push(...(batch.invoices ?? []))
      if ((batch.invoices?.length ?? 0) < pageSize) break
    }
    return { count: invoices.length, invoices }
  },
  importFromXero: async () => {
    const [contacts, invoices] = await Promise.all([xeroApi.contactsAll(), xeroApi.invoicesAll()])
    return { contacts: contacts.count, invoices: invoices.count }
  },
  /**
   * POST /xero/sync — triggers a pull from Xero into the synced store.
   * Uses `wait=true` when supported, then polls /xero/status until last_sync updates.
   */
  sync: async (options?: { full?: boolean; wait?: boolean }): Promise<XeroLastSync> => {
    const full = options?.full ?? false
    const wait = options?.wait ?? true
    const beforeFinished = (await fetchStatus()).last_sync?.finished_at ?? null

    try {
      const { data } = await apiClient.post<XeroSyncResponse>(XERO_SYNC_PATH, {}, {
        params: { full, wait },
        timeout: wait ? SYNC_WAIT_MS : LONG_PULL.timeout,
      })
      if (data.error) throw new ApiError(String(data.error), 502)
      if (data.contacts_stored !== undefined || data.invoices_stored !== undefined) {
        return assertSyncOk({
          status: data.status ?? 'ok',
          mode: data.mode,
          contacts_stored: data.contacts_stored,
          invoices_stored: data.invoices_stored,
          finished_at: data.finished_at ?? new Date().toISOString(),
          error: data.error ?? null,
        })
      }
    } catch (error) {
      if (!wait) throw error
    }

    const deadline = Date.now() + 90_000
    while (Date.now() < deadline) {
      await sleep(2_000)
      const last = (await fetchStatus()).last_sync
      if (last?.finished_at && last.finished_at !== beforeFinished) {
        return assertSyncOk(last)
      }
    }

    const last = (await fetchStatus()).last_sync
    if (last?.finished_at && last.finished_at !== beforeFinished) return assertSyncOk(last)
    if (last?.error) throw new ApiError(last.error, 502)
    throw new ApiError(
      'Sync did not finish in time. If Xero returned 403, log in with Xero again and confirm accounting.contacts.read and accounting.invoices.read are enabled.',
      504,
    )
  },
  syncedContacts: async (): Promise<XeroSyncedContactsResponse> => {
    const { data } = await apiClient.get<XeroSyncedContactsResponse>(XERO_SYNCED_CONTACTS_PATH)
    return data
  },
  syncedInvoices: async (): Promise<XeroSyncedInvoicesResponse> => {
    const { data } = await apiClient.get<XeroSyncedInvoicesResponse>(XERO_SYNCED_INVOICES_PATH)
    return data
  },
  webhookEvents: async (limit = 50): Promise<XeroWebhookEventsResponse> => {
    const { data } = await apiClient.get<XeroWebhookEventsResponse>(XERO_WEBHOOK_EVENTS_PATH, { params: { limit } })
    return data
  },
  dbTest: async (): Promise<DbTest> => {
    const { data } = await apiClient.get<DbTest>(DB_TEST_PATH)
    return data
  },
}
