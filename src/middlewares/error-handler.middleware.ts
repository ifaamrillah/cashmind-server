import { ErrorRequestHandler, Response } from "express";
import { ZodError } from "zod";

import { HTTP_STATUS } from "../configs/http.config";

import { ErrorCodeEnum } from "../enums/error-code.enum";

import { AppError } from "../utils/app-error";

const formatZodError = (err: ZodError, res: Response) => {
  const errors = err?.issues?.map((error) => ({
    field: error.path.join("."),
    message: error.message,
  }));

  return res.status(HTTP_STATUS.BAD_REQUEST).json({
    errorCode: ErrorCodeEnum.VALIDATION_ERROR,
    message: "Validation Error",
    errors,
  });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next): any => {
  console.log("Error occurred on PATH:", req.path, err);

  if (err instanceof ZodError) {
    return formatZodError(err, res);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      errorCode: err.errorCode,
    });
  }

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    error: err?.message || "Unknown error occurred",
  });
};
