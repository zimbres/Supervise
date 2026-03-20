import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw, BarChart2 } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { fetchDataLog, type DataPeriod } from '@/api/client'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const PERIOD_LABELS: Record<DataPeriod, string> = {
  hour: 'Last Hour',
  day: 'Last Day',
  month: 'Last Month',
}

export default function DataLogPage() {
  const { id } = useParams<{ id: string }>()
  const [period, setPeriod] = useState<DataPeriod>('hour')
  const [showChart, setShowChart] = useState(false)

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['dataLog', id, period],
    queryFn: () => fetchDataLog(id!, period),
    enabled: Boolean(id),
  })

  const logs = [...(data?.logs ?? [])].reverse()

  const chartData = logs.map((log) => ({
    time: new Date(log.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    vInput: log.vars.vInput,
    vOutput: log.vars.vOutput,
    vBattery: log.vars.vBattery,
    pOutput: log.vars.pOutput,
    temperature: log.vars.temperature,
  }))

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Data Log</h1>
          <p className="text-sm text-muted-foreground">
            {logs.length} record{logs.length !== 1 ? 's' : ''} — {PERIOD_LABELS[period]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as DataPeriod)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Last Hour</SelectItem>
              <SelectItem value="day">Last Day</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChart((v) => !v)}
          >
            <BarChart2 className="h-4 w-4" />
            {showChart ? 'Show Table' : 'Show Chart'}
          </Button>
        </div>
      </div>

      {/* Chart view */}
      {showChart && chartData.length > 0 && (
        <div className="rounded-lg border bg-card p-4 space-y-6">
          {/* Voltage chart */}
          <div>
            <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Voltage (V)
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => v.toFixed(2)} />
                <Legend />
                <Line type="monotone" dataKey="vInput" name="Input V" stroke="#3b82f6" dot={false} strokeWidth={1.5} />
                <Line type="monotone" dataKey="vOutput" name="Output V" stroke="#10b981" dot={false} strokeWidth={1.5} />
                <Line type="monotone" dataKey="vBattery" name="Battery V" stroke="#f59e0b" dot={false} strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Load & temperature chart */}
          <div>
            <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Load (%) &amp; Temperature (°C)
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => v.toFixed(2)} />
                <Legend />
                <Line type="monotone" dataKey="pOutput" name="Load %" stroke="#8b5cf6" dot={false} strokeWidth={1.5} />
                <Line type="monotone" dataKey="temperature" name="Temp °C" stroke="#ef4444" dot={false} strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table view */}
      {!showChart && (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Date / Time</TableHead>
                <TableHead className="text-right">V Input</TableHead>
                <TableHead className="text-right">V Output</TableHead>
                <TableHead className="text-right">Freq (Hz)</TableHead>
                <TableHead className="text-right">Load (%)</TableHead>
                <TableHead className="text-right">V Battery</TableHead>
                <TableHead className="text-right">Temp (°C)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Loading data…
                  </TableCell>
                </TableRow>
              )}
              {isError && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-destructive py-8">
                    Failed to load data.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No data recorded for this period.
                  </TableCell>
                </TableRow>
              )}
              {logs.map((log, i) => (
                <TableRow key={i}>
                  <TableCell className="text-muted-foreground tabular-nums">{i + 1}</TableCell>
                  <TableCell className="tabular-nums whitespace-nowrap">
                    {formatDate(log.dateTime)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {log.vars.vInput.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {log.vars.vOutput.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {log.vars.fOutput.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {log.vars.pOutput.toFixed(0)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {log.vars.vBattery.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {log.vars.temperature.toFixed(1)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
