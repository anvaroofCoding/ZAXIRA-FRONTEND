import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationAsReadMutation,
} from '@/features/notifications/api/notificationsApi'

const ROWS_PER_PAGE_OPTIONS = [20, 50, 100]

const formatDateTime = (value) => {
  const date = dayjs(value)
  if (!date.isValid()) return ''
  return date.format('DD.MM.YYYY HH:mm')
}

export const NotificationsDrawer = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  const unreadQuery = useGetUnreadNotificationCountQuery(undefined, {
    pollingInterval: 60000,
  })

  const notificationsQuery = useGetNotificationsQuery(
    { page: page + 1, limit: rowsPerPage },
    { skip: !open },
  )

  const [markAsRead] = useMarkNotificationAsReadMutation()

  const unreadCount = unreadQuery.data ?? 0
  const items = notificationsQuery.data?.items ?? []
  const total = notificationsQuery.data?.total ?? 0

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleItemClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification.id).unwrap()
      } catch {
        // navigation still proceeds even if mark-read fails
      }
    }

    setOpen(false)
    navigate(notification.linkPath)
  }

  return (
    <>
      <IconButton color="inherit" aria-label="Bildirishnomalar" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsNoneOutlinedIcon />
        </Badge>
      </IconButton>

      <Drawer anchor="left" open={open} onClose={handleClose}>
        <Box
          sx={{
            width: { xs: '100vw', sm: 420 },
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="h6" fontWeight={700}>
              Bildirishnomalar
            </Typography>
            {unreadCount > 0 && (
              <Typography variant="body2" color="text.secondary">
                {unreadCount} ta o‘qilmagan
              </Typography>
            )}
          </Box>

          <Divider />

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {notificationsQuery.isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={28} />
              </Box>
            ) : items.length === 0 ? (
              <Typography sx={{ px: 2, py: 4 }} color="text.secondary">
                Bildirishnomalar yo‘q
              </Typography>
            ) : (
              <List disablePadding>
                {items.map((item) => (
                  <ListItemButton
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    sx={{
                      alignItems: 'flex-start',
                      bgcolor: item.isRead ? 'transparent' : 'action.hover',
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle2"
                          fontWeight={item.isRead ? 500 : 700}
                        >
                          {item.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.25, display: 'block' }}
                          >
                            {item.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            sx={{ mt: 0.5, display: 'block' }}
                          >
                            {formatDateTime(item.createdAt)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>

          <Divider />

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_event, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value))
              setPage(0)
            }}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            labelRowsPerPage="Sahifada:"
          />
        </Box>
      </Drawer>
    </>
  )
}
