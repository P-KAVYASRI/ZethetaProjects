import { useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import {
  Building2, BriefcaseBusiness, UserCheck,
  TrendingUp, AlertCircle, CheckCircle2, Info,
} from "lucide-react";

/* ─── Shared classes ───────────────────────────────────────────────────────── */
const inputBase =
  "w-full bg-[#282828] border rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder-[#5a5a5a]";
const inputClass  = `${inputBase} border-[#3a3a3a] focus:border-[#1DB954]`;
const labelClass  = "block text-xs text-[#b3b3b3] mb-2";

/* ─── GST regex ────────────────────────────────────────────────────────────── */
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/* ─── Employment tabs ──────────────────────────────────────────────────────── */
const employmentTabs = [
  { value: "salaried",      label: "Salaried",       icon: Building2 },
  { value: "self-employed", label: "Self-Employed",  icon: BriefcaseBusiness },
  { value: "business",      label: "Business Owner", icon: UserCheck },
];

/* ─── Options ──────────────────────────────────────────────────────────────── */
const companyTypeOptions  = [
  { value: "private",    label: "Private Ltd" },
  { value: "public",     label: "Public Ltd"  },
  { value: "government", label: "Government"  },
  { value: "mnc",        label: "MNC"         },
  { value: "startup",    label: "Startup"     },
];
const salaryModeOptions   = [
  { value: "bank",   label: "Bank Transfer" },
  { value: "cash",   label: "Cash"          },
  { value: "cheque", label: "Cheque"        },
];
const businessTypeOptions = [
  { value: "proprietorship", label: "Proprietorship" },
  { value: "partnership",    label: "Partnership"    },
  { value: "pvt_ltd",        label: "Pvt Ltd"        },
  { value: "llp",            label: "LLP"            },
  { value: "public_ltd",     label: "Public Ltd"     },
];

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const formatINR = (raw) => {
  const num = String(raw).replace(/\D/g, "");
  return num ? "₹" + Number(num).toLocaleString("en-IN") : "";
};

const parseINR = (display) => display.replace(/[^\d]/g, "");

const calcMonthsSince = (monthStr) => {
  if (!monthStr) return null;
  const [y, m] = monthStr.split("-").map(Number);
  const now = new Date();
  return (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
};

/* Eligible loan = ~5× annual income, capped at 2 Cr */
const calcEligibility = (monthlyIncome, existingEMIs = 0) => {
  const net = Math.max(0, Number(monthlyIncome) - Number(existingEMIs));
  return Math.min(net * 12 * 5, 20000000);
};

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
      {options.map((o) => (
        <button
          type="button"
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-4 py-1.5 rounded-full text-xs border transition-all duration-200
            ${value === o.value
              ? "border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954] font-semibold"
              : "border-[#3a3a3a] text-[#b3b3b3] hover:border-[#1DB954]/50"
            }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function INRInput({ placeholder, value, onChange, error }) {
  const [display, setDisplay] = useState(value ? formatINR(value) : "");
  return (
    <>
      <input
        type="text"
        value={display}
        placeholder={placeholder}
        onChange={(e) => {
          const raw = parseINR(e.target.value);
          setDisplay(raw ? formatINR(raw) : "");
          onChange(raw);
        }}
        className={`${inputBase} ${error ? "border-red-500" : "border-[#3a3a3a] focus:border-[#1DB954]"}`}
      />
      <FieldError message={error} />
    </>
  );
}

/* ─── Main ─────────────────────────────────────────────────────────────────── */
function Step5Employment() {
  const { register, setValue, watch, formState: { errors } } = useFormContext();

  const employmentType   = watch("employmentType")   || "salaried";
  const companyType      = watch("companyType")      || "";
  const salaryMode       = watch("salaryMode")       || "";
  const businessType     = watch("businessType")     || "";
  const employmentSince  = watch("employmentSince")  || "";
  const businessSince    = watch("businessSince")    || "";
  const monthlySalary    = watch("monthlySalary")    || "";
  const annualTurnover   = watch("annualTurnover")   || "";
  const existingEMIs     = watch("existingEMIs")     || "";
  const gstNumber        = watch("gstNumber")        || "";

  /* Work experience in months */
  const expMonths = useMemo(
    () => calcMonthsSince(employmentSince),
    [employmentSince]
  );
  const bizMonths = useMemo(
    () => calcMonthsSince(businessSince),
    [businessSince]
  );

  /* Income for eligibility */
  const incomeForCalc = useMemo(() => {
    if (employmentType === "salaried")      return Number(monthlySalary)    || 0;
    if (employmentType === "self-employed") return Math.round((Number(annualTurnover) || 0) / 12);
    if (employmentType === "business")      return Math.round((Number(annualTurnover) || 0) / 12);
    return 0;
  }, [employmentType, monthlySalary, annualTurnover]);

  const eligibleAmount = useMemo(
    () => calcEligibility(incomeForCalc, existingEMIs),
    [incomeForCalc, existingEMIs]
  );

  /* Debt-to-income ratio */
  const dtiRatio = incomeForCalc > 0
    ? Math.round((Number(existingEMIs) / incomeForCalc) * 100)
    : 0;

  const gstValid   = GST_REGEX.test(gstNumber);
  const gstInvalid = gstNumber.length > 0 && !gstValid;

  return (
    <div>

      {/* ── Intro ── */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/20 px-4 py-1 rounded-full mb-4">
          <TrendingUp size={12} className="text-[#1DB954]" />
          <span className="text-[#1DB954] text-xs font-semibold tracking-wider uppercase">
            Employment & Income
          </span>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-1">Financial Profile</h2>
        <p className="text-[#b3b3b3] text-sm">
          Tell us about your employment and income details.
        </p>
      </div>

      {/* ── Employment Type Tabs ── */}
      <div className="flex gap-3 mb-6">
        {employmentTabs.map(({ value, label, icon: Icon }) => (
          <button
            type="button"
            key={value}
            onClick={() =>
              setValue("employmentType", value, {
                shouldDirty: true, shouldTouch: true, shouldValidate: true,
              })
            }
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all duration-200
              ${employmentType === value
                ? "border-[#1DB954] bg-[#1DB954]/10 text-[#1DB954] shadow-md shadow-[#1DB954]/10"
                : "border-[#3a3a3a] bg-[#282828] text-[#b3b3b3] hover:border-[#1DB954]/40"
              }`}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ═══ SALARIED ═══ */}
      {employmentType === "salaried" && (
        <div className="bg-[#1a1a1a] border border-[#1DB954]/20 rounded-2xl p-5 space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Name */}
            <div>
              <label className={labelClass}>Company name <span className="text-red-400">*</span></label>
              <input
                {...register("companyName")}
                placeholder="Infosys Ltd"
                className={`${inputBase} ${errors.companyName ? "border-red-500" : "border-[#3a3a3a] focus:border-[#1DB954]"}`}
              />
              <FieldError message={errors.companyName?.message} />
            </div>

            {/* Designation */}
            <div>
              <label className={labelClass}>Designation <span className="text-red-400">*</span></label>
              <input
                {...register("designation")}
                placeholder="Software Engineer"
                className={inputClass}
              />
              <FieldError message={errors.designation?.message} />
            </div>
          </div>

          {/* Company Type */}
          <div>
            <label className={labelClass}>Company type</label>
            <PillSelect
              options={companyTypeOptions}
              value={companyType}
              onChange={(v) => setValue("companyType", v, { shouldDirty: true })}
            />
          </div>

          {/* Employed Since */}
          <div>
            <label className={labelClass}>
              Employed since <span className="text-red-400">*</span>
            </label>
            <input
              {...register("employmentSince")}
              type="month"
              max={new Date().toISOString().slice(0, 7)}
              className={inputClass}
            />
            {expMonths !== null && (
              <div className={`inline-flex items-center gap-1.5 mt-1.5 text-xs px-3 py-1 rounded-full border
                ${expMonths >= 6
                  ? "text-[#1DB954] bg-[#1DB954]/10 border-[#1DB954]/30"
                  : "text-amber-400 bg-amber-400/10 border-amber-400/30"
                }`}>
                {expMonths >= 6 ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                {expMonths >= 12
                  ? `${Math.floor(expMonths / 12)} yr ${expMonths % 12} mo experience`
                  : `${expMonths} months experience`}
                {expMonths < 6 && " — minimum 6 months required"}
              </div>
            )}
            <FieldError message={errors.employmentSince?.message} />
          </div>

          {/* Monthly Salary */}
          <div>
            <label className={labelClass}>Monthly salary <span className="text-red-400">*</span></label>
            <INRInput
              placeholder="₹50,000"
              value={monthlySalary}
              onChange={(raw) => setValue("monthlySalary", raw, { shouldDirty: true })}
              error={errors.monthlySalary?.message}
            />
          </div>

          {/* Salary Mode */}
          <div>
            <label className={labelClass}>Salary received via</label>
            <PillSelect
              options={salaryModeOptions}
              value={salaryMode}
              onChange={(v) => setValue("salaryMode", v, { shouldDirty: true })}
            />
          </div>

        </div>
      )}

      {/* ═══ SELF-EMPLOYED ═══ */}
      {employmentType === "self-employed" && (
        <div className="bg-[#1a1a1a] border border-[#1DB954]/20 rounded-2xl p-5 space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Name */}
            <div>
              <label className={labelClass}>Business / Profession name <span className="text-red-400">*</span></label>
              <input
                {...register("businessName")}
                placeholder="Sharma Consultancy"
                className={inputClass}
              />
              <FieldError message={errors.businessName?.message} />
            </div>

            {/* Business Type */}
            <div>
              <label className={labelClass}>Business type</label>
              <PillSelect
                options={businessTypeOptions}
                value={businessType}
                onChange={(v) => setValue("businessType", v, { shouldDirty: true })}
              />
            </div>
          </div>

          {/* Business Since */}
          <div>
            <label className={labelClass}>In practice / business since <span className="text-red-400">*</span></label>
            <input
              {...register("businessSince")}
              type="month"
              max={new Date().toISOString().slice(0, 7)}
              className={inputClass}
            />
            {bizMonths !== null && (
              <span className={`inline-flex items-center gap-1.5 mt-1.5 text-xs px-3 py-1 rounded-full border
                ${bizMonths >= 24
                  ? "text-[#1DB954] bg-[#1DB954]/10 border-[#1DB954]/30"
                  : "text-amber-400 bg-amber-400/10 border-amber-400/30"
                }`}>
                {bizMonths >= 24 ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                {bizMonths >= 12 ? `${Math.floor(bizMonths / 12)} yr ${bizMonths % 12} mo` : `${bizMonths} months`}
                {bizMonths < 24 && " — min 2 years preferred"}
              </span>
            )}
          </div>

          {/* Annual Turnover */}
          <div>
            <label className={labelClass}>Annual turnover / Income <span className="text-red-400">*</span></label>
            <INRInput
              placeholder="₹12,00,000"
              value={annualTurnover}
              onChange={(raw) => setValue("annualTurnover", raw, { shouldDirty: true })}
              error={errors.annualTurnover?.message}
            />
          </div>

          {/* GST Number */}
          <div>
            <label className={labelClass}>
              GST number
              <span className="text-[#5a5a5a] ml-1 font-normal">(if registered)</span>
            </label>
            <div className="relative">
              <input
                value={gstNumber}
                onChange={(e) =>
                  setValue("gstNumber", e.target.value.toUpperCase(), { shouldDirty: true })
                }
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
                className={`${inputBase} pr-8 tracking-wider ${
                  gstInvalid ? "border-red-500"
                  : gstValid && gstNumber.length === 15 ? "border-[#1DB954]"
                  : "border-[#3a3a3a] focus:border-[#1DB954]"
                }`}
              />
              {gstValid && gstNumber.length === 15 && (
                <CheckCircle2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1DB954]" />
              )}
            </div>
            {gstNumber.length > 0 && gstNumber.length < 15 && (
              <p className="text-[#5a5a5a] text-xs mt-1">
                GST format: 22AAAAA0000A1Z5 ({gstNumber.length}/15)
              </p>
            )}
            {gstInvalid && gstNumber.length === 15 && (
              <FieldError message="Invalid GST number format" />
            )}
            {gstValid && (
              <p className="text-[#1DB954] text-xs mt-1 flex items-center gap-1">
                <CheckCircle2 size={11} /> Valid GST number
              </p>
            )}
          </div>

        </div>
      )}

      {/* ═══ BUSINESS OWNER ═══ */}
      {employmentType === "business" && (
        <div className="bg-[#1a1a1a] border border-[#1DB954]/20 rounded-2xl p-5 space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company / Firm name */}
            <div>
              <label className={labelClass}>Company / Firm name <span className="text-red-400">*</span></label>
              <input
                {...register("businessName")}
                placeholder="Zetheta Pvt Ltd"
                className={inputClass}
              />
              <FieldError message={errors.businessName?.message} />
            </div>

            {/* Business Type */}
            <div>
              <label className={labelClass}>Business structure</label>
              <PillSelect
                options={businessTypeOptions}
                value={businessType}
                onChange={(v) => setValue("businessType", v, { shouldDirty: true })}
              />
            </div>
          </div>

          {/* GST — Required for business owner */}
          <div>
            <label className={labelClass}>
              GST number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                value={gstNumber}
                onChange={(e) =>
                  setValue("gstNumber", e.target.value.toUpperCase(), { shouldDirty: true })
                }
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
                className={`${inputBase} pr-8 tracking-wider ${
                  gstInvalid ? "border-red-500"
                  : gstValid && gstNumber.length === 15 ? "border-[#1DB954]"
                  : "border-[#3a3a3a] focus:border-[#1DB954]"
                }`}
              />
              {gstValid && <CheckCircle2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1DB954]" />}
            </div>
            {gstInvalid && gstNumber.length === 15 && <FieldError message="Invalid GST number format" />}
          </div>

          {/* Business Since */}
          <div>
            <label className={labelClass}>Business established since <span className="text-red-400">*</span></label>
            <input
              {...register("businessSince")}
              type="month"
              max={new Date().toISOString().slice(0, 7)}
              className={inputClass}
            />
            {bizMonths !== null && (
              <span className={`inline-flex items-center gap-1.5 mt-1.5 text-xs px-3 py-1 rounded-full border
                ${bizMonths >= 24
                  ? "text-[#1DB954] bg-[#1DB954]/10 border-[#1DB954]/30"
                  : "text-amber-400 bg-amber-400/10 border-amber-400/30"
                }`}>
                {bizMonths >= 24 ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                {bizMonths >= 12 ? `${Math.floor(bizMonths / 12)} yr ${bizMonths % 12} mo` : `${bizMonths} months`}
                {bizMonths < 24 && " — min 2 years preferred"}
              </span>
            )}
          </div>

          {/* Annual Turnover */}
          <div>
            <label className={labelClass}>Annual turnover <span className="text-red-400">*</span></label>
            <INRInput
              placeholder="₹50,00,000"
              value={annualTurnover}
              onChange={(raw) => setValue("annualTurnover", raw, { shouldDirty: true })}
              error={errors.annualTurnover?.message}
            />
          </div>

        </div>
      )}

      {/* ── Existing EMIs ── */}
      <div className="mt-5">
        <label className={labelClass}>
          Monthly existing loan EMIs
          <span className="text-[#5a5a5a] ml-1 font-normal">(enter 0 if none)</span>
        </label>
        <INRInput
          placeholder="₹0"
          value={existingEMIs}
          onChange={(raw) => setValue("existingEMIs", raw, { shouldDirty: true })}
        />
        {dtiRatio > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-[#5a5a5a] mb-1">
              <span>Debt-to-Income Ratio</span>
              <span className={dtiRatio > 50 ? "text-red-400" : dtiRatio > 30 ? "text-amber-400" : "text-[#1DB954]"}>
                {dtiRatio}% {dtiRatio > 50 ? "⚠ High" : dtiRatio > 30 ? "Moderate" : "✓ Good"}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500
                  ${dtiRatio > 50 ? "bg-red-500" : dtiRatio > 30 ? "bg-amber-400" : "bg-[#1DB954]"}`}
                style={{ width: `${Math.min(dtiRatio, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Eligibility Card ── */}
      {eligibleAmount > 0 && (
        <div className="mt-5 relative overflow-hidden bg-gradient-to-br from-[#1a2e1e] to-[#0f1f13] border border-[#1DB954]/40 rounded-2xl p-5">
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-[#1DB954]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-[#1DB954]" />
            <p className="text-[#1DB954] text-xs font-semibold uppercase tracking-widest">
              Estimated Loan Eligibility
            </p>
          </div>
          <p className="text-white text-3xl font-bold mb-1">
            {formatINR(Math.round(eligibleAmount / 10000) * 10000)}
          </p>
          <p className="text-[#5a5a5a] text-xs">
            Based on your income details — final eligibility depends on credit score & bank policy.
          </p>
          {dtiRatio > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
              <Info size={12} className="text-[#5a5a5a]" />
              <p className="text-[#5a5a5a] text-xs">
                Net take-home after existing EMIs:{" "}
                <span className="text-white font-medium">
                  {formatINR(Math.max(0, incomeForCalc - Number(existingEMIs)))} / month
                </span>
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default Step5Employment;