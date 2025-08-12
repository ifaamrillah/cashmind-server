import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

import { ENV } from "./configs/env.config";
import { HTTP_STATUS } from "./configs/http.config";

const BASE_PATH = ENV.BASE_PATH;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ENV.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.get("/", (req: Request, res: Response, next: NextFunction) => [
  res.status(HTTP_STATUS.OK).json({
    message: "CashMind Server API is running.",
  }),
]);

app.listen(ENV.PORT, () => {
  console.log(
    `Server is running on port "${ENV.PORT}" in "${ENV.NODE_ENV}" mode.`
  );
});
