import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const HIGH_AMOUNT_THRESHOLD = 2500000; // ₹25 Lakhs

const schema = z.object({
  hasCoApplicant: z.boolean(),
  coName: z.string().optional(),
  coRelation: z.string().optional(),
  coDob: z.string().optional(),
  coPhone: z.string().optional(),
  coEmail: z.string().optional(),
  coEmployment: z.string().optional(),
  coIncome: z.string().optional(),
  coPan: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.hasCoApplicant) {
    if (!data.coName || data.coName.length < 2)
      ctx.addIssue({ path: ["coName"], code: "custom", message: "Full name is required" });
    if (!data.coRelation)
      ctx.addIssue({ path: ["coRelation"], code: "custom", message: "Relation is required" });
    if (!data.coPhone || !/^[6-9]\d{9}$/.test(data.coPhone))
      ctx.addIssue({ path: ["coPhone"], code: "custom", message: "Enter valid 10-digit Indian mobile number" });
    if (!data.coEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.coEmail))
      ctx.addIssue({ path: ["coEmail"], code: "custom", message: "Enter a valid email address" });
    if (!data.coEmployment)
      ctx.addIssue({ path: ["coEmployment"], code: "custom", message: "Employment type is required" });
    if (!data.coIncome || isNaN(Number(data.coIncome)) || Number(data.coIncome) < 10000)
      ctx.addIssue({ path: ["coIncome"], code: "custom", message: "Minimum income is ₹10,000" });
    if (data.coPan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.coPan))
      ctx.addIssue({ path: ["coPan"], code: "custom", message: "Invalid PAN format (e.g. ABCDE1234F)" });
  }
});

const relationOptions = [
  "Spouse", "Father", "Mother", "Son", "Daughter", "Brother", "Sister", "Other",
];

const employmentOptions = [
  { value: "salaried",      label: "Salaried" },
  { value: "self-employed", label: "Self-employed" },
  { value: "business",      label: "Business" },
  { value: "retired",       label: "Retired" },
];

const inputClass =
  "w-full bg-[#282828] border border-[#3a3a3a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#1DB954] transition-colors placeholder-[#5a5a5a]";
const labelClass = "block text-xs text-[#b3b3b3] mb-2";
const errorClass = "text-red-400 text-xs mt-1";

function FieldError({ message }) {
  if (!message) return null;
  return <p className={errorClass}>⚠ {message}</p>;
}

function formatINR(val) {
  const num = val.replace(/\D/g, "");
  return num ? "₹" + Number(num).toLocaleString("en-IN") : "";
}

function NotRequired({ loanType, amount }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#1DB954]/10 border border-[#1DB954]/20 flex items-center justify-center text-3xl mb-5">
        ✓
      </div>
      <h3 className="text-white text-lg font-semibold mb-2">Co-applicant not required</h3>
      <p className="text-[#b3b3b3] text-sm max-w-sm leading-relaxed">
        Your selected loan type{" "}
        <span className="text-white font-medium">({loanType})</span> with amount{" "}
        <span className="text-white font-medium">
          (₹{Number(amount).toLocaleString("en-IN")})
        </span>{" "}
        does not require a co-applicant. You can proceed to the next step.
      </p>
      <div className="mt-6 flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/20 px-4 py-2 rounded-full">
        <span className="w-2 h-2 rounded-full bg-[#1DB954]"></span>
        <span className="text-[#1DB954] text-xs font-medium">Click Next Step to continue</span>
      </div>
    </div>
  );
}

