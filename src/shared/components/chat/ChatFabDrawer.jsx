import { useEffect, useMemo, useRef, useState } from 'react'
import ChatIcon from '@mui/icons-material/Chat'
import PublicIcon from '@mui/icons-material/Public'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import PersonIcon from '@mui/icons-material/Person'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import SendIcon from '@mui/icons-material/Send'
import DownloadIcon from '@mui/icons-material/Download'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Popover from '@mui/material/Popover'
import Select from '@mui/material/Select'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import SpeedDialIcon from '@mui/material/SpeedDialIcon'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'
import { useGetUsersLookupQuery } from '@/features/users/api/usersApi'
import {
  useGetChatMessagesQuery,
  useSendChatMessageMutation,
  useSendTypingMutation,
  useToggleMessageReactionMutation,
} from '@/features/chat/api/chatApi'
import { selectAccessToken, selectAuthUser } from '@/features/auth/model/authSlice'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { createChatSocket } from '@/shared/realtime/chatSocket'

const CHAT_TABS = [
  { key: 'SUPPORT', label: 'Support', icon: <SupportAgentIcon fontSize="small" /> },
  { key: 'GLOBAL', label: 'Umumiy', icon: <PublicIcon fontSize="small" /> },
  { key: 'DIRECT', label: 'Lichka', icon: <PersonIcon fontSize="small" /> },
]
const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥']

const hasFullPermissions = (permissions) => {
  if (!permissions || typeof permissions !== 'object') return false
  const pages = Object.values(permissions)
  if (!pages.length) return false
  return pages.every(
    (page) =>
      page?.access &&
      page?.actions?.create &&
      page?.actions?.update &&
      page?.actions?.delete,
  )
}

const formatChatDateTime = (value) => {
  const d = dayjs(value)
  if (!d.isValid()) return ''
  return d.format('DD.MM.YYYY HH:mm')
}

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

const compressImageDataUrl = async (sourceDataUrl) => {
  const img = await loadImage(sourceDataUrl)
  const maxSide = 1280
  const ratio = Math.min(1, maxSide / Math.max(img.width, img.height))
  const width = Math.max(1, Math.round(img.width * ratio))
  const height = Math.max(1, Math.round(img.height * ratio))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return sourceDataUrl
  ctx.drawImage(img, 0, 0, width, height)

  return canvas.toDataURL('image/jpeg', 0.78)
}

