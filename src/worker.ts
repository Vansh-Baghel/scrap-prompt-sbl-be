// src/worker.ts
import { Worker } from "bullmq";
import { taskQueue, connection, TaskJob } from "./queue";
import { db } from "./db/client";
import { tasks } from "./db/schema";
import { eq } from "drizzle-orm";
import { scrapeWebsite } from "./utils/scrape";
import { askAI } from "./utils/ai";

console.log("📌 Worker started and listening for jobs...");

export const taskWorker = new Worker<TaskJob>(
  taskQueue.name,
  async (job) => {
    const { taskId, url, question } = job.data;

    console.log(`Processing task: ${taskId}`);

    // 1) Mark as processing
    await db
      .update(tasks)
      .set({ status: "processing" })
      .where(eq(tasks.id, taskId));

    try {
      // 2) SCRAPE
      console.log(`Scraping: ${url}`);
      const content = await scrapeWebsite(url);
      // console.log("🚀 ~ content:", content);

      // 3) ASK AI
      console.log(`Asking AI for answer...`);
      const answer = await askAI(content, question);

      // 4) STORE RESULT
      await db
        .update(tasks)
        .set({
          status: "completed",
          answer,
        })
        .where(eq(tasks.id, taskId));

      console.log(`✅ Completed task ${taskId}`);
    } catch (err) {
      console.error(`❌ Task ${taskId} failed:`, err);

      // 5) Update status to failed
      await db
        .update(tasks)
        .set({
          status: "failed",
          answer: null,
        })
        .where(eq(tasks.id, taskId));

      throw err;
    }
  },
  { connection }
);
