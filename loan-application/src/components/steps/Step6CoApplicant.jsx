import { useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Users, AlertCircle, CheckCircle2, TrendingUp, Info } from "lucide-react";

/* ─── Thresholds ───────────────────────────────────────────────────────────── */
const HIGH_AMOUNT_THRESHOLD = 1000000; // ₹10 Lakhs

/* ─── Options ──────────────────────────────────────────────────────────────── */
const relationOptions = [
  "Spouse", "Father", "Mother", "Son", "Daughter",
  "Brother", "Sister", "Business Partner", "Other",
];

const occupationOptions = [
  { value: "salaried",      label: "Salaried"      },
  { value: "self-employed", label: "Self-Employed"  },
  { value: "business",      label: "Business Owner" },
  { value: "retired",       label: "Retired"        },
  { value: "homemaker",     label: "Homemaker"      },
  { value: "student",       label: "Student"        },
];

/* ─── Shared classes ───────────────────────────────────────────────────────── */
const inputBase  = "w-full bg-[#282828] border rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder-[#5a5a5a]";
const inputClass = `${inputBase} border-[#3a3a3a] focus:border-[#1DB954]`;
const labelClass = "block text-xs text-[#b3b3b3] mb-2";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const formatINR = (val) => {
  const num = String(val).replace(/\D/g, "");
  return num ? "₹" + Number(num).toLocaleString("en-IN") : "";
};

const calcAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  if (isNaN(birth)) return null;
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const PHONE_REGEX = /^[6-9]\d{9}$/;

/* ─── Sub-components ───────────────────────────────────────────────────────── */
function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
      <AlertCircle size={11} /> {message}
    </p>
  );
}

