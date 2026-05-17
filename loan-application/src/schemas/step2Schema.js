// src/schemas/step2Schema.js
import { z } from "zod";

const MIN_AGE = 21;
const MAX_AGE = 65;

export const step2Schema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(3, "First name must be at least 3 characters")
    .regex(/^[A-Za-z\s]+$/, "First name can only contain letters"),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .regex(/^[A-Za-z\s]+$/, "Last name can only contain letters"),

  dob: z
    .string()
    .min(1, "Date of birth is required")
    .refine((val) => {
      const birth = new Date(val);
      if (isNaN(birth)) return false;
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return age >= MIN_AGE;
    }, { message: `Applicant must be at least ${MIN_AGE} years old` })
    .refine((val) => {
      const birth = new Date(val);
      if (isNaN(birth)) return false;
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return age <= MAX_AGE;
    }, { message: `Applicant must be no older than ${MAX_AGE} years` }),

  gender: z
    .string()
    .min(1, "Please select your gender"),

  maritalStatus: z
    .string()
    .min(1, "Please select your marital status"),

  phone: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),

  email: z
    .string()
    .min(1, "Email address is required")
    .regex(/^\S+@\S+\.\S+$/, "Please enter a valid email address"),

  nationality: z.string().optional().default("Indian"),
});