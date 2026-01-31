import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

export const useObjectCookie = <T>(
    name: string,
    initialValue: T
): [T, (value: T) => void] => {
    const [value, setValue] = useState<T>(() => {
        const cookie = Cookies.get(name)
        if (cookie) {
            try {
                return JSON.parse(cookie)
            } catch (error) {
                console.error('Error parsing cookie:', error)
            }
        }
        return initialValue
    })

    useEffect(() => {
        Cookies.set(name, JSON.stringify(value), { expires: 365 })
    }, [name, value])

    const updateCookie = (newValue: T) => {
        setValue(newValue)
        Cookies.set(name, JSON.stringify(newValue), { expires: 365 })
    }

    return [value, updateCookie]
}
