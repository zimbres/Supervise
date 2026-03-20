import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Wifi, WifiOff, Clock, Thermometer, Battery, Zap, Activity } from 'lucide-react'
import { fetchDevice } from '@/api/client'
import { getOperatingMode, getDeviceStatus, getShutdownCause } from '@/api/helpers'
import { secondsToTime, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface MetricCardProps {
  label: string
  value: string | undefined
  unit?: string
  icon?: React.ReactNode
}

function MetricCard({ label, value, unit, icon }: MetricCardProps) {
  const display = value == null ? 'N/A' : unit ? `${value} ${unit}` : value
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{display}</p>
      </CardContent>
    </Card>
  )
}

export default function DeviceDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['device', id],
    queryFn: () => fetchDevice(id!),
    enabled: Boolean(id),
    refetchInterval: 3000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Loading device data…
      </div>
    )
  }

  if (isError || !data?.device) {
    return (
      <div className="flex items-center justify-center h-48 text-destructive">
        Failed to load device. Check connection.
      </div>
    )
  }

  const dev = data.device
  const v = dev.vars
  const opMode = getOperatingMode(dev)
  const statusInfo = getDeviceStatus(dev)
  const hasVars = Boolean(v)

  // Shutdown countdown
  const rv = dev.regressive?.value
  const rc = dev.regressive?.cause
  const shutdownText =
    rv == null || rv === -1
      ? 'None'
      : dev.status?.inShutdown
        ? `In progress: ${getShutdownCause(rc)}`
        : secondsToTime(rv)

  // LED color (ONEUP only)
  const ledColor =
    dev.userProd === 'ONEUP' && v?.ledRed != null
      ? `#${[v.ledRed, v.ledGreen, v.ledBlue]
          .map((c) => c.toString(16).padStart(2, '0').toUpperCase())
          .join('')}`
      : null

  const noCurrentModels = ['SAVE USB', 'EASY WAY', 'QUADRI']
  const showCurrent = !noCurrentModels.includes(dev.userProd ?? '')

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold">{dev.userName || dev.userProd || `Device ${id}`}</h1>
          <p className="text-sm text-muted-foreground">{dev.userProd} · Port: {dev.port?.name}</p>
        </div>
        <div className="flex gap-2 ml-auto">
          <Badge variant={dev.status?.connected ? 'success' : 'warning'} className="gap-1">
            {dev.status?.connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {dev.status?.connected ? 'Connected' : 'Disconnected'}
          </Badge>
          {opMode.text && (
            <Badge variant="outline" className={opMode.color}>
              {opMode.text}
            </Badge>
          )}
        </div>
      </div>

      {/* Status */}
      {statusInfo.text && (
        <div className={`text-sm font-medium ${statusInfo.color}`}>
          Status: {statusInfo.text}
        </div>
      )}

      {/* Electrical metrics */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4" /> Power
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Input Voltage"
            value={hasVars && v.vInput != null ? v.vInput.toFixed(1) : undefined}
            unit="V"
          />
          <MetricCard
            label="Output Voltage"
            value={hasVars && v.vOutput != null ? v.vOutput.toFixed(1) : undefined}
            unit="V"
          />
          <MetricCard
            label="Output Frequency"
            value={hasVars && v.fOutput != null ? v.fOutput.toFixed(1) : undefined}
            unit="Hz"
          />
          <MetricCard
            label="Output Load"
            value={hasVars && v.pOutput != null ? v.pOutput.toFixed(0) : undefined}
            unit="%"
          />
          {showCurrent && (
            <MetricCard
              label="Output Current"
              value={hasVars && v.iOutput != null ? v.iOutput.toFixed(2) : undefined}
              unit="A"
            />
          )}
        </div>
      </div>

      {/* Battery metrics */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Battery className="h-4 w-4" /> Battery
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Battery Voltage"
            value={hasVars && v.vBattery != null ? v.vBattery.toFixed(1) : undefined}
            unit="V"
          />
          <MetricCard
            label="Battery Charge"
            value={hasVars && v.cBattery != null ? v.cBattery.toFixed(0) : undefined}
            unit="%"
          />
        </div>
      </div>

      {/* Environment */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Thermometer className="h-4 w-4" /> Environment
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Temperature"
            value={hasVars && v.temperature != null ? v.temperature.toFixed(1) : undefined}
            unit="°C"
            icon={<Thermometer className="h-4 w-4" />}
          />
          {ledColor && (
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  LED Color
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded border"
                    style={{ backgroundColor: ledColor }}
                  />
                  <span className="text-sm font-mono">{ledColor}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Shutdown countdown */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4" /> Shutdown Countdown
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <MetricCard label="Time Remaining" value={shutdownText} />
        </div>
      </div>

      {/* Last communication */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Last Communication
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-sm">
            {dev.last ? formatDate(dev.last) : 'Unknown'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
