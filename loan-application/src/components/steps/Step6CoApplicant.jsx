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
  "w-full bg-[#282828] border border-[#3a3a3a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#1DB954]";

const labelClass =
  "block text-xs text-[#b3b3b3] mb-2";

function formatINR(val) {

  const num =
    val.replace(/\D/g, "");

  return num
    ? "₹" +
        Number(num).toLocaleString(
          "en-IN"
        )
    : "";
}

function Step6CoApplicant() {

  const {
    register,
    setValue,
    watch,
  } = useFormContext();

  const loanType =
    watch("loanType") ||
    "personal";

  const amount =
    watch("amount") || 0;

  const isRequired =
    loanType === "home" ||
    loanType ===
      "business" ||
    Number(amount) >=
      HIGH_AMOUNT_THRESHOLD;

  const hasCoApplicant =
    watch(
      "hasCoApplicant"
    ) || isRequired;

  const selectedRelation =
    watch("coRelation");

  const selectedEmployment =
    watch(
      "coEmployment"
    );

  const [
    incomeDisplay,
    setIncomeDisplay,
  ] = useState("");

  return (
    <div>

      <div className="mb-6">

        <h2 className="text-2xl font-semibold text-white">
          Co-Applicant
        </h2>

      </div>

      {!isRequired && (
        <div className="mb-5 flex items-center gap-3">

          <input
            type="checkbox"
            checked={
              hasCoApplicant
            }
            onChange={(e) =>
              setValue(
                "hasCoApplicant",
                e.target
                  .checked,
                {
                  shouldDirty: true,
                }
              )
            }
            className="accent-[#1DB954]"
          />

          <span className="text-sm text-[#b3b3b3]">

            Add co-applicant
            voluntarily

          </span>

        </div>
      )}

      {hasCoApplicant && (
        <div className="bg-[#1a1a1a] border border-[#1DB954]/20 rounded-2xl p-5">

          {/* Name */}
          <div className="mb-4">

            <label className={labelClass}>
              Full name
            </label>

            <input
              defaultValue=""
              {...register(
                "coName"
              )}
              placeholder="Arpit Kumar Mishra"
              className={inputClass}
            />

          </div>

          {/* Relation */}
          <div className="mb-4">

            <label className={labelClass}>
              Relation
            </label>

            <div className="flex flex-wrap gap-2">

              {relationOptions.map(
                (r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() =>
                      setValue(
                        "coRelation",
                        r,
                        {
                          shouldDirty: true,
                        }
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-xs border
                    ${
                      selectedRelation ===
                      r
                        ? "border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954]"
                        : "border-[#3a3a3a] text-[#b3b3b3]"
                    }`}
                  >
                    {r}
                  </button>
                )
              )}

            </div>

          </div>

          {/* Phone */}
          <div className="mb-4">

            <label className={labelClass}>
              Phone
            </label>

            <input
              defaultValue=""
              {...register(
                "coPhone"
              )}
              className={inputClass}
            />

          </div>

          {/* Employment */}
          <div className="mb-4">

            <label className={labelClass}>
              Employment
            </label>

            <div className="flex flex-wrap gap-2">

              {employmentOptions.map(
                (e) => (
                  <button
                    type="button"
                    key={e.value}
                    onClick={() =>
                      setValue(
                        "coEmployment",
                        e.value,
                        {
                          shouldDirty: true,
                        }
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-xs border
                    ${
                      selectedEmployment ===
                      e.value
                        ? "border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954]"
                        : "border-[#3a3a3a] text-[#b3b3b3]"
                    }`}
                  >
                    {e.label}
                  </button>
                )
              )}

            </div>

          </div>

          {/* Income */}
          <div>

            <label className={labelClass}>
              Monthly income
            </label>

            <input
              type="text"
              value={
                incomeDisplay
              }
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

export default Step6CoApplicant;