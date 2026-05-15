import { useState } from "react";

import {
  useFormContext,
} from "react-hook-form";

import {
  Building2,
  BriefcaseBusiness,
} from "lucide-react";

const inputClass =
  "w-full bg-[#282828] border border-[#3a3a3a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#1DB954] transition-colors placeholder-[#5a5a5a]";

const labelClass =
  "block text-xs text-[#b3b3b3] mb-2";

const errorClass =
  "text-red-400 text-xs mt-1";

const formatINR = (
  val
) => {

  const num =
    val.replace(/\D/g, "");

  return num
    ? "₹" +
        Number(num).toLocaleString(
          "en-IN"
        )
    : "";
};

function FieldError({
  message,
}) {

  if (!message)
    return null;

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

        {options.map(
          (o) => (
            <button
              type="button"
              key={o.value}
              onClick={() =>
                onChange(
                  o.value
                )
              }
              className={`px-4 py-1.5 rounded-full text-xs border transition-all duration-200
              ${
                value ===
                o.value
                  ? "border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954] font-semibold"
                  : "border-[#3a3a3a] text-[#b3b3b3]"
              }`}
            >
              {o.label}
            </button>
          )
        )}

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
    label:
      "Proprietorship",
  },
  {
    value: "partnership",
    label:
      "Partnership",
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

function Step5Employment() {

  const {
    register,
    setValue,
    watch,
    formState: {
      errors,
    },
  } = useFormContext();

  const employmentType =
    watch(
      "employmentType"
    ) || "salaried";

  const [
    salaryDisplay,
    setSalaryDisplay,
  ] = useState("");

  const [
    turnoverDisplay,
    setTurnoverDisplay,
  ] = useState("");

  const companyType =
    watch("companyType");

  const salaryMode =
    watch("salaryMode");

  const businessType =
    watch("businessType");

  return (
    <div>

      {/* Intro */}
      <div className="mb-6">

        <h2 className="text-2xl font-semibold text-white mb-1">

          Employment &
          Income

        </h2>

      </div>

      {/* Employment Toggle */}
      <div className="flex gap-3 mb-6">

       {[
  {
    value: "salaried",
    label: (
      <div className="flex items-center gap-2 justify-center">
        <Building2 size={18} />
        <span>Salaried</span>
      </div>
    ),
  },

  {
    value: "self-employed",
    label: (
      <div className="flex items-center gap-2 justify-center">
        <BriefcaseBusiness size={18} />
        <span>Self-employed</span>
      </div>
    ),
  },


].map((t) => (
          <button
            type="button"
            key={t.value}
            onClick={() => {

              setValue(
                "employmentType",
                t.value,
                {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                }
              );
            }}
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

      {/* Salaried */}
      {employmentType ===
      "salaried" ? (
        <div className="bg-[#1a1a1a] border border-[#1DB954]/20 rounded-2xl p-5">

          {/* Company */}
          <div className="mb-4">

            <label className={labelClass}>
              Company name
            </label>

            <input
              defaultValue=""
              {...register(
                "companyName"
              )}
              placeholder="Infosys Ltd"
              className={inputClass}
            />

          </div>

          {/* Designation */}
          <div className="mb-4">

            <label className={labelClass}>
              Designation
            </label>

            <input
              defaultValue=""
              {...register(
                "designation"
              )}
              placeholder="Software Engineer"
              className={inputClass}
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
              value={
                companyType
              }
              onChange={(
                v
              ) =>
                setValue(
                  "companyType",
                  v,
                  {
                    shouldDirty: true,
                  }
                )
              }
            />

          </div>

          {/* Employment Since */}
          <div className="mb-4">

            <label className={labelClass}>
              Employed since
            </label>

            <input
              defaultValue=""
              {...register(
                "employmentSince"
              )}
              type="month"
              className={inputClass}
            />

          </div>

          {/* Salary */}
          <div className="mb-4">

            <label className={labelClass}>
              Monthly salary
            </label>

            <input
              type="text"
              value={
                salaryDisplay
              }
              placeholder="₹50,000"
              onChange={(e) => {

                const raw =
                  e.target.value.replace(
                    /\D/g,
                    ""
                  );

                setSalaryDisplay(
                  formatINR(
                    e.target
                      .value
                  )
                );

                setValue(
                  "monthlySalary",
                  raw,
                  {
                    shouldDirty: true,
                  }
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
              value={
                salaryMode
              }
              onChange={(
                v
              ) =>
                setValue(
                  "salaryMode",
                  v,
                  {
                    shouldDirty: true,
                  }
                )
              }
            />

          </div>

        </div>
      ) : (
        <div className="bg-[#1a1a1a] border border-[#1DB954]/20 rounded-2xl p-5">

          {/* Business Name */}
          <div className="mb-4">

            <label className={labelClass}>
              Business name
            </label>

            <input
              defaultValue=""
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
              value={
                businessType
              }
              onChange={(
                v
              ) =>
                setValue(
                  "businessType",
                  v,
                  {
                    shouldDirty: true,
                  }
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
              defaultValue=""
              {...register(
                "businessSince"
              )}
              type="month"
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
              value={
                turnoverDisplay
              }
              placeholder="₹12,00,000"
              onChange={(e) => {

                const raw =
                  e.target.value.replace(
                    /\D/g,
                    ""
                  );

                setTurnoverDisplay(
                  formatINR(
                    e.target
                      .value
                  )
                );

                setValue(
                  "annualTurnover",
                  raw,
                  {
                    shouldDirty: true,
                  }
                );
              }}
              className={inputClass}
            />

          </div>

        </div>
      )}

    </div>
  );
}

export default Step5Employment;