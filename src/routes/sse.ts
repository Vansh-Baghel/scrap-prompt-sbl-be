import express from "express";
import { db } from "../db/client";
import { tasks } from "../db/schema";
import { eq } from "drizzle-orm";
import pg from "pg";
import "dotenv/config";

export const sseRouter = express.Router();

// Setup and connect PostgreSQL LISTEN client
const pgClient = new pg.Client({ connectionString: process.env.DATABASE_URL });
pgClient.connect().then(() => {
  console.log("🔌 Connected to Postgres LISTEN/NOTIFY channel");
  pgClient.query("LISTEN task_updates");
});

sseRouter.get("/stream/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    console.error("❌ SSE: missing or invalid id", id);
    res.status(400).end("Missing task id");
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // to push headers immediately

  console.log(`📡 Client connected to task stream: ${id}`);

  const listener = (msg: pg.Notification) => {
    const data = JSON.parse(msg.payload!);

    // Only push updates for the requested ID
    if (data.id === id) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);

      // Close stream if task is fully done
      if (data.status === "completed" || data.status === "failed") {
        res.end();
      }
    }
  };

  pgClient.on("notification", listener);

  // When browser disconnects
  req.on("close", () => {
    console.log(`❌ SSE disconnected for task: ${id}`);
    pgClient.off("notification", listener);
  });

  // Poll DB internally (NOT in the browser)
  // const interval = setInterval(async () => {
  //   try {
  //     const [task] = await db.select().from(tasks).where(eq(tasks.id, id));

  //     if (task) {
  //       res.write(`data: ${JSON.stringify(task)}\n\n`);

  //       // If the job is done → close SSE
  //       if (task.status === "completed" || task.status === "failed") {
  //         clearInterval(interval);
  //         res.end();
  //       }
  //     }
  //   } catch (err) {
  //     console.error("SSE error:", err);
  //     clearInterval(interval);
  //     res.end();
  //   }
  // }, 1000);

  // // Close event when client disconnects
  // req.on("close", () => {
  //   console.log(`❌ SSE disconnected for ${id}`);
  //   clearInterval(interval);
  // });
});
