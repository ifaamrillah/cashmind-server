import { HTTPSTATUS, THttpStatusCode } from "../config/http.config";
import { ErrorCodeEnum, TErrorCodeEnum } from "../enums/error-code.enum";

export class AppError extends Error {
  public statusCode: THttpStatusCode;
  public errorCode?: TErrorCodeEnum;

  constructor(
    message: string,
    statusCode = HTTPSTATUS.INTERNAL_SERVER_ERROR,
    errorCode?: TErrorCodeEnum
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class HttpException extends AppError {
  constructor(
    message = "Http Exception Error",
    statusCode: THttpStatusCode,
    errorCode?: TErrorCodeEnum
  ) {
    super(message, statusCode, errorCode);
  }
}

export class NotFoundException extends AppError {
  constructor(message = "Resource Not Found", errorCode?: TErrorCodeEnum) {
    super(
      message,
      HTTPSTATUS.NOT_FOUND,
      errorCode || ErrorCodeEnum.RESOURCE_NOT_FOUND
    );
  }
}

export class BadRequestException extends AppError {
  constructor(message = "Bad Request", errorCode?: TErrorCodeEnum) {
    super(
      message,
      HTTPSTATUS.BAD_REQUEST,
      errorCode || ErrorCodeEnum.VALIDATION_ERROR
    );
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = "Unauthorized Access", errorCode?: TErrorCodeEnum) {
    super(
      message,
      HTTPSTATUS.UNAUTHORIZED,
      errorCode || ErrorCodeEnum.ACCESS_UNAUTHORIZED
    );
  }
}

export class InternalServerException extends AppError {
  constructor(message = "Internal Server Error", errorCode?: TErrorCodeEnum) {
    super(
      message,
      HTTPSTATUS.INTERNAL_SERVER_ERROR,
      errorCode || ErrorCodeEnum.INTERNAL_SERVER_ERROR
    );
  }
}
