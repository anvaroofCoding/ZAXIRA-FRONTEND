/** Faol va ombori bor tuzilmalar (ombor selectlari uchun). */
export const filterStructuresWithWarehouse = (structures) =>
  (structures ?? []).filter(
    (structure) => structure.isActive !== false && structure.hasWarehouse === true,
  )
