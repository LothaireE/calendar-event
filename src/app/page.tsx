import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import CalendarIcon from "@/assets/images/calendar-icon.avif";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId !== null) redirect("/events");

  return (
    <div className="text-center container mx-auto my-4 xl:py-16 lg:py-12 md:py-8 sm:py-4 py-2">
      <h1 className="text-3xl mb-4">Welcome to Calendar Event App</h1>
      <div className="flex justify-center mb-6 xl:mb-12 lg:mb-10 md:mb-8 sm:mb-6">
        <Image
          src={CalendarIcon}
          alt="Calendar Illustration"
          width={300}
          height={300}
        />
      </div>
      <p className="text-muted-foreground mb-6">
        Please sign in or sign up to manage your events.
      </p>
      <p className="text-muted-foreground mb-6">
        This is a demo app built with Next.js, Clerk, and Tailwind CSS designed
        to help you schedule meetings.
      </p>
      <p className="text-muted-foreground mb-6">
        You can create, view, and manage your events with ease using your Google
        Calendar.
      </p>
      <p className="text-muted-foreground mb-6">
        Please note that this is a demo app and does not store any data
        permanently.
      </p>
      <p className="text-muted-foreground mb-6">
        All data will be reset periodically.
      </p>
      <div className="flex gap-2 justify-center my-16">
        <Button asChild>
          <SignInButton />
        </Button>
        <Button asChild>
          <SignUpButton />
        </Button>
        <Button asChild>
          <UserButton />
        </Button>
      </div>
    </div>
  );
}
