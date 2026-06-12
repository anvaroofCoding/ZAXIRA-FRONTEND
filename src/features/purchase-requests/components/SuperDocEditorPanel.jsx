import { useRef } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { SuperDocEditor } from '@superdoc-dev/react'
import 'superdoc/style.css'
import { usePermissions } from '@/shared/hooks/usePermissions'

export const SuperDocEditorPanel = ({ documentFile, loading, error, onReady }) => {
  const editorRef = useRef(null)
  const { user } = usePermissions()

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }

  if (loading || !documentFile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        colorScheme: 'light',
        bgcolor: '#ffffff',
        color: '#212121',
        '& .superdoc-wrapper': {
          flex: 1,
          minHeight: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#ffffff',
        },
        '& .superdoc-toolbar-container': {
          flexShrink: 0,
          bgcolor: '#f5f5f5',
          color: '#212121',
        },
        '& .superdoc-editor-container': {
          flex: 1,
          minHeight: 0,
          bgcolor: '#ffffff',
        },
        '& .superdoc': {
          height: '100%',
          bgcolor: '#ffffff',
        },
      }}
    >
      <SuperDocEditor
        ref={editorRef}
        document={documentFile}
        documentMode="editing"
        role="editor"
        contained
        user={{
          name: user?.displayName || user?.login || 'Foydalanuvchi',
          email: user?.email || user?.login || 'user@zaxira.local',
        }}
        style={{ flex: 1, minHeight: 0, height: '100%' }}
        onReady={({ superdoc }) => {
          superdoc.setDocumentMode('editing')
          onReady?.(superdoc)
        }}
        onEditorCreate={({ editor }) => {
          editor.focus?.()
        }}
      />
    </Box>
  )
}
