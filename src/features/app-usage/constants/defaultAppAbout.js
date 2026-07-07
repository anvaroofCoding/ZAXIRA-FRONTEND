export const DEFAULT_APP_ABOUT = {
  title: 'ZAXIRA — zaxira va xaridlar boshqaruvi',
  subtitle: '',
  purpose:
    'ZAXIRA dasturi davlat va nodavlat tashkilotlarida moddiy zaxiralar, xarid jarayonlari, ombor operatsiyalari hamda ichki nazoratni raqamlashtirish uchun yaratilgan. Tizim xodimlarga ariza yuborishdan tortib tovarlarni qabul qilish, omborga joylashtirish, chiqim qilish va invertarizatsiya o‘tkazishgacha bo‘lgan butun zanjirni yagona axborot muhitida birlashtiradi. Maqsad — jarayonlarni shaffoflashtirish, inson omilini kamaytirish va rahbariyat uchun real vaqt rejimida ishonchli ma’lumot taqdim etish.',
  highlights: [
    {
      title: 'Xaridlar va arizalar',
      description:
        'Xarid arizalarini yuborish, kelishuvdan o‘tkazish, sotib olish va qabul qilish jarayonlarini tartibli yuritish.',
    },
    {
      title: 'Ombor va zaxira',
      description:
        'Ombor qoldiqlarini kuzatish, tovarlarni import qilish, chiqim berish va boshqa omborlar bilan ishlash.',
    },
    {
      title: 'Nazorat va hisobot',
      description:
        'Transfer, invertarizatsiya, statistika va kalendar orqali muddatlar hamda operatsiyalarni nazorat qilish.',
    },
    {
      title: 'Xavfsiz kirish',
      description:
        'Foydalanuvchi rollari, sahifa bo‘yicha ruxsatlar va faoliyat jurnali orqali tizimga nazoratli kirish.',
    },
  ],
}

export const isAppUsageApiMissing = (error) =>
  error?.status === 404 || error?.originalStatus === 404

export const isAppUsageQueryUnavailable = (queryState) =>
  isAppUsageApiMissing(queryState?.error) && !queryState?.isSuccess

const FAQ_API_UNAVAILABLE_STORAGE_KEY = 'zaxira:faq-api-unavailable'

const readFaqApiUnavailable = () => {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    return window.localStorage.getItem(FAQ_API_UNAVAILABLE_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

let faqApiUnavailable = readFaqApiUnavailable()

export const markFaqApiUnavailable = () => {
  faqApiUnavailable = true
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(FAQ_API_UNAVAILABLE_STORAGE_KEY, '1')
    } catch {
      // ignore storage errors
    }
  }
}

export const isFaqApiUnavailable = () => faqApiUnavailable
