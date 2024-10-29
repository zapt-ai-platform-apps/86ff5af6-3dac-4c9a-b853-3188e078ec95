import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.js",
  out: "./drizzle",
  dialect: 'pg',
  dbCredentials: {
    connectionString: process.env.NEON_DB_URL,
  },
});