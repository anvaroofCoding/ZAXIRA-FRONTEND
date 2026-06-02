import { useEffect, useMemo, useState } from 'react'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import SearchIcon from '@mui/icons-material/Search'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import StarIcon from '@mui/icons-material/Star'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import {
  buildProductPriceSearchBody,
  useSearchProductPricesMutation,
} from '@/features/product-prices/api/productPricesApi'
import {
  formatConvertedPriceLine,
  formatPriceValue,
} from '@/shared/utils/formatPrice'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const OfferSkeleton = () => (
  <Paper variant="outlined" sx={{ p: 2 }}>
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
      <Skeleton variant="circular" width={48} height={48} />
      <Box sx={{ flex: 1 }}>
        <Skeleton width="35%" height={22} />
        <Skeleton width="80%" height={18} sx={{ mt: 0.75 }} />
        <Skeleton width="25%" height={28} sx={{ mt: 1 }} />
      </Box>
    </Stack>
  </Paper>
)

const StoreLogo = ({ name, logoUrl }) => {
  const [failed, setFailed] = useState(false)

  if (!logoUrl || failed) {
    return (
      <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
        {(name || '?').charAt(0).toUpperCase()}
      </Avatar>
    )
  }

  return (
    <Avatar
      src={logoUrl}
      alt={name}
      sx={{ width: 48, height: 48, bgcolor: 'background.default' }}
      imgProps={{ onError: () => setFailed(true) }}
    />
  )
}

const OfferRow = ({ offer, isCheapest }) => {
  const originalFormatted =
    offer.priceLabel ||
    formatPriceValue(offer.priceValue, offer.currency || 'UZS') ||
    'Narx ko‘rsatilmagan'

  const convertedLine = formatConvertedPriceLine(offer.convertedPrices)

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderColor: isCheapest ? 'success.main' : 'divider',
        bgcolor: isCheapest ? 'action.hover' : 'background.paper',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 1,
        },
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
        <ListItemAvatar sx={{ minWidth: 0, mt: 0.25 }}>
          <StoreLogo name={offer.storeName} logoUrl={offer.logoUrl} />
        </ListItemAvatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              {offer.storeName}
            </Typography>
            {isCheapest ? (
              <Chip size="small" color="success" label="Eng arzon" sx={{ fontWeight: 600 }} />
            ) : null}
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {offer.title}
          </Typography>

          <Stack spacing={1} sx={{ mt: 1.25 }}>
            <Typography variant="h6" component="span" fontWeight={700} color="primary.main">
              {originalFormatted}
            </Typography>

            {convertedLine.length > 0 ? (
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                {convertedLine.map((row) => (
                  <Chip
                    key={row.code}
                    size="small"
                    variant="outlined"
                    label={row.formatted}
                    sx={{
                      fontWeight: row.code === 'UZS' ? 600 : 500,
                      borderColor:
                        row.code === 'UZS' ? 'primary.main' : 'divider',
                    }}
                  />
                ))}
              </Stack>
            ) : null}
          </Stack>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mt: 1, alignItems: 'center', flexWrap: 'wrap' }}
          >
            {offer.rating != null ? (
              <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
                <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                <Typography variant="caption" color="text.secondary">
                  {offer.rating.toFixed(1)}
                  {offer.reviewsCount != null ? ` (${offer.reviewsCount})` : ''}
                </Typography>
              </Stack>
            ) : null}

            {offer.deliveryNote ? (
              <Typography variant="caption" color="text.secondary">
                {offer.deliveryNote}
              </Typography>
            ) : null}
          </Stack>
        </Box>

        <Tooltip title="Do‘konda ochish">
          <IconButton
            component="a"
            href={offer.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            aria-label={`${offer.storeName} sahifasini ochish`}
          >
            <OpenInNewIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  )
}

export const ProductPriceCompareDialog = ({ open, item, onClose }) => {
  const [searchPrices, { data, isLoading, isError, error }] =
    useSearchProductPricesMutation()

  const googleUrl = useMemo(() => {
    if (!item?.name) return null
    const q = [item.name, item.characteristics, "O'zbekiston narx"]
      .filter(Boolean)
      .join(' ')
    return `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}`
  }, [item])

  useEffect(() => {
    if (!open || !item?.name?.trim()) return

    const body = buildProductPriceSearchBody(item)
    if (!body.name) return

    searchPrices(body)
  }, [open, item, searchPrices])

  const offers = data?.offers ?? []
  const cheapestUzs = offers.reduce((min, row) => {
    const uzs = row.convertedPrices?.uzs
    if (uzs == null) return min
    return min == null ? uzs : Math.min(min, uzs)
  }, null)

  const handleRefresh = () => {
    const body = buildProductPriceSearchBody(item)
    if (!body.name) return
    searchPrices(body)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <ShoppingBagOutlinedIcon color="primary" sx={{ mt: 0.25 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" component="div" fontWeight={700}>
              Bozordagi narxlar
            </Typography>
            {item ? (
              <>
                <Typography variant="subtitle2" sx={{ mt: 0.5 }} fontWeight={600}>
                  {item.name}
                </Typography>
                {item.quantity != null ? (
                  <Chip
                    size="small"
                    label={`Soni: ${item.quantity}`}
                    sx={{ mt: 1 }}
                    variant="outlined"
                  />
                ) : null}
              </>
            ) : null}
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Stack spacing={1.5}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ py: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <CircularProgress size={22} />
              <Typography variant="body2" color="text.secondary">
                Google Shopping va xalqaro do‘konlardan narxlar qidirilmoqda…
              </Typography>
            </Stack>
            <OfferSkeleton />
            <OfferSkeleton />
            <OfferSkeleton />
          </Stack>
        ) : null}

        {isError ? (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={handleRefresh}>
                Qayta
              </Button>
            }
          >
            {getApiErrorMessage(error, 'Narxlar topilmadi')}
          </Alert>
        ) : null}

        {!isLoading && !isError && offers.length === 0 ? (
          <Alert severity="info">
            Ushbu model bo‘yicha avtomatik narx topilmadi (yangi yoki kam sotiladigan tovar
            bo‘lishi mumkin). «Google Shopping» tugmasi orqali qo‘lda qidiring yoki «Yangilash»
            ni bosing.
          </Alert>
        ) : null}

        {!isLoading && offers.length > 0 ? (
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              {offers.length} ta do‘kondan topildi
              {data?.query ? ` · «${data.query}»` : ''}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Chipdagi so‘m, dollar va rubl — joriy kurs bo‘yicha taxminiy narx (Rossiya, AQSh va
              O‘zbekiston bozorlari).
            </Typography>
            <Divider />
            <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {offers.map((offer) => (
                <ListItem key={`${offer.storeName}-${offer.productUrl}`} disablePadding>
                  <OfferRow
                    offer={offer}
                    isCheapest={
                      cheapestUzs != null &&
                      offer.convertedPrices?.uzs != null &&
                      offer.convertedPrices.uzs === cheapestUzs
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onClose}>Yopish</Button>
        <Button
          variant="outlined"
          startIcon={<SearchIcon />}
          disabled={!googleUrl}
          component={googleUrl ? Link : 'button'}
          href={googleUrl ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Shopping
        </Button>
        <Button variant="contained" onClick={handleRefresh} disabled={isLoading || !item}>
          Yangilash
        </Button>
      </DialogActions>
    </Dialog>
  )
}
