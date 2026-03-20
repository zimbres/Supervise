import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw, BarChart2 } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { fetchEventLog } from '@/api/client'
import { getEventDescription } from '@/api/helpers'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6b7280',
]

export default function EventLogPage() {
  const { id } = useParams<{ id: string }>()
  const [showChart, setShowChart] = useState(false)

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['eventLog', id],
    queryFn: () => fetchEventLog(id!),
    enabled: Boolean(id),
  })

  const logs = [...(data?.logs ?? [])].reverse()

  // Build frequency data for pie chart
  const freqMap: Record<string, number> = {}
  for (const log of logs) {
    const desc = getEventDescription(log.event)
    freqMap[desc] = (freqMap[desc] ?? 0) + 1
  }
  const chartData = Object.entries(freqMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Event Log</h1>
          <p className="text-sm text-muted-foreground">
            {logs.length} event{logs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
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
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
            Event Frequency (top 10)
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label={({ percent }: { percent: number }) =>
                  `${(percent * 100).toFixed(0)}%`
                }
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table view */}
      {!showChart && (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">#</TableHead>
                <TableHead>Date / Time</TableHead>
                <TableHead>Event</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Loading events…
                  </TableCell>
                </TableRow>
              )}
              {isError && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-destructive py-8">
                    Failed to load events.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    No events recorded.
                  </TableCell>
                </TableRow>
              )}
              {logs.map((log, i) => (
                <TableRow key={i}>
                  <TableCell className="text-muted-foreground tabular-nums">{i + 1}</TableCell>
                  <TableCell className="tabular-nums whitespace-nowrap">
                    {formatDate(log.dateTime)}
                  </TableCell>
                  <TableCell>{getEventDescription(log.event)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
