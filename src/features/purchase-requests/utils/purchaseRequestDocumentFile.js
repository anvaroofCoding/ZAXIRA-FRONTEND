export const PURCHASE_REQUEST_DOCUMENT_ACCEPT =
  '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export const MANUAL_DOCUMENTS_REQUIRED_MESSAGE =
  'Qo‘lda yuklash rejimida bildirgi va kelishuv Word fayllari yuborilishi shart'

export const PURCHASE_REQUEST_DOCUMENT_MAX_BYTES = 10 * 1024 * 1024

export const isPurchaseRequestDocxFile = (file) => {
  if (!file || typeof file.name !== 'string') return false
  return file.name.toLowerCase().endsWith('.docx')
}

export const getPurchaseRequestDocumentFileError = (file, label) => {
  if (!file) {
    return `${label} faylini tanlang`
  }

  if (!isPurchaseRequestDocxFile(file)) {
    return `${label} faqat .docx formatida bo‘lishi kerak`
  }

  if (file.size > PURCHASE_REQUEST_DOCUMENT_MAX_BYTES) {
    return `${label} hajmi 10 MB dan oshmasligi kerak`
  }

  return ''
}

export const validateManualPurchaseDocuments = (bildirgiFile, kelishuvFile) => {
  const bildirgi = getPurchaseRequestDocumentFileError(bildirgiFile, 'Bildirgi')
  const kelishuv = getPurchaseRequestDocumentFileError(
    kelishuvFile,
    'Kelishuv varaqasi',
  )

  return {
    bildirgi,
    kelishuv,
    hasError: Boolean(bildirgi || kelishuv),
  }
}
