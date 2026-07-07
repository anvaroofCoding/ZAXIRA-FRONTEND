import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
import AppRegistrationOutlinedIcon from '@mui/icons-material/AppRegistrationOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import ShoppingCartCheckoutOutlinedIcon from '@mui/icons-material/ShoppingCartCheckoutOutlined'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined'
import { SIDE_RAIL_ITEMS } from '@/shared/config/sideRailNavigation'

const iconByPath = Object.fromEntries(
  SIDE_RAIL_ITEMS.map(({ path, icon }) => [path, icon]),
)

/** Navbar guruhlari uchun doimiy iconlar */
export const NAV_TOP_LEVEL_ICONS = {
  Dashboard: DashboardOutlinedIcon,
  Xaridlar: ShoppingBagOutlinedIcon,
  'Xarid qilish': ShoppingCartCheckoutOutlinedIcon,
  Omborlar: WarehouseOutlinedIcon,
  Transfer: SwapHorizOutlinedIcon,
  Invertarizatsiya: Inventory2OutlinedIcon,
  Foydalanish: MenuBookOutlinedIcon,
  "Ro'yxatga olish": AppRegistrationOutlinedIcon,
}

export const resolveNavIcon = (item) => {
  if (item?.icon) {
    return item.icon
  }

  if (item?.path && iconByPath[item.path]) {
    return iconByPath[item.path]
  }

  if (item?.label && NAV_TOP_LEVEL_ICONS[item.label]) {
    return NAV_TOP_LEVEL_ICONS[item.label]
  }

  return null
}
