import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/schema.ts",
  dialect: "postgresql",
  strict: true, // Enforce strict type checking
  verbose: true,
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
// This configuration file is used by Drizzle ORM to generate the database schema and migrations.
