import { useContext } from 'react'
import VerticalNavContext from '@/contexts/verticalNavContext'

const useVerticalNav = () => {
    const context = useContext(VerticalNavContext)

    if (!context) {
        throw new Error('useVerticalNav must be used within a VerticalNavProvider')
    }

    return context
}

export default useVerticalNav
