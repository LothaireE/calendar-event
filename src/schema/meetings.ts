import { startOfDay } from "date-fns";
import { z } from "zod";

export const meetingSchemaBase = z.object({
  startTime: z.date().min(new Date()),
  guestEmail: z.string().email().min(1, "Required"),
  guestName: z.string().min(1, "Required"),
  guestNote: z.string().optional(),
  timezone: z.string().min(1, "Required"),
});

export const meetingFormSchema = z
  .object({
    startTime: z.date().min(new Date()),
    guestEmail: z.string().email().min(1, "Required"),
    guestName: z.string().min(1, "Required"),
    guestNote: z.string().optional(),
    timezone: z.string().min(1, "Required"),
    date: z.date().min(startOfDay(new Date()), "Must be in the future."),
  })
  .merge(meetingSchemaBase);

export const meetingActionSchema = z
  .object({
    eventId: z.string().min(1, "Required"),
    clerkUserId: z.string().min(1, "Required"),
  })
  .merge(meetingSchemaBase);
