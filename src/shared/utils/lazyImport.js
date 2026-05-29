import { lazy } from 'react'

/**
 * Named export bilan lazy yuklash — default export majburiy emas.
 * @example const { HomePage } = lazyImport(() => import('@/pages/HomePage'), 'HomePage')
 */
export const lazyImport = (importFn, exportName) => ({
  [exportName]: lazy(() =>
    importFn().then((module) => ({ default: module[exportName] })),
  ),
})
