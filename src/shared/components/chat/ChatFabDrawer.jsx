import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import ChatIcon from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close'
import DownloadIcon from '@mui/icons-material/Download'
import PersonIcon from '@mui/icons-material/Person'
import PublicIcon from '@mui/icons-material/Public'
import ReplyIcon from '@mui/icons-material/Reply'
import SearchIcon from '@mui/icons-material/Search'
import SendIcon from '@mui/icons-material/Send'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import List from '@mui/material/List'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Popover from '@mui/material/Popover'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import SpeedDialIcon from '@mui/material/SpeedDialIcon'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import {
  useGetChatMessagesQuery,
  useGetChatSummaryQuery,
  useMarkChatReadMutation,
  useSendChatMessageMutation,
  useSendTypingMutation,
  useToggleMessageReactionMutation,
} from '@/features/chat/api/chatApi'
import { selectAuthUser } from '@/features/auth/model/authSlice'
import { useGetUsersLookupQuery } from '@/features/users/api/usersApi'
import { ChatUserAvatar } from '@/shared/components/chat/ChatUserAvatar'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { setChatUiState } from '@/shared/realtime/chatUiState'
import { useChatRealtime } from '@/shared/hooks/useChatRealtime'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

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
  const now = dayjs()
  if (d.isSame(now, 'day')) return d.format('HH:mm')
  if (d.isSame(now.subtract(1, 'day'), 'day')) return 'Kecha'
  return d.format('DD.MM.YY')
}

const formatListTime = (value) => {
  const d = dayjs(value)
  if (!d.isValid()) return ''
  return formatChatDateTime(value)
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

const formatReplyPreview = (replyTo) => {
  if (!replyTo) return ''
  if (replyTo.text) return replyTo.text
  if (replyTo.hasImage) return '📷 Rasm'
  if (replyTo.hasFile) return '📎 Fayl'
  return 'Xabar'
}

const ReplyQuote = ({ replyTo, own, onClick }) => {
  if (!replyTo) return null
  return (
    <Box
      onClick={onClick}
      sx={{
        mb: 0.75,
        px: 1,
        py: 0.5,
        borderLeft: 3,
        borderColor: own ? 'primary.contrastText' : 'primary.main',
        bgcolor: own ? 'rgba(255,255,255,0.15)' : 'action.hover',
        borderRadius: 1,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <Typography variant="caption" fontWeight={700} sx={{ display: 'block', opacity: 0.9 }}>
        {replyTo.senderName}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', opacity: 0.85 }} noWrap>
        {formatReplyPreview(replyTo)}
      </Typography>
    </Box>
  )
}

const TabLabelWithBadge = ({ label, count }) => (
  <Badge badgeContent={count} color="error" max={99} invisible={!count}>
    <Box component="span" sx={{ pr: count ? 1.5 : 0 }}>
      {label}
    </Box>
  </Badge>
)

const UnreadBadge = ({ count }) => {
  if (!count) return null
  return (
    <Chip
      size="small"
      color="error"
      label={count > 99 ? '99+' : count}
      sx={{ minWidth: 28, height: 22, fontWeight: 700 }}
    />
  )
}

const ConversationRow = ({ avatar, title, subtitle, time, unreadCount, onClick }) => (
  <ListItemButton onClick={onClick} sx={{ py: 1.25, alignItems: 'flex-start' }}>
    <ListItemAvatar sx={{ minWidth: 52 }}>{avatar}</ListItemAvatar>
    <ListItemText
      slotProps={{
        primary: { component: 'div' },
        secondary: { component: 'div' },
      }}
      primary={
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography component="span" variant="subtitle2" fontWeight={700} noWrap sx={{ flex: 1 }}>
            {title}
          </Typography>
          {time ? (
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ flexShrink: 0 }}
            >
              {time}
            </Typography>
          ) : null}
        </Stack>
      }
      secondary={
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography
            component="span"
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ flex: 1, fontWeight: unreadCount ? 600 : 400 }}
          >
            {subtitle || 'Xabar yo‘q'}
          </Typography>
          <UnreadBadge count={unreadCount} />
        </Stack>
      }
    />
  </ListItemButton>
)

