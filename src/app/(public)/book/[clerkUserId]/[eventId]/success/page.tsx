import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { formatDateTime } from "@/lib/formatters";
import { displayFullName } from "@/lib/utils";
import { clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function SuccessPage(props: {
  params: Promise<{ clerkUserId: string; eventId: string }>;
  searchParams: Promise<{ startTime: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const { clerkUserId, eventId } = params;
  const { startTime } = searchParams;

  const event = await db.query.EventsTable.findFirst({
    where: ({ clerkUserId: userIdCol, isActive, id }, { eq, and }) =>
      and(eq(isActive, true), eq(userIdCol, clerkUserId), eq(id, eventId)),
  });

  if (event == null) return notFound();

  const client = await clerkClient();
  const calendarUser = await client.users.getUser(clerkUserId);
  const startTimeDate = new Date(startTime);
  const fullName = displayFullName(
    calendarUser.firstName,
    calendarUser.lastName,
  );
  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>
          Successfully Booked {event.title} with {fullName}
        </CardTitle>
        <CardDescription>{formatDateTime(startTimeDate)}</CardDescription>
      </CardHeader>
      <CardContent>
        You should receive an email confirmation shortly. You can safely close
        this page now.
      </CardContent>
    </Card>
  );
}
