import { useState } from "react";
import {
  useFormContext,
} from "react-hook-form";
import { z } from "zod";

const addressSchema = z.object({
  addressLine1: z.string().min(5, "Address must be at least 5 characters"),
  addressLine2: z.string().optional(),
  pinCode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  sameAsCurrent: z.boolean().optional(),
  permAddressLine1: z.string().optional(),
  permAddressLine2: z.string().optional(),
  permPinCode: z.string().optional(),
  permCity: z.string().optional(),
  permState: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.sameAsCurrent) {
    if (!data.permAddressLine1 || data.permAddressLine1.length < 5) {
      ctx.addIssue({ path: ["permAddressLine1"], code: "custom", message: "Address must be at least 5 characters" });
    }
    if (!data.permPinCode || !/^\d{6}$/.test(data.permPinCode)) {
      ctx.addIssue({ path: ["permPinCode"], code: "custom", message: "Enter a valid 6-digit PIN code" });
    }
    if (!data.permCity || data.permCity.length < 2) {
      ctx.addIssue({ path: ["permCity"], code: "custom", message: "City is required" });
    }
    if (!data.permState || data.permState.length < 2) {
      ctx.addIssue({ path: ["permState"], code: "custom", message: "State is required" });
    }
  }
});

// Mock PIN code database
const pinDatabase = {
  "500001": { city: "Hyderabad", state: "Telangana" },
  "500002": { city: "Hyderabad", state: "Telangana" },
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "400051": { city: "Mumbai", state: "Maharashtra" },
  "110001": { city: "New Delhi", state: "Delhi" },
  "110011": { city: "New Delhi", state: "Delhi" },
  "560001": { city: "Bengaluru", state: "Karnataka" },
  "560034": { city: "Bengaluru", state: "Karnataka" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "700001": { city: "Kolkata", state: "West Bengal" },
  "380001": { city: "Ahmedabad", state: "Gujarat" },
  "411001": { city: "Pune", state: "Maharashtra" },
  "302001": { city: "Jaipur", state: "Rajasthan" },
  "226001": { city: "Lucknow", state: "Uttar Pradesh" },
  "530001": { city: "Visakhapatnam", state: "Andhra Pradesh" },
  "522001": { city: "Guntur", state: "Andhra Pradesh" },
  "533001": { city: "Rajahmundry", state: "Andhra Pradesh" },
};

const inputClass =
  "w-full bg-[#282828] border border-[#3a3a3a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#1DB954] transition-colors placeholder-[#5a5a5a]";

const disabledInputClass =
  "w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-sm text-[#5a5a5a] outline-none cursor-not-allowed";

const labelClass = "block text-xs text-[#b3b3b3] mb-2";
const errorClass = "text-red-400 text-xs mt-1";

function FieldError({ message }) {
  if (!message) return null;
  return <p className={errorClass}>⚠ {message}</p>;
}

function PinStatus({ status }) {
  if (status === "loading")
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[#b3b3b3] mt-1">
        <span className="w-3 h-3 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin inline-block"></span>
        Fetching city & state...
      </span>
    );
  if (status === "success")
    return <span className="text-xs text-[#1DB954] mt-1 inline-block">✓ City and state auto-filled</span>;
  if (status === "error")
    return <span className="text-xs text-red-400 mt-1 inline-block">✗ PIN not found — fill manually</span>;
  return null;
}

function AddressSection({ prefix = "", register, errors, setValue, watch, title, accent }) {
  const [pinStatus, setPinStatus] = useState("idle");

  const pinField = prefix ? `${prefix}PinCode` : "pinCode";
  const cityField = prefix ? `${prefix}City` : "city";
  const stateField = prefix ? `${prefix}State` : "state";
  const line1Field = prefix ? `${prefix}AddressLine1` : "addressLine1";
  const line2Field = prefix ? `${prefix}AddressLine2` : "addressLine2";

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setValue(pinField, val, { shouldValidate: true });

    if (val.length === 6) {
      setPinStatus("loading");
      setTimeout(() => {
        const found = pinDatabase[val];
        if (found) {
          setValue(cityField, found.city, { shouldValidate: true });
          setValue(stateField, found.state, { shouldValidate: true });
          setPinStatus("success");
        } else {
          setPinStatus("error");
        }
      }, 1000);
    } else {
      setPinStatus("idle");
    }
  };

  return (
    <div className={`bg-[#1a1a1a] border rounded-2xl p-5 mb-5 ${accent ? "border-[#1DB954]/30" : "border-[#2a2a2a]"}`}>
      <p className={`text-xs font-semibold uppercase tracking-widest mb-4 ${accent ? "text-[#1DB954]" : "text-[#b3b3b3]"}`}>
        {title}
      </p>

      {/* Address Line 1 */}
      <div className="mb-4">
        <label className={labelClass}>
          Address line 1 <span className="text-red-400">*</span>
        </label>
        <input
          {...register(line1Field)}
          placeholder="House / Flat no., Building name, Street"
          className={inputClass}
        />
        <FieldError message={errors[line1Field]?.message} />
      </div>

      {/* Address Line 2 */}
      <div className="mb-4">
        <label className={labelClass}>
          Address line 2 <span className="text-[#5a5a5a]">(optional)</span>
        </label>
        <input
          {...register(line2Field)}
          placeholder="Landmark, Area, Colony"
          className={inputClass}
        />
      </div>

      {/* PIN Code */}
      <div className="mb-4">
        <label className={labelClass}>
          PIN code <span className="text-red-400">*</span>
        </label>
        <input
          value={watch(pinField) ?? ""}
          onChange={handlePinChange}
          placeholder="e.g. 500001"
          maxLength={6}
          type="tel"
          className={inputClass}
        />
        <PinStatus status={pinStatus} />
        <FieldError message={errors[pinField]?.message} />
      </div>

      {/* City & State */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>City</label>
          <input
            {...register(cityField)}
            placeholder="Auto-filled"
            className={pinStatus === "success" ? disabledInputClass : inputClass}
            readOnly={pinStatus === "success"}
          />
          <FieldError message={errors[cityField]?.message} />
        </div>
        <div>
          <label className={labelClass}>State</label>
          <input
            {...register(stateField)}
            placeholder="Auto-filled"
            className={pinStatus === "success" ? disabledInputClass : inputClass}
            readOnly={pinStatus === "success"}
          />
          <FieldError message={errors[stateField]?.message} />
        </div>
      </div>
    </div>
  );
}

function Step4Address() {

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const sameAsCurrent =
    watch("sameAsCurrent");

  return (
    <div>

      {/* Intro */}
      <div className="mb-6">

        <h2 className="text-2xl font-semibold text-white mb-1">
          Address Details
        </h2>

        <p className="text-[#b3b3b3] text-sm">
          Enter your PIN code and
          we'll auto-fill your city
          and state.
        </p>

      </div>

      {/* Current Address */}
      <AddressSection
        prefix=""
        register={register}
        errors={errors}
        setValue={setValue}
        watch={watch}
        title="Current address"
        accent={true}
      />

      {/* Same as Current Toggle */}
      <div className="flex items-center gap-3 mb-5 px-1">

        <input
          {...register(
            "sameAsCurrent"
          )}
          type="checkbox"
          id="sameAsCurrent"
          defaultChecked
          className="w-4 h-4 accent-[#1DB954] cursor-pointer"
        />

        <label
          htmlFor="sameAsCurrent"
          className="text-sm text-[#b3b3b3] cursor-pointer"
        >
          Permanent address is same
          as current address
        </label>

      </div>

      {/* Permanent Address */}
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