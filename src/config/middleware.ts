import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";
import passportConfig from "./passport";

export const configureMiddleware = (app: Application): void => {
  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  app.use(passport.initialize());
  passportConfig(passport);
};
