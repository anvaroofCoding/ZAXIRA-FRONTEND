import { Navigate } from 'react-router-dom'
import { MainLayout } from '@/shared/layouts/MainLayout'
import { lazyImport } from '@/shared/utils/lazyImport'
import { GuestRoute } from './GuestRoute'
import { PermissionRoute } from './PermissionRoute'
import { RequireAuth } from './RequireAuth'

const { DashboardPage } = lazyImport(() => import('@/pages/dashboard'), 'DashboardPage')
const { KalendarPage } = lazyImport(() => import('@/pages/dashboard'), 'KalendarPage')
const { MaxsulotlarPage } = lazyImport(
  () => import('@/pages/dashboard'),
  'MaxsulotlarPage',
)
const { LoginPage } = lazyImport(() => import('@/pages/LoginPage'), 'LoginPage')
const { NotFoundPage } = lazyImport(
  () => import('@/pages/NotFoundPage'),
  'NotFoundPage',
)
const { ForbiddenPage } = lazyImport(
  () => import('@/pages/ForbiddenPage'),
  'ForbiddenPage',
)

const { ArizalarYuborishPage } = lazyImport(
  () => import('@/pages/xaridlar/ArizalarYuborishPage'),
  'ArizalarYuborishPage',
)
const { ArizalarniTasdiqlashPage } = lazyImport(
  () => import('@/pages/xaridlar/ArizalarniTasdiqlashPage'),
  'ArizalarniTasdiqlashPage',
)
const { ArizalarTarixiPage } = lazyImport(
  () => import('@/pages/xaridlar/ArizalarTarixiPage'),
  'ArizalarTarixiPage',
)

const { SotibOlinadiganTovarlarPage } = lazyImport(
  () => import('@/pages/xarid-qilish/SotibOlinadiganTovarlarPage'),
  'SotibOlinadiganTovarlarPage',
)
const { XaridQilinganTovarlarPage } = lazyImport(
  () => import('@/pages/xarid-qilish/XaridQilinganTovarlarPage'),
  'XaridQilinganTovarlarPage',
)
const { XaridniQabulQilishPage } = lazyImport(
  () => import('@/pages/xarid-qilish/XaridniQabulQilishPage'),
  'XaridniQabulQilishPage',
)

const { MeningOmborimPage } = lazyImport(
  () => import('@/pages/omborlar'),
  'MeningOmborimPage',
)
const { TavarImportQilishPage } = lazyImport(
  () => import('@/pages/omborlar'),
  'TavarImportQilishPage',
)
const { BoshqaOmborlarPage } = lazyImport(
  () => import('@/pages/omborlar'),
  'BoshqaOmborlarPage',
)
const { Omborlar2DPage } = lazyImport(
  () => import('@/pages/omborlar'),
  'Omborlar2DPage',
)
const { ChiqimQilishPage } = lazyImport(
  () => import('@/pages/omborlar'),
  'ChiqimQilishPage',
)
const { ChiqimTarixiPage } = lazyImport(
  () => import('@/pages/omborlar'),
  'ChiqimTarixiPage',
)
const { AsosiyVositalarPage } = lazyImport(
  () => import('@/pages/omborlar'),
  'AsosiyVositalarPage',
)

const { TransferQilishPage } = lazyImport(
  () => import('@/pages/transfer'),
  'TransferQilishPage',
)
const { TransferniQabulQilishPage } = lazyImport(
  () => import('@/pages/transfer'),
  'TransferniQabulQilishPage',
)
const { TransferlarTarixiPage } = lazyImport(
  () => import('@/pages/transfer'),
  'TransferlarTarixiPage',
)

const { InvertarizatsiyaPage } = lazyImport(
  () => import('@/pages/invertarizatsiya/InvertarizatsiyaPage'),
  'InvertarizatsiyaPage',
)
const { BoshqaruvPage } = lazyImport(
  () => import('@/pages/invertarizatsiya/BoshqaruvPage'),
  'BoshqaruvPage',
)

const { FoydalanuvchilarPage } = lazyImport(
  () => import('@/pages/foydalanuvchilar'),
  'FoydalanuvchilarPage',
)
const { TuzilmalarPage } = lazyImport(
  () => import('@/pages/tuzilmalar'),
  'TuzilmalarPage',
)
const { KomissiyaAzolariPage } = lazyImport(
  () => import('@/pages/komissiya-azolari'),
  'KomissiyaAzolariPage',
)
const { SozlamalarPage } = lazyImport(
  () => import('@/pages/sozlamalar'),
  'SozlamalarPage',
)

