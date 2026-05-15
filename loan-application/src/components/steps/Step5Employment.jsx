import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const salariedSchema = z.object({
  employmentType: z.literal("salaried"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  designation: z.string().min(2, "Designation is required"),
  employmentSince: z.string().min(1, "Please select a date"),
  monthlySalary: z
    .string()
    .regex(/^\d+$/, "Enter a valid amount")
    .refine((v) => Number(v) >= 10000, "Minimum salary is ₹10,000"),
  companyType: z.enum(["private", "public", "government", "mnc"], {
    required_error: "Select company type",
  }),
  salaryMode: z.enum(["bank", "cash", "cheque"], {
    required_error: "Select salary mode",
  }),
});

const selfSchema = z.object({
  employmentType: z.literal("self-employed"),
  businessName: z.string().min(2, "Business name is required"),
  businessType: z.enum(["proprietorship", "partnership", "pvt_ltd", "llp"], {
    required_error: "Select business type",
  }),
  annualTurnover: z
    .string()
    .regex(/^\d+$/, "Enter a valid amount")
    .refine((v) => Number(v) >= 100000, "Minimum turnover is ₹1,00,000"),
  gstNumber: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Invalid GST number format"
    )
    .optional()
    .or(z.literal("")),
  businessSince: z.string().min(1, "Please select a date"),
  itrFiled: z.boolean().optional(),
});

const schema = z.discriminatedUnion("employmentType", [salariedSchema, selfSchema]);

const inputClass =
  "w-full bg-[#282828] border border-[#3a3a3a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#1DB954] transition-colors placeholder-[#5a5a5a]";

const selectClass =
  "w-full bg-[#282828] border border-[#3a3a3a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#1DB954] transition-colors";

const labelClass = "block text-xs text-[#b3b3b3] mb-2";
const errorClass = "text-red-400 text-xs mt-1";

const formatINR = (val) => {
  const num = val.replace(/\D/g, "");
  return num ? "₹" + Number(num).toLocaleString("en-IN") : "";
};

function FieldError({ message }) {
  if (!message) return null;
  return <p className={errorClass}>⚠ {message}</p>;
}

