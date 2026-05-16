import { useMemo, useState, useEffect, useRef } from "react";

import {
  useFormContext,
} from "react-hook-form";

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
  const { getValues } =
    useFormContext();

  const formData =
    getValues();

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
    interestRates[
      formData.loanType
    ] || 10;

  const emi =
    useMemo(() => {

      const r =
        interestRate /
        12 /
        100;

      const val =
        (loanAmount *
          r *
          Math.pow(
            1 + r,
            tenureMonths
          )) /
        (Math.pow(
          1 + r,
          tenureMonths
        ) -
          1);

      return isFinite(val)
        ? Math.round(
            val
          )
        : 0;

    }, [
      loanAmount,
      tenureMonths,
      interestRate,
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
      <div className="text-center text-white text-3xl py-20">
        🎉 Application Submitted Successfully
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
                  "#fff",
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
          Loan Details
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
              Loan Type
            </p>

            <p
              style={{
                color:
                  "#fff",
              }}
            >
              {
                formData.loanType
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
              Loan Amount
            </p>

            <p
              style={{
                color:
                  "#1DB954",
              }}
            >
              {formatINR(
                loanAmount
              )}
            </p>

          </div>

          <div>
            <p
              style={{
                color:
                  "#666",
              }}
            >
              EMI
            </p>

            <p
              style={{
                color:
                  "#fff",
              }}
            >
              <AnimatedNumber
                value={
                  emi
                }
                prefix="₹"
              />
            </p>

          </div>

          <div>
            <p
              style={{
                color:
                  "#666",
              }}
            >
              Interest
              Rate
            </p>

            <p
              style={{
                color:
                  "#fff",
              }}
            >
              {
                interestRate
              }
              %
            </p>

          </div>

        </div>

      </div>

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