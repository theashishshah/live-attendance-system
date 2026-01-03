import bcrypt from "bcrypt";
import crypto from "crypto";
import { User } from "../user/user.model.js";
import { AppError } from "../../src/core/errors/AppError.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "./auth.jwt.js";
import type { CreateUserInput } from "../user/user.schema.js";
import type { CreateLoginInput } from "./auth.schema.js";
import { Session } from "./session.model.js";

//TODO: implement access and refresh token as well

export type AuthApiResponse = {
  user: {
    id: string;
    email: string;
    role: Role;
  };
  accessToken: string;
  refreshToken: string;
};

export type Role = "student" | "teacher";

export const signup = async (
  input: CreateUserInput,
): Promise<AuthApiResponse> => {
  const {
    email,
    password,
    role,
    userAgent = "chrome default",
    ip = "198.168.92.1 default",
  } = input;

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await User.create({
      email,
      passwordHash,
      role,
    });

    const refreshToken = signRefreshToken({ userId: user._id.toString() });

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await Session.create({
      userId: user._id,
      refreshTokenHash,
      userAgent,
      ip,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    });

    const accessToken = signAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

export const login = async (
  input: CreateLoginInput,
): Promise<AuthApiResponse> => {
  const {
    email,
    password,
    userAgent = "chrome deafult",
    ip = "192.168.1.2 default",
  } = input;

  try {
    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user)
      throw new AppError(
        "INVALID_CREDENTIALS",
        400,
        "Email or password is incorrect",
      );

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      throw new AppError(
        "INVALID_CREDENTIALS",
        400,
        "Email or password is incorrect",
      );

    const refreshToken = signRefreshToken({
      userId: user._id.toString(),
    });

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await Session.create({
      userId: user._id,
      refreshTokenHash,
      userAgent,
      ip,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    });

    const accessToken = signAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    throw error;
  }
};

export const me = async ({ userId }: { userId: string }) => {
  try {
    const _id = new Object(userId);
    const user = await User.findById({ _id }).select("email role createdAt");
    if (!user) {
      throw new AppError("NOT_FOUND", 404, "User not found");
    }

    return {
      sucess: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  } catch (error) {
    throw error;
  }
};

export const refreshSession = async (refreshToken: string) => {
  let payload: { userId: string };

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError("UNAUTHORIZED", 401, "Invalid refresh token");
  }

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await Session.findOne({
    userId: payload.userId,
    refreshTokenHash,
  }); // give me the current user's device session

  if (!session) {
    await Session.updateMany(
      {
        userId: payload.userId,
      },
      { revokedAt: new Date() },
    );

    throw new AppError(
      "UNAUTHORIZED",
      401,
      "Refresh token reuse detected. All sessions revoked.",
    );
  }

  if (session.revokedAt) {
    throw new AppError(
      "UNAUTHORIZED",
      401,
      "Session is expired, try login again",
    );
  }

  if (session.expiresAt < new Date()) {
    throw new AppError(
      "UNAUTHORIZED",
      401,
      "Session is expired, try login again",
    );
  }

  const newRefreshToken = signRefreshToken({
    userId: payload.userId,
  });

  const newRefreshTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  session.refreshTokenHash = newRefreshTokenHash;
  await session.save();

  // issue new access token to user
  const user = await User.findById(payload.userId);
  if (!user) throw new AppError("UNAUTHORIZED", 401, "Invalid credentials");

  const newAccessToken = signAccessToken({
    userId: user._id.toString(),
    role: user.role,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};
