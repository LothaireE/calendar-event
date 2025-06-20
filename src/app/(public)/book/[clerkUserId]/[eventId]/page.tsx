import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import getValidTimesFromSchedule from "@/lib/getValidTimesFromSchedule";
import { displayFullName } from "@/lib/utils";
import { clerkClient } from "@clerk/nextjs/server";
import {
  addMonths,
  eachMinuteOfInterval,
  endOfDay,
  roundToNearestMinutes,
} from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";
import MeetingForm from "@/components/forms/MeetingForm";

const minutesGap = 15;

export const revalidate = 0;

export default async function BookEventPage(props: {
  params: Promise<{ clerkUserId: string; eventId: string }>;
}) {
  const params = await props.params;
  const { clerkUserId, eventId } = params;

  const event = await db.query.EventsTable.findFirst({
    where: ({ clerkUserId: userIdCol, isActive, id }, { eq, and }) =>
      and(eq(isActive, true), eq(userIdCol, clerkUserId), eq(id, eventId)),
  });

  if (!event) return notFound();

  const clerk = await clerkClient();
  const calendarUser = await clerk.users.getUser(clerkUserId);
  const fullName = displayFullName(
    calendarUser.firstName,
    calendarUser.lastName,
  );

  const startDate = roundToNearestMinutes(new Date(), {
    nearestTo: minutesGap, // round to the nearest fifteen minutes
    roundingMethod: "ceil",
  });
  const endDate = endOfDay(addMonths(startDate, 2));

  const validTimes = await getValidTimesFromSchedule(
    eachMinuteOfInterval(
      { start: startDate, end: endDate },
      { step: minutesGap },
    ),
    event,
  ); // passing an array of every fifteen minutes value between the start date and 2 month later

  if (validTimes.length === 0) {
    return (
      <NoTimeSlots event={event} calendarUser={{ ...calendarUser, fullName }} />
    );
  }

  return (
    // <div className="flex flex-col items-center justify-center h-screen">
    <div className="items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Book Event Page</h1>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>
            Book {event.title} with {fullName}
          </CardTitle>
          {event.description && (
            <CardDescription>{event.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <MeetingForm
            validTimes={validTimes}
            eventId={event.id}
            clerkUserId={clerkUserId}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function NoTimeSlots({
  event,
  calendarUser,
}: {
  event: { title: string; description: string | null };
  calendarUser: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string;
  };
}) {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>
          Book {event.title} with {calendarUser.fullName}
        </CardTitle>
        {event.description && (
          <CardDescription>{event.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {calendarUser.fullName} is currently booked up. Please check back later
        or choose a shorter event.
      </CardContent>
      <CardFooter>
        <Button asChild>
          <Link href={`/book/${calendarUser.id}`}>Choose Another Event</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
