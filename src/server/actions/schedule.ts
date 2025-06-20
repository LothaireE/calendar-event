"use server";

import "use-server";
import { scheduleFormSchema } from "@/schema/schedule";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/drizzle/db";
import { ScheduleAvailabilityTable, ScheduleTable } from "@/drizzle/schema";
import { BatchItem } from "drizzle-orm/batch";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function saveSchedule(
  unsafeData: z.infer<typeof scheduleFormSchema>,
) {
  const { userId } = await auth();
  const { success, data } = scheduleFormSchema.safeParse(unsafeData);

  if (!success || !userId) return { error: true };

  const { availabilities, ...scheduleData } = data;

  const [{ id: scheduleId }] = await db
    .insert(ScheduleTable)
    .values({ ...scheduleData, clerkUserId: userId })
    .onConflictDoUpdate({
      target: ScheduleTable.clerkUserId,
      set: scheduleData,
    })
    .returning({ id: ScheduleTable.id });

  // delete all the pre-existing availabilities as it is easier than trying to figure them out one by one
  // so delete them all and re-add them

  const statements: [BatchItem<"pg">] = [
    // Batching them allows us to roll back undelete them if the saving-insert fails
    db
      .delete(ScheduleAvailabilityTable)
      .where(eq(ScheduleAvailabilityTable.id, scheduleId)),
  ];

  if (availabilities.length > 0) {
    statements.push(
      db.insert(ScheduleAvailabilityTable).values(
        availabilities.map((availability) => ({
          ...availability,
          scheduleId,
        })),
      ),
    );
  }

  await db.batch(statements);
}
