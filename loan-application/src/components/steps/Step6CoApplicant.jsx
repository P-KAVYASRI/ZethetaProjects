import { useState } from "react";

import {
  useFormContext,
} from "react-hook-form";

const HIGH_AMOUNT_THRESHOLD =
  2500000;

const relationOptions = [
  "Spouse",
  "Father",
  "Mother",
  "Son",
  "Daughter",
  "Brother",
  "Sister",
  "Other",
];

const employmentOptions = [
  {
    value: "salaried",
    label: "Salaried",
  },
  {
    value: "self-employed",
    label: "Self-employed",
  },
  {
    value: "business",
    label: "Business",
  },
  {
    value: "retired",
    label: "Retired",
  },
];

const inputClass =
  "w-full bg-[#282828] border border-[#3a3a3a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#1DB954] transition-colors placeholder-[#5a5a5a]";

const labelClass =
  "block text-xs text-[#b3b3b3] mb-2";

const errorClass =
  "text-red-400 text-xs mt-1";

function FieldError({ message }) {
  if (!message) return null;

  return (
    <p className={errorClass}>
      ⚠ {message}
    </p>
  );
}

function formatINR(val) {
  const num = val.replace(/\D/g, "");

  return num
    ? "₹" +
        Number(num).toLocaleString(
          "en-IN"
        )
    : "";
}

function NotRequired({
  loanType,
  amount,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">

      <div className="w-16 h-16 rounded-2xl bg-[#1DB954]/10 border border-[#1DB954]/20 flex items-center justify-center text-3xl mb-5">
        ✓
      </div>

      <h3 className="text-white text-lg font-semibold mb-2">
        Co-applicant not required
      </h3>

      <p className="text-[#b3b3b3] text-sm max-w-sm leading-relaxed">

        Your selected loan type

        <span className="text-white font-medium">
          {" "}
          ({loanType})
        </span>

        {" "}with amount

        <span className="text-white font-medium">
          {" "}
          (₹
          {Number(
            amount
          ).toLocaleString(
            "en-IN"
          )}
          )
        </span>

        {" "}does not require a
        co-applicant.

      </p>

    </div>
  );
}

