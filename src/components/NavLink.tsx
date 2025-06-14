'use client'
// use client has to be at the top of the file every time hooks are used


import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ComponentProps } from 'react'
import { usePathname } from 'next/navigation'



export function NavLink ({ className, ...props }: ComponentProps<typeof Link>) {
    const path = usePathname()
    const isActive = path === props.href
    return (
    <Link
        className={cn(
            "transition-colors",
            isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            className
        )}
        {...props}
    />
    )
}