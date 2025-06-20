"use client";

// import { Fragment } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { scheduleFormSchema } from "@/schema/schedule";
import { Form } from "@/components/ui/form";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "../ui/button";
import { timeToInt } from "@/lib/utils";

import { DAY_OF_WEEK_IN_ORDER } from "@/app/data/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { formatTimeZoneOffset } from "@/lib/formatters";
import { Plus, X } from "lucide-react";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { saveSchedule } from "@/server/actions/schedule";
import { useState } from "react";
import { setTimeout } from "timers";

type Availability = {
  startTime: string; // ISO time string, e.g., "09:00"
  endTime: string; // ISO time string, e.g., "17:00"
  dayOfWeek: (typeof DAY_OF_WEEK_IN_ORDER)[number]; // e.g., "Monday", "Tuesday"
};

export default function ScheduleForm({
  schedule,
}: {
  schedule?: {
    timezone: string;
    availabilities: Availability[]; // Array of day names, e.g., ["Monday", "Tuesday"]
  };
}) {
  const [successMessage, setSuccessMessage] = useState<string>();
  const form = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      timezone:
        schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,

      availabilities:
        schedule?.availabilities?.toSorted((a, b) => {
          return timeToInt(a.startTime) - timeToInt(b.startTime);
        }) ?? [],
    },
  });

  async function onSubmit(values: z.infer<typeof scheduleFormSchema>) {
    const result = await saveSchedule(values);
    if (result?.error) {
      form.setError("root", {
        type: "manual",
        message: "Failed to save schedule. Please try again.",
      });
      return;
    } else {
      setSuccessMessage("Schedule successfully saved!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);
    }
  }

  const {
    append: addAvailability,
    remove: removeAvailability,
    fields: availabilityFields,
  } = useFieldArray({ name: "availabilities", control: form.control });

  const groupeAvailabilityFields = Object.groupBy(
    availabilityFields.map((field, index) => ({
      ...field,
      index,
    })),
    (availability) => availability.dayOfWeek,
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-6 flex-col"
      >
        {/* <form className="flex gap-6 flex-col"> */}
        {form.formState.errors.root && ( // need to handle this error messages that don't appear
          <div className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </div>
        )}
        {successMessage && (
          <div className="text-green-500 text-sm">{successMessage}</div>
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
        {/* Table */}
        <Table>
          <TableBody>
            {DAY_OF_WEEK_IN_ORDER.map((dayOfWeek) => (
              <TableRow key={dayOfWeek}>
                <TableCell className="capitalize text-sm font-semibold">
                  {dayOfWeek}
                </TableCell>
                <TableCell className="flex flex-col gap-2">
                  <Button
                    className="size-6 p-1"
                    type="button"
                    variant="outline"
                    asChild
                    onClick={() => {
                      addAvailability({
                        dayOfWeek,
                        startTime: "9:00",
                        endTime: "17:00",
                      });
                    }}
                  >
                    <Plus className="size-4" />
                  </Button>
                  {groupeAvailabilityFields[dayOfWeek]?.map(
                    (field, labelIndex) => (
                      <div key={labelIndex} className="flex flex-col gap-1">
                        <div className="flex gap-2 items-center">
                          <FormField
                            control={form.control}
                            name={`availabilities.${field.index}.startTime`}
                            render={({ field }) => (
                              <FormControl>
                                <FormItem>
                                  <Input
                                    className="w-24"
                                    aria-label={`${dayOfWeek} Start Time ${labelIndex + 1}`}
                                    {...field}
                                  />
                                </FormItem>
                              </FormControl>
                            )}
                          />
                          -
                          <FormField
                            control={form.control}
                            name={`availabilities.${field.index}.endTime`}
                            render={({ field }) => (
                              <FormControl>
                                <FormItem>
                                  <Input
                                    className="w-24"
                                    aria-label={`${dayOfWeek} End Time ${labelIndex + 1}`}
                                    {...field}
                                  />
                                </FormItem>
                              </FormControl>
                            )}
                          />
                          <Button
                            type="button"
                            className="size-5 p-1"
                            variant={"destructiveGhost"}
                            onClick={() => removeAvailability(field.index)}
                          >
                            <X />
                          </Button>
                        </div>
                        <FormMessage>
                          {
                            form.formState.errors.availabilities?.at?.(
                              field.index,
                            )?.root?.message
                          }
                          {/* message comiing from scheduleFormSchema -> overlaps -> message */}
                        </FormMessage>
                        <FormMessage>
                          {
                            form.formState.errors.availabilities?.at?.(
                              field.index,
                            )?.startTime?.message
                          }
                          {/* message comiing from scheduleFormSchema -> overlaps -> message */}
                        </FormMessage>
                        <FormMessage>
                          {
                            form.formState.errors.availabilities?.at?.(
                              field.index,
                            )?.endTime?.message
                          }
                          {/* message comiing from scheduleFormSchema -> overlaps -> message */}
                        </FormMessage>
                      </div>
                    ),
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </form>
      {/* move cette div dans le form au dessus */}
      <div className="flex gap-2 justify-end">
        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={form.formState.isSubmitting}
        >
          Save
        </Button>
      </div>
    </Form>
  );
}