function PillSelect({ options, value, onChange, error }) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            type="button"
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`px-4 py-1.5 rounded-full text-xs border transition-all duration-200
              ${value === o.value
                ? "border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954] font-semibold"
                : "border-[#3a3a3a] text-[#b3b3b3] hover:border-[#1DB954]"
              }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {error && <p className={errorClass}>⚠ {error}</p>}
    </>
  );
}

const companyTypeOptions = [
  { value: "private",    label: "Private Ltd" },
  { value: "public",     label: "Public Ltd" },
  { value: "government", label: "Government" },
  { value: "mnc",        label: "MNC" },
];

const salaryModeOptions = [
  { value: "bank",   label: "Bank transfer" },
  { value: "cash",   label: "Cash" },
  { value: "cheque", label: "Cheque" },
];

const businessTypeOptions = [
  { value: "proprietorship", label: "Proprietorship" },
  { value: "partnership",    label: "Partnership" },
  { value: "pvt_ltd",        label: "Pvt Ltd" },
  { value: "llp",            label: "LLP" },
];

function SalariedForm({ register, errors, setValue, watch }) {
  const [salaryDisplay, setSalaryDisplay] = useState("");
  const companyType = watch("companyType");
  const salaryMode = watch("salaryMode");

  return (
    <div className="bg-[#1a1a1a] border border-[#1DB954]/20 rounded-2xl p-5">
      <p className="text-[#1DB954] text-xs font-semibold uppercase tracking-widest mb-4">
        Salaried details
      </p>

      {/* Company Name */}
      <div className="mb-4">
        <label className={labelClass}>Company name <span className="text-red-400">*</span></label>
        <input
          {...register("companyName")}
          placeholder="e.g. Infosys Ltd"
          className={inputClass}
        />
        <FieldError message={errors.companyName?.message} />
      </div>

      {/* Designation */}
      <div className="mb-4">
        <label className={labelClass}>Designation <span className="text-red-400">*</span></label>
        <input
          {...register("designation")}
          placeholder="e.g. Software Engineer"
          className={inputClass}
        />
        <FieldError message={errors.designation?.message} />
      </div>

      {/* Company Type */}
      <div className="mb-4">
        <label className={labelClass}>Company type <span className="text-red-400">*</span></label>
        <PillSelect
          options={companyTypeOptions}
          value={companyType}
          onChange={(v) => setValue("companyType", v, { shouldValidate: true })}
          error={errors.companyType?.message}
        />
      </div>

      {/* Employment Since */}
      <div className="mb-4">
        <label className={labelClass}>Employed since <span className="text-red-400">*</span></label>
        <input
          {...register("employmentSince")}
          type="month"
          max={new Date().toISOString().slice(0, 7)}
          className={inputClass}
        />
        <FieldError message={errors.employmentSince?.message} />
      </div>

      {/* Monthly Salary */}
      <div className="mb-4">
        <label className={labelClass}>Monthly salary (net) <span className="text-red-400">*</span></label>
        <div className="relative">
          <input
            type="text"
            value={salaryDisplay}
            placeholder="e.g. ₹50,000"
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              setSalaryDisplay(formatINR(e.target.value));
              setValue("monthlySalary", raw, { shouldValidate: true });
            }}
            className={inputClass}
          />
        </div>
        <FieldError message={errors.monthlySalary?.message} />
      </div>

      {/* Salary Mode */}
      <div>
        <label className={labelClass}>Salary received via <span className="text-red-400">*</span></label>
        <PillSelect
          options={salaryModeOptions}
          value={salaryMode}
          onChange={(v) => setValue("salaryMode", v, { shouldValidate: true })}
          error={errors.salaryMode?.message}
        />
      </div>
    </div>
  );
}

function SelfEmployedForm({ register, errors, setValue, watch }) {
  const [turnoverDisplay, setTurnoverDisplay] = useState("");
  const businessType = watch("businessType");
  const itrFiled = watch("itrFiled");

  return (
    <div className="bg-[#1a1a1a] border border-[#1DB954]/20 rounded-2xl p-5">
      <p className="text-[#1DB954] text-xs font-semibold uppercase tracking-widest mb-4">
        Business details
      </p>

      {/* Business Name */}
      <div className="mb-4">
        <label className={labelClass}>Business name <span className="text-red-400">*</span></label>
        <input
          {...register("businessName")}
          placeholder="e.g. Sharma Enterprises"
          className={inputClass}
        />
        <FieldError message={errors.businessName?.message} />
      </div>

      {/* Business Type */}
      <div className="mb-4">
        <label className={labelClass}>Business type <span className="text-red-400">*</span></label>
        <PillSelect
          options={businessTypeOptions}
          value={businessType}
          onChange={(v) => setValue("businessType", v, { shouldValidate: true })}
          error={errors.businessType?.message}
        />
      </div>

      {/* Business Since */}
      <div className="mb-4">
        <label className={labelClass}>In business since <span className="text-red-400">*</span></label>
        <input
          {...register("businessSince")}
          type="month"
          max={new Date().toISOString().slice(0, 7)}
          className={inputClass}
        />
        <FieldError message={errors.businessSince?.message} />
      </div>

      {/* Annual Turnover */}
      <div className="mb-4">
        <label className={labelClass}>Annual turnover <span className="text-red-400">*</span></label>
        <input
          type="text"
          value={turnoverDisplay}
          placeholder="e.g. ₹12,00,000"
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            setTurnoverDisplay(formatINR(e.target.value));
            setValue("annualTurnover", raw, { shouldValidate: true });
          }}
          className={inputClass}
        />
        <FieldError message={errors.annualTurnover?.message} />
      </div>

      {/* GST Number */}
      <div className="mb-4">
        <label className={labelClass}>
          GST number <span className="text-[#5a5a5a]">(optional)</span>
        </label>
        <input
          {...register("gstNumber")}
          placeholder="e.g. 27AAPFU0939F1ZV"
          maxLength={15}
          className={`${inputClass} uppercase tracking-widest`}
        />
        <FieldError message={errors.gstNumber?.message} />
      </div>

      {/* ITR Filed */}
      <div className="flex items-center gap-3 p-4 bg-[#121212] rounded-xl border border-[#2a2a2a]">
        <input
          {...register("itrFiled")}
          type="checkbox"
          id="itrFiled"
          className="w-4 h-4 accent-[#1DB954] cursor-pointer"
        />
        <label htmlFor="itrFiled" className="text-sm text-[#b3b3b3] cursor-pointer">
          I have filed ITR for the last 2 years
          <span className="block text-[#5a5a5a] text-xs mt-0.5">
            Improves your loan approval chances significantly
          </span>
        </label>
      </div>
    </div>
  );
}

function Step5Employment({ onDataChange }) {
  const [employmentType, setEmploymentType] = useState("salaried");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { employmentType: "salaried" },
  });

  const handleTypeChange = (type) => {
    setEmploymentType(type);
    reset({ employmentType: type });
  };

  const onSubmit = (data) => {
    onDataChange?.(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>

      {/* Intro */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-1">Employment & Income</h2>
        <p className="text-[#b3b3b3] text-sm">
          Tell us about your current employment and income source.
        </p>
      </div>

      {/* Employment Type Toggle */}
      <div className="flex gap-3 mb-6">
        {[
          { value: "salaried",      label: "🏢  Salaried" },
          { value: "self-employed", label: "💼  Self-employed" },
        ].map((t) => (
          <button
            type="button"
            key={t.value}
            onClick={() => handleTypeChange(t.value)}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all duration-200
              ${employmentType === t.value
                ? "border-[#1DB954] bg-[#1DB954]/10 text-[#1DB954]"
                : "border-[#3a3a3a] bg-[#282828] text-[#b3b3b3] hover:border-[#1DB954]"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Hidden field for employment type */}
      <input type="hidden" {...register("employmentType")} value={employmentType} />

      {/* Dynamic Form */}
      {employmentType === "salaried" ? (
        <SalariedForm
          register={register}
          errors={errors}
          setValue={setValue}
          watch={watch}
        />
      ) : (
        <SelfEmployedForm
          register={register}
          errors={errors}
          setValue={setValue}
          watch={watch}
        />
      )}

      <button type="submit" id="step5-submit" className="hidden" />
    </form>
  );
}

export default Step5Employment;