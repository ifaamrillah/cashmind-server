import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";

import { ENV } from "./config/env.config";
import { HTTPSTATUS } from "./config/http.config";

import { errorHandler } from "./middlewares/error-handler.middleware";
import { asyncHandler } from "./middlewares/async-handler.middleware";
import { connectMongoDB } from "./config/db.config";

const app = express();
const BASE_PATH = ENV.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ENV.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(HTTPSTATUS.OK).json({
      message: "Welcome to CashMind API",
    });
  })
);

app.use(errorHandler);

app.listen(ENV.PORT, async () => {
  await connectMongoDB();
  console.log(`Server is running on port ${ENV.PORT} in ${ENV.NODE_ENV} mode`);
});
