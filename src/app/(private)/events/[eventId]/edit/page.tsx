import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import EventForm from "@/components/forms/EventForm";
import { db } from "@/drizzle/db";
import { notFound } from "next/navigation";

export const revalidate = 0; // Disable revalidation for this page

export default async function EditEventPage(props: {
  params: Promise<{ eventId: string }>;
}) {
  const params = await props.params;
  const { eventId } = params;

  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const event = await db.query.EventsTable.findFirst({
    where: ({ id, clerkUserId }, { and, eq }) =>
      and(eq(clerkUserId, userId), eq(id, eventId)),
  });

  if (!event) return notFound();

  return (
    <Card className="max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-3xl lg:text-4xl xl:text-5xl mb-6">
          Edit Event
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-4">
          This page is only accessible to authenticated users.
        </p>
        <Button asChild>
          <EventForm
            event={{ ...event, description: event.description || undefined }}
          />
        </Button>
      </CardContent>
    </Card>
  );
}
