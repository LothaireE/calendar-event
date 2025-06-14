import { NavLink } from './NavLink'

export interface NavItem {
  title: string
  href: string
}

interface HeaderNavProps {
  items: NavItem[]
  className?: string
}

export function HeaderNav({ items, className }: HeaderNavProps) {
  return (
    <nav className={className}>
      {items.map(({ title, href }) => (
        <NavLink key={href} href={href} className="text-sm font-medium">
          {title}
        </NavLink>
      ))}
    </nav>
  )
}