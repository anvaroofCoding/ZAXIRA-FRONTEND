export const buildSubmittedDocumentPath = (id, docType) =>
  `/purchase-requests/${id}/submitted-documents/${docType}`

export const buildSubmittedDocumentFilename = (request, docType) => {
  const file =
    docType === 'bildirgi' ? request?.submittedBildirgi : request?.submittedKelishuv

  if (file?.originalName) {
    return file.originalName
  }

  const prefix = docType === 'bildirgi' ? 'bildirgi' : 'kelishuv'
  return `${prefix}-${request?.requestCode ?? 'ariza'}.docx`
}

export const hasSubmittedBildirgi = (request) => Boolean(request?.submittedBildirgi)
export const hasSubmittedKelishuv = (request) => Boolean(request?.submittedKelishuv)
export const hasSubmittedDocuments = (request) =>
  hasSubmittedBildirgi(request) || hasSubmittedKelishuv(request)

export const downloadSubmittedDocument = async (
  downloadAuthenticatedFile,
  request,
  docType,
) => {
  const file =
    docType === 'bildirgi' ? request?.submittedBildirgi : request?.submittedKelishuv

  if (!file) {
    throw new Error('Tahrirlangan hujjat topilmadi')
  }

  await downloadAuthenticatedFile(
    buildSubmittedDocumentPath(request.id, docType),
    buildSubmittedDocumentFilename(request, docType),
  )
}
