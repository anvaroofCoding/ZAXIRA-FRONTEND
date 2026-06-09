const ROOM_LABELS = {
  GLOBAL: 'Umumiy chat',
  DIRECT: 'Lichka',
  SUPPORT: 'Support',
}

const buildChatPreview = (payload) => {
  const roomLabel = ROOM_LABELS[payload?.roomType] ?? 'Chat'
  const sender = payload?.senderName?.trim() || 'Foydalanuvchi'

  let body = payload?.text?.trim()
  if (!body && payload?.imageDataUrl) body = '📷 Rasm'
  if (!body && payload?.fileDataUrl) body = payload?.fileName?.trim() || '📎 Fayl'
  if (!body) body = 'Yangi xabar'

  const shortBody = body.length > 80 ? `${body.slice(0, 77)}…` : body
  return `${roomLabel} · ${sender}: ${shortBody}`
}

export { buildChatPreview }
