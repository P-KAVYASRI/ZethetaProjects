import { useMemo, useState, useEffect, useRef } from "react";

import {
  useFormContext,
} from "react-hook-form";
import {
  calculateEMI,
} from "../../utils/emiCalculator";

const interestRates = {
  home: 8.5,
  personal: 12,
  car: 9,
  education: 10,
  business: 14,
  gold: 11,
};


const loanIcons = {
  home: "🏠",
  personal: "👤",
  car: "🚗",
  education: "🎓",
  business: "💼",
  gold: "✨",
};

function formatINR(value) {
  return "₹" + Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
}

function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  duration = 800,
}) {

  const [display, setDisplay] =
    useState(0);

  const startRef =
    useRef(null);

  const rafRef =
    useRef(null);

  useEffect(() => {

    const target =
      Number(value);

    const start =
      Date.now();

    startRef.current =
      start;

    const tick = () => {

      const elapsed =
        Date.now() -
        start;

      const progress =
        Math.min(
          elapsed /
            duration,
          1
        );

      const eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );

      setDisplay(
        Math.round(
          eased * target
        )
      );

      if (
        progress < 1
      ) {
        rafRef.current =
          requestAnimationFrame(
            tick
          );
      }
    };

    rafRef.current =
      requestAnimationFrame(
        tick
      );

    return () =>
      cancelAnimationFrame(
        rafRef.current
      );

  }, [value, duration]);

  return (
    <span>
      {prefix}

      {display.toLocaleString(
        "en-IN"
      )}

      {suffix}
    </span>
  );
}

export default function Step8Review() {

  // IMPORTANT FIX
 const {
  watch,
  reset,
} = useFormContext();

const formData =
  watch() || {};

  const [
    agreeTerms,
    setAgreeTerms,
  ] = useState(false);

  const [
    agreeCreditCheck,
    setAgreeeCreditCheck,
  ] = useState(false);

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    errors,
    setErrors,
  ] = useState({});

  const [
    mounted,
    setMounted,
  ] = useState(false);

  useEffect(() => {
    setTimeout(
      () =>
        setMounted(
          true
        ),
      50
    );
  }, []);

  const loanAmount =
    Number(
      formData.amount ||
        500000
    );

  const tenureMonths =
    Number(
      formData.tenure ||
        60
    );

  const interestRate =
  interestRates?.[
    formData?.loanType
  ] || 10;


const emi = useMemo(() => {
  return calculateEMI(
    loanAmount,
    interestRate,
    tenureMonths
  );

}, [
  loanAmount,
  interestRate,
  tenureMonths,
]);

  const totalPayment =
    emi *
    tenureMonths;

  const totalInterest =
    totalPayment -
    loanAmount;

  const handleSubmit =
    () => {

      const newErrors =
        {};

      if (
        !agreeTerms
      ) {
        newErrors.terms =
          true;
      }

      if (
        !agreeCreditCheck
      ) {
        newErrors.credit =
          true;
      }

      if (
        Object.keys(
          newErrors
        ).length > 0
      ) {

        setErrors(
          newErrors
        );

        return;
      }

      setSubmitting(
        true
      );

      setTimeout(() => {

  setSubmitting(false);

  const existingApps =
  JSON.parse(
    localStorage.getItem(
      "submittedApplications"
    )
  ) || [];

existingApps.push({
  ...formData,
  submittedAt:
    new Date().toISOString(),
});

localStorage.setItem(
  "submittedApplications",
  JSON.stringify(existingApps)
);

 

  setSubmitted(true);

}, 1800);
    };

 if (submitted) {

  return (

    <div className="text-center py-20">

      <div className="text-white text-3xl">
        🎉 Application Submitted Successfully
      </div>

      <button
        onClick={() => {

          reset();

          localStorage.removeItem(
            "loanApplicationDraft"
          );

          window.location.reload();

        }}
        className="mt-8 px-6 py-3 rounded-xl bg-[#1DB954] text-black font-semibold hover:scale-105 transition-all duration-200"
      >
        Start New Application
      </button>

    </div>
  );
}

  return (
    <div
      style={{
        maxWidth: 680,
        margin:
          "0 auto",
        opacity:
          mounted
            ? 1
            : 0,
        transition:
          "opacity 0.3s ease",
      }}
    >

      {/* HEADER */}
      <div
        style={{
          marginBottom:
            32,
        }}
      >

        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            color:
              "#fff",
          }}
        >
          Review &
          Submit
        </h2>

      </div>

      {/* DETAILS */}
      <div
        style={{
          background:
            "#111",
          border:
            "1px solid #222",
          borderRadius:
            20,
          padding:
            "24px 28px",
          marginBottom:
            16,
        }}
      >

        <h3
          style={{
            color:
              "#fff",
            marginBottom:
              20,
          }}
        >
          Personal
          Information
        </h3>

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "1fr 1fr",
            gap:
              "16px 24px",
          }}
        >

          <div>
            <p
              style={{
                color:
                  "#666",
              }}
            >
              Full Name
            </p>

            <p
              style={{
                color:
                  "#fff",
              }}
            >
              {
                formData.firstName
              }{" "}
              {
                formData.lastName
              }
            </p>

          </div>

          <div>
            <p
              style={{
                color:
                  "#666",
              }}
            >
              Phone
            </p>

            <p
              style={{
                color:
                  "#fff",
              }}
            >
              +91{" "}
              {
                formData.phone
              }
            </p>

          </div>

          <div>
            <p
              style={{
                color:
                  "#666",
              }}
            >
              Email
            </p>

            <p
              style={{
                color:
                  "#fff",
              }}
            >
              {
                formData.email
              }
            </p>

          </div>

          <div>
            <p
              style={{
                color:
                  "#666",
              }}
            >
              PAN
            </p>

            <p
              style={{
                color:
                  "#1DB954",
              }}
            >
              {
                formData.pan
              }
            </p>

          </div>

        </div>

      </div>

     {/* LOAN DETAILS */}
