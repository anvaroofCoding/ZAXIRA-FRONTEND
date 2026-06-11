export const exportSuperDocBlob = async (superdocInstance) => {
  if (!superdocInstance?.export) {
    throw new Error('Tahrirchi hali tayyor emas')
  }

  const blob = await superdocInstance.export({
    exportType: ['docx'],
    triggerDownload: false,
  })

  if (!blob || blob.size < 100) {
    throw new Error('Tahrirlangan hujjat bo‘sh — qayta saqlab ko‘ring')
  }

  return blob
}
