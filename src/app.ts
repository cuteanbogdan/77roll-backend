import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import { configureMiddleware } from "./config/middleware";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app: Application = express();

configureMiddleware(app);

app.use("/api/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Test BE boilerplate");
});

export default app;
