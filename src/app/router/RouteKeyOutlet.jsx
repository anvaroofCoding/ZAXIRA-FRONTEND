import { useLocation, useOutlet } from 'react-router-dom'

/**
 * Har bir marshrut almashganda sahifa komponentini majburan yangilaydi.
 * `key` ni `<Outlet />` ga emas, `useOutlet()` natijasiga qo‘yish kerak (RR7).
 */
export const RouteKeyOutlet = () => {
  const location = useLocation()
  const outlet = useOutlet()

  return <div key={location.pathname}>{outlet}</div>
}
