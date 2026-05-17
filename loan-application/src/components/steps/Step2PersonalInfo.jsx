import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import {
  User, Mail, Phone, Calendar, Globe,
  CheckCircle2, AlertCircle, Loader2, ShieldCheck,
} from "lucide-react";

/* ─── Shared classes ───────────────────────────────────────────────────────── */
const inputBase =
  "w-full bg-[#282828] border rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder-[#5a5a5a]";

const labelClass = "block text-xs text-[#b3b3b3] mb-2";

/* ─── Options ──────────────────────────────────────────────────────────────── */
const genderOptions = [
  { value: "male",   label: "Male"   },
  { value: "female", label: "Female" },
  { value: "other",  label: "Other"  },
];

const maritalOptions = [
  { value: "single",   label: "Single"   },
  { value: "married",  label: "Married"  },
  { value: "divorced", label: "Divorced" },
  { value: "widowed",  label: "Widowed"  },
];

const nationalityOptions = [
  "Indian", "NRI (Non-Resident Indian)", "PIO (Person of Indian Origin)", "OCI", "Other",
];

/* ─── Regex ────────────────────────────────────────────────────────────────── */
const PHONE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const calcAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  if (isNaN(birth)) return null;
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const toTitleCase = (str) =>
  str.replace(/\b\w/g, (c) => c.toUpperCase());

/* ─── FieldError ───────────────────────────────────────────────────────────── */
function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
      <AlertCircle size={11} />
      {message}
    </p>
  );
}

