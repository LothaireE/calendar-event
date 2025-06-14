import { auth } from "@clerk/nextjs/server";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

// This layout is used for authenticated routes
// It checks if the user is authenticated and redirects to the home page if not

export default async function AuthLayout({ children } : {  children: ReactNode}) {
    
    const { userId } = await auth();
    if (userId !== null) redirect("/");

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            {children}
        </div>
    );
}
