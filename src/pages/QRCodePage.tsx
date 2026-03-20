import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { fetchDevice } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function QRCodePage() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['device', id],
    queryFn: () => fetchDevice(id!),
    enabled: Boolean(id),
  })

  const dev = data?.device
  const qrValue = dev ? `${dev.id}${dev.idPc}` : ''

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-semibold">QR Code</h1>
        <p className="text-sm text-muted-foreground">
          Scan with the Ragtech SuperviseApp to add this device to your mobile app.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {dev?.userName || dev?.userProd || `Device ${id}`}
          </CardTitle>
          <CardDescription>
            Open the SuperviseApp on your phone, tap &ldquo;Add Device&rdquo;, then scan the code
            below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pb-6">
          {isLoading ? (
            <div className="h-48 w-48 flex items-center justify-center text-muted-foreground text-sm">
              Loading…
            </div>
          ) : qrValue ? (
            <>
              <div className="p-4 bg-white rounded-lg border">
                <QRCodeSVG value={qrValue} size={180} level="H" />
              </div>
              <p className="text-xs text-muted-foreground font-mono">{qrValue}</p>
            </>
          ) : (
            <p className="text-muted-foreground text-sm">Device data unavailable.</p>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Search for <strong>Ragtech SuperviseApp</strong> in your device&apos;s app store to get
        started.
      </p>
    </div>
  )
}
