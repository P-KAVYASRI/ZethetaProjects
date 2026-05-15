import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters"),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters"),

  dob: z.string().refine((val) => {
    const dob = new Date(val);
    const today = new Date();

    const age =
      today.getFullYear() - dob.getFullYear();

    const monthDiff =
      today.getMonth() - dob.getMonth();

    const actualAge =
      monthDiff < 0 ||
      (monthDiff === 0 &&
        today.getDate() < dob.getDate())
        ? age - 1
        : age;

    return actualAge >= 21 && actualAge <= 65;
  }, "Age must be between 21 and 65 years"),

  gender: z.enum(
    ["male", "female", "other"],
    {
      required_error: "Please select a gender",
    }
  ),

  maritalStatus: z.enum(
    ["single", "married", "divorced", "widowed"],
    {
      required_error:
        "Please select marital status",
    }
  ),

  phone: z
    .string()
    .regex(
      /^[6-9]\d{9}$/,
      "Enter a valid 10-digit Indian mobile number"
    ),

  email: z
    .string()
    .email("Enter a valid email address"),
});

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const maritalOptions = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
];

const inputClass =
  "w-full bg-[#282828] border border-[#3a3a3a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#1DB954] transition-colors placeholder-[#5a5a5a]";

const errorClass =
  "text-red-400 text-xs mt-1";

const labelClass =
  "block text-xs text-[#b3b3b3] mb-2";

function FieldError({ message }) {
  if (!message) return null;

  return (
    <p className={errorClass}>
      ⚠ {message}
    </p>
  );
}

function Step2PersonalInfo({
  onDataChange,
}) {
  const [selectedGender, setSelectedGender] =
    useState("");

  const [
    selectedMarital,
    setSelectedMarital,
  ] = useState("");

  const {
    register,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <div>

      {/* Name Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

        <div>
          <label className={labelClass}>
            First name
          </label>

          <input
            {...register("firstName")}
            placeholder="Kavya"
            className={inputClass}
            onChange={(e) => {
              onDataChange?.({
                firstName: e.target.value,
              });
            }}
          />

          <FieldError
            message={
              errors.firstName?.message
            }
          />
        </div>

        <div>
          <label className={labelClass}>
            Last name
          </label>

          <input
            {...register("lastName")}
            placeholder="Sharma"
            className={inputClass}
            onChange={(e) => {
              onDataChange?.({
                lastName: e.target.value,
              });
            }}
          />

          <FieldError
            message={
              errors.lastName?.message
            }
          />
        </div>

      </div>

      {/* DOB */}
      <div className="mb-5">

        <label className={labelClass}>
          Date of birth

          <span className="text-[#5a5a5a] ml-2">
            (Age must be 21–65)
          </span>
        </label>

        <input
          {...register("dob")}
          type="date"
          className={inputClass}
          onChange={(e) => {
            onDataChange?.({
              dob: e.target.value,
            });
          }}
        />

        <FieldError
          message={errors.dob?.message}
        />

      </div>

      {/* Gender */}
      <div className="mb-5">

        <label className={labelClass}>
          Gender
        </label>

        <div className="flex gap-3 flex-wrap">

          {genderOptions.map((g) => (
            <button
              type="button"
              key={g.value}
              onClick={() => {
                setSelectedGender(g.value);

                setValue(
                  "gender",
                  g.value
                );

                onDataChange?.({
                  gender: g.value,
                });
              }}
              className={`px-5 py-2 rounded-full text-xs border transition-all duration-200
              ${
                selectedGender === g.value
                  ? "border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954] font-semibold"
                  : "border-[#3a3a3a] text-[#b3b3b3] hover:border-[#1DB954]"
              }`}
            >
              {g.label}
            </button>
          ))}

        </div>

        <FieldError
          message={
            errors.gender?.message
          }
        />

      </div>

      {/* Marital Status */}
      <div className="mb-5">

        <label className={labelClass}>
          Marital status
        </label>

        <div className="flex gap-3 flex-wrap">

          {maritalOptions.map((m) => (
            <button
              type="button"
              key={m.value}
              onClick={() => {
                setSelectedMarital(
                  m.value
                );

                setValue(
                  "maritalStatus",
                  m.value
                );

                onDataChange?.({
                  maritalStatus:
                    m.value,
                });
              }}
              className={`px-5 py-2 rounded-full text-xs border transition-all duration-200
              ${
                selectedMarital ===
                m.value
                  ? "border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954] font-semibold"
                  : "border-[#3a3a3a] text-[#b3b3b3] hover:border-[#1DB954]"
              }`}
            >
              {m.label}
            </button>
          ))}

        </div>

        <FieldError
          message={
            errors.maritalStatus
              ?.message
          }
        />

      </div>

      {/* Phone + Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

        <div>

          <label className={labelClass}>
            Phone number
          </label>

          <div className="flex">

            <span className="bg-[#1e1e1e] border border-r-0 border-[#3a3a3a] rounded-l-lg px-3 flex items-center text-sm text-[#b3b3b3]">
              +91
            </span>

            <input
              {...register("phone")}
              type="tel"
              placeholder="9876543210"
              maxLength={10}
              className="flex-1 bg-[#282828] border border-[#3a3a3a] rounded-r-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#1DB954]"
              onChange={(e) => {
                onDataChange?.({
                  phone:
                    e.target.value,
                });
              }}
            />

          </div>

          <FieldError
            message={
              errors.phone?.message
            }
          />

        </div>

        <div>

          <label className={labelClass}>
            Email address
          </label>

          <input
            {...register("email")}
            type="email"
            placeholder="kavya@example.com"
            className={inputClass}
            onChange={(e) => {
              onDataChange?.({
                email:
                  e.target.value,
              });
            }}
          />

          <FieldError
            message={
              errors.email?.message
            }
          />

        </div>

      </div>

    </div>
  );
}

export default Step2PersonalInfo;