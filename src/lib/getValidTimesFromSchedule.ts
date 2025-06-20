import { DAY_OF_WEEK_IN_ORDER } from "@/app/data/constants"
import { db } from "@/drizzle/db"
import { ScheduleAvailabilityTable } from "@/drizzle/schema"
import { getCalendarEventTime } from "@/server/GoogleCalendar"

import { addMinutes, areIntervalsOverlapping, isFriday, isMonday, isSaturday, isSunday, isThursday, isTuesday, isWednesday, isWithinInterval, setHours, setMinutes } from "date-fns"
import { fromZonedTime } from "date-fns-tz"

export default async function getValidTimesFromSchedule(
    timesInOrder: Date[],
    event: { clerkUserId: string, durationInMinutes: number }
) {
    const start = timesInOrder[0]
    const end = timesInOrder.at(-1)

    if (!start || !end ) return []

    const schedule = await db.query.ScheduleTable.findFirst({
        where:({ clerkUserId: userIdCol }, { eq }) => eq(userIdCol, event.clerkUserId),
        with: { availabilities: true }
    })
    if(!schedule) return []


    const groupedAvailabilities = Object.groupBy(
        schedule.availabilities, a => a.dayOfWeek
    )

    const eventTimes = await getCalendarEventTime(
        event.clerkUserId, {
            start,
            end
        }
    )

    return timesInOrder.filter(intervalDate => {
        const availabilities = getAvailabilities(
            groupedAvailabilities, 
            intervalDate,
            schedule.timezone
        )
        const eventInterval = {
            start: intervalDate,
            end: addMinutes(intervalDate, event.durationInMinutes
            )
        }

        return eventTimes.every(eventTime => { // is there no event that overlaps with that slot
            return !areIntervalsOverlapping(eventTime, eventInterval) 
                    && availabilities.some(availability => { // is there at least one availability open
                        return (isWithinInterval(eventInterval.start, availability) 
                                && isWithinInterval(eventInterval.end, availability))
                    })
        })
    })
}

function getAvailabilities(
    groupedAvailabilities: Partial<
        Record<
            (typeof DAY_OF_WEEK_IN_ORDER)[number],
            (typeof ScheduleAvailabilityTable.$inferSelect)[]
        >
    >,
    date: Date,
    timezone: string
) {
    let availabilities : | (typeof ScheduleAvailabilityTable.$inferSelect)[] | undefined

    if (isMonday(date)){
        availabilities = groupedAvailabilities.Monday
    }
    if (isTuesday(date)){
        availabilities = groupedAvailabilities.Tuesday
    }
    if (isWednesday(date)){
        availabilities = groupedAvailabilities.Wednesday
    }
    if (isThursday(date)){
        availabilities = groupedAvailabilities.Thursday
    }
    if (isFriday(date)){
        availabilities = groupedAvailabilities.Friday
    }
    if (isSaturday(date)){
        availabilities = groupedAvailabilities.Saturday
    }
    if (isSunday(date)){
        availabilities = groupedAvailabilities.Sunday
    }

    if (availabilities == null) return []

    return availabilities.map(({startTime, endTime})=>{
        const start = fromZonedTime(
            setMinutes(
                setHours(date, parseInt(startTime.split(":")[0])),
                parseInt(startTime.split(":")[1])
            ),
            timezone
        )

        const end = fromZonedTime(
            setMinutes(
                setHours(date, parseInt(endTime.split(":")[0])),
                parseInt(endTime.split(":")[1])
            ),
            timezone
        )

        return { start, end }
    })

}