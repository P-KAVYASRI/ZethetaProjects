import { z } from "zod";

export const step5Schema =
  z.object({

    employmentType:
      z.string(),

    companyName:
      z.string().optional(),

    designation:
      z.string().optional(),

    monthlySalary:
      z.string().optional(),

  });