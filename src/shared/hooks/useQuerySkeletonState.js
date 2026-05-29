/**
 * RTK Query hook natijasidan skeleton holatini ajratib beradi.
 * @example const { data, ...queryState } = useGetUsersQuery()
 * const skeleton = useQuerySkeletonState(queryState, data)
 */
export const useQuerySkeletonState = (
  { isLoading, isFetching, isUninitialized },
  data,
) => {
  const hasData = Array.isArray(data) ? data.length > 0 : Boolean(data)

  return {
    hasData,
    showSkeleton: !hasData && (isLoading || isUninitialized || isFetching),
    isLoading,
    isFetching,
    isUninitialized,
  }
}
