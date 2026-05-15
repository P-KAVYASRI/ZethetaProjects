import { useState } from "react";

import {
  useFormContext,
} from "react-hook-form";

const inputClass =
  "w-full bg-[#282828] border border-[#3a3a3a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#1DB954] transition-colors placeholder-[#5a5a5a]";

const labelClass =
  "block text-xs text-[#b3b3b3] mb-2";

const errorClass =
  "text-red-400 text-xs mt-1";

const formatINR = (val) => {
  const num = val.replace(/\D/g, "");

  return num
    ? "₹" +
        Number(num).toLocaleString(
          "en-IN"
        )
    : "";
};

function FieldError({ message }) {
  if (!message) return null;

  return (
    <p className={errorClass}>
      ⚠ {message}
    </p>
  );
}

function PillSelect({
  options,
  value,
  onChange,
  error,
}) {
  return (
    <>
      <div className="flex flex-wrap gap-2">

        {options.map((o) => (
          <button
            type="button"
            key={o.value}
            onClick={() =>
              onChange(o.value)
            }
            className={`px-4 py-1.5 rounded-full text-xs border transition-all duration-200
            ${
              value === o.value
                ? "border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954] font-semibold"
                : "border-[#3a3a3a] text-[#b3b3b3] hover:border-[#1DB954]"
            }`}
          >
            {o.label}
          </button>
        ))}

      </div>

      {error && (
        <p className={errorClass}>
          ⚠ {error}
        </p>
      )}
    </>
  );
}

const companyTypeOptions = [
  {
    value: "private",
    label: "Private Ltd",
  },
  {
    value: "public",
    label: "Public Ltd",
  },
  {
    value: "government",
    label: "Government",
  },
  {
    value: "mnc",
    label: "MNC",
  },
];

const salaryModeOptions = [
  {
    value: "bank",
    label: "Bank transfer",
  },
  {
    value: "cash",
    label: "Cash",
  },
  {
    value: "cheque",
    label: "Cheque",
  },
];

const businessTypeOptions = [
  {
    value: "proprietorship",
    label: "Proprietorship",
  },
  {
    value: "partnership",
    label: "Partnership",
  },
  {
    value: "pvt_ltd",
    label: "Pvt Ltd",
  },
  {
    value: "llp",
    label: "LLP",
  },
];

function SalariedForm({
  register,
  errors,
  setValue,
  watch,
}) {
  const [salaryDisplay, setSalaryDisplay] =
    useState("");

  const companyType =
    watch("companyType");

  const salaryMode =
    watch("salaryMode");

  return (
    <div className="bg-[#1a1a1a] border border-[#1DB954]/20 rounded-2xl p-5">

      <p className="text-[#1DB954] text-xs font-semibold uppercase tracking-widest mb-4">
        Salaried details
      </p>

      {/* Company */}
      <div className="mb-4">

        <label className={labelClass}>
          Company name
        </label>

        <input
          {...register(
            "companyName"
          )}
          placeholder="e.g. Infosys Ltd"
          className={inputClass}
        />

        <FieldError
          message={
            errors.companyName
              ?.message
          }
        />

      </div>

      {/* Designation */}
      <div className="mb-4">

        <label className={labelClass}>
          Designation
        </label>

        <input
          {...register(
            "designation"
          )}
          placeholder="e.g. Software Engineer"
          className={inputClass}
        />

        <FieldError
          message={
            errors.designation
              ?.message
          }
        />

      </div>

      {/* Company Type */}
      <div className="mb-4">

        <label className={labelClass}>
          Company type
        </label>

        <PillSelect
          options={
            companyTypeOptions
          }
          value={companyType}
          onChange={(v) =>
            setValue(
              "companyType",
              v
            )
          }
          error={
            errors.companyType
              ?.message
          }
        />

      </div>

      {/* Employment Since */}
      <div className="mb-4">

        <label className={labelClass}>
          Employed since
        </label>

        <input
          {...register(
            "employmentSince"
          )}
          type="month"
          max={new Date()
            .toISOString()
            .slice(0, 7)}
          className={inputClass}
        />

        <FieldError
          message={
            errors
              .employmentSince
              ?.message
          }
        />

      </div>

      {/* Salary */}
      <div className="mb-4">

        <label className={labelClass}>
          Monthly salary
        </label>

        <input
          type="text"
          value={salaryDisplay}
          placeholder="₹50,000"
          onChange={(e) => {

            const raw =
              e.target.value.replace(
                /\D/g,
                ""
              );

            setSalaryDisplay(
              formatINR(
                e.target.value
              )
            );

            setValue(
              "monthlySalary",
              raw
            );
          }}
          className={inputClass}
        />

      </div>

      {/* Salary Mode */}
      <div>

        <label className={labelClass}>
          Salary received via
        </label>

        <PillSelect
          options={
            salaryModeOptions
          }
          value={salaryMode}
          onChange={(v) =>
            setValue(
              "salaryMode",
              v
            )
          }
          error={
            errors.salaryMode
              ?.message
          }
        />

      </div>

    </div>
  );
}