const { PurchaseRequestVerifyPublicPage } = lazyImport(
  () => import('@/pages/public'),
  'PurchaseRequestVerifyPublicPage',
)
const { PurchaseRequestPdfPublicPage } = lazyImport(
  () => import('@/pages/public'),
  'PurchaseRequestPdfPublicPage',
)
const { NakladnoyPdfPublicPage } = lazyImport(
  () => import('@/pages/public'),
  'NakladnoyPdfPublicPage',
)

export const routes = [
  {
    path: '/public/ariza/tekshirish/:token',
    Component: PurchaseRequestVerifyPublicPage,
  },
  {
    path: '/public/ariza/:id/pdf',
    element: <PurchaseRequestPdfPublicPage variant="bildirgi" />,
  },
  {
    path: '/public/ariza/:id/kelishuv-pdf',
    element: <PurchaseRequestPdfPublicPage variant="kelishuv" />,
  },
  {
    path: '/public/nakladnoy/:id/pdf',
    Component: NakladnoyPdfPublicPage,
  },
  {
    path: '/403',
    Component: ForbiddenPage,
  },
  {
    element: <GuestRoute />,
    children: [
      {
        path: '/login',
        Component: LoginPage,
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            element: <PermissionRoute />,
            children: [
          {
            path: 'dashboard',
            Component: DashboardPage,
          },
          {
            path: 'dashboard/tavar-import',
            element: <Navigate to="/omborlar/tavar-import-qilish" replace />,
          },
          {
            path: 'dashboard/kalendar',
            Component: KalendarPage,
          },
          {
            path: 'dashboard/maxsulotlar',
            Component: MaxsulotlarPage,
          },
          {
            path: 'xaridlar/arizalar-yuborish',
            Component: ArizalarYuborishPage,
          },
          {
            path: 'xaridlar/arizalarni-tasdiqlash',
            Component: ArizalarniTasdiqlashPage,
          },
          {
            path: 'xaridlar/arizalar-tarixi',
            Component: ArizalarTarixiPage,
          },
          {
            path: 'xarid-qilish',
            element: <Navigate to="/xarid-qilish/sotib-olinadigan-tavarlar" replace />,
          },
          {
            path: 'xarid-qilish/sotib-olinadigan-tavarlar',
            Component: SotibOlinadiganTovarlarPage,
          },
          {
            path: 'xarid-qilish/xarid-qilingan-tavarlar',
            Component: XaridQilinganTovarlarPage,
          },
          {
            path: 'xarid-qilish/xaridni-qabul-qilish',
            Component: XaridniQabulQilishPage,
          },
          {
            path: 'omborlar/mening-omborim',
            Component: MeningOmborimPage,
          },
          {
            path: 'omborlar/tavar-import-qilish',
            Component: TavarImportQilishPage,
          },
          {
            path: 'omborlar/boshqa-omborlar',
            Component: BoshqaOmborlarPage,
          },
          {
            path: 'omborlar/2d-omborlar',
            Component: Omborlar2DPage,
          },
          {
            path: 'omborlar/chiqim-qilish',
            Component: ChiqimQilishPage,
          },
          {
            path: 'omborlar/asosiy-vositalar',
            Component: AsosiyVositalarPage,
          },
          {
            path: 'omborlar/chiqim-tarixi',
            Component: ChiqimTarixiPage,
          },
          {
            path: 'transfer/transfer-qilish',
            Component: TransferQilishPage,
          },
          {
            path: 'transfer/transferni-qabul-qilish',
            Component: TransferniQabulQilishPage,
          },
          {
            path: 'transfer/transferlar-tarixi',
            Component: TransferlarTarixiPage,
          },
          {
            path: 'invertarizatsiya',
            element: <Navigate to="/invertarizatsiya/invertarizatsiya-qilish" replace />,
          },
          {
            path: 'invertarizatsiya/invertarizatsiya-qilish',
            Component: InvertarizatsiyaPage,
          },
          {
            path: 'invertarizatsiya/barcha-invertarizatsiyalar',
            Component: InvertarizatsiyaPage,
          },
          {
            path: 'invertarizatsiya/boshqaruv',
            Component: BoshqaruvPage,
          },
          {
            path: 'sozlamalar',
            Component: SozlamalarPage,
          },
          {
            path: 'royxatga-olish/foydalanuvchilar',
            Component: FoydalanuvchilarPage,
          },
          {
            path: 'royxatga-olish/tuzilmalar',
            Component: TuzilmalarPage,
          },
          {
            path: 'royxatga-olish/komissiya-azolari',
            Component: KomissiyaAzolariPage,
          },
          {
            path: 'foydalanuvchilar',
            element: <Navigate to="/royxatga-olish/foydalanuvchilar" replace />,
          },
            ],
          },
          {
            path: '*',
            Component: NotFoundPage,
          },
        ],
      },
    ],
  },
]
