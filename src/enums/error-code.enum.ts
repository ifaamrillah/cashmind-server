export const ErrorCodeEnum = {
  ACCESS_UNAUTHORIZED: "ACCESS_UNAUTHORIZED",

  AUTH_USER_NOT_FOUND: "AUTH_USER_NOT_FOUND",

  AUTH_EMAIL_ALREADY_EXISTS: "AUTH_EMAIL_ALREADY_EXISTS",
  AUTH_INVALID_TOKEN: "AUTH_INVALID_TOKEN",

  AUTH_NOT_FOUND: "AUTH_NOT_FOUND",
  AUTH_TOO_MANY_REQUESTS: "AUTH_TOO_MANY_REQUESTS",
  AUTH_UNAUTHORIZED_ACCESS: "AUTH_UNAUTHORIZED_ACCESS",
  AUTH_TOKEN_NOT_FOUND: "AUTH_TOKEN_NOT_FOUND",

  //   Validation and resource errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  FILE_UPLOAD_ERROR: "FILE_UPLOAD_ERROR",

  //   System errors
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

export type TErrorCodeEnum = keyof typeof ErrorCodeEnum;
