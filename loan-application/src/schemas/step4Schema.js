import { z } from "zod";

/* ─── Reusable address block ────────────────────────────────────────────────── */
const addressBlock = z.object({
  addressLine1: z
    .string()
    .min(10, "Address must be at least 10 characters"),

  addressLine2: z.string().optional(),

  pinCode: z
    .string()
    .regex(/^[0-9]{6}$/, "PIN must be exactly 6 digits"),

  city: z
    .string()
    .min(2, "City is required"),

  state: z
    .string()
    .min(2, "State is required"),
});

/* ─── Step 4 schema ─────────────────────────────────────────────────────────── */
export const step4Schema = z
  .object({

    /* ── Current address ── */
    addressLine1: z
      .string()
      .min(10, "Address must be at least 10 characters"),

    addressLine2: z.string().optional(),

    pinCode: z
      .string()
      .regex(/^[0-9]{6}$/, "PIN must be exactly 6 digits"),

    city: z
      .string()
      .min(2, "City is required"),

    state: z
      .string()
      .min(2, "State is required"),

    /* ── Residence details ── */
    residenceType: z.enum(
      ["owned", "rented", "family", "company"],
      { errorMap: () => ({ message: "Please select a residence type" }) }
    ),

    yearsAtAddress: z.enum(
      [
        "Less than 1 year",
        "1–2 years",
        "2–5 years",
        "5–10 years",
        "More than 10 years",
      ],
      { errorMap: () => ({ message: "Please select years at address" }) }
    ),

    /* ── Same-address toggle ── */
    sameAsCurrent: z.boolean().default(true),

    /* ── Permanent address (only validated when sameAsCurrent = false) ── */
    permAddressLine1: z.string().optional(),
    permAddressLine2: z.string().optional(),
    permPinCode:      z.string().optional(),
    permCity:         z.string().optional(),
    permState:        z.string().optional(),

  })
  /* Conditional: if permanent address differs, validate it fully */
  .superRefine((data, ctx) => {
    if (!data.sameAsCurrent) {
      if (!data.permAddressLine1 || data.permAddressLine1.length < 10) {
        ctx.addIssue({
          path: ["permAddressLine1"],
          code: z.ZodIssueCode.custom,
          message: "Permanent address must be at least 10 characters",
        });
      }
      if (!data.permPinCode || !/^[0-9]{6}$/.test(data.permPinCode)) {
        ctx.addIssue({
          path: ["permPinCode"],
          code: z.ZodIssueCode.custom,
          message: "PIN must be exactly 6 digits",
        });
      }
      if (!data.permCity || data.permCity.length < 2) {
        ctx.addIssue({
          path: ["permCity"],
          code: z.ZodIssueCode.custom,
          message: "City is required",
        });
      }
      if (!data.permState || data.permState.length < 2) {
        ctx.addIssue({
          path: ["permState"],
          code: z.ZodIssueCode.custom,
          message: "State is required",
        });
      }
    }
  });