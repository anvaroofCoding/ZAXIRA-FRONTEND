import { baseApi } from '@/shared/api/baseApi'

const MAX_NAME_LEN = 500
const MAX_CHARACTERISTICS_LEN = 20_000

/** API faqat name va characteristics qabul qiladi */
export const buildProductPriceSearchBody = (payload) => {
  const name =
    typeof payload === 'string'
      ? payload
      : typeof payload?.name === 'string'
        ? payload.name
        : ''

  const characteristics =
    typeof payload?.characteristics === 'string' ? payload.characteristics.trim() : ''

  const trimmedName = name.trim().slice(0, MAX_NAME_LEN)
  const trimmedCharacteristics = characteristics.slice(0, MAX_CHARACTERISTICS_LEN)

  return {
    name: trimmedName,
    ...(trimmedCharacteristics ? { characteristics: trimmedCharacteristics } : {}),
  }
}

export const productPricesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchProductPrices: builder.mutation({
      query: (payload) => ({
        url: '/product-prices/search',
        method: 'POST',
        body: buildProductPriceSearchBody(payload),
      }),
    }),
  }),
})

export const { useSearchProductPricesMutation } = productPricesApi