function Step6CoApplicant() {

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const loanType =
    watch("loanType") ??
    "personal";

  const amount =
    watch("amount") ?? 0;

  const isRequired =
    loanType === "home" ||
    loanType === "business" ||
    Number(amount) >=
      HIGH_AMOUNT_THRESHOLD;

  const [
    hasCoApplicant,
    setHasCoApplicant,
  ] = useState(isRequired);

  const [
    incomeDisplay,
    setIncomeDisplay,
  ] = useState("");

  const [
    selectedRelation,
    setSelectedRelation,
  ] = useState("");

  const [
    selectedEmployment,
    setSelectedEmployment,
  ] = useState("");

  const reasonTag = () => {

    if (loanType === "home")
      return "Required for home loans";

    if (
      loanType === "business"
    )
      return "Required for business loans";

    if (
      Number(amount) >=
      HIGH_AMOUNT_THRESHOLD
    )
      return `Required for loans above ₹${Number(
        HIGH_AMOUNT_THRESHOLD
      ).toLocaleString(
        "en-IN"
      )}`;

    return "";
  };

  return (
    <div>

      {/* Intro */}
      <div className="mb-6">

        <h2 className="text-2xl font-semibold text-white mb-1">
          Co-Applicant Details
        </h2>

        <p className="text-[#b3b3b3] text-sm">
          A co-applicant increases
          your loan eligibility and
          approval chances.
        </p>

      </div>

      {/* Not Required */}
      {!isRequired ? (
        <>
          <NotRequired
            loanType={loanType}
            amount={amount}
          />

          <div className="mt-6 flex items-center gap-3 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">

            <input
              type="checkbox"
              id="optIn"
              checked={
                hasCoApplicant
              }
              onChange={(e) => {

                setHasCoApplicant(
                  e.target.checked
                );

                setValue(
                  "hasCoApplicant",
                  e.target.checked
                );
              }}
              className="w-4 h-4 accent-[#1DB954] cursor-pointer"
            />

            <label
              htmlFor="optIn"
              className="text-sm text-[#b3b3b3] cursor-pointer"
            >
              I want to add a
              co-applicant
              voluntarily
            </label>

          </div>
        </>
      ) : (
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-3 py-1 mb-5">

          <span className="text-amber-400 text-xs font-medium">
            ⚠ {reasonTag()}
          </span>

        </div>
      )}

      {/* Form */}
      {hasCoApplicant && (
        <div className="bg-[#1a1a1a] border border-[#1DB954]/20 rounded-2xl p-5 mt-4">

          <p className="text-[#1DB954] text-xs font-semibold uppercase tracking-widest mb-4">
            Co-applicant information
          </p>

          {/* Name */}
          <div className="mb-4">

            <label className={labelClass}>
              Full name
            </label>

            <input
              {...register(
                "coName"
              )}
              placeholder="Ravi Sharma"
              className={inputClass}
            />

            <FieldError
              message={
                errors.coName
                  ?.message
              }
            />

          </div>

          {/* Relation + DOB */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

            <div>

              <label className={labelClass}>
                Relation
              </label>

              <div className="flex flex-wrap gap-2">

                {relationOptions.map(
                  (r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => {

                        setSelectedRelation(
                          r
                        );

                        setValue(
                          "coRelation",
                          r
                        );
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-200
                      ${
                        selectedRelation ===
                        r
                          ? "border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954] font-semibold"
                          : "border-[#3a3a3a] text-[#b3b3b3]"
                      }`}
                    >
                      {r}
                    </button>
                  )
                )}

              </div>

            </div>

            <div>

              <label className={labelClass}>
                Date of birth
              </label>

              <input
                {...register(
                  "coDob"
                )}
                type="date"
                className={inputClass}
              />

            </div>

          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

            <div>

              <label className={labelClass}>
                Phone
              </label>

              <div className="flex">

                <span className="bg-[#1e1e1e] border border-r-0 border-[#3a3a3a] rounded-l-lg px-3 flex items-center text-sm text-[#b3b3b3]">
                  +91
                </span>

                <input
                  {...register(
                    "coPhone"
                  )}
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  className="flex-1 bg-[#282828] border border-[#3a3a3a] rounded-r-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#1DB954]"
                />

              </div>

            </div>

            <div>

              <label className={labelClass}>
                Email
              </label>

              <input
                {...register(
                  "coEmail"
                )}
                type="email"
                placeholder="ravi@example.com"
                className={inputClass}
              />

            </div>

          </div>

          {/* Employment */}
          <div className="mb-4">

            <label className={labelClass}>
              Employment type
            </label>

            <div className="flex flex-wrap gap-2">

              {employmentOptions.map(
                (e) => (
                  <button
                    type="button"
                    key={e.value}
                    onClick={() => {

                      setSelectedEmployment(
                        e.value
                      );

                      setValue(
                        "coEmployment",
                        e.value
                      );
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs border transition-all duration-200
                    ${
                      selectedEmployment ===
                      e.value
                        ? "border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954] font-semibold"
                        : "border-[#3a3a3a] text-[#b3b3b3]"
                    }`}
                  >
                    {e.label}
                  </button>
                )
              )}

            </div>

          </div>

          {/* Income + PAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>

              <label className={labelClass}>
                Monthly income
              </label>

              <input
                type="text"
                value={
                  incomeDisplay
                }
                placeholder="₹40,000"
                onChange={(e) => {

                  const raw =
                    e.target.value.replace(
                      /\D/g,
                      ""
                    );

                  setIncomeDisplay(
                    formatINR(
                      e.target
                        .value
                    )
                  );

                  setValue(
                    "coIncome",
                    raw
                  );
                }}
                className={inputClass}
              />

            </div>

            <div>

              <label className={labelClass}>
                PAN number
              </label>

              <input
                {...register(
                  "coPan"
                )}
                placeholder="ABCDE1234F"
                maxLength={10}
                className={`${inputClass} uppercase tracking-widest`}
              />

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Step6CoApplicant;