<div
  style={{
    background: "#111",
    border: "1px solid #222",
    borderRadius: 20,
    padding: "24px 28px",
    marginBottom: 16,
  }}
>

  <h3
    style={{
      color: "#fff",
      marginBottom: 20,
    }}
  >
    Loan Details
  </h3>

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(3, 1fr)",
      gap: "16px 24px",
    }}
  >

    {/* Loan Type */}
    <div>

      <p
        style={{
          color: "#666",
        }}
      >
        Loan Type
      </p>

      <p
        style={{
          color: "#fff",
        }}
      >
        {formData.loanType}
      </p>

    </div>

    {/* Loan Amount */}
    <div>

      <p
        style={{
          color: "#666",
        }}
      >
        Loan Amount
      </p>

      <p
        style={{
          color: "#1DB954",
        }}
      >
        {formatINR(
          loanAmount
        )}
      </p>

    </div>

    {/* EMI */}
    <div>

      <p
        style={{
          color: "#666",
        }}
      >
        EMI
      </p>

      <p
        style={{
          color: "#1DB954",
        }}
      >
        <AnimatedNumber
          value={emi}
          prefix="₹"
        />
      </p>

    </div>

    {/* Interest Rate */}
    <div>

      <p
        style={{
          color: "#666",
        }}
      >
        Interest Rate
      </p>

      <p
        style={{
          color: "#1DB954",
        }}
      >
        {interestRate}%
      </p>

    </div>

    {/* Total Interest */}
    <div>

      <p
        style={{
          color: "#666",
        }}
      >
        Total Interest
      </p>

      <p
        style={{
          color: "#1DB954",
        }}
      >
        {formatINR(
          totalInterest
        )}
      </p>

    </div>

    {/* Total Payment */}
    <div>

      <p
        style={{
          color: "#666",
        }}
      >
        Total Payment
      </p>

      <p
        style={{
          color: "#1DB954",
        }}
      >
        {formatINR(
          totalPayment
        )}
      </p>

    </div>

  </div>

</div>
{/* UPLOADED DOCUMENTS */}

{formData.documents && (

  <div
    style={{
      background: "#111",
      border: "1px solid #222",
      borderRadius: 20,
      padding: "24px 28px",
      marginBottom: 16,
    }}
  >

    <h3
      style={{
        color: "#fff",
        marginBottom: 20,
      }}
    >
      Uploaded Documents
    </h3>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(2, 1fr)",
        gap: 16,
      }}
    >

      {Object.entries(
        formData.documents
      ).map(
        ([key, file]) => {

          const isImage =
            file?.type?.startsWith(
              "image/"
            );

          return (

            <div
              key={key}
              style={{
                border:
                  "1px solid #222",
                borderRadius: 14,
                padding: 14,
                background:
                  "#181818",
              }}
            >

              <p
                style={{
                  color: "#aaa",
                  fontSize: 13,
                  marginBottom: 10,
                  textTransform:
                    "capitalize",
                }}
              >
                {key}
              </p>

              {isImage ? (

                <img
                  src={URL.createObjectURL(
                    file
                  )}
                  alt={key}
                  style={{
                    width: "100%",
                    height: 140,
                    objectFit:
                      "cover",
                    borderRadius: 10,
                  }}
                />

              ) : (

                <div
                  style={{
                    color:
                      "#1DB954",
                    fontSize: 14,
                  }}
                >
                  📄 {file.name}
                </div>

              )}

            </div>

          );
        }
      )}

    </div>

  </div>

)}
      {/* SIGNATURE PREVIEW */}

{formData.signature && (

  <div
    style={{
      background: "#111",
      border: "1px solid #222",
      borderRadius: 20,
      padding: "24px 28px",
      marginBottom: 16,
    }}
  >

    <h3
      style={{
        color: "#fff",
        marginBottom: 20,
      }}
    >
      Digital Signature
    </h3>

    <img
      src={formData.signature}
      alt="signature"
      style={{
        width: 220,
        borderRadius: 12,
        border: "1px solid #333",
        background: "#1a1a1a",
      }}
    />

  </div>

)}

      {/* CONSENT */}
      <div
        style={{
          background:
            "#111",
          border:
            "1px solid #222",
          borderRadius:
            20,
          padding:
            "24px 28px",
          marginBottom:
            24,
        }}
      >

        <label
          style={{
            display:
              "flex",
            gap: 12,
            marginBottom:
              16,
            color:
              "#aaa",
          }}
        >

          <input
            type="checkbox"
            checked={
              agreeTerms
            }
            onChange={() =>
              setAgreeTerms(
                !agreeTerms
              )
            }
          />

          I confirm all
          information is
          correct.

        </label>

        <label
          style={{
            display:
              "flex",
            gap: 12,
            color:
              "#aaa",
          }}
        >

          <input
            type="checkbox"
            checked={
              agreeCreditCheck
            }
            onChange={() =>
              setAgreeeCreditCheck(
                !agreeCreditCheck
              )
            }
          />

          I authorize
          credit
          verification.

        </label>

      </div>

      {/* SUBMIT */}
      <button
        type="button"
        onClick={
          handleSubmit
        }
        disabled={
          submitting
        }
        style={{
          background:
            "#1DB954",
          color: "#000",
          border: "none",
          borderRadius: 14,
          padding:
            "14px 28px",
          fontSize: 14,
          fontWeight: 700,
          cursor:
            "pointer",
          width: "100%",
        }}
      >

        {submitting
          ? "Processing..."
          : "Submit Application"}

      </button>

    </div>
  );
}