export const ChatFabDrawer = () => {
  const user = useAppSelector(selectAuthUser)
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('GLOBAL')
  const [view, setView] = useState('list')
  const [text, setText] = useState('')
  const [selectedPeerId, setSelectedPeerId] = useState('')
  const [selectedSupportRequesterId, setSelectedSupportRequesterId] = useState('')
  const [directSearch, setDirectSearch] = useState('')
  const [supportSearch, setSupportSearch] = useState('')
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
  const [replyTo, setReplyTo] = useState(null)
  const listRef = useRef(null)
  const typingTimerRef = useRef(null)
  const reactionTimerRef = useRef(null)

  const isSupportOperator = useMemo(
    () =>
      user?.role === 'SUPER_ADMIN' ||
      user?.role === 'ADMIN' ||
      hasFullPermissions(user?.permissions),
    [user?.permissions, user?.role],
  )

  const summaryQuery = useGetChatSummaryQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })
  const summary = summaryQuery.data

  const tabUnread = useMemo(() => {
    const supportUnread = isSupportOperator
      ? (summary?.supportThreads ?? []).reduce((sum, thread) => sum + (thread.unreadCount ?? 0), 0)
      : (summary?.support?.unreadCount ?? 0)
    const directUnread = Object.values(summary?.direct ?? {}).reduce(
      (sum, item) => sum + (item.unreadCount ?? 0),
      0,
    )
    return {
      SUPPORT: supportUnread,
      GLOBAL: summary?.global?.unreadCount ?? 0,
      DIRECT: directUnread,
    }
  }, [isSupportOperator, summary])

  const lookupQuery = useGetUsersLookupQuery()
  const peers = useMemo(
    () => (lookupQuery.data ?? []).filter((u) => u.id !== user?.id),
    [lookupQuery.data, user?.id],
  )

  const activeRoom = useMemo(() => {
    if (view !== 'thread') return null
    if (tab === 'DIRECT') {
      return { roomType: 'DIRECT', directPeerUserId: selectedPeerId }
    }
    if (tab === 'SUPPORT') {
      return {
        roomType: 'SUPPORT',
        supportRequesterId: isSupportOperator ? selectedSupportRequesterId : user?.id,
      }
    }
    return { roomType: 'GLOBAL' }
  }, [
    isSupportOperator,
    selectedPeerId,
    selectedSupportRequesterId,
    tab,
    user?.id,
    view,
  ])

  const messageMatchesActiveRoom = useCallback(
    (payload) => {
      if (!payload || view !== 'thread' || !open) return false
      if (payload.roomType !== tab) return false
      if (tab === 'GLOBAL') return true
      if (tab === 'DIRECT') {
        const senderId = String(payload.senderId ?? '')
        return (
          senderId === String(selectedPeerId) || senderId === String(user?.id ?? '')
        )
      }
      if (tab === 'SUPPORT') {
        const requesterId = isSupportOperator ? selectedSupportRequesterId : user?.id
        return String(payload.supportRequesterId ?? '') === String(requesterId ?? '')
      }
      return false
    },
    [
      isSupportOperator,
      open,
      selectedPeerId,
      selectedSupportRequesterId,
      tab,
      user?.id,
      view,
    ],
  )

  useEffect(() => {
    setChatUiState({
      open,
      view,
      tab,
      selectedPeerId,
      selectedSupportRequesterId,
      userId: user?.id ?? '',
      isSupportOperator,
    })
  }, [
    isSupportOperator,
    open,
    selectedPeerId,
    selectedSupportRequesterId,
    tab,
    user?.id,
    view,
  ])

  useChatRealtime({
    activeRoom,
    onMessage: (payload) => {
      if (messageMatchesActiveRoom(payload)) {
        setIncomingTick((v) => v + 1)
      }
    },
    onTyping: (payload) => {
      const senderId = payload?.userId
      if (!senderId) return
      setTypingIds((prev) =>
        payload?.isTyping
          ? Array.from(new Set([...prev, senderId]))
          : prev.filter((id) => id !== senderId),
      )
    },
    onReaction: (payload) => {
      if (messageMatchesActiveRoom(payload)) {
        setIncomingTick((v) => v + 1)
      }
    },
  })

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
    skip:
      !open ||
      view !== 'thread' ||
      (tab === 'DIRECT' && !selectedPeerId) ||
      (tab === 'SUPPORT' && isSupportOperator && !selectedSupportRequesterId),
  })

  const [sendChatMessage, sendState] = useSendChatMessageMutation()
  const [markChatRead] = useMarkChatReadMutation()
  const [sendTyping] = useSendTypingMutation()
  const [toggleMessageReaction] = useToggleMessageReactionMutation()

  const markCurrentThreadRead = useCallback(() => {
    if (tab === 'GLOBAL') {
      markChatRead({ roomType: 'GLOBAL' })
      return
    }
    if (tab === 'DIRECT' && selectedPeerId) {
      markChatRead({ roomType: 'DIRECT', directPeerUserId: selectedPeerId })
      return
    }
    if (tab === 'SUPPORT') {
      if (isSupportOperator && selectedSupportRequesterId) {
        markChatRead({
          roomType: 'SUPPORT',
          supportRequesterId: selectedSupportRequesterId,
        })
      } else {
        markChatRead({ roomType: 'SUPPORT' })
      }
    }
  }, [isSupportOperator, markChatRead, selectedPeerId, selectedSupportRequesterId, tab])

  useEffect(() => {
    if (!open || view !== 'thread') return
    if (!messagesQuery.data) return
    markCurrentThreadRead()
  }, [
    incomingTick,
    markCurrentThreadRead,
    messagesQuery.data,
    open,
    selectedPeerId,
    selectedSupportRequesterId,
    tab,
    view,
  ])

  useEffect(() => {
    if (incomingTick > 0 && open && view === 'thread') {
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

  useEffect(() => {
    setView('list')
    setTypingIds([])
    setReplyTo(null)
  }, [tab])

  const selectedPeer = useMemo(
    () => peers.find((p) => p.id === selectedPeerId),
    [peers, selectedPeerId],
  )

  const threadTitle = useMemo(() => {
    if (tab === 'GLOBAL') return 'Umumiy chat'
    if (tab === 'SUPPORT') {
      if (isSupportOperator) {
        const thread = summary?.supportThreads?.find(
          (t) => t.requesterId === selectedSupportRequesterId,
        )
        return thread?.requesterName ?? 'Support'
      }
      return 'Support'
    }
    return selectedPeer?.displayName ?? 'Lichka chat'
  }, [
    isSupportOperator,
    selectedPeer?.displayName,
    selectedSupportRequesterId,
    summary?.supportThreads,
    tab,
  ])

  const filteredPeers = useMemo(() => {
    const q = directSearch.trim().toLowerCase()
    const list = q
      ? peers.filter((peer) => {
          const haystack = [
            peer.displayName,
            peer.login,
            peer.structureShortName,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          return haystack.includes(q)
        })
      : peers

    return [...list].sort((a, b) => {
      const aMeta = summary?.direct?.[a.id]
      const bMeta = summary?.direct?.[b.id]
      const aTime = aMeta?.lastMessageAt ? new Date(aMeta.lastMessageAt).getTime() : 0
      const bTime = bMeta?.lastMessageAt ? new Date(bMeta.lastMessageAt).getTime() : 0
      if (aTime !== bTime) return bTime - aTime
      return (a.displayName || '').localeCompare(b.displayName || '')
    })
  }, [directSearch, peers, summary?.direct])

  const filteredSupportThreads = useMemo(() => {
    const threads = summary?.supportThreads ?? []
    const q = supportSearch.trim().toLowerCase()
    if (!q) return threads
    return threads.filter((thread) =>
      thread.requesterName.toLowerCase().includes(q),
    )
  }, [summary?.supportThreads, supportSearch])

  const openThread = (options = {}) => {
    if (options.peerId) setSelectedPeerId(options.peerId)
    if (options.supportRequesterId) {
      setSelectedSupportRequesterId(options.supportRequesterId)
    }
    setView('thread')
    setTypingIds([])
    setReplyTo(null)
  }

  const backToList = () => {
    setView('list')
    setTypingIds([])
    setReplyTo(null)
  }

  const handleTabChange = (_event, value) => {
    setTab(value)
    setView('list')
  }

  const sendTypingSignal = (isTyping) => {
    if (!open || view !== 'thread') return
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
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
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
      ...(fileDataUrl ? { fileDataUrl, fileName, fileMime } : {}),
      ...(tab === 'DIRECT' ? { directPeerUserId: selectedPeerId } : {}),
      ...(tab === 'SUPPORT' && isSupportOperator
        ? { supportRequesterId: selectedSupportRequesterId }
        : {}),
      ...(replyTo?.id ? { replyToMessageId: replyTo.id } : {}),
    }
    try {
      await sendChatMessage(payload).unwrap()
      setText('')
      setImageDataUrl('')
      setFileDataUrl('')
      setFileName('')
      setFileMime('')
      setReplyTo(null)
      sendTypingSignal(false)
      messagesQuery.refetch()
      markCurrentThreadRead()
    } catch (error) {
      setSendError(getApiErrorMessage(error, 'Xabar yuborilmadi'))
    }
  }

  const handleReply = (msg) => {
    setReplyTo({
      id: msg.id,
      senderName: msg.senderName,
      text: msg.text,
      hasImage: Boolean(msg.imageDataUrl),
      hasFile: Boolean(msg.fileDataUrl && !msg.imageDataUrl),
    })
  }

  const scrollToMessage = (messageId) => {
    if (!messageId || !listRef.current) return
    const node = listRef.current.querySelector(`[data-message-id="${messageId}"]`)
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' })
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

  const currentTypingNames = useMemo(() => {
    const nameMap = new Map((messagesQuery.data ?? []).map((m) => [m.senderId, m.senderName]))
    return typingIds.map((id) => nameMap.get(id) || 'Kimdir')
  }, [messagesQuery.data, typingIds])

  const renderConversationList = () => {
    if (tab === 'GLOBAL') {
      return (
        <List disablePadding>
          <ConversationRow
            avatar={<ChatUserAvatar name="Umumiy" />}
            title="Umumiy chat"
            subtitle={summary?.global?.lastMessageText}
            time={formatListTime(summary?.global?.lastMessageAt)}
            unreadCount={summary?.global?.unreadCount ?? 0}
            onClick={() => openThread()}
          />
        </List>
      )
    }

    if (tab === 'SUPPORT') {
      if (isSupportOperator) {
        return (
          <>
            <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Qidiruv"
                value={supportSearch}
                onChange={(e) => setSupportSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <List disablePadding>
              {filteredSupportThreads.map((thread) => (
                <ConversationRow
                  key={thread.requesterId}
                  avatar={<ChatUserAvatar name={thread.requesterName} />}
                  title={thread.requesterName}
                  subtitle={thread.lastMessageText}
                  time={formatListTime(thread.lastMessageAt)}
                  unreadCount={thread.unreadCount}
                  onClick={() =>
                    openThread({ supportRequesterId: thread.requesterId })
                  }
                />
              ))}
              {!filteredSupportThreads.length ? (
                <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 3 }}>
                  Support suhbatlari topilmadi
                </Typography>
              ) : null}
            </List>
          </>
        )
      }

      return (
        <List disablePadding>
          <ConversationRow
            avatar={<ChatUserAvatar name="Support" />}
            title="Support"
            subtitle={summary?.support?.lastMessageText}
            time={formatListTime(summary?.support?.lastMessageAt)}
            unreadCount={summary?.support?.unreadCount ?? 0}
            onClick={() => openThread()}
          />
        </List>
      )
    }

    return (
      <>
        <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Qidiruv"
            value={directSearch}
            onChange={(e) => setDirectSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <List disablePadding sx={{ pb: 1 }}>
          {filteredPeers.map((peer) => {
            const meta = summary?.direct?.[peer.id]
            const subtitle =
              meta?.lastMessageText ||
              [peer.structureShortName, peer.login].filter(Boolean).join(' · ')
            return (
              <ConversationRow
                key={peer.id}
                avatar={<ChatUserAvatar name={peer.displayName} />}
                title={peer.displayName}
                subtitle={subtitle}
                time={formatListTime(meta?.lastMessageAt)}
                unreadCount={meta?.unreadCount ?? 0}
                onClick={() => openThread({ peerId: peer.id })}
              />
            )
          })}
          {!filteredPeers.length ? (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 3 }}>
              Xodim topilmadi
            </Typography>
          ) : null}
        </List>
      </>
    )
  }

  const renderMessages = () => (
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
              data-message-id={msg.id}
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
                '&:hover .message-action-icon': { opacity: 1 },
                '&:hover .message-download-icon': { opacity: 1 },
              }}
            >
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="caption" sx={{ opacity: 0.85, display: 'block', flex: 1 }}>
                  {msg.senderName}
                </Typography>
                <IconButton
                  size="small"
                  className="message-action-icon"
                  onClick={() => handleReply(msg)}
                  sx={{
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    color: own ? 'primary.contrastText' : 'text.secondary',
                    p: 0.25,
                  }}
                  aria-label="Javob berish"
                >
                  <ReplyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Stack>
              <ReplyQuote
                replyTo={msg.replyTo}
                own={own}
                onClick={
                  msg.replyTo?.messageId
                    ? () => scrollToMessage(msg.replyTo.messageId)
                    : undefined
                }
              />
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
                    onClick={() =>
                      downloadDataUrl(msg.imageDataUrl, msg.fileName || 'image.jpg')
                    }
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
                    downloadDataUrl(msg.fileDataUrl, msg.fileName || 'attachment')
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
  )

  return (
    <>
      <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1300 }}>
        <SpeedDial
          ariaLabel="Chat"
          icon={<SpeedDialIcon openIcon={<ChatIcon />} />}
          onClick={() => {
            setOpen(true)
            setView('list')
          }}
          sx={{ position: 'static' }}
        >
          {CHAT_TABS.map((action) => (
            <SpeedDialAction
              key={action.key}
              icon={action.icon}
              slotProps={{
                tooltip: { title: action.label },
              }}
              onClick={() => {
                setTab(action.key)
                setOpen(true)
                setView('list')
              }}
            />
          ))}
        </SpeedDial>
      </Box>

      <Drawer
        anchor="left"
        open={open}
        onClose={() => {
          setOpen(false)
          setView('list')
        }}
      >
        <Box
          sx={{
            width: { xs: 360, sm: 420 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ px: 1.5, pt: 1.5, pb: 0.5 }}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              {view === 'thread' ? (
                <IconButton size="small" onClick={backToList} aria-label="Orqaga">
                  <ArrowBackIcon />
                </IconButton>
              ) : null}
              <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
                {view === 'thread' ? threadTitle : 'Chat'}
              </Typography>
            </Stack>
            {view === 'list' ? (
              <Tabs value={tab} onChange={handleTabChange} sx={{ mt: 0.5 }}>
                {CHAT_TABS.map((item) => (
                  <Tab
                    key={item.key}
                    value={item.key}
                    label={
                      <TabLabelWithBadge label={item.label} count={tabUnread[item.key] ?? 0} />
                    }
                  />
                ))}
              </Tabs>
            ) : null}
          </Box>

          <Divider />

          {view === 'list' ? (
            <Box sx={{ flex: 1, overflowY: 'auto' }}>{renderConversationList()}</Box>
          ) : (
            <>
              {renderMessages()}
              {currentTypingNames.length ? (
                <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 0.5 }}>
                  {currentTypingNames.join(', ')} yozmoqda...
                </Typography>
              ) : null}
              <Divider />
              <Box sx={{ p: 1.5 }}>
                {replyTo ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      mb: 1,
                      px: 1.25,
                      py: 0.75,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      borderLeft: 3,
                      borderColor: 'primary.main',
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" fontWeight={700} color="primary.main">
                        {replyTo.senderName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {formatReplyPreview(replyTo)}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setReplyTo(null)} aria-label="Javobni bekor qilish">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Paper>
                ) : null}
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
                <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-end' }}>
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
                {sendError ? (
                  <Typography variant="caption" color="error.main">
                    {sendError}
                  </Typography>
                ) : null}
              </Box>
            </>
          )}
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
