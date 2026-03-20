import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PowerOff, XCircle, ChevronRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { triggerShutdown, cancelShutdown, fetchDevice } from '@/api/client'

export default function Header() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cancelOpen, setCancelOpen] = useState(false)

  const { data } = useQuery({
    queryKey: ['device', id],
    queryFn: () => fetchDevice(id!),
    enabled: Boolean(id),
    refetchInterval: 3000,
  })

  const deviceName = data?.device?.userName || data?.device?.userProd || id

  const shutdownMutation = useMutation({
    mutationFn: () => triggerShutdown(id!),
    onSuccess: () => toast.success('Immediate shutdown request sent.'),
    onError: () => toast.error('Failed to send shutdown request.'),
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelShutdown(id!),
    onSuccess: () => {
      toast.success('Shutdown cancelled.')
      setCancelOpen(false)
    },
    onError: () => toast.error('Failed to cancel shutdown.'),
  })

  return (
    <header className="h-14 shrink-0 border-b flex items-center px-4 gap-4 bg-background/95 backdrop-blur">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-1 min-w-0">
        <button
          onClick={() => navigate('/')}
          className="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Devices</span>
        </button>
        {id && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium truncate">{deviceName}</span>
          </>
        )}
      </div>

      {/* Action buttons */}
      {id && (
        <div className="flex items-center gap-2 shrink-0">
          {/* Immediate Shutdown */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={shutdownMutation.isPending}
              >
                <PowerOff className="h-4 w-4" />
                Immediate Shutdown
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Immediate Shutdown</AlertDialogTitle>
                <AlertDialogDescription>
                  This will immediately trigger a shutdown on{' '}
                  <strong>{deviceName}</strong>. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => shutdownMutation.mutate()}
                >
                  Shut Down Now
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Cancel Shutdown */}
          <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={cancelMutation.isPending}>
                <XCircle className="h-4 w-4" />
                Cancel Shutdown
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Scheduled Shutdown</AlertDialogTitle>
                <AlertDialogDescription>
                  Cancel the active shutdown countdown on <strong>{deviceName}</strong>?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Back</AlertDialogCancel>
                <AlertDialogAction onClick={() => cancelMutation.mutate()}>
                  Yes, Cancel Shutdown
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </header>
  )
}
