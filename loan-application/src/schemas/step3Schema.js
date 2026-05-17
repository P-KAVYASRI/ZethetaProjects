import { z } from "zod";

export const step3Schema = z.object({
  pan: z
    .string()
    .min(1, "PAN number is required")
    .regex(
      /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      "Invalid PAN — expected format: ABCDE1234F"
    ),

  aadhaar: z
    .string()
    .min(1, "Aadhaar number is required")
    .regex(/^\d{12}$/, "Aadhaar must contain exactly 12 digits"),

  voterId: z.string().optional(),
  passport: z.string().optional(),

  consent: z
    .boolean({ required_error: "You must authorise KYC verification to proceed" })
    .refine((v) => v === true, {
      message: "You must authorise KYC verification to proceed",
    }),
});