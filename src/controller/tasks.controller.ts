import { desc } from "drizzle-orm";
import { Request, Response } from "express";
import { db } from "../db/client";
import { tasks } from "../db/schema";
import { taskQueue } from "../queue";

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const allTasks = await db
      .select()
      .from(tasks)
      .orderBy(desc(tasks.createdAt));
    if (!allTasks) {
      return res.status(404).json({ error: "Tasks not found." });
    }

    res.status(200).json(allTasks);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// export const getTask = async (req: Request, res: Response) => {
//   const { id } = req.params;

//   try {
//     const [task] = await db
//       .select()
//       .from(tasks)
//       .where(eq(tasks.id, id))
//       .limit(1);

//     if (!task) {
//       return res.status(404).json({ error: "Task not found." });
//     }

//     res.status(200).json({
//       id: task.id,
//       url: task.url,
//       question: task.question,
//       status: task.status,
//       answer: task.answer,
//     });
//   } catch (error) {
//     console.error("Error fetching task:", error);
//     res.status(500).json({ error: "Internal server error." });
//   }
// };

export const createTask = async (req: Request, res: Response) => {
  const { url, question } = req.body;

  if (!url || !question) {
    return res.status(400).json({ error: "URL and question are required." });
  }

  try {
    new URL(url); // will throw on bad URL
  } catch {
    return res.status(400).json({ error: "Invalid URL format." });
  }

  try {
    const [newTask] = await db
      .insert(tasks)
      .values({ url, question, status: "pending" })
      .returning();

    await taskQueue.add("scrape-and-answer", {
      taskId: newTask.id,
      url,
      question,
    });

    // res.status(201).json({ taskId: newTask.id });
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
