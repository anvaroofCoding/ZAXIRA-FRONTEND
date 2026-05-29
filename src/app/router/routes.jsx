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
  () => import('@/pages/invertarizatsiya'),
  'InvertarizatsiyaPage',
)
const { BoshqaruvPage } = lazyImport(
  () => import('@/pages/invertarizatsiya'),
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
        element: <LoginPage />,
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
            element: <DashboardPage />,
          },
          {
            path: 'xaridlar/arizalar-yuborish',
            element: <ArizalarYuborishPage />,
          },
          {
            path: 'xaridlar/arizalarni-tasdiqlash',
            element: <ArizalarniTasdiqlashPage />,
          },
          {
            path: 'xaridlar/arizalar-tarixi',
            element: <ArizalarTarixiPage />,
          },
          {
            path: 'xarid-qilish',
            element: <Navigate to="/xarid-qilish/sotib-olinadigan-tavarlar" replace />,
          },
          {
            path: 'xarid-qilish/sotib-olinadigan-tavarlar',
            element: <SotibOlinadiganTovarlarPage />,
          },
          {
            path: 'xarid-qilish/xarid-qilingan-tavarlar',
            element: <XaridQilinganTovarlarPage />,
          },
          {
            path: 'xarid-qilish/xaridni-qabul-qilish',
            element: <XaridniQabulQilishPage />,
          },
          {
            path: 'omborlar/mening-omborim',
            element: <MeningOmborimPage />,
          },
          {
            path: 'omborlar/boshqa-omborlar',
            element: <BoshqaOmborlarPage />,
          },
          {
            path: 'omborlar/chiqim-qilish',
            element: <ChiqimQilishPage />,
          },
          {
            path: 'omborlar/chiqim-tarixi',
            element: <ChiqimTarixiPage />,
          },
          {
            path: 'transfer/transfer-qilish',
            element: <TransferQilishPage />,
          },
          {
            path: 'transfer/transferni-qabul-qilish',
            element: <TransferniQabulQilishPage />,
          },
          {
            path: 'transfer/transferlar-tarixi',
            element: <TransferlarTarixiPage />,
          },
          {
            path: 'invertarizatsiya',
            element: <Navigate to="/invertarizatsiya/invertarizatsiya-qilish" replace />,
          },
          {
            path: 'invertarizatsiya/invertarizatsiya-qilish',
            element: <InvertarizatsiyaPage />,
          },
          {
            path: 'invertarizatsiya/barcha-invertarizatsiyalar',
            element: <InvertarizatsiyaPage />,
          },
          {
            path: 'invertarizatsiya/boshqaruv',
            element: <BoshqaruvPage />,
          },
          {
            path: 'royxatga-olish/foydalanuvchilar',
            element: <FoydalanuvchilarPage />,
          },
          {
            path: 'royxatga-olish/tuzilmalar',
            element: <TuzilmalarPage />,
          },
          {
            path: 'foydalanuvchilar',
            element: <Navigate to="/royxatga-olish/foydalanuvchilar" replace />,
          },
            ],
          },
          {
            path: '*',
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
]
