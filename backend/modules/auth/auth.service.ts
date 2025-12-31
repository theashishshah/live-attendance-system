import bcrypt from "bcrypt";
import { User } from "../user/user.model.js";
import { AppError } from "../../src/core/errors/AppError.js";
import { mapError } from "../../src/core/errors/error-maper.js";
import { signAccessToken } from "./auth.jwt.js";
import type { CreateUserInput } from "../user/user.schema.js";

//TODO: implement access and refresh token as well

export type AuthApiResponse = {
  user: {
    id: string;
    email: string;
    role: Role;
  };
  accessToken: string;
};

export type Role = "student" | "teacher";

export const signup = async (
  input: CreateUserInput,
): Promise<AuthApiResponse> => {
  const { email, password, role } = input;

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await User.create({
      email,
      passwordHash,
      role,
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
    };
  } catch (error) {
    throw error;
  }
};

export const login = async (
  email: string,
  password: string,
): Promise<AuthApiResponse> => {
  if (!password?.trim() || !email?.trim())
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "Email or password is missing.",
    );
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordHash",
    );

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

    const accessToken = signAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });

    return {
      accessToken,
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
