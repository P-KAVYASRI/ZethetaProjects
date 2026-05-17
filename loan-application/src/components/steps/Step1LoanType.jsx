import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import {
  House, User, Car, GraduationCap, Briefcase, Gem,
  TrendingUp, Calculator, AlertCircle, Building2, BriefcaseBusiness, UserCheck,
} from "lucide-react";

/* ─── Loan config ──────────────────────────────────────────────────────────── */
const loanTypes = [
  {
    id: "home",
    icon: House,
    label: "Home Loan",
    min: 500000,
    max: 10000000,
    tenures: [60, 120, 180, 240, 300],
    rate: 8.5,
    badge: "Property documents required in later steps",
    note: "Co-applicant may be required",
  },
  {
    id: "personal",
    icon: User,
    label: "Personal Loan",
    min: 50000,
    max: 1000000,
    tenures: [6, 12, 24, 36, 48],
    rate: 12.5,
    badge: "No collateral needed — quick approval",
    note: "Disbursed within 24 hours",
  },
  {
    id: "car",
    icon: Car,
    label: "Car Loan",
    min: 100000,
    max: 5000000,
    tenures: [12, 24, 36, 48, 60],
    rate: 9.0,
    badge: "Vehicle RC & insurance needed later",
    note: "Up to 90% of vehicle value",
  },
  {
    id: "education",
    icon: GraduationCap,
    label: "Education Loan",
    min: 50000,
    max: 2000000,
    tenures: [24, 60, 84, 120],
    rate: 10.5,
    badge: "Admission letter required in later steps",
    note: "Moratorium period available",
  },
  {
    id: "business",
    icon: Briefcase,
    label: "Business Loan",
    min: 500000,
    max: 20000000,
    tenures: [12, 24, 36, 48, 60],
    rate: 11.0,
    badge: "Business registration & GST docs needed",
    note: "Requires business vintage ≥ 2 years",
  },
  {
    id: "gold",
    icon: Gem,
    label: "Gold Loan",
    min: 10000,
    max: 2500000,
    tenures: [3, 6, 12, 18, 24],
    rate: 7.5,
    badge: "Gold valuation done at branch visit",
    note: "Same-day disbursal possible",
  },
];

const purposeOptions = [
  "Medical Emergency",
  "Business Expansion",
  "Home Renovation",
  "Vehicle Purchase",
  "Education",
  "Wedding",
  "Travel",
  "Debt Consolidation",
  "Other",
];

const employmentTypes = [
  { value: "salaried",      label: "Salaried",       icon: Building2 },
  { value: "self-employed", label: "Self-Employed",   icon: BriefcaseBusiness },
  { value: "business",      label: "Business Owner",  icon: UserCheck },
];

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const formatINR = (val) =>
  "₹" + Number(val).toLocaleString("en-IN");

const tenureLabel = (months) =>
  months < 12
    ? `${months} mo`
    : months % 12 === 0
    ? `${months / 12} yr`
    : `${months} mo`;

const getLoanCategory = (amount) => {
  if (amount < 200000)  return { label: "Micro Loan",       color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/30" };
  if (amount < 1000000) return { label: "Small Loan",       color: "text-cyan-400",   bg: "bg-cyan-400/10 border-cyan-400/30" };
  if (amount < 5000000) return { label: "Medium Loan",      color: "text-[#1DB954]",  bg: "bg-[#1DB954]/10 border-[#1DB954]/30" };
  return                       { label: "High Value Loan",  color: "text-amber-400",  bg: "bg-amber-400/10 border-amber-400/30" };
};

/* EMI = P × r × (1+r)^n / ((1+r)^n − 1) */
const calcEMI = (principal, annualRate, months) => {
  if (!principal || !months || !annualRate) return 0;
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  const pow = Math.pow(1 + r, months);
  return Math.round((principal * r * pow) / (pow - 1));
};

/* ─── Sub-components ───────────────────────────────────────────────────────── */
function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
      <AlertCircle size={11} />
      {message}
    </p>
  );
}

