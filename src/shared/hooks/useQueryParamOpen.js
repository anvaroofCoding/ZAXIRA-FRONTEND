import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export const useQueryParamOpen = (paramName, onOpen) => {
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const value = searchParams.get(paramName)?.trim()
    if (!value) return

    onOpen(value)

    const next = new URLSearchParams(searchParams)
    next.delete(paramName)
    setSearchParams(next, { replace: true })
  }, [paramName, onOpen, searchParams, setSearchParams])
}
