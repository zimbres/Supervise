import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { fetchEmailConfig, saveEmailConfig, sendTestEmail } from '@/api/client'
import type { EmailConfig } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type FormValues = Omit<EmailConfig, 'port' | 'auth' | 'secure' | 'enable'> & {
  port: string
  auth: string
  secure: string
  enable: string
}

export default function EmailConfigPage() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['emailConfig', id],
    queryFn: () => fetchEmailConfig(id!),
    enabled: Boolean(id),
  })

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      server: '',
      port: '587',
      from: '',
      auth: '0',
      username: '',
      password: '',
      secure: '1',
      enable: '0',
      to1: '',
      to2: '',
      to3: '',
      to4: '',
      to5: '',
    },
  })

  useEffect(() => {
    const { unsubscribe } = watch(() => setIsSaved(false))
    return unsubscribe
  }, [watch])

  useEffect(() => {
    if (data) {
      reset({
        server: data.server ?? '',
        port: String(data.port ?? 587),
        from: data.from ?? '',
        auth: String(data.auth ?? 0),
        username: data.username ?? '',
        password: data.password ?? '',
        secure: String(data.secure ?? 1),
        enable: String(data.enable ?? 0),
        to1: data.to1 ?? '',
        to2: data.to2 ?? '',
        to3: data.to3 ?? '',
        to4: data.to4 ?? '',
        to5: data.to5 ?? '',
      })
    }
  }, [data, reset])

  const [isSaved, setIsSaved] = useState(false)

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      saveEmailConfig(id!, {
        ...values,
        port: Number(values.port),
        auth: Number(values.auth),
        secure: Number(values.secure),
        enable: Number(values.enable),
      }),
    onSuccess: () => {
      toast.success('Email configuration saved.')
      setIsSaved(true)
    },
    onError: () => toast.error('Failed to save email configuration.'),
  })

  const testMutation = useMutation({
    mutationFn: () => sendTestEmail(id!),
    onSuccess: () => toast.success('Test email sent.'),
    onError: () => toast.error('Failed to send test email.'),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Loading configuration…
      </div>
    )
  }

  const authValue = watch('auth')
  const notificationsEnabled = watch('enable') === '1'
  const hasRecipient = (['to1', 'to2', 'to3', 'to4', 'to5'] as const).some(
    (f) => watch(f).trim() !== '',
  )

  return (
    <form
      onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
      className="space-y-6 max-w-2xl"
    >
      <div>
        <h1 className="text-xl font-semibold">Email Configuration</h1>
        <p className="text-sm text-muted-foreground">
          Configure SMTP settings for power event notifications.
        </p>
      </div>

      {/* SMTP server */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SMTP Server</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 grid gap-1.5">
              <Label htmlFor="server">Server</Label>
              <Input id="server" placeholder="smtp.example.com" {...register('server')} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="port">Port</Label>
              <Input id="port" type="number" placeholder="587" {...register('port')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="from">From Address</Label>
              <Input id="from" type="email" placeholder="noreply@example.com" {...register('from')} />
            </div>
            <div className="grid gap-1.5">
              <Label>Encryption</Label>
              <Select
                value={watch('secure')}
                onValueChange={(v) => setValue('secure', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  <SelectItem value="1">TLS/SSL</SelectItem>
                  <SelectItem value="2">STARTTLS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Authentication</Label>
            <Select value={watch('auth')} onValueChange={(v) => setValue('auth', v)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">None</SelectItem>
                <SelectItem value="1">Username / Password</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {authValue === '1' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...register('username')} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...register('password')} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Enable Email Notifications</Label>
            <Select value={watch('enable')} onValueChange={(v) => setValue('enable', v)}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No</SelectItem>
                <SelectItem value="1">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <p className="text-sm font-medium">Recipients (up to 5)</p>
          <div className="grid gap-2">
            {(['to1', 'to2', 'to3', 'to4', 'to5'] as const).map((field, i) => (
              <div key={field} className="grid gap-1">
                <Label htmlFor={field} className="text-xs text-muted-foreground">
                  Recipient {i + 1}
                </Label>
                <Input
                  id={field}
                  type="email"
                  placeholder="user@example.com"
                  {...register(field)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => testMutation.mutate()}
          disabled={!notificationsEnabled || !isSaved || testMutation.isPending || saveMutation.isPending}
        >
          {testMutation.isPending ? 'Sending…' : 'Send Test Email'}
        </Button>
        <Button
          type="submit"
          disabled={
            saveMutation.isPending ||
            testMutation.isPending ||
            (notificationsEnabled && !hasRecipient)
          }
          title={notificationsEnabled && !hasRecipient ? 'At least one recipient is required when notifications are enabled' : undefined}
        >
          {saveMutation.isPending ? 'Saving…' : 'Save Configuration'}
        </Button>
      </div>
    </form>
  )
}
