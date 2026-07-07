import { useEffect, useMemo, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Alert from '@mui/material/Alert'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {
  useCreateAppFaqMutation,
  useDeleteAppFaqMutation,
  useGetAppFaqsQuery,
} from '@/features/app-usage/api/appUsageApi'
import {
  isAppUsageApiMissing,
  isFaqApiUnavailable,
} from '@/features/app-usage/constants/defaultAppAbout'
import { isPrivilegedAdminUser } from '@/features/auth/utils/isPrivilegedAdminUser'
import { PageShell } from '@/shared/components/layout/PageShell'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const LOCAL_FAQS_STORAGE_KEY = 'zaxira:faq-local-items'

const DEFAULT_FAQS = [
  {
    id: 'local-1',
    question: 'ZAXIRA dasturida xarid arizasi qanday yuboriladi?',
    answer:
      'Xaridlar bo‘limidan ariza formasini to‘ldiring, kerakli fayllarni biriktiring va tasdiqlashga yuboring.',
  },
  {
    id: 'local-2',
    question: 'Omborga kirim qilingan tovarlarni qayerdan ko‘raman?',
    answer:
      'Omborlar bo‘limidagi “Mening omborim” sahifasida qoldiq, kirim va chiqim holatini ko‘rishingiz mumkin.',
  },
]

const readLocalFaqs = () => {
  if (typeof window === 'undefined') return DEFAULT_FAQS

  try {
    const raw = window.localStorage.getItem(LOCAL_FAQS_STORAGE_KEY)
    if (!raw) return DEFAULT_FAQS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : DEFAULT_FAQS
  } catch {
    return DEFAULT_FAQS
  }
}

const KopBeriladiganSavollarPageSkeleton = () => (
  <PageShell>
    <Stack spacing={2.5}>
      <Skeleton variant="text" width="40%" height={42} />

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.25}>
          <Skeleton variant="rounded" height={52} />
          <Skeleton variant="text" width="85%" />
          <Skeleton variant="text" width="72%" />
        </Stack>
      </Paper>
    </Stack>
  </PageShell>
)

export const KopBeriladiganSavollarPage = () => {
  const { user } = usePermissions()
  const isAdmin = isPrivilegedAdminUser(user)
  const faqApiUnavailable = isFaqApiUnavailable()

  const faqQuery = useGetAppFaqsQuery(undefined, { skip: faqApiUnavailable })
  const [createFaq, createState] = useCreateAppFaqMutation()
  const [deleteFaq, deleteState] = useDeleteAppFaqMutation()

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [snackbarError, setSnackbarError] = useState('')
  const [localFaqs, setLocalFaqs] = useState(readLocalFaqs)
  const apiMissing = faqApiUnavailable || isAppUsageApiMissing(faqQuery.error)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(LOCAL_FAQS_STORAGE_KEY, JSON.stringify(localFaqs))
    } catch {
      // ignore storage errors
    }
  }, [localFaqs])

  const faqs = useMemo(() => (apiMissing ? localFaqs : faqQuery.data ?? []), [apiMissing, localFaqs, faqQuery.data])
  const loading = faqQuery.isLoading && !faqQuery.data

  const handleCreateFaq = async () => {
    const trimmedQuestion = question.trim()
    const trimmedAnswer = answer.trim()

    if (!trimmedQuestion || !trimmedAnswer) {
      setSnackbarError('Savol va javobni to‘liq kiriting')
      return
    }

    if (apiMissing) {
      setLocalFaqs((prev) => [
        {
          id: `local-${Date.now()}`,
          question: trimmedQuestion,
          answer: trimmedAnswer,
        },
        ...prev,
      ])
      setQuestion('')
      setAnswer('')
      setSnackbarError('')
      return
    }

    try {
      await createFaq({
        question: trimmedQuestion,
        answer: trimmedAnswer,
      }).unwrap()
      setQuestion('')
      setAnswer('')
      setSnackbarError('')
    } catch (error) {
      setSnackbarError(getApiErrorMessage(error, 'Savol qo‘shishda xatolik'))
    }
  }

  const handleDeleteFaq = async (faq) => {
    const confirmed = window.confirm('Ushbu savolni o‘chirasizmi?')
    if (!confirmed) return

    if (apiMissing) {
      setLocalFaqs((prev) => prev.filter((item) => item.id !== faq.id))
      return
    }

    try {
      await deleteFaq(faq.id).unwrap()
    } catch (error) {
      setSnackbarError(getApiErrorMessage(error, 'Savolni o‘chirishda xatolik'))
    }
  }

  if (loading) {
    return <KopBeriladiganSavollarPageSkeleton />
  }

  return (
    <PageShell>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Ko‘p beriladigan savollar
          </Typography>
        </Box>

        {faqQuery.isError && !apiMissing ? (
          <Alert severity="error">
            {getApiErrorMessage(faqQuery.error, 'Savollarni yuklashda xatolik')}
          </Alert>
        ) : null}

        {snackbarError ? <Alert severity="error">{snackbarError}</Alert> : null}

        {faqs.length ? (
          <Stack spacing={1.25}>
            {faqs.map((faq) => (
              <Accordion key={faq.id} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ width: '100%', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Typography fontWeight={600}>{faq.question}</Typography>
                    {isAdmin ? (
                      <IconButton
                        component="span"
                        size="small"
                        color="error"
                        aria-label="Savolni o‘chirish"
                        onClick={(event) => {
                          event.stopPropagation()
                          void handleDeleteFaq(faq)
                        }}
                        disabled={deleteState.isLoading}
                      >
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    ) : null}
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        ) : (
          <Alert severity="info">Hozircha savollar kiritilmagan.</Alert>
        )}

        {isAdmin ? (
          <>
            <Divider />
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" fontWeight={700}>
                Admin boshqaruvi
              </Typography>
              <TextField
                label="Savol"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                fullWidth
              />
              <TextField
                label="Javob"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                fullWidth
                multiline
                minRows={3}
              />
              <Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateFaq}
                  disabled={createState.isLoading}
                >
                  Savol qo‘shish
                </Button>
              </Box>
            </Stack>
          </>
        ) : null}
      </Stack>
    </PageShell>
  )
}
