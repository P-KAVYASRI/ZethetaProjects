import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { ShieldCheck, Eye, EyeOff, BadgeCheck, AlertCircle, Loader2, Info } from "lucide-react";

/* ─── Constants ──────────────────────────────────────────────────────────── */
const PAN_REGEX     = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const AADHAAR_REGEX = /^\d{12}$/;

/* ─── Shared classes (matches your existing design system) ───────────────── */
const inputBase =
  "w-full bg-[#282828] border rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder-[#5a5a5a]";

const labelClass = "block text-xs text-[#b3b3b3] mb-2";

/* ─── FieldError ─────────────────────────────────────────────────────────── */
function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
      <AlertCircle size={11} />
      {message}
    </p>
  );
}

/* ─── VerifyButton ───────────────────────────────────────────────────────── */
function VerifyButton({ status, onClick, disabled }) {
  if (status === "success")
    return (
      <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#1DB954] font-semibold animate-pulse-once">
        <BadgeCheck size={14} />
        Verified successfully
      </span>
    );

  if (status === "loading")
    return (
      <span className="mt-2 inline-flex items-center gap-2 text-xs text-[#b3b3b3]">
        <Loader2 size={12} className="animate-spin text-[#1DB954]" />
        Verifying...
      </span>
    );

  if (status === "error")
    return (
      <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-red-400">
        <AlertCircle size={12} />
        Verification failed — check the value
      </span>
    );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`mt-2 px-4 py-1.5 rounded-full text-xs border transition-all duration-200
        ${disabled
          ? "border-[#2a2a2a] text-[#3a3a3a] cursor-not-allowed"
          : "border-[#3a3a3a] text-[#b3b3b3] hover:border-[#1DB954] hover:text-[#1DB954] cursor-pointer"
        }`}
    >
      Verify
    </button>
  );
}

/* ─── Tooltip ────────────────────────────────────────────────────────────── */
function Tooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center ml-1.5">
      <Info
        size={12}
        className="text-[#5a5a5a] cursor-pointer hover:text-[#b3b3b3] transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <span className="absolute left-5 top-0 z-50 w-52 bg-[#1e1e1e] border border-[#3a3a3a] text-[#b3b3b3] text-xs rounded-lg px-3 py-2 shadow-xl whitespace-normal leading-relaxed">
          {text}
        </span>
      )}
    </span>
  );
}

