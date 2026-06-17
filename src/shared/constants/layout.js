/** Barcha asosiy kontent va navbar uchun yagona kenglik */
export const APP_CONTAINER_WIDTH = '100%'

/** Navbar balandligi (Toolbar minHeight bilan mos) */
export const APP_NAVBAR_HEIGHT = { xs: 56, sm: 64 }

/** Desktop chap icon rail kengligi — navbar balandligi bilan teng */
export const APP_SIDE_RAIL_WIDTH = APP_NAVBAR_HEIGHT.sm

/** Mobil qurilmalarda kontent chetidan minimal masofa (safe-area bilan) */
export const APP_MOBILE_EDGE_PADDING = 16

export const appMobileSafePaddingSx = {
  pl: `max(${APP_MOBILE_EDGE_PADDING}px, env(safe-area-inset-left, 0px))`,
  pr: `max(${APP_MOBILE_EDGE_PADDING}px, env(safe-area-inset-right, 0px))`,
}
