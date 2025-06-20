"use server"
import { db } from "@/drizzle/db";
import { auth } from "@clerk/nextjs/server";
import { EventsTable } from "@/drizzle/schema";
import "use-server"
import { z } from "zod";
import { eventFormSchema } from "@/schema/events";
import { eq, and, count } from "drizzle-orm";
import { redirect } from "next/navigation";


export async function createEvent(unsafeData: z.infer<typeof eventFormSchema>) {
    const { userId } = await auth();
    const { success, data } = eventFormSchema.safeParse(unsafeData);
    
    if (!success || !userId) return { error: true };

    await db.insert(EventsTable).values({...data, clerkUserId: userId })
        .catch((error) => {
            console.error("Error creating event:", error);
            return { error: true };
        });
        
    return { success: true, data };

}

export async function updateEvent(
    id: string,
    unsafeData: z.infer<typeof eventFormSchema>
    ) : Promise<{ error: boolean} | undefined > {
    const { userId } = await auth();
    const { success, data } = eventFormSchema.safeParse(unsafeData);
    
    if (!success || !userId) return { error: true };

    const rowCount = await db
        .select({ value: count() })
        .from(EventsTable)
        .where(and(eq(EventsTable.id, id), eq(EventsTable.clerkUserId, userId)));
    
    if (rowCount[0].value === 0) {
        return { error: true };
    }
    await db.update(EventsTable)
        .set({ ...data })
        .where(and(eq(EventsTable.id, id), eq(EventsTable.clerkUserId, userId)));

    redirect("/events");    
}


export async function deleteEvent(id: string) {
    const { userId } = await auth();
    if (!userId) return { error: true };

    const rowCount = await db
        .select({ value: count()})
        .from(EventsTable)
        .where(and(eq(EventsTable.id, id), eq(EventsTable.clerkUserId, userId)))

    if (rowCount[0].value === 0) {
        console.error("No event found to delete with id:", id);
        return { error: true };
    }
    await db
        .delete(EventsTable)
        .where(and(eq(EventsTable.id, id), eq(EventsTable.clerkUserId, userId)))

    return { success: true };
}