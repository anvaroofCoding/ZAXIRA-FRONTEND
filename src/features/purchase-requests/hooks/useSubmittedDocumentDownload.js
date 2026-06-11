import { useCallback, useState } from 'react'
import { downloadSubmittedDocument } from '@/features/purchase-requests/utils/purchaseRequestExport'
import { downloadAuthenticatedFile } from '@/shared/utils/downloadFile'

export const useSubmittedDocumentDownload = ({ onError } = {}) => {
  const [downloadingId, setDownloadingId] = useState(null)

  const handleDownload = useCallback(
    async (request, docType) => {
      if (!request?.id) return

      setDownloadingId(request.id)

      try {
        await downloadSubmittedDocument(downloadAuthenticatedFile, request, docType)
      } catch (error) {
        onError?.(error)
        throw error
      } finally {
        setDownloadingId(null)
      }
    },
    [onError],
  )

  const downloadHandlers = {
    onDownloadBildirgi: (request) => handleDownload(request, 'bildirgi'),
    onDownloadKelishuv: (request) => handleDownload(request, 'kelishuv'),
  }

  return {
    downloadingId,
    handleDownload,
    downloadHandlers,
  }
}
