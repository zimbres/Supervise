import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import AppLayout from '@/components/layout/AppLayout'
import DeviceListPage from '@/pages/DeviceListPage'
import DeviceDetailPage from '@/pages/DeviceDetailPage'
import QRCodePage from '@/pages/QRCodePage'
import ShutdownConfigPage from '@/pages/ShutdownConfigPage'
import EmailConfigPage from '@/pages/EmailConfigPage'
import EventLogPage from '@/pages/EventLogPage'
import DataLogPage from '@/pages/DataLogPage'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DeviceListPage />} />
          <Route path="device/:id" element={<DeviceDetailPage />} />
          <Route path="device/:id/qrcode" element={<QRCodePage />} />
          <Route path="device/:id/shutdown-config" element={<ShutdownConfigPage />} />
          <Route path="device/:id/email" element={<EmailConfigPage />} />
          <Route path="device/:id/events" element={<EventLogPage />} />
          <Route path="device/:id/log" element={<DataLogPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
