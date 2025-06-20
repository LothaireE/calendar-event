import { DAY_OF_WEEK_IN_ORDER } from '@/app/data/constants';
import { z } from 'zod';
import { timeToInt } from '@/lib/utils';

export const scheduleFormSchema = z.object({
    timezone: z.string().min(1, "Required"),
    availabilities: z.array(
        z.object({
            dayOfWeek: z.enum(DAY_OF_WEEK_IN_ORDER),
            startTime: z.string().regex(
                    /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
                    "Time must be in the format HH:MM"
                ),
            endTime: z.string().regex(
                    /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
                    "Time must be in the format HH:MM"
                ),
        })
    ).superRefine((availabilities, ctx) => { 
        // add error handling for availabilities
        // checking for overlap and if start time and end time are in the correct order
        availabilities.forEach((availability, index) => {
            const overlaps = availabilities.some((a, i) => {
                return (
                    i !== index && // not comparing availability to itself
                    a.dayOfWeek === availability.dayOfWeek && // no overlap if not the same day
                    timeToInt(a.startTime) < timeToInt(availability.endTime) && // start time is before end time of another
                    timeToInt(a.endTime) > timeToInt(availability.startTime) // end time is after start time of another
                )

            });
            if (overlaps) {
                ctx.addIssue({
                    code: "custom",
                    message: `Availability for ${availability.dayOfWeek} overlaps with another availability.`,
                    path: [index],
                });
            }
            if (timeToInt(availability.startTime) >= timeToInt(availability.endTime)) {
                ctx.addIssue({
                    code: "custom",
                    message: `End time must be after start time for ${availability.dayOfWeek}.`,
                    path: [index],
                });
            }
        });
    }),
});

