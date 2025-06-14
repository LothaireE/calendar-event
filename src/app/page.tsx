import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
    const { userId } = await auth();
    if (userId !== null) redirect("/events");

  return (
    <div className="text-center container mx-auto my-4">
      <h1 className="text-3xl mb-4">Welcome to Calendar Event App</h1>
      <div className="flex gap-2 justify-center">
        <Button asChild>
          <SignInButton />
        </Button>

        <Button asChild>
          <SignUpButton />
        </Button>
        <Button >
          <UserButton />
        </Button>
      </div>
    </div>
  );
}
