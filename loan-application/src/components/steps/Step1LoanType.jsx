import { useState } from "react";

import {
  useFormContext,
} from "react-hook-form";

const loanTypes = [
  {
    id: "home",
    icon: "🏠",
    label: "Home loan",
    min: 500000,
    max: 10000000,
    tenures: [60, 120, 180, 240, 300],
    badge: "Property documents required in later steps",
  },
  {
    id: "personal",
    icon: "👤",
    label: "Personal loan",
    min: 50000,
    max: 1000000,
    tenures: [6, 12, 24, 36, 48],
    badge: "No collateral needed — quick approval",
  },
  {
    id: "car",
    icon: "🚗",
    label: "Car loan",
    min: 100000,
    max: 5000000,
    tenures: [12, 24, 36, 48, 60],
    badge: "Vehicle RC & insurance needed later",
  },
  {
    id: "education",
    icon: "🎓",
    label: "Education loan",
    min: 50000,
    max: 2000000,
    tenures: [24, 60, 84, 120],
    badge: "Admission letter required in later steps",
  },
  {
    id: "business",
    icon: "💼",
    label: "Business loan",
    min: 500000,
    max: 20000000,
    tenures: [12, 24, 36, 48, 60],
    badge: "Business registration docs needed later",
  },
  {
    id: "gold",
    icon: "💎",
    label: "Gold loan",
    min: 10000,
    max: 2500000,
    tenures: [3, 6, 12, 18, 24],
    badge: "Gold valuation done at branch visit",
  },
];

const purposeOptions = [
  "Purchase",
  "Construction",
  "Renovation",
  "Debt consolidation",
  "Medical expenses",
  "Travel",
  "Wedding",
  "Education",
  "Business expansion",
  "Other",
];

const formatINR = (val) =>
  "₹" + Number(val).toLocaleString("en-IN");

const tenureLabel = (months) =>
  months < 12
    ? `${months} mo`
    : months % 12 === 0
    ? `${months / 12} yr`
    : `${months} mo`;

function Step1LoanDetails() {
  const { setValue } =
    useFormContext();

  const [selectedType, setSelectedType] =
    useState(null);

  const [amount, setAmount] =
    useState(500000);

  const [tenure, setTenure] =
    useState(null);

  const [purpose, setPurpose] =
    useState("");

  const [referral, setReferral] =
    useState("");

  const currentLoan = loanTypes.find(
    (l) => l.id === selectedType
  );

  const handleTypeSelect = (loan) => {
    const mid =
      Math.round(
        ((loan.min + loan.max) / 2) /
          10000
      ) * 10000;

    const defaultTenure =
      loan.tenures[1] ??
      loan.tenures[0];

    setSelectedType(loan.id);
    setAmount(mid);
    setTenure(defaultTenure);

    setValue("loanType", loan.id);
    setValue("amount", mid);
    setValue(
      "tenure",
      defaultTenure
    );
    setValue("purpose", purpose);
    setValue(
      "referral",
      referral
    );
  };

  return (
    <div className="max-w-5xl mx-auto">

      {/* Intro */}
      <div className="mb-8">

        <div className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/20 px-4 py-1 rounded-full mb-4">

          <span className="text-[#1DB954] text-xs font-semibold tracking-wider uppercase">
            Smart Loan Journey
          </span>

        </div>

        <h2 className="text-4xl font-bold text-white leading-tight mb-3">

          Find the perfect loan

          <span className="text-[#1DB954]">
            {" "}
            for your needs
          </span>

        </h2>

        <p className="text-[#b3b3b3] max-w-2xl leading-relaxed">

          Choose your preferred loan type
          and configure repayment
          options.

        </p>

      </div>

      {/* Loan Types */}
      <p className="text-[#b3b3b3] text-xs mb-3">
        Select loan type
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">

        {loanTypes.map((loan) => (
          <div
            key={loan.id}
            onClick={() =>
              handleTypeSelect(loan)
            }
            className={`flex flex-col items-center p-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:scale-[1.03]
            ${
              selectedType ===
              loan.id
                ? "border-[#1DB954] bg-[#1a2e1e]"
                : "border-[#3a3a3a] bg-[#282828]"
            }`}
          >

            <span className="text-2xl mb-2">
              {loan.icon}
            </span>

            <span
              className={`text-xs font-medium text-center ${
                selectedType ===
                loan.id
                  ? "text-white"
                  : "text-[#b3b3b3]"
              }`}
            >
              {loan.label}
            </span>

          </div>
        ))}

      </div>

      {/* Badge */}
      {currentLoan && (
        <div className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-full px-3 py-1 mb-5">

          <span className="text-[#1DB954] text-xs">
            ℹ {currentLoan.badge}
          </span>

        </div>
      )}

      {/* Amount */}
      <div className="mb-5">

        <label className="block text-xs text-[#b3b3b3] mb-1">
          Loan amount
        </label>

        <p className="text-[#1DB954] text-3xl font-semibold mb-2">

          {formatINR(amount)}

        </p>

        <input
          type="range"
          min={
            currentLoan?.min ??
            50000
          }
          max={
            currentLoan?.max ??
            1000000
          }
          step={10000}
          value={amount}
          onChange={(e) => {
            const value = Number(
              e.target.value
            );

            setAmount(value);

            setValue(
              "amount",
              value
            );
          }}
          className="w-full accent-[#1DB954]"
        />

      </div>

      {/* Tenure */}
      <div className="mb-5">

        <label className="block text-xs text-[#b3b3b3] mb-2">
          Tenure
        </label>

        <div className="flex flex-wrap gap-2">

          {(currentLoan?.tenures ?? [
            6,
            12,
            24,
          ]).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => {
                setTenure(t);

                setValue(
                  "tenure",
                  t
                );
              }}
              className={`px-4 py-1.5 rounded-full text-xs border
              ${
                tenure === t
                  ? "border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954]"
                  : "border-[#3a3a3a] text-[#b3b3b3]"
              }`}
            >
              {tenureLabel(t)}
            </button>
          ))}

        </div>

      </div>

      {/* Purpose */}
      <div className="mb-5">

        <label className="block text-xs text-[#b3b3b3] mb-2">
          Purpose of loan
        </label>

        <select
          value={purpose}
          onChange={(e) => {
            const value =
              e.target.value;

            setPurpose(value);

            setValue(
              "purpose",
              value
            );
          }}
          className="w-full bg-[#282828] border border-[#3a3a3a] rounded-lg px-4 py-2.5 text-sm text-white"
        >

          <option value="">
            Select a purpose
          </option>

          {purposeOptions.map(
            (p) => (
              <option
                key={p}
                value={p}
              >
                {p}
              </option>
            )
          )}

        </select>

      </div>

      {/* Referral */}
      <div>

        <label className="block text-xs text-[#b3b3b3] mb-2">
          Referral code
        </label>

        <input
          type="text"
          placeholder="REF123"
          value={referral}
          onChange={(e) => {
            const value =
              e.target.value.toUpperCase();

            setReferral(value);

            setValue(
              "referral",
              value
            );
          }}
          className="w-full bg-[#282828] border border-[#3a3a3a] rounded-lg px-4 py-2.5 text-sm text-white"
        />

      </div>

    </div>
  );
}

export default Step1LoanDetails;