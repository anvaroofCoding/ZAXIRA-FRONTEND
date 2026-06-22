import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import {
  useGetGlobalSecondCodeStatusQuery,
  useSetGlobalSecondCodeMutation,
} from '@/features/auth/api/authApi'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

export const GlobalSecondCodeForm = ({
  showDescription = true,
  onSaved,
}) => {
  const statusQuery = useGetGlobalSecondCodeStatusQuery()
  const [setGlobalSecondCode, saveState] = useSetGlobalSecondCodeMutation()
  const [code, setCode] = useState('')
  const [codeConfirm, setCodeConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!statusQuery.data?.isConfigured) return
    setCode('')
    setCodeConfirm('')
    setError('')
    setSuccess('')
  }, [statusQuery.data?.isConfigured])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const normalizedCode = code.trim()
    const normalizedConfirm = codeConfirm.trim()

    if (!normalizedCode || !normalizedConfirm) {
      setError('Kodni ikki marta kiriting')
      return
    }

    if (normalizedCode !== normalizedConfirm) {
      setError('Kodlar mos kelmadi')
      return
    }

    if (normalizedCode.length < 4) {
      setError('Kod kamida 4 belgidan iborat bo‘lishi kerak')
      return
    }

    try {
      await setGlobalSecondCode({
        code: normalizedCode,
        codeConfirm: normalizedConfirm,
      }).unwrap()

      setCode('')
      setCodeConfirm('')
      const message =
        'Umumiy kod saqlandi. Login sahifasida: foydalanuvchi login + shu kod (parol o‘rniga).'
      setSuccess(message)
      statusQuery.refetch()
      onSaved?.(message)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Kodni saqlab bo‘lmadi'))
    }
  }

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={2}>
      {showDescription ? (
        <Typography variant="body2" color="text.secondary">
          Bitta kod barcha foydalanuvchilar uchun. Login sahifasida parol o‘rniga kiriting.
        </Typography>
      ) : null}

      {statusQuery.isLoading ? (
        <CircularProgress size={20} />
      ) : (
        <Alert severity={statusQuery.data?.isConfigured ? 'success' : 'warning'}>
          {statusQuery.data?.isConfigured
            ? 'Umumiy kod o‘rnatilgan'
            : 'Umumiy kod hali o‘rnatilmagan'}
        </Alert>
      )}

      <TextField
        label="Umumiy kod"
        type="password"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        size="small"
        fullWidth
        disabled={saveState.isLoading}
        autoFocus
      />

      <TextField
        label="Kodni tasdiqlang"
        type="password"
        value={codeConfirm}
        onChange={(event) => setCodeConfirm(event.target.value)}
        size="small"
        fullWidth
        disabled={saveState.isLoading}
      />

      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <Box>
        <Button type="submit" variant="contained" disabled={saveState.isLoading}>
          {saveState.isLoading ? 'Saqlanmoqda...' : 'Saqlash'}
        </Button>
      </Box>
    </Stack>
  )
}
