import { Navigate } from 'react-router-dom'
import { MainLayout } from '@/shared/layouts/MainLayout'
import { lazyImport } from '@/shared/utils/lazyImport'
import { GuestRoute } from './GuestRoute'
import { PermissionRoute } from './PermissionRoute'
import { RequireAuth } from './RequireAuth'

const { DashboardPage } = lazyImport(() => import('@/pages/dashboard'), 'DashboardPage')
const { LoginPage } = lazyImport(() => import('@/pages/LoginPage'), 'LoginPage')
const { NotFoundPage } = lazyImport(
  () => import('@/pages/NotFoundPage'),
  'NotFoundPage',
)

const { ArizalarYuborishPage } = lazyImport(
  () => import('@/pages/xaridlar'),
  'ArizalarYuborishPage',
)
const { ArizalarniTasdiqlashPage } = lazyImport(
  () => import('@/pages/xaridlar'),
  'ArizalarniTasdiqlashPage',
)
const { ArizalarTarixiPage } = lazyImport(
  () => import('@/pages/xaridlar'),
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
const { BoshqaOmborlarPage } = lazyImport(
  () => import('@/pages/omborlar'),
  'BoshqaOmborlarPage',
)
const { ChiqimQilishPage } = lazyImport(
  () => import('@/pages/omborlar'),
  'ChiqimQilishPage',
)
const { ChiqimTarixiPage } = lazyImport(
  () => import('@/pages/omborlar'),
  'ChiqimTarixiPage',
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

export const routes = [
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
            path: 'omborlar/boshqa-omborlar',
            Component: BoshqaOmborlarPage,
          },
          {
            path: 'omborlar/chiqim-qilish',
            Component: ChiqimQilishPage,
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
            path: 'royxatga-olish/foydalanuvchilar',
            Component: FoydalanuvchilarPage,
          },
          {
            path: 'royxatga-olish/tuzilmalar',
            Component: TuzilmalarPage,
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
