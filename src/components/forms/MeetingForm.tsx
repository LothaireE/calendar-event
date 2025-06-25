"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { meetingFormSchema } from "@/schema/meetings";
import { Form } from "@/components/ui/form";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import {
  formatDate,
  formatTimeString,
  formatTimeZoneOffset,
} from "@/lib/formatters";
import { isSameDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { createMeeting } from "@/server/actions/meeting";

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

export default function MeetingForm({
  validTimes,
  eventId,
  clerkUserId,
}: {
  validTimes: Date[];
  eventId: string;
  clerkUserId: string;
}) {
  const defaultValues = {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  const form = useForm<z.infer<typeof meetingFormSchema>>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues,
  });

  const date = form.watch("date");
  const timezone = form.watch("timezone"); // gives an update version of the timezone eveytime we change it
  const validTimesInTimezone = useMemo(() => {
    return validTimes.map((date) => toZonedTime(date, timezone));
  }, [validTimes, timezone]);

  async function onSubmit(values: z.infer<typeof meetingFormSchema>) {
    const data = await createMeeting({
      ...values,
      eventId,
      clerkUserId,
    });
    if (data?.error) {
      form.setError("root", {
        type: "manual",
        message: "Failed to create meeting. Please try again.",
      });
      console.error("Error creating meeting:", data.error);
      return;
    }
    redirect("/events");
  }

  return (
    <Form {...form}>
      {/* <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-6 flex-col"> */}
      <form className="flex gap-6 flex-col">
        {form.formState.errors.root && (
          <div className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </div>
        )}
        {/* Timezone field */}
        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Intl.supportedValuesOf("timeZone").map((timezone) => (
                    <SelectItem key={timezone} value={timezone}>
                      {` (${formatTimeZoneOffset(timezone)})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Date field */}
        <div className="flex flex-col md:flex-row gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-1 align-center">
                <FormLabel>Meeting Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          formatDate(field.value)
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      captionLayout="dropdown"
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        !validTimesInTimezone.some((time) =>
                          isSameDay(date, time),
                        )
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="self-center" />
              </FormItem>
            )}
          />
          {/* StartTime field */}
          {/* <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem className="flex flex-1">
                <FormLabel>Meeting Time</FormLabel>
                <Select
                  disabled={timezone == null || date == null}
                  onValueChange={(value) =>
                    field.onChange(new Date(Date.parse(value)))
                  }
                  defaultValue={field.value?.toISOString()}
                >
                  <FormControl>
                    <SelectTrigger
                      aria-placeholder={
                        timezone == null || date == null
                          ? "Select a date and timezone."
                          : "Select a meeting time."
                      }
                    />
                  </FormControl>
                  <SelectContent>
                    {validTimesInTimezone
                      .filter((time) => isSameDay(time, date))
                      .map((time) => (
                        <SelectItem
                          key={time.toISOString()}
                          value={time.toISOString()}
                        >
                          {formatTimeString(time)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage className="self-center" />
              </FormItem>
            )}
          /> */}
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem className="flex flex-1 align-center">
                <FormLabel>Meeting Time</FormLabel>
                <Select
                  disabled={date == null || timezone == null}
                  onValueChange={(value) =>
                    field.onChange(new Date(Date.parse(value)))
                  }
                  defaultValue={field.value?.toISOString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          date == null || timezone == null
                            ? "Select a date/timezone first"
                            : "Select a meeting time"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {validTimesInTimezone
                      .filter((time) => isSameDay(time, date))
                      .map((time) => (
                        <SelectItem
                          key={time.toISOString()}
                          value={time.toISOString()}
                        >
                          {formatTimeString(time)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          {/* guestName field */}
          <FormField
            control={form.control}
            name="guestName"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Name:</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* guestName field */}
          <FormField
            control={form.control}
            name="guestEmail"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Email:</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage className="self-center" />
              </FormItem>
            )}
          />
        </div>
        {/* guestNote field */}
        <FormField
          control={form.control}
          name="guestNote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes:</FormLabel>
              <FormControl>
                <Textarea className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Submit button */}
        <div className="flex gap-2 justify-end">
          <Button
            asChild
            type="button"
            variant="outline"
            disabled={form.formState.isSubmitting}
          >
            <Link href={`/book/${clerkUserId}`}>Go Back</Link>
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={form.formState.isSubmitting}
          >
            Save Meeting
          </Button>
        </div>
      </form>
    </Form>
  );
}
