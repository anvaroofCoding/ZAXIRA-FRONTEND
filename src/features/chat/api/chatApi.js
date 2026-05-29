import { baseApi } from '@/shared/api/baseApi'

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
  useGetChatMessagesQuery,
  useSendChatMessageMutation,
  useSendTypingMutation,
  useToggleMessageReactionMutation,
} = chatApi
