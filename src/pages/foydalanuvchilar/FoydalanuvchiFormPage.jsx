import { useEffect } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useGetStructuresQuery } from '@/features/structures/api/structuresApi'
import { UserForm } from '@/features/users/components/UserForm'
import { UserFormPageSkeleton } from '@/features/users/components/UserFormPageSkeleton'
import {
  useCreateUserMutation,
  useGetPermissionCatalogQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from '@/features/users/api/usersApi'
import { USERS_PAGE_PATH } from '@/features/permissions/constants'
import { hasPageAction } from '@/features/permissions/utils/permissions'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { showNotification } from '@/shared/model/notificationSlice'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

export const FoydalanuvchiFormPage = ({ mode = 'create' }) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { userId } = useParams()
  const { user: authUser } = usePermissions()

  const isSuperAdmin =
    authUser?.isSuperAdmin || authUser?.role === 'SUPER_ADMIN'

  const canCreate =
    isSuperAdmin || hasPageAction(authUser, USERS_PAGE_PATH, 'create')
  const canUpdate =
    isSuperAdmin || hasPageAction(authUser, USERS_PAGE_PATH, 'update')

  const catalogQuery = useGetPermissionCatalogQuery()
  const structuresQuery = useGetStructuresQuery()
  const userQuery = useGetUserByIdQuery(userId, {
    skip: mode !== 'edit' || !userId,
  })

  const [createUser, createState] = useCreateUserMutation()
  const [updateUser, updateState] = useUpdateUserMutation()

  const isSaving = createState.isLoading || updateState.isLoading
  const catalog = catalogQuery.data
  const structures = structuresQuery.data ?? []

  useEffect(() => {
    if (mode === 'create' && !canCreate) {
      navigate(USERS_PAGE_PATH, { replace: true })
    }
    if (mode === 'edit' && !canUpdate) {
      navigate(USERS_PAGE_PATH, { replace: true })
    }
  }, [canCreate, canUpdate, mode, navigate])

  if (mode === 'create' && !canCreate) {
    return <Navigate to={USERS_PAGE_PATH} replace />
  }

  if (mode === 'edit' && !canUpdate) {
    return <Navigate to={USERS_PAGE_PATH} replace />
  }

  const handleCancel = () => {
    if (isSaving) return
    navigate(USERS_PAGE_PATH)
  }

  const handleSubmit = async (payload) => {
    try {
      if (mode === 'create') {
        await createUser(payload).unwrap()
        dispatch(
          showNotification({
            message: 'Foydalanuvchi qo‘shildi',
            severity: 'success',
          }),
        )
      } else {
        await updateUser({ id: userId, ...payload }).unwrap()
        dispatch(
          showNotification({
            message: 'Foydalanuvchi yangilandi',
            severity: 'success',
          }),
        )
      }
      navigate(USERS_PAGE_PATH)
    } catch (error) {
      const message = getApiErrorMessage(error, 'Saqlashda xatolik')
      throw new Error(message, { cause: error })
    }
  }

  if (mode === 'edit') {
    if (userQuery.isError) {
      return (
        <Box sx={{ width: '100%' }}>
          <Alert severity="error">
            {getApiErrorMessage(userQuery.error, 'Foydalanuvchini yuklab bo‘lmadi')}
          </Alert>
        </Box>
      )
    }

    const isUserReady =
      !userQuery.isLoading && !userQuery.isUninitialized && Boolean(userQuery.data)

    return (
      <QuerySkeleton
        isLoading={userQuery.isLoading}
        isFetching={userQuery.isFetching}
        isUninitialized={userQuery.isUninitialized}
        hasData={isUserReady}
        skeleton={<UserFormPageSkeleton mode="edit" />}
      >
        <UserForm
          mode="edit"
          initialUser={userQuery.data}
          catalog={catalog}
          catalogLoading={catalogQuery.isLoading}
          structures={structures}
          structuresLoading={structuresQuery.isLoading}
          loading={isSaving}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      </QuerySkeleton>
    )
  }

  return (
    <UserForm
      mode="create"
      catalog={catalog}
      catalogLoading={catalogQuery.isLoading}
      structures={structures}
      structuresLoading={structuresQuery.isLoading}
      loading={isSaving}
      onCancel={handleCancel}
      onSubmit={handleSubmit}
    />
  )
}

export const FoydalanuvchiYaratishPage = () => (
  <FoydalanuvchiFormPage mode="create" />
)

export const FoydalanuvchiTahrirlashPage = () => (
  <FoydalanuvchiFormPage mode="edit" />
)
