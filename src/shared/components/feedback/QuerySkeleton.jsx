import { PageContentSkeleton } from '@/shared/components/skeleton'

/**
 * RTK Query va boshqa async holatlar uchun skeleton wrapper.
 * Birinchi yuklashda skeleton, ma'lumot kelgach — children.
 */
export const QuerySkeleton = ({
  isLoading = false,
  isFetching = false,
  isUninitialized = false,
  data,
  hasData,
  skeleton = null,
  children,
}) => {
  const resolvedHasData =
    hasData ?? (Array.isArray(data) ? data.length > 0 : Boolean(data))

  const showSkeleton =
    !resolvedHasData && (isLoading || isUninitialized || (isFetching && !data))

  if (showSkeleton) {
    return skeleton ?? <PageContentSkeleton />
  }

  return children
}
