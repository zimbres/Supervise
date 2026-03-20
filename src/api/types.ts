// ── System ──────────────────────────────────────────────────────────────────
export interface SystemInfo {
  monVersion: string
  apiVersion: string
  hostname: string
  ip: string
  port: number
  upTime: number
}

// ── Device list ──────────────────────────────────────────────────────────────
export interface DeviceListItem {
  id: string
  idPc: string
  userName: string
  userProd: string
  family: number
  connected: boolean
  port: { name: string }
}

export interface DeviceListResponse {
  devices: DeviceListItem[]
}

// ── Device detail ────────────────────────────────────────────────────────────
export interface DeviceStatus {
  connected: boolean
  opStartup: boolean
  opStandBy: boolean
  opBattery: boolean
  loBattery: boolean
  noSyncInput: boolean
  loFInput: boolean
  hiFInput: boolean
  loVInput: boolean
  hiVInput: boolean
  noVInput: boolean
  inShutdown: number
}

export interface DeviceFailures {
  overtemp: boolean
  internal: boolean
  endBattery: boolean
  overload: boolean
  shortcircuit: boolean
  abnormalVOutput: boolean
  abnormalVBattery: boolean
  inverter: boolean
  loVInput: boolean
  hiPOutput: boolean
  tiristor: boolean
}

export interface DeviceVars {
  vInput: number
  vOutput: number
  fOutput: number
  pOutput: number
  vBattery: number
  cBattery: number
  temperature: number
  iOutput: number
  ledRed: number
  ledGreen: number
  ledBlue: number
  random: number
}

export interface DeviceRegressive {
  value: number   // milliseconds; -1 = none active
  cause: number   // 0–5
}

export interface Device {
  id: string
  idPc: string
  userName: string
  userProd: string
  family: number
  connected: boolean
  port: { name: string }
  last: number
  status: DeviceStatus
  failures: DeviceFailures
  vars: DeviceVars
  regressive: DeviceRegressive
}

export interface DeviceDetailResponse {
  device: Device
}

// ── Shutdown config ──────────────────────────────────────────────────────────
export interface ShutdownConfig {
  enabled: number
  counterManual: number
  counterOpBattery: number
  counterLoBattery: number
  counterFailure: number
  counterTimer: number
  counterBatLevel: number
  remCtrlDelay: number
  devShutEnabled: number
  devStandByKeep: number
  devShutTimer: number
  cliShutEnabled: number
  cliHibernate: number
  cliShutTimer: number
  cliRun: number
}

// ── Email config ─────────────────────────────────────────────────────────────
export interface EmailConfig {
  server: string
  port: number
  from: string
  auth: number
  username: string
  password: string
  secure: number
  enable: number
  to1: string
  to2: string
  to3: string
  to4: string
  to5: string
}

// ── Logs ─────────────────────────────────────────────────────────────────────
export interface DataLogEntry {
  dateTime: number
  vars: {
    vInput: number
    vOutput: number
    fOutput: number
    pOutput: number
    vBattery: number
    temperature: number
  }
}

export interface DataLogResponse {
  logs: DataLogEntry[]
}

export interface EventLogEntry {
  dateTime: number
  event: number
}

export interface EventLogResponse {
  logs: EventLogEntry[]
}

// ── Supervision config ───────────────────────────────────────────────────────
export interface SupConfig {
  detect: number   // 1=auto, 2=manual
  theme: number    // 1=classic, 2=dark, 3=red
  style: number    // 1=list, 2=brick
}