/* ─── Main component ───────────────────────────────────────────────────────── */
function Step1LoanDetails() {
  const { setValue, watch, formState: { errors } } = useFormContext();

  const selectedType   = watch("loanType")        || "";
  const amount         = watch("amount")           || 500000;
  const tenure         = watch("tenure")           || 0;
  const purpose        = watch("purpose")          || "";
  const employmentType = watch("employmentType")   || "salaried";

  const currentLoan = loanTypes.find((l) => l.id === selectedType);
  const loanCategory = getLoanCategory(amount);

  const emi = useMemo(
    () => calcEMI(amount, currentLoan?.rate ?? 10, tenure),
    [amount, currentLoan?.rate, tenure]
  );

  const totalPayable   = emi * tenure;
  const totalInterest  = totalPayable - amount;

  const handleTypeSelect = (loan) => {
    const mid = Math.round(((loan.min + loan.max) / 2) / 10000) * 10000;
    const defaultTenure = loan.tenures[1] ?? loan.tenures[0];
    setValue("loanType", loan.id,      { shouldDirty: true, shouldValidate: true });
    setValue("amount",   mid,          { shouldDirty: true });
    setValue("tenure",   defaultTenure,{ shouldDirty: true });
  };

  return (
    <div className="max-w-5xl mx-auto">

      {/* ── Intro ── */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/20 px-4 py-1 rounded-full mb-4">
          <span className="text-[#1DB954] text-xs font-semibold tracking-wider uppercase">Smart Loan Journey</span>
        </div>
        <h2 className="text-4xl font-bold text-white leading-tight mb-3">
          Find the perfect loan
          <span className="text-[#1DB954]"> for your needs</span>
        </h2>
        <p className="text-[#b3b3b3] max-w-2xl leading-relaxed">
          Choose your preferred loan type and configure repayment options.
        </p>
      </div>

      {/* ── Loan Type Cards ── */}
      <div className="mb-2">
        <label className="block text-xs text-[#b3b3b3] mb-3">
          Select loan type <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {loanTypes.map((loan) => {
            const Icon = loan.icon;
            const isSelected = selectedType === loan.id;
            return (
              <div
                key={loan.id}
                onClick={() => handleTypeSelect(loan)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:scale-[1.04] hover:border-[#1DB954]/60
                  ${isSelected
                    ? "border-[#1DB954] bg-[#1a2e1e] shadow-lg shadow-[#1DB954]/10"
                    : "border-[#3a3a3a] bg-[#282828] hover:bg-[#2e2e2e]"
                  }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                  ${isSelected ? "bg-[#1DB954]/20" : "bg-[#1e1e1e]"}`}>
                  <Icon size={20} color={isSelected ? "#1DB954" : "#81d5a9"} />
                </div>
                <span className={`text-xs font-medium text-center leading-tight ${isSelected ? "text-white" : "text-[#b3b3b3]"}`}>
                  {loan.label}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
                )}
              </div>
            );
          })}
        </div>
        <FieldError message={errors.loanType?.message} />
      </div>

      {/* ── Loan Badge ── */}
      {currentLoan && (
        <div className="flex flex-wrap items-center gap-2 mt-4 mb-6">
          <div className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-full px-3 py-1">
            <span className="text-[#1DB954] text-xs">ℹ {currentLoan.badge}</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1">
            <span className="text-[#b3b3b3] text-xs">📌 {currentLoan.note}</span>
          </div>
        </div>
      )}

      {/* ── Amount + Tenure (2-col on desktop) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

        {/* Amount */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-[#b3b3b3]">
              Loan amount <span className="text-red-400">*</span>
            </label>
            {/* Category badge */}
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${loanCategory.bg} ${loanCategory.color}`}>
              {loanCategory.label}
            </span>
          </div>

          <p className="text-[#1DB954] text-3xl font-bold mb-3 tracking-tight">
            {formatINR(amount)}
          </p>

          <input
            type="range"
            min={currentLoan?.min ?? 50000}
            max={currentLoan?.max ?? 1000000}
            step={10000}
            value={amount}
            onChange={(e) => setValue("amount", Number(e.target.value), { shouldDirty: true })}
            className="w-full accent-[#1DB954] cursor-pointer"
          />

          <div className="flex justify-between mt-1">
            <span className="text-[#5a5a5a] text-xs">{formatINR(currentLoan?.min ?? 50000)}</span>
            <span className="text-[#5a5a5a] text-xs">{formatINR(currentLoan?.max ?? 1000000)}</span>
          </div>

          <FieldError message={errors.amount?.message} />
        </div>

        {/* Tenure */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
          <label className="block text-xs text-[#b3b3b3] mb-3">
            Loan tenure <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {(currentLoan?.tenures ?? [6, 12, 24, 36, 48]).map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setValue("tenure", t, { shouldDirty: true, shouldValidate: true })}
                className={`px-4 py-1.5 rounded-full text-xs border font-medium transition-all duration-200
                  ${tenure === t
                    ? "border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954] shadow-sm shadow-[#1DB954]/20"
                    : "border-[#3a3a3a] text-[#b3b3b3] hover:border-[#1DB954]/50 hover:text-white"
                  }`}
              >
                {tenureLabel(t)}
              </button>
            ))}
          </div>
          {tenure > 0 && (
            <p className="text-[#5a5a5a] text-xs mt-3">
              Selected: <span className="text-white font-medium">{tenure} months</span>
              {tenure >= 12 && <span className="text-[#5a5a5a]"> ({(tenure / 12).toFixed(1)} years)</span>}
            </p>
          )}
          <FieldError message={errors.tenure?.message} />
        </div>

      </div>

      {/* ── Purpose + Employment (2-col) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

        {/* Purpose */}
        <div>
          <label className="block text-xs text-[#b3b3b3] mb-2">
            Purpose of loan <span className="text-red-400">*</span>
          </label>
          <select
            value={purpose}
            onChange={(e) => setValue("purpose", e.target.value, { shouldDirty: true, shouldValidate: true })}
            className="w-full bg-[#282828] border border-[#3a3a3a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#1DB954] transition-colors"
          >
            <option value="">Select a purpose</option>
            {purposeOptions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <FieldError message={errors.purpose?.message} />
        </div>

        {/* Employment Type */}
        <div>
          <label className="block text-xs text-[#b3b3b3] mb-2">
            Employment type <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-col gap-2">
            {employmentTypes.map(({ value, label, icon: Icon }) => (
              <button
                type="button"
                key={value}
                onClick={() => setValue("employmentType", value, { shouldDirty: true, shouldValidate: true })}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 text-left
                  ${employmentType === value
                    ? "border-[#1DB954] bg-[#1DB954]/10 text-[#1DB954]"
                    : "border-[#3a3a3a] bg-[#282828] text-[#b3b3b3] hover:border-[#1DB954]/50"
                  }`}
              >
                <Icon size={16} />
                {label}
                {employmentType === value && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
          <FieldError message={errors.employmentType?.message} />
        </div>

      </div>

      {/* ── EMI Preview Card ── */}
      {emi > 0 && tenure > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1a2e1e] to-[#0f1f13] border border-[#1DB954]/40 rounded-2xl p-5">
          {/* Decorative glow */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#1DB954]/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 mb-4">
            <Calculator size={16} className="text-[#1DB954]" />
            <p className="text-[#1DB954] text-xs font-semibold uppercase tracking-widest">
              Estimated Repayment
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* EMI */}
            <div>
              <p className="text-[#b3b3b3] text-xs mb-1">Monthly EMI</p>
              <p className="text-white text-2xl font-bold">{formatINR(emi)}</p>
              <p className="text-[#5a5a5a] text-xs">/ month</p>
            </div>

            {/* Total Interest */}
            <div>
              <p className="text-[#b3b3b3] text-xs mb-1">Total Interest</p>
              <p className="text-amber-400 text-xl font-semibold">{formatINR(totalInterest)}</p>
              <p className="text-[#5a5a5a] text-xs">@ {currentLoan?.rate ?? 10}% p.a.</p>
            </div>

            {/* Total Payable */}
            <div>
              <p className="text-[#b3b3b3] text-xs mb-1">Total Payable</p>
              <p className="text-white text-xl font-semibold">{formatINR(totalPayable)}</p>
              <p className="text-[#5a5a5a] text-xs">over {tenureLabel(tenure)}</p>
            </div>
          </div>

          {/* Progress bar — principal vs interest ratio */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-[#5a5a5a] mb-1">
              <span>Principal</span>
              <span>Interest</span>
            </div>
            <div className="w-full h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1DB954] rounded-full transition-all duration-500"
                style={{ width: `${Math.round((amount / totalPayable) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-[#1DB954]">{Math.round((amount / totalPayable) * 100)}%</span>
              <span className="text-amber-400">{Math.round((totalInterest / totalPayable) * 100)}%</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            <TrendingUp size={12} className="text-[#1DB954]" />
            <p className="text-[#5a5a5a] text-xs">
              Indicative rates — final rate depends on your credit profile.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

export default Step1LoanDetails;