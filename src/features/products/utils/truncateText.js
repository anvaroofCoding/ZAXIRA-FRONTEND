export const truncateText = (value, maxLength = 120) => {
  const text = String(value ?? '').trim()
  if (text.length <= maxLength) {
    return { text, truncated: false }
  }
  return {
    text: `${text.slice(0, maxLength).trimEnd()}…`,
    truncated: true,
  }
}