function PillSelect({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const label = typeof o === "string" ? o : o.label;
        const val   = typeof o === "string" ? o : o.value;
        return (
          <button
            type="button"
            key={val}
            onClick={() => onChange(val)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-200
              ${value === val
                ? "border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954] font-semibold"
                : "border-[#3a3a3a] text-[#b3b3b3] hover:border-[#1DB954]/50"
              }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Main Step6CoApplicant ─────────────────────────────────────────────────── */
function Step6CoApplicant() {
  const { register, setValue, watch, formState: { errors } } = useFormContext();

  const loanType    = watch("loanType")        || "personal";
  const amount      = watch("amount")          || 0;
  const monthlySalary = watch("monthlySalary") || 0;
  const coIncome    = watch("coIncome")        || "";
  const coDob       = watch("coDob")           || "";
  const coPhone     = watch("coPhone")         || "";
  const coRelation  = watch("coRelation")      || "";
  const coOccupation = watch("coOccupation")   || "";
  const hasCoApplicant = watch("hasCoApplicant") || false;
  const coSameAddress  = watch("coSameAddress")  || false;

  const [incomeDisplay, setIncomeDisplay] = useState(coIncome ? formatINR(coIncome) : "");

  /* Is co-applicant mandatory? */
  const isRequired = loanType === "home" || loanType === "business" || Number(amount) >= HIGH_AMOUNT_THRESHOLD;
  const showForm   = isRequired || hasCoApplicant;

  /* Age calculations */
  const coAge    = calcAge(coDob);
  const coAgeOk  = coAge !== null && coAge >= 21 && coAge <= 70;

  /* Phone validation */
  const coPhoneValid   = PHONE_REGEX.test(coPhone);
  const coPhoneInvalid = coPhone.length > 0 && !coPhoneValid;

  /* Combined income */
  const primaryIncome = Number(monthlySalary) || 0;
  const secondaryIncome = Number(coIncome)    || 0;
  const combinedIncome = primaryIncome + secondaryIncome;

  /* Reason label */
  const requiredReason =
    loanType === "home"     ? "Co-applicant is mandatory for Home Loans"
    : loanType === "business" ? "Co-applicant is mandatory for Business Loans"
    : Number(amount) >= HIGH_AMOUNT_THRESHOLD ? `Co-applicant required for loans above ${formatINR(HIGH_AMOUNT_THRESHOLD)}`
    : "";

  return (
    <div>

      {/* ── Intro ── */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/20 px-4 py-1 rounded-full mb-4">
          <Users size={12} className="text-[#1DB954]" />
          <span className="text-[#1DB954] text-xs font-semibold tracking-wider uppercase">
            Co-Applicant Details
          </span>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-1">Co-Applicant Information</h2>
        <p className="text-[#b3b3b3] text-sm">
          A co-applicant can increase your loan eligibility significantly.
        </p>
      </div>

      {/* ── Mandatory banner ── */}
      {isRequired && (
        <div className="flex items-start gap-3 mb-5 p-4 bg-amber-400/10 border border-amber-400/30 rounded-xl">
          <AlertCircle size={14} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-400 text-sm font-medium">{requiredReason}</p>
            <p className="text-[#b3b3b3] text-xs mt-0.5">
              Please fill in the co-applicant details below to proceed.
            </p>
          </div>
        </div>
      )}

      {/* ── Optional toggle ── */}
      {!isRequired && (
        <div className={`flex items-center justify-between p-4 rounded-xl border mb-5 transition-all duration-200
          ${hasCoApplicant ? "border-[#1DB954]/30 bg-[#1DB954]/5" : "border-[#2a2a2a] bg-[#1a1a1a]"}`}>
          <div>
            <p className="text-white text-sm font-medium">Add a co-applicant voluntarily</p>
            <p className="text-[#5a5a5a] text-xs mt-0.5">
              Adding a co-applicant may increase your eligible loan amount
            </p>
          </div>
          <button
            type="button"
            onClick={() => setValue("hasCoApplicant", !hasCoApplicant, { shouldDirty: true })}
            className={`relative w-11 h-6 rounded-full border transition-all duration-300 shrink-0 ml-4
              ${hasCoApplicant ? "bg-[#1DB954] border-[#1DB954]" : "bg-[#282828] border-[#3a3a3a]"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300
              ${hasCoApplicant ? "left-5" : "left-0.5"}`} />
          </button>
        </div>
      )}

      {/* ── Co-applicant Form ── */}
      {showForm && (
        <div className="bg-[#1a1a1a] border border-[#1DB954]/20 rounded-2xl p-5 space-y-4">

          {/* Name + Relation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Full name <span className="text-red-400">*</span>
              </label>
              <input
                {...register("coName")}
                placeholder="Arpit Kumar Mishra"
                className={`${inputBase} ${errors.coName ? "border-red-500" : "border-[#3a3a3a] focus:border-[#1DB954]"}`}
              />
              <FieldError message={errors.coName?.message} />
            </div>

            <div>
              <label className={labelClass}>Relationship <span className="text-red-400">*</span></label>
              <PillSelect
                options={relationOptions}
                value={coRelation}
                onChange={(v) => setValue("coRelation", v, { shouldDirty: true })}
              />
              <FieldError message={errors.coRelation?.message} />
            </div>
          </div>

          {/* DOB */}
          <div>
            <label className={labelClass}>
              Date of birth <span className="text-red-400">*</span>
            </label>
            <input
              {...register("coDob")}
              type="date"
              className={`${inputBase} ${errors.coDob ? "border-red-500" : "border-[#3a3a3a] focus:border-[#1DB954]"}`}
            />
            {coAge !== null && (
              <div className={`inline-flex items-center gap-1.5 mt-1.5 text-xs px-3 py-1 rounded-full border
                ${coAgeOk
                  ? "text-[#1DB954] bg-[#1DB954]/10 border-[#1DB954]/30"
                  : "text-red-400 bg-red-400/10 border-red-400/30"
                }`}>
                {coAgeOk ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                Age: {coAge} years{!coAgeOk && " — must be between 21 and 70"}
              </div>
            )}
            <FieldError message={errors.coDob?.message} />
          </div>

          {/* Phone */}
          <div>
            <label className={labelClass}>
              Mobile number <span className="text-red-400">*</span>
            </label>
            <div className="flex">
              <span className="bg-[#1e1e1e] border border-r-0 border-[#3a3a3a] rounded-l-lg px-3 flex items-center text-sm text-[#b3b3b3] shrink-0">
                +91
              </span>
              <input
                value={coPhone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setValue("coPhone", digits, { shouldDirty: true, shouldValidate: true });
                }}
                type="tel"
                placeholder="9876543210"
                maxLength={10}
                className={`flex-1 ${inputBase} rounded-l-none ${
                  coPhoneInvalid ? "border-red-500"
                  : coPhoneValid ? "border-[#1DB954]"
                  : "border-[#3a3a3a] focus:border-[#1DB954]"
                }`}
              />
            </div>
            {coPhoneValid && (
              <p className="text-[#1DB954] text-xs mt-1 flex items-center gap-1">
                <CheckCircle2 size={11} /> Valid mobile number
              </p>
            )}
            {coPhoneInvalid && <FieldError message="Enter a valid 10-digit Indian mobile number" />}
          </div>

          {/* Occupation */}
          <div>
            <label className={labelClass}>Occupation <span className="text-red-400">*</span></label>
            <PillSelect
              options={occupationOptions}
              value={coOccupation}
              onChange={(v) => setValue("coOccupation", v, { shouldDirty: true })}
            />
            <FieldError message={errors.coOccupation?.message} />
          </div>

          {/* Monthly Income */}
          <div>
            <label className={labelClass}>
              Monthly income <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={incomeDisplay}
              placeholder="₹40,000"
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                setIncomeDisplay(raw ? formatINR(raw) : "");
                setValue("coIncome", raw, { shouldDirty: true });
              }}
              className={`${inputBase} ${errors.coIncome ? "border-red-500" : "border-[#3a3a3a] focus:border-[#1DB954]"}`}
            />
            <FieldError message={errors.coIncome?.message} />
          </div>

          {/* Same address toggle */}
          <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200
            ${coSameAddress ? "border-[#1DB954]/30 bg-[#1DB954]/5" : "border-[#2a2a2a]"}`}>
            <input
              type="checkbox"
              id="coSameAddress"
              checked={coSameAddress}
              onChange={(e) => setValue("coSameAddress", e.target.checked, { shouldDirty: true })}
              className="w-4 h-4 accent-[#1DB954] cursor-pointer"
            />
            <label htmlFor="coSameAddress" className="text-sm text-[#b3b3b3] cursor-pointer">
              Co-applicant's address is same as primary applicant
            </label>
          </div>

        </div>
      )}

      {/* ── Combined Income Card ── */}
      {showForm && combinedIncome > 0 && (
        <div className="mt-5 relative overflow-hidden bg-gradient-to-br from-[#1a2e1e] to-[#0f1f13] border border-[#1DB954]/40 rounded-2xl p-5">
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-[#1DB954]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-[#1DB954]" />
            <p className="text-[#1DB954] text-xs font-semibold uppercase tracking-widest">
              Combined Financial Profile
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-[#b3b3b3] text-xs mb-1">Your Income</p>
              <p className="text-white text-lg font-bold">{formatINR(primaryIncome)}</p>
              <p className="text-[#5a5a5a] text-xs">/ month</p>
            </div>
            <div>
              <p className="text-[#b3b3b3] text-xs mb-1">Co-Applicant</p>
              <p className="text-[#1DB954] text-lg font-bold">{formatINR(secondaryIncome)}</p>
              <p className="text-[#5a5a5a] text-xs">/ month</p>
            </div>
            <div>
              <p className="text-[#b3b3b3] text-xs mb-1">Combined</p>
              <p className="text-white text-xl font-bold">{formatINR(combinedIncome)}</p>
              <p className="text-[#5a5a5a] text-xs">/ month</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
            <Info size={12} className="text-[#5a5a5a]" />
            <p className="text-[#5a5a5a] text-xs">
              Combined income boosts your eligible loan to approximately{" "}
              <span className="text-white font-medium">
                {formatINR(Math.min(combinedIncome * 60, 20000000))}
              </span>
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

export default Step6CoApplicant;