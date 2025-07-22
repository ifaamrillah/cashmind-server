import { getEnv } from "../utils/get-env";

const envConfig = () => ({
  PORT: getEnv("PORT", "8000"),
  NODE_ENV: getEnv("NODE_ENV", "development"),
  BASE_PATH: getEnv("BASE_PATH", "/api"),

  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "http://localhost:5173"),

  MONGO_URI: getEnv("MONGO_URI", ""),

  JWT_SECRET: getEnv("JWT_SECRET", "jwt_secret"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "15m") as string,

  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET", "jwt_refresh_secret"),
  JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "7d") as string,

  GEMINI_API_KEY: getEnv("GEMINI_API_KEY", ""),

  CRON_SECRET: getEnv("CRON_SECRET", "cron_secret"),
});

export const ENV = envConfig();
