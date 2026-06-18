const parseApiErrorMessage = async (response, fallback) => {
  try {
    const payload = await response.json()
    const raw = payload?.message ?? payload?.error ?? fallback
    return Array.isArray(raw) ? raw[0] ?? fallback : raw ?? fallback
  } catch {
    return fallback
  }
}

export const openPdfFromApiUrl = async (apiUrl, { headers } = {}) => {
  const response = await fetch(apiUrl, { headers })

  if (!response.ok) {
    throw new Error(
      await parseApiErrorMessage(response, 'PDF faylni ochib bo‘lmadi'),
    )
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/pdf')) {
    throw new Error(
      await parseApiErrorMessage(
        response,
        'Server PDF o‘rniga noto‘g‘ri javob qaytardi',
      ),
    )
  }

  const blob = await response.blob()
  const pdfBlob =
    blob.type === 'application/pdf'
      ? blob
      : new Blob([blob], { type: 'application/pdf' })
  const blobUrl = window.URL.createObjectURL(pdfBlob)
  window.location.replace(blobUrl)
}
