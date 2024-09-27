import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import http from "http";
import { configureMiddleware } from "./config/middleware";
import authRoutes from "./routes/authRoutes";
import usersRoutes from "./routes/usersRoutes";
import transactionsRoutes from "./routes/transactionsRoutes";
import fairnessRoutes from "./routes/fairnessRoutes";
import balanceRoutes from "./routes/balanceRoutes";

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

configureMiddleware(app);

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/fairness", fairnessRoutes);
app.use("/api/balance", balanceRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Test BE boilerplate");
});

export { app, server };
