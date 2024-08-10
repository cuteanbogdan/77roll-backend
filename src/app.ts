import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import { configureMiddleware } from "./config/middleware";

dotenv.config();

const app: Application = express();

configureMiddleware(app);

app.get("/", (req: Request, res: Response) => {
  res.send("Test BE boilerplate");
});

export default app;
