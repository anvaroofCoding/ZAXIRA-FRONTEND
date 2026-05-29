import { Outlet, useLocation } from 'react-router-dom'

/** Har bir route almashishda Outlet child komponentini majburan yangilaydi. */
export const RouteKeyOutlet = () => {
  const location = useLocation()

  return <Outlet key={location.pathname} />
}
