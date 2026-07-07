export const NAV_ITEMS = [
  {
    type: 'link',
    label: 'Dashboard',
    path: '/dashboard',
  },
  {
    type: 'group',
    label: 'Xaridlar',
    children: [
      { label: 'Arizalar yuborish', path: '/xaridlar/arizalar-yuborish' },
      { label: 'Arizalarni tasdiqlash', path: '/xaridlar/arizalarni-tasdiqlash' },
      { label: 'Arizalar tarixi', path: '/xaridlar/arizalar-tarixi' },
      { label: 'Sotib olish statistikasi', path: '/xaridlar/sotib-olish-statistikasi' },
    ],
  },
  {
    type: 'group',
    label: 'Xarid qilish',
    children: [
      { label: 'Sotib olinadigan maxsulotlar', path: '/xarid-qilish/sotib-olinadigan-tavarlar' },
      { label: 'Xarid qilingan tavarlar', path: '/xarid-qilish/xarid-qilingan-tavarlar' },
      { label: 'Xaridni qabul qilish', path: '/xarid-qilish/xaridni-qabul-qilish', badgeKey: 'warehouse-receipt' },
      { label: 'Ishonchnoma', path: '/xarid-qilish/ishonchnoma' },
    ],
  },
  {
    type: 'group',
    label: 'Omborlar',
    children: [
      { label: 'Tavar import qilish', path: '/omborlar/tavar-import-qilish' },
      { label: 'Mening omborim', path: '/omborlar/mening-omborim' },
      { label: 'Boshqa omborlar', path: '/omborlar/boshqa-omborlar' },
    ],
  },
  {
    type: 'group',
    label: 'Transfer',
    children: [
      { label: 'Transfer qilish', path: '/transfer/transfer-qilish' },
      { label: 'Transferni qabul qilish', path: '/transfer/transferni-qabul-qilish' },
      { label: 'Transferlar tarixi', path: '/transfer/transferlar-tarixi' },
    ],
  },
  {
    type: 'group',
    label: 'Invertarizatsiya',
    children: [
      { label: 'Invertarizatsiya qilish', path: '/invertarizatsiya/invertarizatsiya-qilish' },
      {
        label: 'Barcha invertarizatsiyalar',
        path: '/invertarizatsiya/barcha-invertarizatsiyalar',
      },
      { label: 'Boshqaruv', path: '/invertarizatsiya/boshqaruv' },
    ],
  },
  {
    type: 'group',
    label: "Ro'yxatga olish",
    children: [
      { label: 'Foydalanuvchilar', path: '/royxatga-olish/foydalanuvchilar' },
      { label: 'Tarkibiy tuzilmalar', path: '/royxatga-olish/tuzilmalar' },
      { label: "Komissiya a'zolari", path: '/royxatga-olish/komissiya-azolari' },
      { label: 'Birliklar', path: '/royxatga-olish/birliklar' },
      { label: 'Vazifa berish', path: '/royxatga-olish/vazifa-berish' },
    ],
  },
]
