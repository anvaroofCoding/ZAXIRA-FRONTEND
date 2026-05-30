import { baseApi } from '@/shared/api/baseApi'
import { API_TAGS } from '@/shared/constants/apiTags'

const recalcTotalUnread = (draft) => {
  if (!draft) return
  const globalUnread = draft.global?.unreadCount ?? 0
  const supportUnread = Array.isArray(draft.supportThreads) && draft.supportThreads.length
    ? draft.supportThreads.reduce((sum, thread) => sum + (thread.unreadCount ?? 0), 0)
    : (draft.support?.unreadCount ?? 0)
  const directUnread = Object.values(draft.direct ?? {}).reduce(
    (sum, item) => sum + (item.unreadCount ?? 0),
    0,
  )
  draft.totalUnread = globalUnread + supportUnread + directUnread
}

const applyMarkReadOptimistic = (draft, body) => {
  if (!draft || !body?.roomType) return

  if (body.roomType === 'GLOBAL' && draft.global) {
    draft.global.unreadCount = 0
  }

  if (body.roomType === 'DIRECT' && body.directPeerUserId && draft.direct?.[body.directPeerUserId]) {
    draft.direct[body.directPeerUserId].unreadCount = 0
  }

  if (body.roomType === 'SUPPORT') {
    if (body.supportRequesterId && Array.isArray(draft.supportThreads)) {
      const thread = draft.supportThreads.find(
        (item) => item.requesterId === body.supportRequesterId,
      )
      if (thread) thread.unreadCount = 0
    } else if (draft.support) {
      draft.support.unreadCount = 0
    }
  }

  recalcTotalUnread(draft)
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatSummary: builder.query({
      query: () => '/chat/summary',
      providesTags: [API_TAGS.CHAT],
    }),
    getChatMessages: builder.query({
      query: ({ roomType, directPeerUserId = '', supportRequesterId = '', limit = 40 }) => ({
        url: '/chat/messages',
        params: {
          roomType,
          limit,
          ...(directPeerUserId ? { directPeerUserId } : {}),
          ...(supportRequesterId ? { supportRequesterId } : {}),
        },
      }),
    }),
    sendChatMessage: builder.mutation({
      query: (body) => ({
        url: '/chat/messages',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.CHAT],
    }),
    markChatRead: builder.mutation({
      query: (body) => ({
        url: '/chat/mark-read',
        method: 'POST',
        body,
      }),
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          chatApi.util.updateQueryData('getChatSummary', undefined, (draft) => {
            applyMarkReadOptimistic(draft, body)
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
    }),
    sendTyping: builder.mutation({
      query: (body) => ({
        url: '/chat/typing',
        method: 'POST',
        body,
      }),
    }),
    toggleMessageReaction: builder.mutation({
      query: ({ messageId, emoji }) => ({
        url: `/chat/messages/${messageId}/reaction`,
        method: 'POST',
        body: { emoji },
      }),
    }),
  }),
})

export const {
  useGetChatSummaryQuery,
  useGetChatMessagesQuery,
  useSendChatMessageMutation,
  useMarkChatReadMutation,
  useSendTypingMutation,
  useToggleMessageReactionMutation,
} = chatApi
