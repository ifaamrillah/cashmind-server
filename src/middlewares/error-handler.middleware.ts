import { ErrorRequestHandler } from "express";

import { HTTPSTATUS } from "../config/http.config";

import { AppError } from "../utils/app-error";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error("Error occurred on PATH:", req.path);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      errorCode: err.errorCode,
      message: err.message,
    });
  }

  return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    error: err?.message || "Unknown error occurred",
  });
};
