import { z } from "zod";

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/* ─── Step 5 schema ─────────────────────────────────────────────────────────── */
export const step5Schema = z
  .object({

    /* ── Employment type (always required) ── */
    employmentType: z.enum(
      ["salaried", "self-employed", "business"],
      { errorMap: () => ({ message: "Please select an employment type" }) }
    ),

    /* ── SALARIED fields ── */
    companyName:      z.string().optional(),
    companyType:      z.string().optional(),   // private / public / government / mnc / startup
    designation:      z.string().optional(),
    monthlySalary:    z.string().optional(),   // stored as raw numeric string via INRInput
    salaryMode:       z.string().optional(),   // bank / cash / cheque
    employmentSince:  z.string().optional(),   // YYYY-MM (month input)

    /* ── SELF-EMPLOYED fields ── */
    businessNameSE:   z.string().optional(),   // business name for self-employed
    annualTurnover:   z.string().optional(),   // raw numeric string
    gstNumber:        z.string().optional(),
    businessSinceSE:  z.string().optional(),   // YYYY-MM

    /* ── BUSINESS OWNER fields ── */
    businessName:     z.string().optional(),   // company / firm name
    businessType:     z.string().optional(),   // proprietorship / partnership / pvt_ltd …
    businessSince:    z.string().optional(),   // YYYY-MM

    /* ── Common ── */
    existingEMIs: z
      .string()
      .optional()
      .refine(
        (v) => !v || Number(v) >= 0,
        "EMI amount cannot be negative"
      ),

  })
  .superRefine((data, ctx) => {
    const type = data.employmentType;

    /* ── Salaried validations ── */
    if (type === "salaried") {
      if (!data.companyName || data.companyName.trim().length < 2) {
        ctx.addIssue({
          path: ["companyName"],
          code: z.ZodIssueCode.custom,
          message: "Company name is required",
        });
      }
      if (!data.designation || data.designation.trim().length < 2) {
        ctx.addIssue({
          path: ["designation"],
          code: z.ZodIssueCode.custom,
          message: "Designation is required",
        });
      }
      if (!data.monthlySalary || Number(data.monthlySalary) <= 0) {
        ctx.addIssue({
          path: ["monthlySalary"],
          code: z.ZodIssueCode.custom,
          message: "Monthly salary must be a positive amount",
        });
      }
      /* Work experience — minimum 6 months */
      if (data.employmentSince) {
        const [y, m] = data.employmentSince.split("-").map(Number);
        const now = new Date();
        const months =
          (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
        if (months < 6) {
          ctx.addIssue({
            path: ["employmentSince"],
            code: z.ZodIssueCode.custom,
            message: "Minimum 6 months of work experience required",
          });
        }
      } else {
        ctx.addIssue({
          path: ["employmentSince"],
          code: z.ZodIssueCode.custom,
          message: "Employment start date is required",
        });
      }
    }

    /* ── Self-employed validations ── */
    if (type === "self-employed") {
      if (!data.annualTurnover || Number(data.annualTurnover) <= 0) {
        ctx.addIssue({
          path: ["annualTurnover"],
          code: z.ZodIssueCode.custom,
          message: "Annual turnover must be a positive amount",
        });
      }
      /* GST — optional but must be valid format if provided */
      if (data.gstNumber && data.gstNumber.length > 0) {
        if (!GST_REGEX.test(data.gstNumber)) {
          ctx.addIssue({
            path: ["gstNumber"],
            code: z.ZodIssueCode.custom,
            message: "Invalid GST number format (e.g. 22AAAAA0000A1Z5)",
          });
        }
      }
    }

    /* ── Business owner validations ── */
    if (type === "business") {
      if (!data.businessName || data.businessName.trim().length < 2) {
        ctx.addIssue({
          path: ["businessName"],
          code: z.ZodIssueCode.custom,
          message: "Company / firm name is required",
        });
      }
      if (!data.annualTurnover || Number(data.annualTurnover) <= 0) {
        ctx.addIssue({
          path: ["annualTurnover"],
          code: z.ZodIssueCode.custom,
          message: "Annual turnover must be a positive amount",
        });
      }
      /* GST required for business owners */
      if (!data.gstNumber || !GST_REGEX.test(data.gstNumber)) {
        ctx.addIssue({
          path: ["gstNumber"],
          code: z.ZodIssueCode.custom,
          message: "Valid GST number is required for business owners",
        });
      }
      /* Business age — minimum 2 years preferred (warn via UI; hard block at 0) */
      if (!data.businessSince) {
        ctx.addIssue({
          path: ["businessSince"],
          code: z.ZodIssueCode.custom,
          message: "Business established date is required",
        });
      }
    }
  });