import { clerkClient } from "@clerk/nextjs/server";
import "use-server";
import { google } from "googleapis";
import { startOfDay, endOfDay, addMinutes } from "date-fns";

export async function getCalendarEventTime(
  clerkUserId: string,
  { start, end }: { start: Date; end: Date },
) {
  const oAuthClient = await getOAuthClient(clerkUserId);

  const events = await google.calendar("v3").events.list({
    calendarId: "primary",
    eventTypes: ["default"],
    singleEvents: true,
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    maxResults: 2500,
    auth: oAuthClient,
  });

  return (
    events.data.items
      ?.map((event) => {
        if (
          (event?.start?.date != null || event?.end?.date != null) &&
          event?.start?.date !== undefined &&
          event?.end?.date !== undefined
        ) {
          return {
            start: startOfDay(event.start.date as string),
            end: endOfDay(event.end.date as string),
          };
        }
        if (
          (event?.start?.dateTime != null || event?.end?.dateTime != null) &&
          event?.start?.dateTime !== undefined &&
          event?.end?.dateTime !== undefined
        ) {
          return {
            start: new Date(event.start.dateTime as string),
            end: new Date(event.end.dateTime as string),
          };
        }
      })
      .filter((date) => date != null) || []
  );
}

export async function createCalendarEvent({
  clerkUserId,
  guestName,
  guestEmail,
  startTime,
  guestNotes,
  durationInMinutes,
  eventTitle,
}: {
  clerkUserId: string;
  guestName: string;
  guestEmail: string;
  startTime: Date;
  guestNotes?: string | null;
  durationInMinutes: number;
  eventTitle: string;
}) {
  const oAuthClient = await getOAuthClient(clerkUserId);
  const client = await clerkClient();
  const calendarUser = await client.users.getUser(clerkUserId);

  if (calendarUser.primaryEmailAddress == null)
    throw new Error("Clerk user has no Email.");

  const calendarEvent = await google.calendar("v3").events.insert({
    calendarId: "primary",
    auth: oAuthClient,
    sendUpdates: "all",
    requestBody: {
      attendees: [
        { email: guestEmail, displayName: guestName },
        {
          email: calendarUser.primaryEmailAddress.emailAddress,
          displayName: calendarUser.fullName,
          responseStatus: "accepted",
        },
      ],
      description: guestNotes ? `Additional details: ${guestNotes}` : undefined,
      start: {
        dateTime: startTime.toISOString(),
      },
      end: {
        dateTime: addMinutes(startTime, durationInMinutes).toISOString(),
      },
      summary: `${guestName} - ${calendarUser.fullName}: ${eventTitle}`,
    },
  });

  return calendarEvent.data;
}

async function getOAuthClient(clerkUserId: string) {
  const provider = "google";

  const clerk = await clerkClient();
  const token = await clerk.users.getUserOauthAccessToken(
    clerkUserId,
    provider,
  );
  if (token.data.length === 0 || token.data[0].token == null) return;

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URL,
  );

  client.setCredentials({ access_token: token.data[0].token });

  return client;
}
