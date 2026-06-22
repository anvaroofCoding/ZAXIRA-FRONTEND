import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined'
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined'
import PrecisionManufacturingOutlinedIcon from '@mui/icons-material/PrecisionManufacturingOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import ShoppingCartCheckoutOutlinedIcon from '@mui/icons-material/ShoppingCartCheckoutOutlined'
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined'
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined'
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined'
import OutputOutlinedIcon from '@mui/icons-material/OutputOutlined'

/** Desktop chap icon rail — har bir sahifa alohida icon */
export const SIDE_RAIL_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardOutlinedIcon },

  { label: 'Arizalar yuborish', path: '/xaridlar/arizalar-yuborish', icon: SendOutlinedIcon, dividerBefore: true },
  { label: 'Arizalarni tasdiqlash', path: '/xaridlar/arizalarni-tasdiqlash', icon: FactCheckOutlinedIcon },
  { label: 'Arizalar tarixi', path: '/xaridlar/arizalar-tarixi', icon: HistoryOutlinedIcon },
  {
    label: 'Sotib olish statistikasi',
    path: '/xaridlar/sotib-olish-statistikasi',
    icon: BarChartOutlinedIcon,
  },

  {
    label: 'Sotib olinadigan maxsulotlar',
    path: '/xarid-qilish/sotib-olinadigan-tavarlar',
    icon: ShoppingCartCheckoutOutlinedIcon,
    dividerBefore: true,
  },
  {
    label: 'Xarid qilingan tavarlar',
    path: '/xarid-qilish/xarid-qilingan-tavarlar',
    icon: ReceiptLongOutlinedIcon,
  },
  {
    label: 'Xaridni qabul qilish',
    path: '/xarid-qilish/xaridni-qabul-qilish',
    icon: LocalShippingOutlinedIcon,
    badgeKey: 'warehouse-receipt',
  },
  {
    label: 'Ishonchnoma',
    path: '/xarid-qilish/ishonchnoma',
    icon: FileUploadOutlinedIcon,
  },

  { label: 'Tavar import qilish', path: '/omborlar/tavar-import-qilish', icon: FileUploadOutlinedIcon, dividerBefore: true },
  { label: 'Mening omborim', path: '/omborlar/mening-omborim', icon: StoreOutlinedIcon },
  { label: 'Boshqa omborlar', path: '/omborlar/boshqa-omborlar', icon: WarehouseOutlinedIcon },
  { label: 'Chiqim qilish', path: '/omborlar/chiqim-qilish', icon: OutputOutlinedIcon },
  { label: 'Chiqim tarixi', path: '/omborlar/chiqim-tarixi', icon: HistoryOutlinedIcon },
  { label: 'Asosiy vositalar', path: '/omborlar/asosiy-vositalar', icon: PrecisionManufacturingOutlinedIcon },

  { label: 'Transfer qilish', path: '/transfer/transfer-qilish', icon: SwapHorizOutlinedIcon, dividerBefore: true },
  { label: 'Transferni qabul qilish', path: '/transfer/transferni-qabul-qilish', icon: MoveToInboxOutlinedIcon },
  { label: 'Transferlar tarixi', path: '/transfer/transferlar-tarixi', icon: HistoryOutlinedIcon },

  {
    label: 'Invertarizatsiya qilish',
    path: '/invertarizatsiya/invertarizatsiya-qilish',
    icon: Inventory2OutlinedIcon,
    dividerBefore: true,
  },
  {
    label: 'Barcha invertarizatsiyalar',
    path: '/invertarizatsiya/barcha-invertarizatsiyalar',
    icon: ChecklistOutlinedIcon,
  },
  { label: 'Invertarizatsiya boshqaruvi', path: '/invertarizatsiya/boshqaruv', icon: AdminPanelSettingsOutlinedIcon },

  { label: 'Kalendar', path: '/dashboard/kalendar', icon: CalendarMonthOutlinedIcon, dividerBefore: true },
  { label: 'Maxsulotlar', path: '/dashboard/maxsulotlar', icon: CategoryOutlinedIcon },

  { label: 'Foydalanuvchilar', path: '/royxatga-olish/foydalanuvchilar', icon: PeopleOutlinedIcon, dividerBefore: true },
  { label: 'Tarkibiy tuzilmalar', path: '/royxatga-olish/tuzilmalar', icon: AccountTreeOutlinedIcon },
  { label: "Komissiya a'zolari", path: '/royxatga-olish/komissiya-azolari', icon: GroupsOutlinedIcon },

  { label: 'Sozlamalar', path: '/sozlamalar', icon: SettingsOutlinedIcon, dividerBefore: true },
]
