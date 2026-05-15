import { z } from "zod";

export const step1Schema =
  z.object({

    loanType:
      z.string().min(
        1,
        "Select loan type"
      ),

    amount:
      z
        .number()
        .min(
          10000,
          "Minimum amount required"
        ),

    tenure:
      z.union([
        z.string(),
        z.number(),
      ]),

    purpose:
      z.string().min(
        1,
        "Select loan purpose"
      ),

    referral:
      z.string().optional(),

  });