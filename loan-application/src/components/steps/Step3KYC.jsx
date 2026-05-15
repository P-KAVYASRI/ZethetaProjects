import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  pan: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g. ABCDE1234F)"),
  aadhaar: z
    .string()
    .regex(/^\d{12}$/, "Aadhaar must be exactly 12 digits"),
  voterId: z.string().optional(),
  passport: z.string().optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must give consent to proceed" }),
  }),
});

const inputClass =
  "w-full bg-[#282828] border border-[#3a3a3a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#1DB954] transition-colors placeholder-[#5a5a5a] tracking-widest uppercase";

const labelClass = "block text-xs text-[#b3b3b3] mb-2";
const errorClass = "text-red-400 text-xs mt-1";

function FieldError({ message }) {
  if (!message) return null;
  return <p className={errorClass}>⚠ {message}</p>;
}

function VerifyButton({ status, onClick }) {
  if (status === "idle")
    return (
      <button
        type="button"
        onClick={onClick}
        className="mt-2 px-4 py-1.5 rounded-full text-xs border border-[#3a3a3a] text-[#b3b3b3] hover:border-[#1DB954] hover:text-[#1DB954] transition-all duration-200"
      >
        Verify
      </button>
    );
  if (status === "loading")
    return (
      <span className="mt-2 inline-flex items-center gap-2 text-xs text-[#b3b3b3]">
        <span className="w-3 h-3 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin inline-block"></span>
        Verifying...
      </span>
    );
  if (status === "success")
    return (
      <span className="mt-2 inline-flex items-center gap-1 text-xs text-[#1DB954] font-semibold">
        ✓ Verified successfully
      </span>
    );
  if (status === "error")
    return (
      <span className="mt-2 inline-flex items-center gap-1 text-xs text-red-400">
        ✗ Verification failed — check the number
      </span>
    );
}

function Step3KYC({ onDataChange }) {
  const [verifyStatus, setVerifyStatus] = useState({
    pan: "idle",
    aadhaar: "idle",
    voterId: "idle",
    passport: "idle",
  });

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { consent: false },
  });

  const simulate = (field) => {
    const val = getValues(field);
    if (!val || val.length < 4) {
      setVerifyStatus((p) => ({ ...p, [field]: "error" }));
      return;
    }
    setVerifyStatus((p) => ({ ...p, [field]: "loading" }));
    setTimeout(() => {
      setVerifyStatus((p) => ({ ...p, [field]: "success" }));
    }, 1800);
  };

  const onSubmit = (data) => {
    onDataChange?.(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>

      {/* Intro */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-1">KYC Verification</h2>
        <p className="text-[#b3b3b3] text-sm">
          Provide your identity documents for verification. PAN and Aadhaar are mandatory.
        </p>
      </div>

      {/* Mandatory Section */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 mb-5">
        <p className="text-[#1DB954] text-xs font-semibold uppercase tracking-widest mb-4">
          Mandatory
        </p>

        {/* PAN */}
        <div className="mb-5">
          <label className={labelClass}>
            PAN number
            <span className="text-red-400 ml-1">*</span>
          </label>
          <input
            {...register("pan")}
            placeholder="ABCDE1234F"
            maxLength={10}
            className={inputClass}
          />
          <FieldError message={errors.pan?.message} />
          <VerifyButton status={verifyStatus.pan} onClick={() => simulate("pan")} />
        </div>

        {/* Aadhaar */}
        <div>
          <label className={labelClass}>
            Aadhaar number
            <span className="text-red-400 ml-1">*</span>
          </label>
          <input
            {...register("aadhaar")}
            placeholder="XXXX XXXX XXXX"
            maxLength={12}
            type="tel"
            className={inputClass}
          />
          <FieldError message={errors.aadhaar?.message} />
          <VerifyButton status={verifyStatus.aadhaar} onClick={() => simulate("aadhaar")} />
        </div>
      </div>

      {/* Optional Section */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 mb-5">
        <p className="text-[#b3b3b3] text-xs font-semibold uppercase tracking-widest mb-1">
          Optional — provide any one
        </p>
        <p className="text-[#5a5a5a] text-xs mb-4">
          Additional documents improve your approval chances
        </p>

        {/* Voter ID */}
        <div className="mb-5">
          <label className={labelClass}>Voter ID</label>
          <input
            {...register("voterId")}
            placeholder="ABC1234567"
            maxLength={10}
            className={inputClass}
          />
          <VerifyButton status={verifyStatus.voterId} onClick={() => simulate("voterId")} />
        </div>

        {/* Passport */}
        <div>
          <label className={labelClass}>Passport number</label>
          <input
            {...register("passport")}
            placeholder="A1234567"
            maxLength={8}
            className={inputClass}
          />
          <VerifyButton status={verifyStatus.passport} onClick={() => simulate("passport")} />
        </div>
      </div>

      {/* Consent */}
      <div className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 ${
        errors.consent ? "border-red-400/50 bg-red-400/5" : "border-[#2a2a2a] bg-[#1a1a1a]"
      }`}>
        <input
          {...register("consent")}
          type="checkbox"
          id="consent"
          className="mt-0.5 w-4 h-4 accent-[#1DB954] cursor-pointer"
        />
        <label htmlFor="consent" className="text-xs text-[#b3b3b3] leading-relaxed cursor-pointer">
          I hereby give my consent to{" "}
          <span className="text-white font-medium">Zetheta Finance</span> to fetch,
          verify and store my KYC documents for the purpose of loan processing. I confirm
          that all information provided is accurate and belongs to me.
        </label>
      </div>
      <FieldError message={errors.consent?.message} />

      <button type="submit" id="step3-submit" className="hidden" />
    </form>
  );
}

export default Step3KYC;
