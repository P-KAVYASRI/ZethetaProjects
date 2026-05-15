import { z } from "zod";

export const step3Schema =
  z.object({

    pan:
      z
        .string()
        .regex(
          /^[A-Z]{5}[0-9]{4}[A-Z]$/,
          "Invalid PAN format"
        ),

    aadhaar:
      z
        .string()
        .regex(
          /^[0-9]{12}$/,
          "Aadhaar must be 12 digits"
        ),

  });