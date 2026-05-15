import { z } from "zod";

export const step4Schema =
  z.object({

    addressLine1:
      z.string().min(
        5,
        "Address required"
      ),

    pinCode:
      z
        .string()
        .regex(
          /^[0-9]{6}$/,
          "PIN must be 6 digits"
        ),

    city:
      z.string().min(
        2,
        "City required"
      ),

    state:
      z.string().min(
        2,
        "State required"
      ),

  });