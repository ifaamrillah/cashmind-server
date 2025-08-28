import { ErrorRequestHandler, Response } from "express";
import { ZodError } from "zod";
import { MulterError } from "multer";

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

const formatMulterError = (err: MulterError, res: Response) => {
  const messages = {
    LIMIT_UNEXPECTED_FILE: "Invalid file field name. Please use 'file'",
    LIMIT_FILE_SIZE: "File size is too large",
    LIMIT_FILE_COUNT: "Too many files uploaded",
    default: "File upload error",
  };

  return res.status(HTTP_STATUS.BAD_REQUEST).json({
    errorCode: ErrorCodeEnum.FILE_UPLOAD_ERROR,
    message: messages[err.code as keyof typeof messages] || messages.default,
    error: err.message,
  });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next): any => {
  console.log("Error occurred on PATH:", req.path, err);

  if (err instanceof ZodError) {
    return formatZodError(err, res);
  }

  if (err instanceof MulterError) {
    return formatMulterError(err, res);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      errorCode: err.errorCode,
      message: err.message,
    });
  }

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    error: err?.message || "Unknown error occurred",
  });
};
