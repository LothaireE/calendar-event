"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventFormSchema } from "@/schema/events";
import { Form, FormDescription } from "@/components/ui/form";
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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { createEvent, updateEvent, deleteEvent } from "@/server/actions/events";
import { formatISO } from "date-fns";
import { redirect } from "next/navigation";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../ui/alert-dialog";

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const defaultDate: string = formatISO(today, { representation: "date" }); // ex: "2025-06-05"

const eventFallbackValues: z.infer<typeof eventFormSchema> = {
  title: "",
  isActive: true,
  durationInMinutes: 60,
  date: defaultDate,
  description: "",
};

export default function EventForm({
  event,
}: {
  event?: {
    id: string;
    title: string;
    description?: string;
    isActive: boolean;
    durationInMinutes: number;
    date: string; // ISO date string
  };
}) {
  const [isDeletePending, startDeleteTransition] = useTransition();

  const defaultValues = {
    ...eventFallbackValues,
    ...event,
  };

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  });

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    const action =
      event == null ? createEvent : updateEvent.bind(null, event.id);
    const result = await action(values);
    if (result?.error) {
      form.setError("root", {
        type: "manual",
        message: "Failed to create event. Please try again.",
      });
      console.error("Error creating event:", result.error);
      return;
    }
    redirect("/events");
    // Here you would typically send the form data to your server or API
  }

  async function handleDelete() {
    if (!event) {
      form.setError("root", {
        type: "manual",
        message: "No event to delete.",
      });
      return;
    }
    startDeleteTransition(async () => {
      const result = await deleteEvent(event.id);
      if (result?.error)
        form.setError("root", {
          type: "manual",
          message: "Failed to delete event. Please try again.",
        });
      redirect("/events");
    });
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
        {/* Title field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter event title" />
              </FormControl>
              <FormDescription>
                This is the title of your event.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Date field */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Event Date</FormLabel>
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
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={field.onChange}
                    disabled={(date) => date < yesterday}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Description field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter event description"
                  className="resize-none h-32"
                />
              </FormControl>
              <FormDescription>Description of your event.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Duration field */}
        <FormField
          control={form.control}
          name="durationInMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Duration (in minutes)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  placeholder="Enter duration in minutes"
                />
              </FormControl>
              <FormDescription>
                Specify the duration of your event in minutes.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Active status field */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <div className="flex items-center gap-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    // className="h-4 w-s4"
                  />
                </FormControl>
                <FormLabel>Is Active</FormLabel>
              </div>

              <FormDescription>
                Check this box if the event is currently active.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Submit button */}
      </form>
      <div className="flex gap-2 justify-end">
        <Button
          asChild
          type="button"
          variant="outline"
          disabled={
            form.formState.isSubmitting ||
            form.formState.isValidating ||
            isDeletePending
          }
        >
          <Link href="/events">Go Back</Link>
        </Button>
        <Button
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={
            form.formState.isSubmitting ||
            form.formState.isValidating ||
            isDeletePending
          }
        >
          Save Event
        </Button>
        {event && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructiveGhost"
                disabled={
                  form.formState.isSubmitting ||
                  form.formState.isValidating ||
                  isDeletePending
                }
              >
                Delete Event
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  event.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </AlertDialogContent>
            <AlertDialogFooter>
              <AlertDialogContent>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={
                    form.formState.isSubmitting ||
                    form.formState.isValidating ||
                    isDeletePending
                  }
                  onClick={() => {
                    handleDelete();
                  }}
                  variant="destructive"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogContent>
            </AlertDialogFooter>
          </AlertDialog>
        )}
      </div>
    </Form>
  );
}
