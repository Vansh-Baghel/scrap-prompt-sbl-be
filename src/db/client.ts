import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL in environment variables");
}

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
export const db = drizzle(client);