/* ─── AadhaarInput — masks to XXXX XXXX 1234 after typing ───────────────── */
function AadhaarInput({ value, onChange, inputClass }) {
  const [showFull, setShowFull] = useState(false);
  const raw = value || "";

  const display = showFull
    ? raw.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3")
    : raw.length === 12
    ? `XXXX XXXX ${raw.slice(8)}`
    : raw;

  return (
    <div className="relative">
      <input
        type={showFull ? "text" : "password"}
        value={raw}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
          onChange(digits);
        }}
        placeholder="123456789012"
        maxLength={12}
        className={`${inputClass} pr-10 tracking-widest`}
      />
      <button
        type="button"
        onClick={() => setShowFull((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5a5a] hover:text-[#b3b3b3] transition-colors"
        tabIndex={-1}
      >
        {showFull ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
      {raw.length === 12 && !showFull && (
        <p className="text-[#5a5a5a] text-xs mt-1">
          Masked for security — showing last 4 digits: <span className="text-white font-mono">{raw.slice(8)}</span>
        </p>
      )}
    </div>
  );
}

/* ─── Main Step3KYC ──────────────────────────────────────────────────────── */
function Step3KYC() {
  const {
    register,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useFormContext();

  /* Verification states */
  const [verifyStatus, setVerifyStatus] = useState({
    pan: "idle",
    aadhaar: "idle",
    voterId: "idle",
    passport: "idle",
  });

  /* Local inline errors (supplement RHF for verify-before-proceed check) */
  const [inlineErrors, setInlineErrors] = useState({});

  const pan     = watch("pan")     || "";
  const aadhaar = watch("aadhaar") || "";
  const voterId = watch("voterId") || "";
  const passport = watch("passport") || "";
  const consent = watch("consent");

  /* Reset verification if user edits a field */
  useEffect(() => {
    if (verifyStatus.pan !== "idle") {
      setVerifyStatus((p) => ({ ...p, pan: "idle" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pan]);

  useEffect(() => {
    if (verifyStatus.aadhaar !== "idle") {
      setVerifyStatus((p) => ({ ...p, aadhaar: "idle" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aadhaar]);

  /* Simulate API verification */
  const simulate = (field, validator, failMsg) => {
    const val = getValues(field);

    if (!val || !validator(val)) {
      setInlineErrors((p) => ({ ...p, [field]: failMsg }));
      setVerifyStatus((p) => ({ ...p, [field]: "error" }));
      return;
    }

    setInlineErrors((p) => ({ ...p, [field]: "" }));
    setVerifyStatus((p) => ({ ...p, [field]: "loading" }));

    setTimeout(() => {
      setVerifyStatus((p) => ({ ...p, [field]: "success" }));
    }, 1800);
  };

  const bothVerified =
    verifyStatus.pan === "success" && verifyStatus.aadhaar === "success";

  /* Derived border colour for inputs */
  const panBorder = () => {
    if (verifyStatus.pan === "success") return "border-[#1DB954]";
    if (verifyStatus.pan === "error")   return "border-red-500";
    if (errors.pan)                     return "border-red-500";
    return "border-[#3a3a3a] focus:border-[#1DB954]";
  };

  const aadhaarBorder = () => {
    if (verifyStatus.aadhaar === "success") return "border-[#1DB954]";
    if (verifyStatus.aadhaar === "error")   return "border-red-500";
    if (errors.aadhaar)                     return "border-red-500";
    return "border-[#3a3a3a] focus:border-[#1DB954]";
  };

  return (
    <div>

      {/* ── Intro ── */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/20 px-4 py-1 rounded-full mb-4">
          <ShieldCheck size={12} className="text-[#1DB954]" />
          <span className="text-[#1DB954] text-xs font-semibold tracking-wider uppercase">
            Identity Verification
          </span>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-1">KYC Verification</h2>
        <p className="text-[#b3b3b3] text-sm">
          Verify your identity documents securely. PAN and Aadhaar are mandatory.
        </p>
      </div>

      {/* ── Both-verified banner ── */}
      {bothVerified && (
        <div className="flex items-center gap-3 mb-5 p-3.5 bg-[#1a2e1e] border border-[#1DB954]/40 rounded-xl">
          <BadgeCheck size={16} className="text-[#1DB954] shrink-0" />
          <span className="text-[#1DB954] text-sm font-medium">
            KYC verified — you can proceed to the next step.
          </span>
        </div>
      )}

      {/* ── Mandatory Section ── */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 mb-5">
        <p className="text-[#1DB954] text-xs font-semibold uppercase tracking-widest mb-5">
          Mandatory
        </p>

        {/* PAN */}
        <div className="mb-6">
          <label className={labelClass}>
            PAN Number
            <span className="text-red-400 ml-1">*</span>
            <Tooltip text="Permanent Account Number issued by the Income Tax Department. Format: ABCDE1234F" />
          </label>

          <input
            {...register("pan")}
            placeholder="ABCDE1234F"
            maxLength={10}
            onChange={(e) => {
              const upper = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
              setValue("pan", upper, { shouldValidate: true, shouldDirty: true });
            }}
            value={pan}
            className={`${inputBase} ${panBorder()} tracking-widest uppercase`}
          />

          {/* Real-time format hint */}
          {pan.length > 0 && pan.length < 10 && (
            <p className="text-[#5a5a5a] text-xs mt-1">
              Format: 5 letters · 4 digits · 1 letter&nbsp;
              <span className="font-mono text-[#b3b3b3]">({pan.length}/10)</span>
            </p>
          )}
          {pan.length === 10 && !PAN_REGEX.test(pan) && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertCircle size={11} /> Invalid PAN format — expected ABCDE1234F
            </p>
          )}
          {pan.length === 10 && PAN_REGEX.test(pan) && verifyStatus.pan === "idle" && (
            <p className="text-[#1DB954] text-xs mt-1">✓ Format looks correct — click Verify to confirm</p>
          )}

          <FieldError message={errors.pan?.message} />

          <VerifyButton
            status={verifyStatus.pan}
            disabled={!PAN_REGEX.test(pan)}
            onClick={() =>
              simulate("pan", (v) => PAN_REGEX.test(v), "Invalid PAN format")
            }
          />
        </div>

        {/* Aadhaar */}
        <div>
          <label className={labelClass}>
            Aadhaar Number
            <span className="text-red-400 ml-1">*</span>
            <Tooltip text="12-digit unique identity number issued by UIDAI. Your number is masked for security." />
          </label>

          <AadhaarInput
            value={aadhaar}
            onChange={(val) =>
              setValue("aadhaar", val, { shouldValidate: true, shouldDirty: true })
            }
            inputClass={`${inputBase} ${aadhaarBorder()}`}
          />

          {aadhaar.length > 0 && aadhaar.length < 12 && (
            <p className="text-[#5a5a5a] text-xs mt-1">
              Must be exactly 12 digits&nbsp;
              <span className="font-mono text-[#b3b3b3]">({aadhaar.length}/12)</span>
            </p>
          )}

          <FieldError message={errors.aadhaar?.message} />

          <VerifyButton
            status={verifyStatus.aadhaar}
            disabled={!AADHAAR_REGEX.test(aadhaar)}
            onClick={() =>
              simulate("aadhaar", (v) => AADHAAR_REGEX.test(v), "Aadhaar must be 12 digits")
            }
          />
        </div>
      </div>

      {/* ── Optional Section ── */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 mb-5">
        <p className="text-[#b3b3b3] text-xs font-semibold uppercase tracking-widest mb-1">
          Optional — provide any one
        </p>
        <p className="text-[#5a5a5a] text-xs mb-5">
          Additional documents improve your approval chances
        </p>

        {/* Voter ID */}
        <div className="mb-5">
          <label className={labelClass}>
            Voter ID
            <Tooltip text="Issued by the Election Commission. Example: ABC1234567" />
          </label>
          <input
            {...register("voterId")}
            placeholder="ABC1234567"
            maxLength={10}
            onChange={(e) =>
              setValue("voterId", e.target.value.toUpperCase(), { shouldDirty: true })
            }
            value={voterId}
            className={`${inputBase} ${
              verifyStatus.voterId === "success"
                ? "border-[#1DB954]"
                : "border-[#3a3a3a] focus:border-[#1DB954]"
            } tracking-widest uppercase`}
          />
          <VerifyButton
            status={verifyStatus.voterId}
            disabled={voterId.length < 4}
            onClick={() =>
              simulate("voterId", (v) => v.length >= 4, "Enter a valid Voter ID")
            }
          />
        </div>

        {/* Passport */}
        <div>
          <label className={labelClass}>
            Passport Number
            <Tooltip text="8-character Indian passport number. Example: A1234567" />
          </label>
          <input
            {...register("passport")}
            placeholder="A1234567"
            maxLength={8}
            onChange={(e) =>
              setValue("passport", e.target.value.toUpperCase(), { shouldDirty: true })
            }
            value={passport}
            className={`${inputBase} ${
              verifyStatus.passport === "success"
                ? "border-[#1DB954]"
                : "border-[#3a3a3a] focus:border-[#1DB954]"
            } tracking-widest uppercase`}
          />
          <VerifyButton
            status={verifyStatus.passport}
            disabled={passport.length < 4}
            onClick={() =>
              simulate("passport", (v) => v.length >= 4, "Enter a valid Passport number")
            }
          />
        </div>
      </div>

      {/* ── Consent ── */}
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 mb-2
          ${errors.consent
            ? "border-red-400/50 bg-red-400/5"
            : consent
            ? "border-[#1DB954]/30 bg-[#1DB954]/5"
            : "border-[#2a2a2a] bg-[#1a1a1a]"
          }`}
      >
        <input
          {...register("consent")}
          type="checkbox"
          id="consent"
          className="mt-0.5 w-4 h-4 accent-[#1DB954] cursor-pointer shrink-0"
        />
        <label htmlFor="consent" className="text-xs text-[#b3b3b3] leading-relaxed cursor-pointer">
          I hereby authorise{" "}
          <span className="text-white font-medium">Zetheta Finance</span> to fetch, verify
          and store my KYC documents for the purpose of loan processing, in compliance with
          RBI KYC guidelines.
        </label>
      </div>
      <FieldError message={errors.consent?.message} />

      {/* ── "Next disabled" nudge ── */}
      {(!verifyStatus.pan === "success" || !verifyStatus.aadhaar === "success") &&
        !bothVerified && (
          <p className="mt-4 text-[#5a5a5a] text-xs flex items-center gap-1.5">
            <AlertCircle size={11} />
            Verify both PAN and Aadhaar to enable the Next Step button.
          </p>
        )}
    </div>
  );
}

export default Step3KYC;