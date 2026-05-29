/** Ism va qavs ichida tuzilma qisqa nomi: «Ali Valiyev (IT)» */
export const formatMemberLabel = (member) => {
  if (!member) {
    return '—'
  }

  const base = member.displayName || member.login || '—'

  if (member.structureShortName?.trim()) {
    return `${base} (${member.structureShortName.trim()})`
  }

  return base
}
