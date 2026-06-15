export const formatBossDocumentName = (boss) =>
  boss?.structureLeaderName?.trim() || boss?.displayName || boss?.login || '—'
