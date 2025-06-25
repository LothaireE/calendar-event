import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/drizzle/db";
import ScheduleForm from "@/components/forms/ScheduleForm";

export const revalidate = 0; // Disable revalidation for this page

export default async function SchedulePage() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const schedule = await db.query.ScheduleTable.findFirst({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    with: { availabilities: true },
  });

  return (
    <Card className="max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-3xl lg:text-4xl xl:text-5xl mb-6">
          Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-4 text-muted-foreground">
          This page is only accessible to authenticated users.
        </p>
        <ScheduleForm schedule={schedule} />
      </CardContent>
    </Card>
  );
}
