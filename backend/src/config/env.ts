import "dotenv/config";
import { AppError } from "../core/errors/AppError.js";

function getEnv(name: string): string {
  const value = process.env[name];

  if (!value)
    throw new AppError(
      "INTERNAL_ERROR",
      500,
      `${name} ENV file is not loaded.`,
    );

  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3000),
  MONGODB_URI: getEnv("MONGODB_URI"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "15m",
};
