import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Activity, BarChart2, List, Mail, PowerOff, QrCode, Zap } from 'lucide-react'
import { NavLink, useParams } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

function SidebarLink({ to, label, icon, disabled }: NavItem & { disabled?: boolean }) {
  if (disabled) {
    return (
      <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/40 cursor-not-allowed text-sm">
        {icon}
        {label}
      </span>
    )
  }
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}

export default function Sidebar() {
  const { id } = useParams<{ id: string }>()
  const hasDevice = Boolean(id)

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border h-full">
      {/* Branding */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
        <Zap className="h-5 w-5 text-blue-400" />
        <span className="font-bold text-sidebar-foreground text-lg tracking-tight">Supervise</span>
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-1 p-3">
        <SidebarLink to="/" label="Device List" icon={<List className="h-4 w-4" />} />
      </nav>

      {/* Device-specific nav */}
      <div className="px-3 pt-2">
        <Separator className="bg-sidebar-border mb-3" />
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
          Device
        </p>
        <nav className="flex flex-col gap-1">
          <SidebarLink
            to={id ? `/device/${id}/shutdown-config` : '/'}
            label="Configure Shutdown"
            icon={<PowerOff className="h-4 w-4" />}
            disabled={!hasDevice}
          />
          <SidebarLink
            to={id ? `/device/${id}/email` : '/'}
            label="Notifications"
            icon={<Mail className="h-4 w-4" />}
            disabled={!hasDevice}
          />
          <SidebarLink
            to={id ? `/device/${id}/qrcode` : '/'}
            label="Mobile App"
            icon={<QrCode className="h-4 w-4" />}
            disabled={!hasDevice}
          />
          <SidebarLink
            to={id ? `/device/${id}/events` : '/'}
            label="Events"
            icon={<Activity className="h-4 w-4" />}
            disabled={!hasDevice}
          />
          <SidebarLink
            to={id ? `/device/${id}/log` : '/'}
            label="Log"
            icon={<BarChart2 className="h-4 w-4" />}
            disabled={!hasDevice}
          />
        </nav>
      </div>
    </aside>
  )
}