/* ─── InputIcon wrapper ────────────────────────────────────────────────────── */
function InputWithIcon({ icon: Icon, children, suffix }) {
  return (
    <div className="relative flex items-center">
      <Icon size={14} className="absolute left-3 text-[#5a5a5a] pointer-events-none" />
      <div className="w-full [&>input]:pl-9">{children}</div>
      {suffix && (
        <div className="absolute right-3 pointer-events-none">{suffix}</div>
      )}
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────────────────────── */
function Step2PersonalInfo() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const firstName     = watch("firstName")     || "";
  const lastName      = watch("lastName")      || "";
  const dob           = watch("dob")           || "";
  const gender        = watch("gender")        || "";
  const maritalStatus = watch("maritalStatus") || "";
  const phone         = watch("phone")         || "";
  const email         = watch("email")         || "";
  const nationality   = watch("nationality")   || "Indian";

  /* Live age */
  const age = calcAge(dob);
  const ageValid = age !== null && age >= 21 && age <= 65;

  /* Email live validation */
  const emailValid = email.length > 0 && EMAIL_REGEX.test(email);
  const emailInvalid = email.length > 3 && !EMAIL_REGEX.test(email);

  /* Phone live validation */
  const phoneValid   = PHONE_REGEX.test(phone);
  const phoneInvalid = phone.length > 0 && !PHONE_REGEX.test(phone);

  /* OTP simulation */
  const [otpState, setOtpState] = useState("idle"); // idle | sending | sent | verified
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");

  const sendOTP = () => {
    if (!phoneValid) return;
    setOtpState("sending");
    setTimeout(() => setOtpState("sent"), 1500);
  };

  const verifyOTP = () => {
    if (otpValue === "1234") {
      setOtpState("verified");
      setOtpError("");
    } else {
      setOtpError("Incorrect OTP — use 1234 for demo");
    }
  };

  /* Hidden field registrations for RHF */
  const hiddenGender   = register("gender");
  const hiddenMarital  = register("maritalStatus");
  const hiddenNat      = register("nationality");

  return (
    <div>
      <input type="hidden" {...hiddenGender} />
      <input type="hidden" {...hiddenMarital} />
      <input type="hidden" {...hiddenNat} />

      {/* ── Intro ── */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/20 px-4 py-1 rounded-full mb-4">
          <User size={12} className="text-[#1DB954]" />
          <span className="text-[#1DB954] text-xs font-semibold tracking-wider uppercase">
            Personal Information
          </span>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-1">Tell us about yourself</h2>
        <p className="text-[#b3b3b3] text-sm">
          All fields are encrypted and kept confidential.
        </p>
      </div>

      {/* ── Name row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* First Name */}
        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <User size={11} />
              First name <span className="text-red-400">*</span>
            </span>
          </label>
          <input
            value={firstName}
            onChange={(e) =>
              setValue("firstName", toTitleCase(e.target.value), {
                shouldDirty: true, shouldValidate: true,
              })
            }
            placeholder="Kavya Sri"
            className={`${inputBase} ${errors.firstName ? "border-red-500" : "border-[#3a3a3a] focus:border-[#1DB954]"}`}
          />
          <FieldError message={errors.firstName?.message} />
        </div>

        {/* Last Name */}
        <div>
          <label className={labelClass}>
            Last name <span className="text-red-400">*</span>
          </label>
          <input
            value={lastName}
            onChange={(e) =>
              setValue("lastName", toTitleCase(e.target.value), {
                shouldDirty: true, shouldValidate: true,
              })
            }
            placeholder="Mishra"
            className={`${inputBase} ${errors.lastName ? "border-red-500" : "border-[#3a3a3a] focus:border-[#1DB954]"}`}
          />
          <FieldError message={errors.lastName?.message} />
        </div>
      </div>

      {/* ── DOB ── */}
      <div className="mb-5">
        <label className={labelClass}>
          <span className="flex items-center gap-1.5">
            <Calendar size={11} />
            Date of birth <span className="text-red-400">*</span>
            <span className="text-[#3f3e3e] ml-1">(Age must be 21–65)</span>
          </span>
        </label>

        <div className="relative">
          <input
            {...register("dob")}
            type="date"
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 21))
              .toISOString().split("T")[0]}
            className={`${inputBase} ${
              errors.dob ? "border-red-500"
              : ageValid  ? "border-[#1DB954]"
              : "border-[#3a3a3a] focus:border-[#1DB954]"
            }`}
          />
        </div>

        {/* Live age badge */}
        {age !== null && (
          <div className={`inline-flex items-center gap-1.5 mt-2 text-xs px-3 py-1 rounded-full border
            ${ageValid
              ? "text-[#1DB954] bg-[#1DB954]/10 border-[#1DB954]/30"
              : "text-red-400 bg-red-400/10 border-red-400/30"
            }`}
          >
            {ageValid ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
            Age: {age} years
            {!ageValid && age < 21 && " — Minimum age is 21"}
            {!ageValid && age > 65 && " — Maximum age is 65"}
          </div>
        )}
        <FieldError message={errors.dob?.message} />
      </div>

      {/* ── Gender ── */}
      <div className="mb-5">
        <label className={labelClass}>Gender <span className="text-red-400">*</span></label>
        <div className="flex gap-3 flex-wrap">
          {genderOptions.map((g) => (
            <button
              type="button"
              key={g.value}
              onClick={() =>
                setValue("gender", g.value, {
                  shouldDirty: true, shouldTouch: true, shouldValidate: true,
                })
              }
              className={`px-5 py-2 rounded-full text-xs border transition-all duration-200
                ${gender === g.value
                  ? "border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954] font-semibold"
                  : "border-[#3a3a3a] text-[#b3b3b3] hover:border-[#1DB954]/50"
                }`}
            >
              {g.label}
            </button>
          ))}
        </div>
        <FieldError message={errors.gender?.message} />
      </div>

      {/* ── Marital Status ── */}
      <div className="mb-5">
        <label className={labelClass}>Marital status <span className="text-red-400">*</span></label>
        <div className="flex gap-3 flex-wrap">
          {maritalOptions.map((m) => (
            <button
              type="button"
              key={m.value}
              onClick={() =>
                setValue("maritalStatus", m.value, {
                  shouldDirty: true, shouldTouch: true, shouldValidate: true,
                })
              }
              className={`px-5 py-2 rounded-full text-xs border transition-all duration-200
                ${maritalStatus === m.value
                  ? "border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954] font-semibold"
                  : "border-[#3a3a3a] text-[#b3b3b3] hover:border-[#1DB954]/50"
                }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        {maritalStatus === "married" && (
          <p className="text-[#5a5a5a] text-xs mt-1.5">
            ℹ Co-applicant option available in Step 6
          </p>
        )}
        <FieldError message={errors.maritalStatus?.message} />
      </div>

      {/* ── Phone + Email ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

        {/* Phone */}
        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <Phone size={11} />
              Mobile number <span className="text-red-400">*</span>
            </span>
          </label>

          <div className="flex">
            <span className="bg-[#1e1e1e] border border-r-0 border-[#3a3a3a] rounded-l-lg px-3 flex items-center text-sm text-[#b3b3b3] shrink-0">
              +91
            </span>
            <input
              value={phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                setValue("phone", digits, { shouldDirty: true, shouldValidate: true });
                if (otpState !== "idle") setOtpState("idle");
              }}
              type="tel"
              placeholder="9876543210"
              maxLength={10}
              className={`flex-1 bg-[#282828] border rounded-r-lg px-4 py-2.5 text-sm text-white outline-none transition-colors
                ${errors.phone || phoneInvalid ? "border-red-500"
                  : phoneValid && otpState !== "verified" ? "border-[#1DB954]"
                  : otpState === "verified" ? "border-[#1DB954]"
                  : "border-[#3a3a3a] focus:border-[#1DB954]"
                }`}
            />
          </div>

          {/* OTP flow */}
          {phoneValid && otpState === "idle" && (
            <button
              type="button"
              onClick={sendOTP}
              className="mt-2 text-xs text-[#1DB954] underline underline-offset-2 hover:text-white transition-colors"
            >
              Send OTP to verify
            </button>
          )}

          {otpState === "sending" && (
            <span className="mt-2 flex items-center gap-1.5 text-xs text-[#b3b3b3]">
              <Loader2 size={11} className="animate-spin" /> Sending OTP...
            </span>
          )}

          {otpState === "sent" && (
            <div className="mt-2">
              <p className="text-xs text-[#b3b3b3] mb-1.5">Enter OTP sent to +91 {phone}</p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  maxLength={4}
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="1234"
                  className="w-24 bg-[#282828] border border-[#3a3a3a] rounded-lg px-3 py-1.5 text-sm text-white text-center outline-none focus:border-[#1DB954] tracking-widest"
                />
                <button
                  type="button"
                  onClick={verifyOTP}
                  className="px-3 py-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-semibold rounded-lg transition-colors"
                >
                  Verify
                </button>
              </div>
              {otpError && <p className="text-red-400 text-xs mt-1">{otpError}</p>}
              <p className="text-[#5a5a5a] text-xs mt-1">Demo OTP: 1234</p>
            </div>
          )}

          {otpState === "verified" && (
            <span className="mt-2 flex items-center gap-1.5 text-xs text-[#1DB954] font-semibold">
              <ShieldCheck size={13} /> Mobile verified
            </span>
          )}

          <FieldError message={errors.phone?.message} />
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>
            <span className="flex items-center gap-1.5">
              <Mail size={11} />
              Email address <span className="text-red-400">*</span>
            </span>
          </label>

          <div className="relative">
            <input
              {...register("email")}
              type="email"
              placeholder="kavya@gmail.com"
              className={`${inputBase} pr-8 ${
                errors.email || emailInvalid ? "border-red-500"
                : emailValid ? "border-[#1DB954]"
                : "border-[#3a3a3a] focus:border-[#1DB954]"
              }`}
            />
            {emailValid && (
              <CheckCircle2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1DB954]" />
            )}
            {emailInvalid && (
              <AlertCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" />
            )}
          </div>

          {emailValid && (
            <p className="text-[#1DB954] text-xs mt-1.5 flex items-center gap-1">
              <CheckCircle2 size={11} /> Valid email address
            </p>
          )}
          <FieldError message={errors.email?.message} />
        </div>

      </div>

      {/* ── Nationality ── */}
      <div className="mb-5">
        <label className={labelClass}>
          <span className="flex items-center gap-1.5">
            <Globe size={11} />
            Nationality
          </span>
        </label>
        <select
          value={nationality}
          onChange={(e) =>
            setValue("nationality", e.target.value, { shouldDirty: true })
          }
          className="w-full bg-[#282828] border border-[#3a3a3a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#1DB954] transition-colors"
        >
          {nationalityOptions.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

    </div>
  );
}

export default Step2PersonalInfo;