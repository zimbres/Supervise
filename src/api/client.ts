import type {
  SystemInfo,
  DeviceListResponse,
  DeviceDetailResponse,
  ShutdownConfig,
  EmailConfig,
  DataLogResponse,
  EventLogResponse,
  SupConfig,
} from './types'

const BASE = '/mon/1.1'

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
  const text = await res.text()
  return (text ? JSON.parse(text) : {}) as T
}

// ── System ───────────────────────────────────────────────────────────────────
export const fetchSystemInfo = () => request<SystemInfo>('')

// ── Devices ──────────────────────────────────────────────────────────────────
export const fetchDevices = () => request<DeviceListResponse>('/device')

export const fetchDevice = (id: string) =>
  request<DeviceDetailResponse>(`/device/${id}`)

export const updateDeviceUser = (
  id: string,
  payload: { userName: string; userProd: string },
) =>
  request(`/device/${id}/user`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const deleteDevice = (id: string) =>
  request(`/device/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ confirm: 1 }),
  })

// ── Shutdown ─────────────────────────────────────────────────────────────────
export const triggerShutdown = (id: string) =>
  request(`/device/${id}/shutdown`, {
    method: 'PUT',
    body: JSON.stringify({ confirm: 1 }),
  })

export const cancelShutdown = (id: string) =>
  request(`/device/${id}/shutdown`, {
    method: 'DELETE',
    body: JSON.stringify({ confirm: 1 }),
  })

export const fetchShutdownConfig = (id: string) =>
  request<ShutdownConfig>(`/device/${id}/shutcfg`)

export const saveShutdownConfig = (id: string, payload: ShutdownConfig) =>
  request(`/device/${id}/shutcfg`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

// ── Email ─────────────────────────────────────────────────────────────────────
export const fetchEmailConfig = (id: string) =>
  request<EmailConfig>(`/device/${id}/mailcfg`)

export const saveEmailConfig = (id: string, payload: EmailConfig) =>
  request(`/device/${id}/mailcfg`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const sendTestEmail = (id: string) =>
  request(`/device/${id}/mailtest`, {
    method: 'PUT',
    body: JSON.stringify({ confirm: 1 }),
  })

// ── LED color ─────────────────────────────────────────────────────────────────
export const setLedColor = (
  id: string,
  payload: { red: number; green: number; blue: number; random: boolean },
) =>
  request(`/device/${id}/color`, {
    method: 'PUT',
    body: JSON.stringify({ confirm: 1, ...payload }),
  })

// ── Logs ─────────────────────────────────────────────────────────────────────
export type DataPeriod = 'hour' | 'day' | 'month'

export const fetchDataLog = (id: string, period: DataPeriod) =>
  request<DataLogResponse>(`/device/${id}/histlog/${period}`)

export const fetchEventLog = (id: string) =>
  request<EventLogResponse>(`/device/${id}/log`)

// ── Supervision config ────────────────────────────────────────────────────────
export const fetchSupConfig = () => request<SupConfig>('/supcfg')

export const triggerDiscovery = () =>
  request('/supcfg', {
    method: 'POST',
    body: JSON.stringify({ detect: 2 }),
  })
