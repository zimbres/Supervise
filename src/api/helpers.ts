import type { Device } from './types'

export function getOperatingMode(device: Device | undefined): { text: string; color: string } {
  if (!device) return { text: '', color: '' }
  const { status } = device
  if (!status) return { text: '', color: '' }
  if (!status.connected) return { text: 'No communication', color: 'text-yellow-600' }
  if (status.opStartup) return { text: 'Starting up', color: 'text-green-600' }
  if (status.opStandBy) return { text: 'Standby mode', color: 'text-green-600' }
  if (status.opBattery) return { text: 'Battery mode', color: 'text-red-600' }
  return { text: 'Grid mode', color: 'text-green-600' }
}

export function getDeviceStatus(device: Device | undefined): { text: string; color: string } {
  if (!device) return { text: '', color: '' }
  const { status, failures } = device
  if (!status || !failures) return { text: '', color: '' }
  if (!status.connected) return { text: 'No communication', color: 'text-yellow-600' }
  if (failures.overtemp) return { text: 'Overtemperature failure', color: 'text-red-600' }
  if (failures.internal) return { text: 'Internal failure', color: 'text-red-600' }
  if (failures.endBattery) return { text: 'End of battery', color: 'text-red-600' }
  if (failures.overload) return { text: 'Output overload', color: 'text-red-600' }
  if (failures.shortcircuit) return { text: 'Output short circuit', color: 'text-red-600' }
  if (failures.abnormalVOutput) return { text: 'Abnormal output voltage', color: 'text-red-600' }
  if (failures.abnormalVBattery) return { text: 'Abnormal battery voltage', color: 'text-red-600' }
  if (failures.inverter) return { text: 'Inverter failure', color: 'text-red-600' }
  if (failures.loVInput) return { text: 'Grid voltage too low', color: 'text-red-600' }
  if (failures.hiPOutput) return { text: 'Output power too high', color: 'text-red-600' }
  if (failures.tiristor) return { text: 'Thyristor failure', color: 'text-red-600' }
  if (status.opStartup) return { text: 'Starting up', color: 'text-green-600' }
  if (status.loBattery) return { text: 'Low battery', color: 'text-red-600' }
  if (status.noSyncInput) return { text: 'Sync failure', color: 'text-red-600' }
  if (status.loFInput) return { text: 'Low input frequency', color: 'text-red-600' }
  if (status.hiFInput) return { text: 'High input frequency', color: 'text-red-600' }
  if (status.loVInput) return { text: 'Low input voltage', color: 'text-red-600' }
  if (status.hiVInput) return { text: 'High input voltage', color: 'text-red-600' }
  if (status.noVInput) return { text: 'No grid power', color: 'text-red-600' }
  return { text: 'Grid power normal', color: 'text-green-600' }
}

export function getShutdownCause(cause: number | undefined): string {
  switch (cause) {
    case 1: return 'Manual Shutdown'
    case 2: return 'Autonomy Shutdown'
    case 3: return 'Low Battery Shutdown'
    case 4: return 'End of Battery / Failure Shutdown'
    case 5: return 'Scheduled Shutdown'
    default: return ''
  }
}

export function getEventDescription(ev: number): string {
  const map: Record<number, string> = {
    0: 'Monitoring started',
    1: 'Monitoring stopped',
    2: 'Overtemperature failure',
    3: 'Internal failure',
    4: 'End of battery failure',
    5: 'Overload failure',
    6: 'Short circuit at output',
    7: 'Abnormal output voltage',
    8: 'Abnormal battery voltage',
    9: 'Inverter failure',
    10: 'Changed to battery mode',
    11: 'Changed to grid/normal mode',
    12: 'Changed to standby mode',
    14: 'Changed to attention mode',
    15: 'Changed to startup mode',
    16: 'Low input frequency',
    17: 'High input frequency',
    18: 'Grid power normal',
    19: 'Sync failure',
    20: 'Sync control OK',
    21: 'Low input voltage',
    22: 'High input voltage',
    24: 'No grid power',
    26: 'Low battery',
    27: 'Battery normal',
    28: 'Grid noise',
    29: 'Battery charged',
    30: 'Countdown timer active',
    31: 'Communicating',
    32: 'Not communicating',
    33: 'Remote control triggered',
    35: 'Not calibrated',
    36: 'Autonomy shutdown',
    37: 'User triggered shutdown',
    38: 'Low battery shutdown',
    39: 'End of battery shutdown',
    40: 'Timer/scheduled shutdown',
    41: 'User changed LED color',
    48: 'Full discharge activated',
    49: 'Fan abnormal',
    50: 'User cancelled shutdown',
    51: 'Grid very low',
    52: 'Output power very high',
    53: 'Thyristor failure',
    54: 'Battery disconnected',
    55: 'Aged battery',
    56: 'Low output overload',
    57: 'Extended autonomy',
    58: 'Reduced autonomy',
  }
  return map[ev] ?? `Unknown event (${ev})`
}
