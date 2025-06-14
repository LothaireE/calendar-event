import { ReactNode } from "react";
import {CalendarRange} from 'lucide-react';
import { UserButton } from "@clerk/nextjs";
import { HeaderNav } from "@/components/HeaderNav";

interface NavItem {
  title: string
  href: string
}

const privateLayoutNavItems: NavItem[] = [
  { title: 'Events', href: '/events' },
  { title: 'Schedule', href: '/schedule' },
//   { title: 'Profile', href: '/profile' },
]

// This layout is used for authenticated routes
// It wraps the children components in a flex container
export default function PrivateLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
    <header className="flex py-2 border-b bg-card">
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold">Private Layout</h1>
            <nav className="font-medium flex items-center text-sm gap-6 container">
                <div className="flex items-center gap-2 font-semibold mr-auto">
                    <CalendarRange className="size-6" />
                    <span className="sr-only md:not-sr-only">Calendar Event</span>
                </div>
                <div>
                    <HeaderNav items={privateLayoutNavItems} className="flex gap-6" />
                </div>
                <div className="ml-auto size-10">
                    <UserButton appearance={{ elements: { userButtonAvatarBox: "size-full"}}} />
                </div>
            </nav>
        </div>
    </header>
        <main className="container mx-auto my-6">
      {children}
    </main>
    </>

  );
}
