import { z } from "zod";

export const eventFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(256, "Title must be less than 256 characters"),
  description: z
    .string()
    .max(256, "Description must be less than 256 characters")
    .optional(),
  isActive: z.boolean().default(true).optional(), // .optional() only way to stop type error on control field, isActive: boolean is always required
  durationInMinutes: z.coerce
    .number()
    .int()
    .min(1, "Duration must be at least 1 minute")
    .max(60 * 24, "Duration cannot exceed 24 hours")
    .positive("Duration must be a greater than 0"),
  date: z.string().max(10),
});
