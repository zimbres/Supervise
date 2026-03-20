import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchShutdownConfig, saveShutdownConfig } from '@/api/client'
import type { ShutdownConfig } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type FormValues = {
  enabled: string
  counterManual: string
  counterOpBattery: string
  counterLoBattery: string
  counterFailure: string
  counterTimer: string
  counterBatLevel: string
  remCtrlDelay: string
  devShutEnabled: string
  devStandByKeep: string
  devShutTimer: string
  cliShutEnabled: string
  cliHibernate: string
  cliShutTimer: string
  cliRun: string
}

const DEFAULT_FORM: FormValues = {
  enabled: '0', counterManual: '0', counterOpBattery: '0',
  counterLoBattery: '0', counterFailure: '0', counterTimer: '0',
  counterBatLevel: '0', remCtrlDelay: '0', devShutEnabled: '0',
  devStandByKeep: '0', devShutTimer: '0', cliShutEnabled: '0',
  cliHibernate: '0', cliShutTimer: '0', cliRun: '0',
}

function toStringForm(cfg: ShutdownConfig): FormValues {
  return Object.fromEntries(
    Object.entries(cfg).map(([k, v]) => [k, String(v)]),
  ) as FormValues
}

function YesNoSelect({
  value, onChange, disabled,
}: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="0">No</SelectItem>
        <SelectItem value="1">Yes</SelectItem>
      </SelectContent>
    </Select>
  )
}

function SecondsInput({
  value, onChange, disabled,
}: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number" min={0} className="w-28"
        value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
      />
      <span className="text-sm text-muted-foreground">s</span>
    </div>
  )
}

function Row({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

export default function ShutdownConfigPage() {
  const { id } = useParams<{ id: string }>()
  const [form, setForm] = useState<FormValues>(DEFAULT_FORM)

  const set = (key: keyof FormValues) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }))

  const { data, isLoading } = useQuery({
    queryKey: ['shutdownConfig', id],
    queryFn: () => fetchShutdownConfig(id!),
    enabled: Boolean(id),
  })

  useEffect(() => {
    if (data) setForm(toStringForm(data))
  }, [data])

  const mutation = useMutation({
    mutationFn: () =>
      saveShutdownConfig(
        id!,
        Object.fromEntries(
          Object.entries(form).map(([k, v]) => [k, Number(v)]),
        ) as unknown as ShutdownConfig,
      ),
    onSuccess: () => toast.success('Shutdown configuration saved.'),
    onError: () => toast.error('Failed to save configuration.'),
  })

  const enabled = form.enabled === '1'
  const devEnabled = form.devShutEnabled === '1'
  const cliEnabled = form.cliShutEnabled === '1'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Loading configuration…
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">Configure Shutdown</h1>
        <p className="text-sm text-muted-foreground">
          Configure automatic shutdown behavior for this device.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Shutdown Control</CardTitle></CardHeader>
        <CardContent>
          <Row label="Enable shutdown management">
            <YesNoSelect value={form.enabled} onChange={set('enabled')} />
          </Row>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Countdown Triggers</CardTitle></CardHeader>
        <CardContent className="divide-y">
          <Row label="Manual shutdown delay" hint="Seconds after manual shutdown command">
            <SecondsInput value={form.counterManual} onChange={set('counterManual')} disabled={!enabled} />
          </Row>
          <Row label="Battery mode delay" hint="Seconds to wait before shutdown on battery">
            <SecondsInput value={form.counterOpBattery} onChange={set('counterOpBattery')} disabled={!enabled} />
          </Row>
          <Row label="Low battery delay" hint="Seconds after low battery warning">
            <SecondsInput value={form.counterLoBattery} onChange={set('counterLoBattery')} disabled={!enabled} />
          </Row>
          <Row label="Failure delay" hint="Seconds after detecting a failure">
            <SecondsInput value={form.counterFailure} onChange={set('counterFailure')} disabled={!enabled} />
          </Row>
          <Row label="Timer delay" hint="Scheduled shutdown countdown (seconds)">
            <SecondsInput value={form.counterTimer} onChange={set('counterTimer')} disabled={!enabled} />
          </Row>
          <Row label="Battery level threshold" hint="Shutdown when battery drops below (%)">
            <div className="flex items-center gap-2">
              <Input
                type="number" min={0} max={100} className="w-28"
                value={form.counterBatLevel}
                onChange={(e) => set('counterBatLevel')(e.target.value)}
                disabled={!enabled}
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </Row>
          <Row label="Remote control delay" hint="Delay before executing remote control command">
            <SecondsInput value={form.remCtrlDelay} onChange={set('remCtrlDelay')} disabled={!enabled} />
          </Row>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">UPS Shutdown</CardTitle></CardHeader>
        <CardContent className="divide-y">
          <Row label="Shut down the UPS">
            <YesNoSelect value={form.devShutEnabled} onChange={set('devShutEnabled')} disabled={!enabled} />
          </Row>
          <Row label="Keep standby mode">
            <YesNoSelect value={form.devStandByKeep} onChange={set('devStandByKeep')} disabled={!enabled || !devEnabled} />
          </Row>
          <Row label="UPS shutdown delay" hint="Seconds before turning off the UPS">
            <SecondsInput value={form.devShutTimer} onChange={set('devShutTimer')} disabled={!enabled || !devEnabled} />
          </Row>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Computer Shutdown</CardTitle></CardHeader>
        <CardContent className="divide-y">
          <Row label="Shut down the computer">
            <YesNoSelect value={form.cliShutEnabled} onChange={set('cliShutEnabled')} disabled={!enabled} />
          </Row>
          <Row label="Hibernate instead of shutdown">
            <YesNoSelect value={form.cliHibernate} onChange={set('cliHibernate')} disabled={!enabled || !cliEnabled} />
          </Row>
          <Row label="Computer shutdown delay" hint="Seconds before the OS shutdown command">
            <SecondsInput value={form.cliShutTimer} onChange={set('cliShutTimer')} disabled={!enabled || !cliEnabled} />
          </Row>
          <Row label="Run command before shutdown">
            <YesNoSelect value={form.cliRun} onChange={set('cliRun')} disabled={!enabled || !cliEnabled} />
          </Row>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  )
}
