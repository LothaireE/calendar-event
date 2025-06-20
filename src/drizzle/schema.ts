import {
  uuid,
  text,
  integer,
  pgTable,
  varchar,
  boolean,
  timestamp,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { DAY_OF_WEEK_IN_ORDER } from "../app/data/constants";
import { relations } from "drizzle-orm";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(), // integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

const createdAt = timestamp("createdAt").notNull().defaultNow();
const updatedAt = timestamp("updatedAt")
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date()); // Auto update on row modification

export const EventsTable = pgTable(
  "events",
  {
    //pg postgres is case-sensitive, so use camelCase for table names
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar({ length: 256 }).notNull(), // text("title").notNull(),
    description: varchar({ length: 256 }), // text("description"),
    durationInMinutes: integer("duration_in_minutes").notNull(),
    date: varchar({ length: 50 }).notNull(), // Use varchar for date to avoid timezone issues
    clerkUserId: text("clerkUserId").notNull(), // Use text for Clerk user ID
    isActive: boolean("isActive").notNull().default(true), // Use boolean for active status
    createdAt: createdAt,
    updatedAt: updatedAt,
  },
  (table) => ({
    clerkUserIdIndex: index("clerkUserIndex").on(table.clerkUserId), // Index for Clerk user ID
  }),
);

export const ScheduleTable = pgTable("schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  timezone: varchar({ length: 50 }).notNull(), // Use varchar for timezone to avoid timezone issues
  clerkUserId: text("clerkUserId").notNull().unique(), // Use text for Clerk user ID
  createdAt: createdAt,
  updatedAt: updatedAt,
});

export const scheduleRelations = relations(ScheduleTable, ({ many }) => ({
  availabilities: many(ScheduleAvailabilityTable), // Define relation to ScheduleAvailabilityTable
}));

export const scheduleDayOfTheWeek = pgEnum("day", DAY_OF_WEEK_IN_ORDER);

export const ScheduleAvailabilityTable = pgTable(
  "scheduleAvailabilities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    scheduleId: uuid("scheduleId")
      .notNull()
      .references(() => ScheduleTable.id, { onDelete: "cascade" }), // Foreign key to schedules table
    dayOfWeek: scheduleDayOfTheWeek("dayOfWeek").notNull(),
    startTime: varchar({ length: 5 }).notNull(),
    endTime: varchar({ length: 5 }).notNull(),
    createdAt: createdAt,
    updatedAt: updatedAt,
  },
  (table) => ({
    scheduleIdIndex: index("scheduleIdIndex").on(table.scheduleId),
  }),
);

export const ScheduleAvailabilityRelations = relations(
  ScheduleAvailabilityTable,
  ({ one }) => ({
    schedule: one(ScheduleTable, {
      fields: [ScheduleAvailabilityTable.scheduleId],
      references: [ScheduleTable.id],
    }), // Define relation to ScheduleTable
  }),
);
