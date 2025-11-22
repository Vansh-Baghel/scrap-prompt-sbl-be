import express from "express";
import { db } from "../db/client";
import { tasks } from "../db/schema";
import { eq } from "drizzle-orm";

export const sseRouter = express.Router();

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

  console.log(` SSE connected for task: ${id}`);

  // Poll DB internally (NOT in the browser)
  const interval = setInterval(async () => {
    try {
      const [task] = await db.select().from(tasks).where(eq(tasks.id, id));

      if (task) {
        res.write(`data: ${JSON.stringify(task)}\n\n`);

        // If the job is done → close SSE
        if (task.status === "completed" || task.status === "failed") {
          clearInterval(interval);
          res.end();
        }
      }
    } catch (err) {
      console.error("SSE error:", err);
      clearInterval(interval);
      res.end();
    }
  }, 1000);

  // Close event when client disconnects
  req.on("close", () => {
    console.log(`❌ SSE disconnected for ${id}`);
    clearInterval(interval);
  });
});
