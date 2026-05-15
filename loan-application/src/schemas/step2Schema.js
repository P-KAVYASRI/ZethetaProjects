import { z } from "zod";

export const step2Schema =
  z.object({

    firstName:
      z.string().min(
        2,
        "First name required"
      ),

    lastName:
      z.string().min(
        2,
        "Last name required"
      ),

    dob:
      z.string().min(
        1,
        "DOB required"
      ),

    gender:
      z.string().min(
        1,
        "Select gender"
      ),

    maritalStatus:
      z.string().min(
        1,
        "Select marital status"
      ),

    phone:
      z.string()
        .regex(
          /^[6-9]\d{9}$/,
          "Invalid phone number"
        ),

    email:
      z
        .string()
        .email(
          "Invalid email"
        ),

  });