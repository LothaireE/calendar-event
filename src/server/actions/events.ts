"use server"
import { db } from "@/drizzle/db";
import { auth } from "@clerk/nextjs/server";
import { EventsTable } from "@/drizzle/schema";
import "use-server"
import { z } from "zod";
import { eventFormSchema } from "@/schema/events";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";


export async function createEvent(unsafeData: z.infer<typeof eventFormSchema>) {
    // Promise<{ success: boolean; data?: z.infer<typeof eventFormSchema>; error?: boolean } | undefined > {
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
    // Promise<{ success: boolean; data?: z.infer<typeof eventFormSchema>; error?: boolean } | undefined > {
    const { userId } = await auth();
    const { success, data } = eventFormSchema.safeParse(unsafeData);
    
    if (!success || !userId) return { error: true };

    const { rowCount } = await db
        .update(EventsTable)
        .set({ ...data })
        .where(and(eq(EventsTable.id, id), eq(EventsTable.clerkUserId, userId)))
        .catch((error) => {
            console.error("Error creating event:", error);
            return { error: true };
        });

    if (rowCount === 0) { // if there was event to update
        console.error("No event found to update with id:", id);
        // might want to handle this case differently: throw an error or return a specific message
        return { error: true };
    }
    
    redirect("/events");
}


export async function deleteEvent(id: string) {
    const { userId } = await auth();
    if (!userId) return { error: true };

    const { rowCount } = await db
        .delete(EventsTable)
        .where(and(eq(EventsTable.id, id), eq(EventsTable.clerkUserId, userId)))
        .catch((error) => {
            console.error("Error deleting event:", error);
            return { error: true };
        });

    if (rowCount === 0) {
        console.error("No event found to delete with id:", id);
        return { error: true };
    }

    return { success: true };
}