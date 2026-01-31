import { useEffect } from 'react'
import { useSettings } from '@/hooks/useSettings'
import { SystemMode } from '@/types/coreTypes'

const useLayoutInit = (systemMode: SystemMode) => {
    const { settings, updateSettings } = useSettings()

    useEffect(() => {
        if (settings.layout === 'horizontal' && settings.mode === 'semi-dark') {
            updateSettings({ mode: 'light' })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings.layout])
}

export default useLayoutInit