function Step6CoApplicant({ onDataChange, formData = {} }) {
  const loanType = formData?.loanType ?? "personal";
  const amount = formData?.amount ?? 0;

  const isRequired =
    loanType === "home" ||
    loanType === "business" ||
    Number(amount) >= HIGH_AMOUNT_THRESHOLD;

  const [hasCoApplicant, setHasCoApplicant] = useState(isRequired);
  const [incomeDisplay, setIncomeDisplay] = useState("");
  const [selectedRelation, setSelectedRelation] = useState("");
  const [selectedEmployment, setSelectedEmployment] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { hasCoApplicant: isRequired },
  });

  const onSubmit = (data) => {
    onDataChange?.(data);
  };

  const reasonTag = () => {
    if (loanType === "home") return "Required for home loans";
    if (loanType === "business") return "Required for business loans";
    if (Number(amount) >= HIGH_AMOUNT_THRESHOLD)
      return `Required for loans above ₹${Number(HIGH_AMOUNT_THRESHOLD).toLocaleString("en-IN")}`;
    return "";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-1">Co-Applicant Details</h2>
        <p className="text-[#b3b3b3] text-sm">
          A co-applicant increases your loan eligibility and chances of approval.
        </p>
      </div>

      {/* Conditional: not required */}
      {!isRequired ? (
        <>
          <NotRequired loanType={loanType} amount={amount} />

          {/* Optional opt-in */}
          <div className="mt-6 flex items-center gap-3 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
            <input
              type="checkbox"
              id="optIn"
              checked={hasCoApplicant}
              onChange={(e) => {
                setHasCoApplicant(e.target.checked);
                setValue("hasCoApplicant", e.target.checked);
              }}
              className="w-4 h-4 accent-[#1DB954] cursor-pointer"
            />
            <label htmlFor="optIn" className="text-sm text-[#b3b3b3] cursor-pointer">
              I want to add a co-applicant voluntarily
              <span className="block text-[#5a5a5a] text-xs mt-0.5">
                Helps improve loan amount eligibility
              </span>
            </label>
          </div>
        </>
      ) : (
        /* Required badge */
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-3 py-1 mb-5">
          <span className="text-amber-400 text-xs font-medium">⚠ {reasonTag()}</span>
        </div>
      )}

      {/* Co-applicant form */}
      {hasCoApplicant && (
        <div className="bg-[#1a1a1a] border border-[#1DB954]/20 rounded-2xl p-5 mt-4">
          <p className="text-[#1DB954] text-xs font-semibold uppercase tracking-widest mb-4">
            Co-applicant information
          </p>

          {/* Full Name */}
          <div className="mb-4">
            <label className={labelClass}>Full name <span className="text-red-400">*</span></label>
            <input
              {...register("coName")}
              placeholder="e.g. Ravi Sharma"
              className={inputClass}
            />
            <FieldError message={errors.coName?.message} />
          </div>

          {/* Relation & DOB */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Relation <span className="text-red-400">*</span></label>
              <div className="flex flex-wrap gap-2">
                {relationOptions.map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => {
                      setSelectedRelation(r);
                      setValue("coRelation", r, { shouldValidate: true });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-200
                      ${selectedRelation === r
                        ? "border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954] font-semibold"
                        : "border-[#3a3a3a] text-[#b3b3b3] hover:border-[#1DB954]"
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <FieldError message={errors.coRelation?.message} />
            </div>

            <div>
              <label className={labelClass}>Date of birth</label>
              <input
                {...register("coDob")}
                type="date"
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                  .toISOString().split("T")[0]}
                className={inputClass}
              />
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Phone <span className="text-red-400">*</span></label>
              <div className="flex">
                <span className="bg-[#1e1e1e] border border-r-0 border-[#3a3a3a] rounded-l-lg px-3 flex items-center text-sm text-[#b3b3b3]">
                  +91
                </span>
                <input
                  {...register("coPhone")}
                  type="tel"
                  maxLength={10}
                  placeholder="98765 43210"
                  className="flex-1 bg-[#282828] border border-[#3a3a3a] rounded-r-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#1DB954] transition-colors placeholder-[#5a5a5a]"
                />
              </div>
              <FieldError message={errors.coPhone?.message} />
            </div>

            <div>
              <label className={labelClass}>Email <span className="text-red-400">*</span></label>
              <input
                {...register("coEmail")}
                type="email"
                placeholder="ravi@example.com"
                className={inputClass}
              />
              <FieldError message={errors.coEmail?.message} />
            </div>
          </div>

          {/* Employment Type */}
          <div className="mb-4">
            <label className={labelClass}>Employment type <span className="text-red-400">*</span></label>
            <div className="flex flex-wrap gap-2">
              {employmentOptions.map((e) => (
                <button
                  type="button"
                  key={e.value}
                  onClick={() => {
                    setSelectedEmployment(e.value);
                    setValue("coEmployment", e.value, { shouldValidate: true });
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs border transition-all duration-200
                    ${selectedEmployment === e.value
                      ? "border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954] font-semibold"
                      : "border-[#3a3a3a] text-[#b3b3b3] hover:border-[#1DB954]"
                    }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
            <FieldError message={errors.coEmployment?.message} />
          </div>

          {/* Monthly Income & PAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Monthly income <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={incomeDisplay}
                placeholder="e.g. ₹40,000"
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setIncomeDisplay(formatINR(e.target.value));
                  setValue("coIncome", raw, { shouldValidate: true });
                }}
                className={inputClass}
              />
              <FieldError message={errors.coIncome?.message} />
            </div>

            <div>
              <label className={labelClass}>
                PAN number <span className="text-[#5a5a5a]">(optional)</span>
              </label>
              <input
                {...register("coPan")}
                placeholder="ABCDE1234F"
                maxLength={10}
                className={`${inputClass} uppercase tracking-widest`}
              />
              <FieldError message={errors.coPan?.message} />
            </div>
          </div>
        </div>
      )}

      <button type="submit" id="step6-submit" className="hidden" />
    </form>
  );
}

export default Step6CoApplicant;