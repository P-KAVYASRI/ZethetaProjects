import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { MapPin, Home, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

/* ─── PIN database (expanded) ──────────────────────────────────────────────── */
const pinDatabase = {
  "500001": { city: "Hyderabad",      state: "Telangana" },
  "500002": { city: "Hyderabad",      state: "Telangana" },
  "500032": { city: "Hyderabad",      state: "Telangana" },
  "400001": { city: "Mumbai",         state: "Maharashtra" },
  "400051": { city: "Mumbai",         state: "Maharashtra" },
  "110001": { city: "New Delhi",      state: "Delhi" },
  "110011": { city: "New Delhi",      state: "Delhi" },
  "560001": { city: "Bengaluru",      state: "Karnataka" },
  "560034": { city: "Bengaluru",      state: "Karnataka" },
  "560100": { city: "Bengaluru",      state: "Karnataka" },
  "600001": { city: "Chennai",        state: "Tamil Nadu" },
  "600020": { city: "Chennai",        state: "Tamil Nadu" },
  "700001": { city: "Kolkata",        state: "West Bengal" },
  "380001": { city: "Ahmedabad",      state: "Gujarat" },
  "411001": { city: "Pune",           state: "Maharashtra" },
  "411045": { city: "Pune",           state: "Maharashtra" },
  "302001": { city: "Jaipur",         state: "Rajasthan" },
  "226001": { city: "Lucknow",        state: "Uttar Pradesh" },
  "530001": { city: "Visakhapatnam",  state: "Andhra Pradesh" },
  "530016": { city: "Visakhapatnam",  state: "Andhra Pradesh" },
  "522001": { city: "Guntur",         state: "Andhra Pradesh" },
  "533001": { city: "Rajahmundry",    state: "Andhra Pradesh" },
  "452001": { city: "Indore",         state: "Madhya Pradesh" },
  "440001": { city: "Nagpur",         state: "Maharashtra" },
  "395001": { city: "Surat",          state: "Gujarat" },
  "641001": { city: "Coimbatore",     state: "Tamil Nadu" },
  "682001": { city: "Kochi",          state: "Kerala" },
  "800001": { city: "Patna",          state: "Bihar" },
  "751001": { city: "Bhubaneswar",    state: "Odisha" },
  "160001": { city: "Chandigarh",     state: "Punjab" },
  "208001": { city: "Kanpur",         state: "Uttar Pradesh" },
  "201001": { city: "Ghaziabad",      state: "Uttar Pradesh" },
  "122001": { city: "Gurugram",       state: "Haryana" },
  "201301": { city: "Noida",          state: "Uttar Pradesh" },
};

/* ─── Options ──────────────────────────────────────────────────────────────── */
const residenceTypes = [
  { value: "owned",       label: "Owned",        icon: "🏠" },
  { value: "rented",      label: "Rented",       icon: "🔑" },
  { value: "family",      label: "Family Owned", icon: "👨‍👩‍👧" },
  { value: "company",     label: "Company Provided", icon: "🏢" },
];

const yearsOptions = [
  "Less than 1 year", "1–2 years", "2–5 years", "5–10 years", "More than 10 years",
];

/* ─── Shared classes ───────────────────────────────────────────────────────── */
const inputBase =
  "w-full bg-[#282828] border rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder-[#5a5a5a]";

const inputClass   = `${inputBase} border-[#3a3a3a] focus:border-[#1DB954]`;
const disabledClass = `${inputBase} border-[#2a2a2a] bg-[#1e1e1e] text-[#5a5a5a] cursor-not-allowed`;
const labelClass   = "block text-xs text-[#b3b3b3] mb-2";

/* ─── Sub-components ───────────────────────────────────────────────────────── */
function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-red-400 text-xs mt-1.5">
      <AlertCircle size={11} /> {message}
    </p>
  );
}

function PinStatus({ status, city, state }) {
  if (status === "loading")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-[#b3b3b3] mt-1.5">
        <Loader2 size={11} className="animate-spin text-[#1DB954]" />
        Looking up PIN code...
      </span>
    );
  if (status === "success")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-[#1DB954] mt-1.5">
        <CheckCircle2 size={11} />
        Auto-filled: {city}, {state}
      </span>
    );
  if (status === "error")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-red-400 mt-1.5">
        <AlertCircle size={11} />
        PIN not found — please fill city & state manually
      </span>
    );
  return null;
}

