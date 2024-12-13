import { object, string } from "zod";
import { message } from "./constants/message";

export const signUpSchema = object({
  email: string({ required_error: message.EMAIL_IS_REQUIRED }).email(
    message.INVALID_EMAIL,
  ),
  password: string({ required_error: message.PASSWORD_IS_REQUIRED })
    .min(8, message.PASSWORD_MUST_BE_8_CHARACTERS)
    .max(32, message.PASSWORD_MUST_BE_AT_MOST_32_CHARACTERS),
});

export const signInSchema = object({
  email: string({ required_error: message.EMAIL_IS_REQUIRED }).email(
    message.INVALID_EMAIL,
  ),
  password: string({ required_error: message.PASSWORD_IS_REQUIRED }),
});
