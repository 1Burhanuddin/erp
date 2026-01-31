// React Imports
import { ReactNode } from 'react'

// Component Imports
import BlankLayout from '@/components/layout/BlankLayout'
import GuestOnlyRoute from '@/components/GuestOnlyRoute'

type Props = {
  children: ReactNode
}

const GuestLayoutWrapper = ({ children }: Props) => {
  // For client-side, we'll use default values
  const systemMode = 'light' // or detect from browser

  return (
    <BlankLayout systemMode={systemMode}>
      <GuestOnlyRoute>{children}</GuestOnlyRoute>
    </BlankLayout>
  )
}

export default GuestLayoutWrapper
