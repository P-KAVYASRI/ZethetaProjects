import { z } from "zod";

const PHONE_REGEX = /^[6-9]\d{9}$/;
const HIGH_AMOUNT_THRESHOLD = 1000000; // ₹10 Lakhs

/* ─── Helper: calculate age from YYYY-MM-DD ─────────────────────────────────── */
const calcAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

/* ─── Step 6 schema ─────────────────────────────────────────────────────────── */
export const step6Schema = z
  .object({

    /* ── Flags that drive conditional step rendering ── */
    loanType:        z.string().optional(),  // carried from step 1
    amount:          z.string().optional(),  // carried from step 1 (raw numeric string)
    hasCoApplicant:  z.boolean().default(false), // optional voluntary toggle

    /* ── Co-applicant fields ── */
    coName:       z.string().optional(),
    coRelation:   z.string().optional(),
    coDob:        z.string().optional(),   // YYYY-MM-DD (date input)
    coPhone:      z.string().optional(),
    coOccupation: z.string().optional(),
    coIncome:     z.string().optional(),   // raw numeric string

    /* ── UX helper ── */
    coSameAddress: z.boolean().default(false),

  })
  .superRefine((data, ctx) => {
    const loanType = data.loanType || "";
    const amount   = Number(data.amount) || 0;

    /* Is co-applicant mandatory? */
    const isRequired =
      loanType === "home" ||
      loanType === "business" ||
      amount >= HIGH_AMOUNT_THRESHOLD;

    /* Validate co-applicant fields only when the form is shown */
    const shouldValidate = isRequired || data.hasCoApplicant;
    if (!shouldValidate) return;

    /* Full name — alphabets, spaces, dots only */
    if (!data.coName || data.coName.trim().length < 2) {
      ctx.addIssue({
        path: ["coName"],
        code: z.ZodIssueCode.custom,
        message: "Co-applicant full name is required",
      });
    } else if (!/^[a-zA-Z\s.'-]+$/.test(data.coName.trim())) {
      ctx.addIssue({
        path: ["coName"],
        code: z.ZodIssueCode.custom,
        message: "Name should contain alphabets only",
      });
    }

    /* Relationship */
    const validRelations = [
      "Spouse", "Father", "Mother", "Son", "Daughter",
      "Brother", "Sister", "Business Partner", "Other",
    ];
    if (!data.coRelation || !validRelations.includes(data.coRelation)) {
      ctx.addIssue({
        path: ["coRelation"],
        code: z.ZodIssueCode.custom,
        message: "Please select a relationship",
      });
    }

    /* Date of birth — age must be 21–70 */
    if (!data.coDob) {
      ctx.addIssue({
        path: ["coDob"],
        code: z.ZodIssueCode.custom,
        message: "Date of birth is required",
      });
    } else {
      const age = calcAge(data.coDob);
      if (age === null) {
        ctx.addIssue({
          path: ["coDob"],
          code: z.ZodIssueCode.custom,
          message: "Invalid date of birth",
        });
      } else if (age < 21 || age > 70) {
        ctx.addIssue({
          path: ["coDob"],
          code: z.ZodIssueCode.custom,
          message: "Co-applicant age must be between 21 and 70 years",
        });
      }
    }

    /* Mobile number — 10-digit Indian */
    if (!data.coPhone || !PHONE_REGEX.test(data.coPhone)) {
      ctx.addIssue({
        path: ["coPhone"],
        code: z.ZodIssueCode.custom,
        message: "Enter a valid 10-digit Indian mobile number",
      });
    }

    /* Occupation */
    const validOccupations = [
      "salaried", "self-employed", "business", "retired", "homemaker", "student",
    ];
    if (!data.coOccupation || !validOccupations.includes(data.coOccupation)) {
      ctx.addIssue({
        path: ["coOccupation"],
        code: z.ZodIssueCode.custom,
        message: "Please select an occupation",
      });
    }

    /* Monthly income — positive numeric */
    if (!data.coIncome || Number(data.coIncome) <= 0) {
      ctx.addIssue({
        path: ["coIncome"],
        code: z.ZodIssueCode.custom,
        message: "Monthly income must be a positive amount",
      });
    }
  });