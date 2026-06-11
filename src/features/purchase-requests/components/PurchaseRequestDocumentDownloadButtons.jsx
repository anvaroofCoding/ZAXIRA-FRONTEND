import DescriptionIcon from '@mui/icons-material/Description'
import Button from '@mui/material/Button'
import {
  hasSubmittedBildirgi,
  hasSubmittedKelishuv,
} from '@/features/purchase-requests/utils/purchaseRequestExport'

export const PurchaseRequestDocumentDownloadButtons = ({
  request,
  downloading = false,
  onDownloadBildirgi,
  onDownloadKelishuv,
  size = 'medium',
}) => {
  if (!request) {
    return null
  }

  const showBildirgi = hasSubmittedBildirgi(request) && typeof onDownloadBildirgi === 'function'
  const showKelishuv = hasSubmittedKelishuv(request) && typeof onDownloadKelishuv === 'function'

  if (!showBildirgi && !showKelishuv) {
    return null
  }

  return (
    <>
      {showBildirgi ? (
        <Button
          size={size}
          variant="outlined"
          startIcon={<DescriptionIcon fontSize="small" />}
          disabled={downloading}
          onClick={() => onDownloadBildirgi(request)}
        >
          Bildirgi
        </Button>
      ) : null}
      {showKelishuv ? (
        <Button
          size={size}
          variant="outlined"
          startIcon={<DescriptionIcon fontSize="small" />}
          disabled={downloading}
          onClick={() => onDownloadKelishuv(request)}
        >
          Kelishuv varaqasi
        </Button>
      ) : null}
    </>
  )
}
