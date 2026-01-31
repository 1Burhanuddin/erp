// React Imports
import { ReactElement, ReactNode, Suspense } from 'react'

// Next Imports
import { useRouter } from 'next/router'

// MUI Imports
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Component Imports
import DashboardLayout from '@/components/layout/DashboardLayout'
import Navigation from '@/components/layout/vertical/Navigation'
import Navbar from '@/components/layout/vertical/Navbar'
import Footer from '@/components/layout/vertical/Footer'
import ScrollToTop from '@/components/scroll-to-top'
import AuthGuard from '@/components/auth/AuthGuard'

// Util Imports
import { getMode, getSystemMode } from '@/utils/serverHelpers'

// Loading fallback component
const PageLoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      width: '100%'
    }}
  >
    <CircularProgress size={60} />
  </Box>
)

type Props = {
  children: ReactNode
}

const DashboardLayoutWrapper = ({ children }: Props) => {
  // For client-side, we'll use default values
  // You can adjust these based on client-side detection if needed
  const mode = 'light' // or detect from browser
  const systemMode = 'light' // or detect from browser

  return (
    <AuthGuard>
      <DashboardLayout
        systemMode={systemMode}
        navigation={<Navigation mode={mode} />}
        navbar={<Navbar />}
        footer={<Footer />}
      >
        <Suspense fallback={<PageLoadingFallback />}>{children}</Suspense>
      </DashboardLayout>

      <ScrollToTop className='mui-fixed'>
        <Button variant='contained' className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'>
          <i className='ri-arrow-up-line' />
        </Button>
      </ScrollToTop>
    </AuthGuard>
  )
}

export default DashboardLayoutWrapper