/* ─── AddressSection ────────────────────────────────────────────────────────── */
function AddressSection({ prefix, register, errors, setValue, watch, title, accent }) {
  const [pinStatus, setPinStatus] = useState("idle");
  const [resolvedCity,  setResolvedCity]  = useState("");
  const [resolvedState, setResolvedState] = useState("");

  const f = (name) => (prefix ? `${prefix}${name.charAt(0).toUpperCase()}${name.slice(1)}` : name);

  const pinVal  = watch(f("pinCode"))      ?? "";
  const cityVal = watch(f("city"))         ?? "";
  const stateVal = watch(f("state"))       ?? "";

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setValue(f("pinCode"), val, { shouldValidate: true });

    if (val.length === 6) {
      setPinStatus("loading");
      setTimeout(() => {
        const found = pinDatabase[val];
        if (found) {
          setValue(f("city"),  found.city,  { shouldValidate: true });
          setValue(f("state"), found.state, { shouldValidate: true });
          setResolvedCity(found.city);
          setResolvedState(found.state);
          setPinStatus("success");
        } else {
          setPinStatus("error");
        }
      }, 1000);
    } else {
      setPinStatus("idle");
      setResolvedCity("");
      setResolvedState("");
    }
  };

  const isAutoFilled = pinStatus === "success";

  return (
    <div className={`bg-[#1a1a1a] border rounded-2xl p-5 mb-5
      ${accent ? "border-[#1DB954]/30" : "border-[#2a2a2a]"}`}>
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={13} className={accent ? "text-[#1DB954]" : "text-[#5a5a5a]"} />
        <p className={`text-xs font-semibold uppercase tracking-widest
          ${accent ? "text-[#1DB954]" : "text-[#b3b3b3]"}`}>
          {title}
        </p>
      </div>

      {/* Address Line 1 */}
      <div className="mb-4">
        <label className={labelClass}>
          Address line 1 <span className="text-red-400">*</span>
        </label>
        <input
          {...register(f("addressLine1"))}
          placeholder="House / Flat no., Building name, Street"
          className={`${inputBase} ${errors[f("addressLine1")] ? "border-red-500" : "border-[#3a3a3a] focus:border-[#1DB954]"}`}
        />
        <FieldError message={errors[f("addressLine1")]?.message} />
      </div>

      {/* Address Line 2 */}
      <div className="mb-4">
        <label className={labelClass}>
          Address line 2 <span className="text-[#5a5a5a]">(optional)</span>
        </label>
        <input
          {...register(f("addressLine2"))}
          placeholder="Landmark, Area, Colony"
          className={inputClass}
        />
      </div>

      {/* PIN Code */}
      <div className="mb-4">
        <label className={labelClass}>
          PIN code <span className="text-red-400">*</span>
          <span className="text-[#5a5a5a] ml-1 font-normal">(city & state auto-fill)</span>
        </label>
        <input
          value={pinVal}
          onChange={handlePinChange}
          placeholder="e.g. 500001"
          maxLength={6}
          type="tel"
          className={`${inputBase} ${
            errors[f("pinCode")] ? "border-red-500"
            : pinStatus === "success" ? "border-[#1DB954]"
            : "border-[#3a3a3a] focus:border-[#1DB954]"
          }`}
        />
        <PinStatus status={pinStatus} city={resolvedCity} state={resolvedState} />
        <FieldError message={errors[f("pinCode")]?.message} />
      </div>

      {/* City + State */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>City <span className="text-red-400">*</span></label>
          <input
            {...register(f("city"))}
            placeholder="Auto-filled"
            readOnly={isAutoFilled}
            className={isAutoFilled ? disabledClass : `${inputBase} ${errors[f("city")] ? "border-red-500" : "border-[#3a3a3a] focus:border-[#1DB954]"}`}
          />
          <FieldError message={errors[f("city")]?.message} />
        </div>
        <div>
          <label className={labelClass}>State <span className="text-red-400">*</span></label>
          <input
            {...register(f("state"))}
            placeholder="Auto-filled"
            readOnly={isAutoFilled}
            className={isAutoFilled ? disabledClass : `${inputBase} ${errors[f("state")] ? "border-red-500" : "border-[#3a3a3a] focus:border-[#1DB954]"}`}
          />
          <FieldError message={errors[f("state")]?.message} />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Step4Address ─────────────────────────────────────────────────────── */
function Step4Address() {
  const { register, setValue, watch, formState: { errors } } = useFormContext();

  const sameAsCurrent  = watch("sameAsCurrent")  ?? true;
  const residenceType  = watch("residenceType")  ?? "";
  const yearsAtAddress = watch("yearsAtAddress") ?? "";

  /* Copy current address to permanent */
  const copyCurrentToPermanent = () => {
    const fields = ["addressLine1", "addressLine2", "pinCode", "city", "state"];
    fields.forEach((field) => {
      const val = watch(field) ?? "";
      const permField = `perm${field.charAt(0).toUpperCase()}${field.slice(1)}`;
      setValue(permField, val, { shouldDirty: true });
    });
  };

  return (
    <div>

      {/* ── Intro ── */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/20 px-4 py-1 rounded-full mb-4">
          <Home size={12} className="text-[#1DB954]" />
          <span className="text-[#1DB954] text-xs font-semibold tracking-wider uppercase">
            Address Information
          </span>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-1">Address Details</h2>
        <p className="text-[#b3b3b3] text-sm">
          Enter your PIN code and we'll auto-fill your city and state instantly.
        </p>
      </div>

      {/* ── Current Address ── */}
      <AddressSection
        prefix=""
        register={register}
        errors={errors}
        setValue={setValue}
        watch={watch}
        title="Current address"
        accent={true}
      />

      {/* ── Residence Type ── */}
      <div className="mb-5">
        <label className={labelClass}>
          Residence type <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {residenceTypes.map(({ value, label, icon }) => (
            <button
              type="button"
              key={value}
              onClick={() => setValue("residenceType", value, { shouldDirty: true, shouldValidate: true })}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition-all duration-200
                ${residenceType === value
                  ? "border-[#1DB954] bg-[#1DB954]/10 text-[#1DB954]"
                  : "border-[#3a3a3a] bg-[#282828] text-[#b3b3b3] hover:border-[#1DB954]/50"
                }`}
            >
              <span className="text-lg">{icon}</span>
              {label}
            </button>
          ))}
        </div>
        <FieldError message={errors.residenceType?.message} />
      </div>

      {/* ── Years at Address ── */}
      <div className="mb-5">
        <label className={labelClass}>
          Years at current address <span className="text-red-400">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {yearsOptions.map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => setValue("yearsAtAddress", opt, { shouldDirty: true, shouldValidate: true })}
              className={`px-4 py-1.5 rounded-full text-xs border transition-all duration-200
                ${yearsAtAddress === opt
                  ? "border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954] font-semibold"
                  : "border-[#3a3a3a] text-[#b3b3b3] hover:border-[#1DB954]/50"
                }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <FieldError message={errors.yearsAtAddress?.message} />
      </div>

      {/* ── Same As Current toggle ── */}
      <div className={`flex items-center justify-between p-4 rounded-xl border mb-5 transition-all duration-200
        ${sameAsCurrent ? "border-[#1DB954]/30 bg-[#1DB954]/5" : "border-[#2a2a2a] bg-[#1a1a1a]"}`}>
        <div className="flex items-center gap-3">
          <input
            {...register("sameAsCurrent")}
            type="checkbox"
            id="sameAsCurrent"
            defaultChecked
            className="w-4 h-4 accent-[#1DB954] cursor-pointer"
          />
          <label htmlFor="sameAsCurrent" className="text-sm text-[#b3b3b3] cursor-pointer">
            Permanent address is same as current address
          </label>
        </div>
        {!sameAsCurrent && (
          <button
            type="button"
            onClick={copyCurrentToPermanent}
            className="text-xs text-[#1DB954] border border-[#1DB954]/40 px-3 py-1 rounded-full hover:bg-[#1DB954]/10 transition-colors shrink-0 ml-3"
          >
            Copy current →
          </button>
        )}
      </div>

      {/* ── Permanent Address ── */}
      {!sameAsCurrent && (
        <AddressSection
          prefix="perm"
          register={register}
          errors={errors}
          setValue={setValue}
          watch={watch}
          title="Permanent address"
          accent={false}
        />
      )}

    </div>
  );
}

export default Step4Address;