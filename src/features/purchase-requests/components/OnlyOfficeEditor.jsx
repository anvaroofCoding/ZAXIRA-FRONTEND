import { useEffect, useRef, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { loadOnlyOfficeApi } from '@/features/purchase-requests/utils/onlyofficeLoader'

const EDITOR_ID = 'zaxira-onlyoffice-editor'

export const OnlyOfficeEditor = ({ documentServerUrl, config, onReady, onError }) => {
  const containerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    let editorInstance = null

    const mountEditor = async () => {
      if (!documentServerUrl || !config) return

      setLoading(true)
      setError('')

      try {
        const DocsAPI = await loadOnlyOfficeApi(documentServerUrl)
        if (cancelled || !containerRef.current) return

        containerRef.current.innerHTML = ''
        const placeholder = document.createElement('div')
        placeholder.id = EDITOR_ID
        placeholder.style.height = '100%'
        placeholder.style.width = '100%'
        containerRef.current.appendChild(placeholder)

        editorInstance = new DocsAPI.DocEditor(EDITOR_ID, {
          ...config,
          events: {
            onDocumentReady: () => {
              if (!cancelled) {
                setLoading(false)
                onReady?.(editorInstance)
              }
            },
            onError: (event) => {
              if (!cancelled) {
                const message = event?.data ?? 'ONLYOFFICE xatosi'
                setError(String(message))
                setLoading(false)
                onError?.(message)
              }
            },
          },
        })

        window.DocEditor = window.DocEditor || { instances: {} }
        window.DocEditor.instances = window.DocEditor.instances || {}
        window.DocEditor.instances[EDITOR_ID] = editorInstance
      } catch (mountError) {
        if (!cancelled) {
          const message = mountError.message || 'ONLYOFFICE ochilmadi'
          setError(message)
          setLoading(false)
          onError?.(message)
        }
      }
    }

    mountEditor()

    return () => {
      cancelled = true
      if (editorInstance?.destroyEditor) {
        editorInstance.destroyEditor()
      }
      if (window.DocEditor?.instances?.[EDITOR_ID]) {
        delete window.DocEditor.instances[EDITOR_ID]
      }
    }
  }, [documentServerUrl, config, onReady, onError])

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Box sx={{ position: 'relative', height: '100%', minHeight: 480 }}>
      {loading ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            bgcolor: 'background.paper',
          }}
        >
          <CircularProgress />
        </Box>
      ) : null}
      <Box ref={containerRef} sx={{ height: '100%', minHeight: 480 }} />
    </Box>
  )
}

export const ONLYOFFICE_EDITOR_ID = EDITOR_ID