export const ChatFabDrawer = () => {
  const token = useAppSelector(selectAccessToken)
  const user = useAppSelector(selectAuthUser)
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('GLOBAL')
  const [text, setText] = useState('')
  const [selectedPeerId, setSelectedPeerId] = useState('')
  const [selectedSupportRequesterId, setSelectedSupportRequesterId] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState('')
  const [fileDataUrl, setFileDataUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileMime, setFileMime] = useState('')
  const [previewImageUrl, setPreviewImageUrl] = useState('')
  const [typingIds, setTypingIds] = useState([])
  const [incomingTick, setIncomingTick] = useState(0)
  const [sendError, setSendError] = useState('')
  const [reactionAnchorEl, setReactionAnchorEl] = useState(null)
  const [reactionMessageId, setReactionMessageId] = useState('')
  const listRef = useRef(null)
  const socketRef = useRef(null)
  const typingTimerRef = useRef(null)
  const reactionTimerRef = useRef(null)

  const lookupQuery = useGetUsersLookupQuery(undefined, { skip: !open })
  const peers = useMemo(
    () => (lookupQuery.data ?? []).filter((u) => u.id !== user?.id),
    [lookupQuery.data, user?.id],
  )
  const isSupportOperator = useMemo(
    () =>
      user?.role === 'SUPER_ADMIN' ||
      user?.role === 'ADMIN' ||
      hasFullPermissions(user?.permissions),
    [user?.permissions, user?.role],
  )

  useEffect(() => {
    if (!selectedPeerId && peers.length) {
      setSelectedPeerId(peers[0].id)
    }
  }, [peers, selectedPeerId])

  useEffect(() => {
    if (isSupportOperator && !selectedSupportRequesterId && peers.length) {
      setSelectedSupportRequesterId(peers[0].id)
    }
  }, [isSupportOperator, peers, selectedSupportRequesterId])

  const queryArgs = useMemo(
    () => ({
      roomType: tab,
      directPeerUserId: tab === 'DIRECT' ? selectedPeerId : '',
      supportRequesterId:
        tab === 'SUPPORT' && isSupportOperator ? selectedSupportRequesterId : '',
      limit: 80,
    }),
    [isSupportOperator, selectedPeerId, selectedSupportRequesterId, tab],
  )

  const messagesQuery = useGetChatMessagesQuery(queryArgs, {
    skip: !open || (tab === 'DIRECT' && !selectedPeerId),
  })
  const [sendChatMessage, sendState] = useSendChatMessageMutation()
  const [sendTyping] = useSendTypingMutation()
  const [toggleMessageReaction] = useToggleMessageReactionMutation()

  useEffect(() => {
    if (!open || !token) return
    const socket = createChatSocket(token)
    socketRef.current = socket

    socket.on('chat:message', () => {
      setIncomingTick((v) => v + 1)
    })

    socket.on('chat:typing', (payload) => {
      const senderId = payload?.userId
      if (!senderId || senderId === user?.id) return
      const matchRoom = payload?.roomType === tab
      const matchDirect =
        tab !== 'DIRECT' || payload?.directPeerUserId === user?.id || senderId === selectedPeerId
      if (!matchRoom || !matchDirect) return

      setTypingIds((prev) =>
        payload?.isTyping
          ? Array.from(new Set([...prev, senderId]))
          : prev.filter((id) => id !== senderId),
      )
    })

    socket.on('chat:reaction', () => {
      setIncomingTick((v) => v + 1)
    })

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
    }
  }, [open, selectedPeerId, tab, token, user?.id])

  useEffect(() => {
    if (incomingTick > 0) {
      messagesQuery.refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingTick])

  useEffect(() => {
    if (!messagesQuery.data?.length) return
    const node = listRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [messagesQuery.data])

  const currentTypingNames = useMemo(() => {
    const nameMap = new Map((messagesQuery.data ?? []).map((m) => [m.senderId, m.senderName]))
    return typingIds.map((id) => nameMap.get(id) || 'Kimdir')
  }, [messagesQuery.data, typingIds])

  const sendTypingSignal = (isTyping) => {
    if (!open) return
    sendTyping({
      roomType: tab,
      ...(tab === 'DIRECT' ? { directPeerUserId: selectedPeerId } : {}),
      ...(tab === 'SUPPORT' && isSupportOperator
        ? { supportRequesterId: selectedSupportRequesterId }
        : {}),
      isTyping,
    })
  }

  const handleInputChange = (value) => {
    setText(value)
    if (sendError) setSendError('')
    sendTypingSignal(true)
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
    }
    typingTimerRef.current = setTimeout(() => sendTypingSignal(false), 900)
  }

  const handleFilePick = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const source = await fileToDataUrl(file)
    if (file.type?.startsWith('image/')) {
      const compressed = await compressImageDataUrl(source)
      setImageDataUrl(compressed)
      setFileDataUrl('')
      setFileName(file.name)
      setFileMime(file.type || 'image/jpeg')
    } else {
      setFileDataUrl(source)
      setFileName(file.name)
      setFileMime(file.type || 'application/octet-stream')
      setImageDataUrl('')
    }
    event.target.value = ''
    if (sendError) setSendError('')
  }

  const downloadDataUrl = (dataUrl, name = 'download') => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = name
    a.click()
  }

  const handleSend = async () => {
    setSendError('')
    const payload = {
      roomType: tab,
      text: text.trim(),
      imageDataUrl,
      ...(fileDataUrl
        ? {
            fileDataUrl,
            fileName,
            fileMime,
          }
        : {}),
      ...(tab === 'DIRECT' ? { directPeerUserId: selectedPeerId } : {}),
      ...(tab === 'SUPPORT' && isSupportOperator
        ? { supportRequesterId: selectedSupportRequesterId }
        : {}),
    }
    try {
      await sendChatMessage(payload).unwrap()
      setText('')
      setImageDataUrl('')
      setFileDataUrl('')
      setFileName('')
      setFileMime('')
      sendTypingSignal(false)
      messagesQuery.refetch()
    } catch (error) {
      setSendError(getApiErrorMessage(error, 'Xabar yuborilmadi'))
    }
  }

  const openReactionPicker = (event, messageId) => {
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current)
    reactionTimerRef.current = setTimeout(() => {
      setReactionAnchorEl(event.currentTarget)
      setReactionMessageId(messageId)
    }, 2000)
  }

  const cancelReactionHover = () => {
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current)
  }

  const closeReactionPicker = () => {
    if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current)
    setReactionAnchorEl(null)
    setReactionMessageId('')
  }

  const handlePickReaction = async (emoji) => {
    if (!reactionMessageId) return
    await toggleMessageReaction({ messageId: reactionMessageId, emoji }).unwrap()
    closeReactionPicker()
    messagesQuery.refetch()
  }

  return (
    <>
      <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1300 }}>
        <SpeedDial
          ariaLabel="Chat speed dial"
          icon={<SpeedDialIcon openIcon={<ChatIcon />} />}
          onClick={() => setOpen(true)}
        >
          {CHAT_TABS.map((action) => (
            <SpeedDialAction
              key={action.key}
              icon={action.icon}
              slotProps={{
                tooltip: {
                  title: action.label,
                },
              }}
              onClick={() => {
                setTab(action.key)
                setOpen(true)
              }}
            />
          ))}
        </SpeedDial>
      </Box>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: { xs: 340, sm: 420 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              Chat
            </Typography>
            <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mt: 1 }}>
              {CHAT_TABS.map((item) => (
                <Tab key={item.key} value={item.key} label={item.label} />
              ))}
            </Tabs>
            {tab === 'DIRECT' ? (
              <FormControl fullWidth size="small" sx={{ mt: 1.5 }}>
                <InputLabel id="chat-peer-label">Kimga</InputLabel>
                <Select
                  labelId="chat-peer-label"
                  value={selectedPeerId}
                  label="Kimga"
                  onChange={(e) => setSelectedPeerId(e.target.value)}
                >
                  {peers.map((peer) => (
                    <MenuItem key={peer.id} value={peer.id}>
                      {peer.displayName}
                      {peer.structureShortName ? ` (${peer.structureShortName})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}
            {tab === 'SUPPORT' && isSupportOperator ? (
              <FormControl fullWidth size="small" sx={{ mt: 1.5 }}>
                <InputLabel id="chat-support-user-label">Support kimga</InputLabel>
                <Select
                  labelId="chat-support-user-label"
                  value={selectedSupportRequesterId}
                  label="Support kimga"
                  onChange={(e) => setSelectedSupportRequesterId(e.target.value)}
                >
                  {peers.map((peer) => (
                    <MenuItem key={peer.id} value={peer.id}>
                      {peer.displayName}
                      {peer.structureShortName ? ` (${peer.structureShortName})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}
          </Box>

          <Divider />

          <Box
            ref={listRef}
            sx={{
              flex: 1,
              overflowY: 'auto',
              px: 0.75,
              py: 1,
              bgcolor: 'background.default',
            }}
          >
            <Stack spacing={1}>
              {(messagesQuery.data ?? []).map((msg) => {
                const own = String(msg.senderId) === String(user?.id)
                return (
                  <Box
                    key={msg.id}
                    onMouseEnter={(event) => openReactionPicker(event, msg.id)}
                    onMouseLeave={cancelReactionHover}
                    sx={{
                      ml: own ? 'auto' : 0,
                      mr: own ? 0 : 'auto',
                      alignSelf: own ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      bgcolor: own ? 'primary.main' : 'background.paper',
                      color: own ? 'primary.contrastText' : 'text.primary',
                      borderRadius: 2,
                      px: 1.25,
                      py: 0.9,
                      position: 'relative',
                      '&:hover .message-download-icon': { opacity: 1 },
                    }}
                  >
                    <Typography variant="caption" sx={{ opacity: 0.85, display: 'block' }}>
                      {msg.senderName}
                    </Typography>
                    {msg.text ? <Typography variant="body2">{msg.text}</Typography> : null}
                    {msg.imageDataUrl ? (
                      <>
                        <Box
                          component="img"
                          src={msg.imageDataUrl}
                          alt="chat-attachment"
                          onClick={() => setPreviewImageUrl(msg.imageDataUrl)}
                          sx={{
                            mt: 0.5,
                            width: '100%',
                            borderRadius: 1.5,
                            maxHeight: 260,
                            objectFit: 'cover',
                            cursor: 'zoom-in',
                          }}
                        />
                        <IconButton
                          size="small"
                          className="message-download-icon"
                          onClick={() => downloadDataUrl(msg.imageDataUrl, msg.fileName || 'image.jpg')}
                          sx={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            bgcolor: 'background.paper',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </>
                    ) : null}
                    {msg.fileDataUrl && !msg.imageDataUrl ? (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() =>
                          downloadDataUrl(
                            msg.fileDataUrl,
                            msg.fileName || 'attachment',
                          )
                        }
                        sx={{ mt: 0.5, textTransform: 'none' }}
                      >
                        {msg.fileName || 'Faylni yuklab olish'}
                      </Button>
                    ) : null}
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.75, display: 'block', mt: 0.5, textAlign: 'right' }}
                    >
                      {formatChatDateTime(msg.createdAt)}
                    </Typography>
                    {Array.isArray(msg.reactions) && msg.reactions.length ? (
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                        {msg.reactions.map((reaction) => (
                          <Chip
                            key={`${msg.id}-${reaction.emoji}`}
                            size="small"
                            label={`${reaction.emoji} ${reaction.count}`}
                          />
                        ))}
                      </Stack>
                    ) : null}
                  </Box>
                )
              })}
            </Stack>
          </Box>

          {currentTypingNames.length ? (
            <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 0.5 }}>
              {currentTypingNames.join(', ')} yozmoqda...
            </Typography>
          ) : null}

          <Divider />

          <Box sx={{ p: 1.5 }}>
            {imageDataUrl ? (
              <Chip
                size="small"
                label="1 ta rasm biriktirildi"
                onDelete={() => setImageDataUrl('')}
                sx={{ mb: 1 }}
              />
            ) : null}
            {!imageDataUrl && fileDataUrl ? (
              <Chip
                size="small"
                label={fileName ? `1 ta fayl: ${fileName}` : '1 ta fayl biriktirildi'}
                onDelete={() => {
                  setFileDataUrl('')
                  setFileName('')
                  setFileMime('')
                }}
                sx={{ mb: 1 }}
              />
            ) : null}
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <TextField
                fullWidth
                size="small"
                multiline
                maxRows={4}
                placeholder="Xabar yozing..."
                value={text}
                onChange={(e) => handleInputChange(e.target.value)}
              />
              <IconButton component="label">
                <AttachFileIcon />
                <input hidden type="file" onChange={handleFilePick} />
              </IconButton>
              <IconButton
                color="primary"
                disabled={
                  sendState.isLoading ||
                  (!text.trim() && !imageDataUrl && !fileDataUrl) ||
                  (tab === 'DIRECT' && !selectedPeerId) ||
                  (tab === 'SUPPORT' && isSupportOperator && !selectedSupportRequesterId)
                }
                onClick={handleSend}
              >
                <SendIcon />
              </IconButton>
            </Stack>
            {tab === 'DIRECT' && !selectedPeerId ? (
              <Typography variant="caption" color="warning.main">
                Lichka chat uchun foydalanuvchi tanlang
              </Typography>
            ) : null}
            {sendError ? (
              <Typography variant="caption" color="error.main">
                {sendError}
              </Typography>
            ) : null}
          </Box>
        </Box>
      </Drawer>

      <Popover
        open={Boolean(reactionAnchorEl)}
        anchorEl={reactionAnchorEl}
        onClose={closeReactionPicker}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Stack direction="row" spacing={0.5} sx={{ p: 0.75 }}>
          {REACTION_EMOJIS.map((emoji) => (
            <IconButton
              key={emoji}
              size="small"
              onClick={() => handlePickReaction(emoji)}
              sx={{ fontSize: 20 }}
            >
              {emoji}
            </IconButton>
          ))}
        </Stack>
      </Popover>

      <Dialog open={Boolean(previewImageUrl)} onClose={() => setPreviewImageUrl('')} maxWidth="lg">
        <Box
          component="img"
          src={previewImageUrl}
          alt="chat-full-preview"
          sx={{ width: '100%', maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain' }}
        />
      </Dialog>
    </>
  )
}
