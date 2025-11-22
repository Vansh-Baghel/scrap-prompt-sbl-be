import { Queue } from "bullmq";
import IORedis from "ioredis";
import "dotenv/config";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL is missing");
}

export const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const taskQueue = new Queue("tasks", { connection });

export type TaskJob = {
  taskId: string;
  url: string;
  question: string;
};
