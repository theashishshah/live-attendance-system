import jwt from "jsonwebtoken";
import type { Role } from "./auth.service.js";

export interface AccessTokenPayload {
  userId: string;
  role: Role;
}

export interface RefreshTokenPayload {
  userId: string;
}

const REFRESH_TOKEN_EXPIRES_IN = "15d";
const ACCESS_TOKEN_EXPIRES_IN = "1d";

export const signAccessToken = (payload: AccessTokenPayload): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    issuer: "live attendance system",
    audience: "access",
  });

  return token;
};

export const signRefreshToken = (payload: RefreshTokenPayload): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: "live attendance system",
    audience: "refresh",
  });

  return token;
};
