import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import passport from "passport";
import "./configs/passport.config";

import { initializeCrons } from "./crons";

import { ENV } from "./configs/env.config";
import { HTTP_STATUS } from "./configs/http.config";
import { connectDatabase } from "./configs/database.config";
import { passportAuthenticateJwt } from "./configs/passport.config";

import { errorHandler } from "./middlewares/error-handler.middleware";
import { asyncHandler } from "./middlewares/async-handler.middleware";

import { BadRequestException } from "./utils/app-error";

import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import transactionRoutes from "./routes/transaction.route";

const BASE_PATH = ENV.BASE_PATH;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use(
  cors({
    origin: ENV.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw new BadRequestException("This s a test error");
    res.status(HTTP_STATUS.OK).json({
      message: "CashMind Server API is running.",
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenticateJwt, userRoutes);
app.use(`${BASE_PATH}/transaction`, passportAuthenticateJwt, transactionRoutes);

app.use(errorHandler);

app.listen(ENV.PORT, async () => {
  await connectDatabase();

  if (ENV.NODE_ENV === "development") {
    await initializeCrons();
  }

  console.log(
    `Server is running on port "${ENV.PORT}" in "${ENV.NODE_ENV}" mode.`
  );
});
