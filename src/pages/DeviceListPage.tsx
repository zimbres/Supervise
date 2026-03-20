import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Wifi, WifiOff, Pencil, Trash2, ExternalLink, Search, RefreshCw } from 'lucide-react'
import { fetchDevices, deleteDevice, updateDeviceUser, triggerDiscovery } from '@/api/client'
import type { DeviceListItem } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PRODUCT_FAMILIES: Record<number, string[]> = {
  1: ['SENIUM'],
  2: ['SENIÃO'],
  3: [''],
  4: ['INFINIUM'],
  5: ['INFINIUM 3000'],
  6: ['PRECISION'],
  7: ['SENIUM FLEXVOLT', 'ONEUP'],
  8: ['SENINHO'],
  9: ['SENIÃO ATM'],
  10: ['EASY PRO', 'TORO', 'INNERGIE', 'ONEUP'],
  11: ['DINAMO'],
  12: ['SAVE USB'],
  13: ['SAVE VIO'],
  14: ['EASY WAY', 'QUADRI', 'TANK'],
  15: ['EASY JET'],
}

interface EditDialogProps {
  device: DeviceListItem | null
  open: boolean
  onClose: () => void
}

function EditDialog({ device, open, onClose }: EditDialogProps) {
  const qc = useQueryClient()
  const [userName, setUserName] = useState(device?.userName ?? '')
  const [userProd, setUserProd] = useState(device?.userProd ?? '')

  const products = device ? (PRODUCT_FAMILIES[device.family] ?? ['']) : []

  const mutation = useMutation({
    mutationFn: () => updateDeviceUser(device!.id, { userName, userProd }),
    onSuccess: () => {
      toast.success('Device updated.')
      qc.invalidateQueries({ queryKey: ['devices'] })
      onClose()
    },
    onError: () => toast.error('Failed to update device.'),
  })

  // Sync state when device changes
  if (device && userName === '' && device.userName) setUserName(device.userName)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Device</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Custom name"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="edit-prod">Model</Label>
            <Select value={userProd} onValueChange={setUserProd}>
              <SelectTrigger id="edit-prod">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {products.filter(Boolean).map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function DeviceListPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [editDevice, setEditDevice] = useState<DeviceListItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['devices'],
    queryFn: fetchDevices,
    refetchInterval: 3000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDevice(id),
    onSuccess: () => {
      toast.success('Device removed. A system restart may be required.')
      qc.invalidateQueries({ queryKey: ['devices'] })
      setDeleteId(null)
    },
    onError: () => toast.error('Failed to remove device.'),
  })

  const discoveryMutation = useMutation({
    mutationFn: triggerDiscovery,
    onSuccess: () => toast.info('Device discovery activated for ~30 seconds.'),
    onError: () => toast.error('Failed to start discovery.'),
  })

  const devices = data?.devices ?? []

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Devices</h1>
          <p className="text-sm text-muted-foreground">
            {devices.length} device{devices.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => qc.invalidateQueries({ queryKey: ['devices'] })}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => discoveryMutation.mutate()}
            disabled={discoveryMutation.isPending}
          >
            <Search className="h-4 w-4" />
            Discover Devices
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Port</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Loading devices…
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-destructive py-8">
                  Failed to load devices.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && devices.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No devices found. Use &ldquo;Discover Devices&rdquo; to scan for UPS units.
                </TableCell>
              </TableRow>
            )}
            {devices.map((dev) => (
              <TableRow
                key={dev.id}
                className="cursor-pointer"
                onClick={() => navigate(`/device/${dev.id}`)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Badge variant={dev.connected ? 'success' : 'warning'} className="gap-1">
                    {dev.connected ? (
                      <Wifi className="h-3 w-3" />
                    ) : (
                      <WifiOff className="h-3 w-3" />
                    )}
                    {dev.connected ? 'Online' : 'Offline'}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{dev.userName || '—'}</TableCell>
                <TableCell className="text-muted-foreground">{dev.userProd || '—'}</TableCell>
                <TableCell className="text-muted-foreground">{dev.port?.name || '—'}</TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditDevice(dev)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={dev.connected}
                      onClick={() => setDeleteId(dev.id)}
                      title={dev.connected ? 'Cannot delete a connected device' : 'Delete'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/device/${dev.id}`)}
                      title="Open"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit dialog */}
      <EditDialog
        device={editDevice}
        open={Boolean(editDevice)}
        onClose={() => setEditDevice(null)}
      />

      {/* Delete confirm */}
      <AlertDialog open={Boolean(deleteId)} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Device</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the device. A system restart may be required to complete removal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
