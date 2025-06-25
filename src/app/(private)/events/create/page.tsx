import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import EventForm from "@/components/forms/EventForm";

export default async function CreateEventPage() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  return (
    <Card className="max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-3xl lg:text-4xl xl:text-5xl mb-6">
          Create New Event
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="mb-4 text-muted-foreground">
          This page is only accessible to authenticated users.
        </p>
        <Button asChild>
          <EventForm />
        </Button>
      </CardContent>
    </Card>
  );
}
