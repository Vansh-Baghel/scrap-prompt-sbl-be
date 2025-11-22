import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import taskRouter from "./routes/tasks";
import { sseRouter } from "./routes/sse";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/tasks", taskRouter, sseRouter);

app.listen(process.env.PORT || 4000, () =>
  console.log("Server running on port", process.env.PORT || 4000)
);
