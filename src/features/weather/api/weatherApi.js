import { baseApi } from '@/shared/api/baseApi'

const TASHKENT_COORDS = {
  latitude: 41.2995,
  longitude: 69.2401,
}

const buildWeatherUrl = () => {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(TASHKENT_COORDS.latitude))
  url.searchParams.set('longitude', String(TASHKENT_COORDS.longitude))
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,weather_code',
  )
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min')
  url.searchParams.set('timezone', 'Asia/Tashkent')
  url.searchParams.set('forecast_days', '6')
  url.searchParams.set('wind_speed_unit', 'kmh')
  return url.toString()
}

export const weatherApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTashkentWeather: builder.query({
      async queryFn() {
        try {
          const response = await fetch(buildWeatherUrl())

          if (!response.ok) {
            return {
              error: {
                status: response.status,
                data: 'Ob-havo ma’lumotini yuklab bo‘lmadi',
              },
            }
          }

          const data = await response.json()
          return { data }
        } catch {
          return {
            error: {
              status: 'FETCH_ERROR',
              data: 'Ob-havo ma’lumotini yuklab bo‘lmadi',
            },
          }
        }
      },
      keepUnusedDataFor: 300,
    }),
  }),
})

export const { useGetTashkentWeatherQuery } = weatherApi
