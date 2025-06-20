import { db } from "@/drizzle/db";
import { clerkClient } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatEventDuration } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { displayFullName } from "@/lib/utils";

export const revalidate = 0;

export default async function BookingPage(props: {
  params: Promise<{ clerkUserId: string }>;
}) {
  const params = await props.params;
  const { clerkUserId } = params;

  console.log("clerkUserId ici ", clerkUserId);

  const events = await db.query.EventsTable.findMany({
    where: ({ clerkUserId: userIdCol, isActive }, { eq, and }) =>
      and(eq(userIdCol, clerkUserId), eq(isActive, true)), // Rename clerkUserId to userIdCol to avoid confusion with the one in params
    orderBy: ({ title }, { asc, sql }) => asc(sql`lower(${title})`),
  });

  if (events.length === 0) return notFound();

  // const user = await (await clerkClient()).users.getUser(clerkUserId); // one line but less clear
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(clerkUserId);

  const fullName = displayFullName(
    user.firstName,
    user.lastName,
    user.username,
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-4xl md:text-5xl font-semibold mb-4 text-center">
        {fullName}
      </div>

      <div className="text-muted-foreground mb-6 max-w-sm mx-auto text-center">
        Welcome to the scheduling page, please follow the instructions to add an
        event to the calendar.
      </div>

      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        {events.map((event) => (
          <EventCard key={event.id} {...event} />
        ))}
      </div>
    </div>
  );
}

type EventCardProps = {
  id: string;
  title: string;
  description: string | null; // Make description optional
  date: string;
  durationInMinutes: number;
  clerkUserId: string;
};

function EventCard({
  id,
  title,
  description,
  date,
  durationInMinutes,
  clerkUserId,
}: EventCardProps) {
  return (
    // <Card className="flex flex-col min-w-[220px] basis-[250px]">
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>title: {title}</CardTitle>
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
        )}
        {/* <p className="text-sm text-gray-500">Date: {new Date(date).toLocaleDateString()}</p> */}
      </CardDescription>
      <CardFooter className="flex justify-end w-full gap-2 mt-auto">
        <Button variant="default" asChild>
          <Link href={`/book/${clerkUserId}/edit/${id}`}>Select</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
