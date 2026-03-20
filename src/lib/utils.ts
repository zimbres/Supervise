import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function secondsToTime(ms: number): string {
  const secs = Math.round(ms / 1000)
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = Math.floor(secs % 60)
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('en-US')
}
