'use client'

import { usePathname } from "next/navigation"

function Header({page}) {
  const pathname = usePathname()
  return (
    <div className="mainHeader">
      {pathname == `/main/${page}` && page}
    </div>
  )
}

export default Header