function SelfEmployedForm({
  register,
  errors,
  setValue,
  watch,
}) {
  const [
    turnoverDisplay,
    setTurnoverDisplay,
  ] = useState("");

  const businessType =
    watch("businessType");

  return (
    <div className="bg-[#1a1a1a] border border-[#1DB954]/20 rounded-2xl p-5">

      <p className="text-[#1DB954] text-xs font-semibold uppercase tracking-widest mb-4">
        Business details
      </p>

      {/* Business Name */}
      <div className="mb-4">

        <label className={labelClass}>
          Business name
        </label>

        <input
          {...register(
            "businessName"
          )}
          placeholder="Sharma Enterprises"
          className={inputClass}
        />

      </div>

      {/* Business Type */}
      <div className="mb-4">

        <label className={labelClass}>
          Business type
        </label>

        <PillSelect
          options={
            businessTypeOptions
          }
          value={businessType}
          onChange={(v) =>
            setValue(
              "businessType",
              v
            )
          }
        />

      </div>

      {/* Business Since */}
      <div className="mb-4">

        <label className={labelClass}>
          In business since
        </label>

        <input
          {...register(
            "businessSince"
          )}
          type="month"
          max={new Date()
            .toISOString()
            .slice(0, 7)}
          className={inputClass}
        />

      </div>

      {/* Turnover */}
      <div className="mb-4">

        <label className={labelClass}>
          Annual turnover
        </label>

        <input
          type="text"
          value={turnoverDisplay}
          placeholder="₹12,00,000"
          onChange={(e) => {

            const raw =
              e.target.value.replace(
                /\D/g,
                ""
              );

            setTurnoverDisplay(
              formatINR(
                e.target.value
              )
            );

            setValue(
              "annualTurnover",
              raw
            );
          }}
          className={inputClass}
        />

      </div>

      {/* GST */}
      <div className="mb-4">

        <label className={labelClass}>
          GST number
        </label>

        <input
          {...register(
            "gstNumber"
          )}
          placeholder="27AAPFU0939F1ZV"
          maxLength={15}
          className={`${inputClass} uppercase tracking-widest`}
        />

      </div>

      {/* ITR */}
      <div className="flex items-center gap-3 p-4 bg-[#121212] rounded-xl border border-[#2a2a2a]">

        <input
          {...register(
            "itrFiled"
          )}
          type="checkbox"
          id="itrFiled"
          className="w-4 h-4 accent-[#1DB954] cursor-pointer"
        />

        <label
          htmlFor="itrFiled"
          className="text-sm text-[#b3b3b3] cursor-pointer"
        >
          I have filed ITR for
          last 2 years
        </label>

      </div>

    </div>
  );
}

function Step5Employment() {

  const [
    employmentType,
    setEmploymentType,
  ] = useState("salaried");

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const handleTypeChange = (
    type
  ) => {

    setEmploymentType(type);

    setValue(
      "employmentType",
      type
    );
  };

  return (
    <div>

      {/* Intro */}
      <div className="mb-6">

        <h2 className="text-2xl font-semibold text-white mb-1">
          Employment & Income
        </h2>

        <p className="text-[#b3b3b3] text-sm">
          Tell us about your
          current employment and
          income source.
        </p>

      </div>

      {/* Type Toggle */}
      <div className="flex gap-3 mb-6">

        {[
          {
            value: "salaried",
            label:
              "🏢 Salaried",
          },
          {
            value:
              "self-employed",
            label:
              "💼 Self-employed",
          },
        ].map((t) => (
          <button
            type="button"
            key={t.value}
            onClick={() =>
              handleTypeChange(
                t.value
              )
            }
            className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all duration-200
            ${
              employmentType ===
              t.value
                ? "border-[#1DB954] bg-[#1DB954]/10 text-[#1DB954]"
                : "border-[#3a3a3a] bg-[#282828] text-[#b3b3b3]"
            }`}
          >
            {t.label}
          </button>
        ))}

      </div>

      <input
        type="hidden"
        {...register(
          "employmentType"
        )}
        value={employmentType}
      />

      {/* Dynamic Form */}
      {employmentType ===
      "salaried" ? (
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

    </div>
  );
}

export default Step5Employment;