import {
  useFormContext,
} from "react-hook-form";

const genderOptions = [
  {
    value: "male",
    label: "Male",
  },
  {
    value: "female",
    label: "Female",
  },
  {
    value: "other",
    label: "Other",
  },
];

const maritalOptions = [
  {
    value: "single",
    label: "Single",
  },
  {
    value: "married",
    label: "Married",
  },
  {
    value: "divorced",
    label: "Divorced",
  },
  {
    value: "widowed",
    label: "Widowed",
  },
];

const inputClass =
  "w-full bg-[#282828] border border-[#3a3a3a] rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#1DB954] transition-colors placeholder-[#5a5a5a]";

const errorClass =
  "text-red-400 text-xs mt-1";

const labelClass =
  "block text-xs text-[#b3b3b3] mb-2";

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

function Step2PersonalInfo() {

  const {
    register,
    setValue,
    watch,
    formState: {
      errors,
    },
  } = useFormContext();

  // RHF VALUES
  const selectedGender =
    watch("gender");

  const selectedMarital =
    watch(
      "maritalStatus"
    );

  return (
    <div>

      {/* Hidden Fields */}
      <input
        type="hidden"
        {...register(
          "gender"
        )}
      />

      <input
        type="hidden"
        {...register(
          "maritalStatus"
        )}
      />

      {/* Name Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

        {/* First Name */}
        <div>

          <label className={labelClass}>
            First name
          </label>

          <input
            defaultValue=""
            {...register(
              "firstName"
            )}
            placeholder="Kavya sri"
            className={inputClass}
          />

          <FieldError
            message={
              errors.firstName
                ?.message
            }
          />

        </div>

        {/* Last Name */}
        <div>

          <label className={labelClass}>
            Last name
          </label>

          <input
            defaultValue=""
            {...register(
              "lastName"
            )}
            placeholder="Mishra"
            className={inputClass}
          />

          <FieldError
            message={
              errors.lastName
                ?.message
            }
          />

        </div>

      </div>

      {/* DOB */}
      <div className="mb-5">

        <label className={labelClass}>

          Date of birth

          <span className="text-[#3f3e3e] ml-2">
            (Age must be 21–65)
          </span>

        </label>

        <input
          defaultValue=""
          {...register("dob")}
          type="date"
          className={inputClass}
        />

        <FieldError
          message={
            errors.dob
              ?.message
          }
        />

      </div>

      {/* Gender */}
      <div className="mb-5">

        <label className={labelClass}>
          Gender
        </label>

        <div className="flex gap-3 flex-wrap">

          {genderOptions.map(
            (g) => (
              <button
                type="button"
                key={g.value}
                onClick={() => {

                  setValue(
                    "gender",
                    g.value,
                    {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    }
                  );
                }}
                className={`px-5 py-2 rounded-full text-xs border transition-all duration-200
                ${
                  selectedGender ===
                  g.value
                    ? "border-[#1DB954] bg-[#1DB954]/15 text-[#1DB954] font-semibold"
                    : "border-[#3a3a3a] text-[#b3b3b3] hover:border-[#1DB954]"
                }`}
              >
                {g.label}
              </button>
            )
          )}

        </div>

        <FieldError
          message={
            errors.gender
              ?.message
          }
        />

      </div>

      {/* Marital Status */}
      <div className="mb-5">

        <label className={labelClass}>
          Marital status
        </label>

        <div className="flex gap-3 flex-wrap">

          {maritalOptions.map(
            (m) => (
              <button
                type="button"
                key={m.value}
                onClick={() => {

                  setValue(
                    "maritalStatus",
                    m.value,
                    {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    }
                  );
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
            )
          )}

        </div>

        <FieldError
          message={
            errors
              .maritalStatus
              ?.message
          }
        />

      </div>

      {/* Phone + Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">

        {/* Phone */}
        <div>

          <label className={labelClass}>
            Phone number
          </label>

          <div className="flex">

            <span className="bg-[#1e1e1e] border border-r-0 border-[#3a3a3a] rounded-l-lg px-3 flex items-center text-sm text-[#b3b3b3]">
              +91
            </span>

            <input
              defaultValue=""
              {...register(
                "phone"
              )}
              type="tel"
              placeholder="9876543210"
              maxLength={10}
              className="flex-1 bg-[#282828] border border-[#3a3a3a] rounded-r-lg px-4 py-2.5 text-sm text-white outline-none focus:border-[#1DB954]"
            />

          </div>

          <FieldError
            message={
              errors.phone
                ?.message
            }
          />

        </div>

        {/* Email */}
        <div>

          <label className={labelClass}>
            Email address
          </label>

          <input
            defaultValue=""
            {...register(
              "email"
            )}
            type="email"
            placeholder="kavya@gmail.com"
            className={inputClass}
          />

          <FieldError
            message={
              errors.email
                ?.message
            }
          />

        </div>

      </div>

    </div>
  );
}

export default Step2PersonalInfo;