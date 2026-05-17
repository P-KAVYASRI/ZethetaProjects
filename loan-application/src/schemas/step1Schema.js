// src/schemas/step1Schema.js
import { z } from "zod";

export const step1Schema = z.object({
  loanType: z
    .string()
    .min(1, "Please select a loan type"),

  amount: z
    .number({ invalid_type_error: "Loan amount is required" })
    .min(50000, "Loan amount must be at least ₹50,000")
    .max(20000000, "Loan amount cannot exceed ₹2 Crore"),

  tenure: z
    .number({ invalid_type_error: "Please select a tenure" })
    .min(1, "Please select a tenure"),

  purpose: z
    .string()
    .min(1, "Please select a loan purpose"),

  employmentType: z
    .string()
    .min(1, "Please select your employment type"),

  referral: z.string().optional(),
});