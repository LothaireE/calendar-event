import { clerkClient } from "@clerk/nextjs/server"
import "use-server"
import { google } from "googleapis"
import { startOfDay, endOfDay } from "date-fns"

export async function getCalendarEventTime(clerkUserid:string, {start, end}:{start: Date, end: Date}) {
    const oAuthClient = await getOAuthClient(clerkUserid)

    const events = await google.calendar("v3").events.list({
        calendarId: "primary",
        eventTypes: ["default"],
        singleEvents: true,
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        maxResults: 2500,
        auth: oAuthClient
    })

    return events.data.items?.map(event => {
        if (
            (event?.start?.date != null || event?.end?.date != null) &&
            event?.start?.date !== undefined &&
            event?.end?.date !== undefined
        ) {
            return {
                start: startOfDay(event.start.date as string),
                end: endOfDay(event.end.date as string)
            }
        }
        if (
            (event?.start?.dateTime != null || event?.end?.dateTime != null) &&
            event?.start?.dateTime !== undefined &&
            event?.end?.dateTime !== undefined
        ) {
            return {
                start: new Date(event.start.dateTime as string),
                end: new Date(event.end.dateTime as string)
            }
        }
        // return undefined
    }).filter(date => date != null) || []

}

async function getOAuthClient(clerkUserid:string) {
    const provider = 'google'

    const clerk = await clerkClient();
    const token = await clerk.users.getUserOauthAccessToken(clerkUserid, provider)

    if (token.data.length === 0 || token.data[0].token == null) return 

    const client = new google.Auth.OAuth2Client(
        process.env.GOOGLE_OAUTH_CLIENT_ID,
        process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        process.env.GOOGLE_OAUTH_REDIRECT_URL
    )
    
    client.setCredentials({ access_token: token.data[0].token})

    return client
}


// const token = await (await clerkClient()).users.getUserOauthAccessToken(clerkUserid, provider)
// const clerk = await clerkClient();
// const token = await clerk.users.getUserOauthAccessToken(clerkUserid, provider)