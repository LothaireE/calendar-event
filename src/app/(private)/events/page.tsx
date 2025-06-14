import { CalendarPlus, CalendarRange } from "lucide-react";
import { db } from "@/drizzle/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEventDuration } from "@/lib/formatters";
import { CopyEventButton } from "@/components/CopyEventButton";
import { cn } from "@/lib/utils";

export const revalidate = 0; // Disable revalidation for this page

export default async function EventsPage() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn(); 
  
  const events = await db.query.EventsTable.findMany({
    orderBy: ({createdAt}, { desc }) => desc(createdAt),
    where: ({clerkUserId}, {eq}) => eq(clerkUserId, userId), // Replace with actual user ID logic
  });

  return (
    <>
      <div className="flex flex-col gap-4 items-baseline">
        <h1 className="text-center text-3xl lg:text-4xl xl:text-5xl mb-6">Event Private Page</h1>
        <p>This page is only accessible to authenticated users.</p>

        <Button asChild>
          <Link href="/events/create" className="flex items-center">
            <CalendarPlus className="mr-2 size-4" />
            Create New Event
          </Link>
        </Button>

        {events.length > 0 ? (
          <>
          <h1>Events</h1>
          <div className="grid gap-4 grids-cols-[repeat(auto-fill,minmax(400px,1fr))]">
            { events.map((event) => (
              <div key={event.id} className="flex flex-col items-center justify-center gap-4 text-center">
                <EventCard key={event.id} {...event} />
              </div>
            ))}
          </div>
          
          </>
        ):(
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <CalendarRange className="size-6" />
           <h1>Create your first event</h1>
           <Button size="lg" className="text-lg" asChild>
            <Link href="/events/create" className="flex items-center">
              <CalendarPlus className="mr-4 size-6" />
              Create New Event
            </Link>
          </Button>
          </div>
        )}
        
      </div>
    </>
 
  );
}

type EventCardProps = {
  id: string;
  title: string;
  description: string | null; // Make description optional
  date: string;
  durationInMinutes: number;
  isActive: boolean;
  clerkUserId: string;
};

function EventCard({ id, title, description, date, durationInMinutes, isActive, clerkUserId }
: EventCardProps
) {

  return (
    <Card className={cn("flex flex-col", isActive && "border-secondary")}>
      <CardHeader className={cn(!isActive && "opacity-50")}>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {new Date(date).toLocaleDateString()}
          <br />
          {formatEventDuration(durationInMinutes)}
        </CardDescription>
      </CardHeader>

      <CardDescription className="mb-2">
      {description !== null && (
        <CardContent>
                  <p className="text-sm text-gray-500">{description}</p>

        </CardContent>
      ) }
      {/* <p className="text-sm text-gray-500">Date: {new Date(date).toLocaleDateString()}</p> */}
      </CardDescription>
      <CardFooter
        className={`flex justify-end w-full gap-2 mt-auto`}
      >
        {isActive && <CopyEventButton eventId={id} clerkUserId={clerkUserId} variant="outline"/>}
        <Button asChild>
          <Link href={`/events/${id}/edit`}>
            Edit
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}