import { ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

type Props = {
    children: ReactNode
    fallback?: ReactNode
}

const AuthGuard = (props: Props) => {
    const { children, fallback } = props
    const { session, loading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!session && !loading) {
            navigate('/auth')
        }
    }, [session, loading, navigate])

    if (loading) {
        return fallback || null
    }

    if (!session) {
        return null
    }

    return <>{children}</>
}

export default AuthGuard
