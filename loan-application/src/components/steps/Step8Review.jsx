import { useMemo, useState } from "react";

import {
  useFormContext,
} from "react-hook-form";

function Step8Review() {

  const {
    getValues,
  } = useFormContext();

  const formData =
    getValues();

  const [
    agreeTerms,
    setAgreeTerms,
  ] = useState(false);

  const [
    agreeCreditCheck,
    setAgreeCreditCheck,
  ] = useState(false);

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  // Loan Details
  const loanAmount = Number(
    formData.amount || 500000
  );

  const tenureMonths = Number(
    formData.tenure || 60
  );

  // Interest rates
  const interestRates = {
    home: 8.5,
    personal: 12,
    car: 9,
    education: 10,
    business: 14,
    gold: 11,
  };

  const interestRate =
    interestRates[
      formData.loanType
    ] || 10;

  // EMI Calculation
  const emi = useMemo(() => {

    const monthlyRate =
      interestRate / 12 / 100;

    const emiValue =
      (loanAmount *
        monthlyRate *
        Math.pow(
          1 + monthlyRate,
          tenureMonths
        )) /
      (Math.pow(
        1 + monthlyRate,
        tenureMonths
      ) -
        1);

    return isFinite(emiValue)
      ? emiValue.toFixed(0)
      : 0;

  }, [
    loanAmount,
    tenureMonths,
    interestRate,
  ]);

  const totalPayment =
    Number(emi) *
    tenureMonths;

  const totalInterest =
    totalPayment -
    loanAmount;

  const formatINR = (
    value
  ) =>
    "₹" +
    Number(value).toLocaleString(
      "en-IN"
    );

  const handleSubmit = () => {

    if (
      !agreeTerms ||
      !agreeCreditCheck
    ) {

      alert(
        "Please accept all consent checkboxes."
      );

      return;
    }

    console.log(
      "FINAL FORM DATA:",
      formData
    );

    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">

        <div className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/20 px-4 py-1 rounded-full mb-4">

          <span className="text-[#1DB954] text-xs font-semibold tracking-wider uppercase">
            Final Verification
          </span>

        </div>

        <h2 className="text-4xl font-bold text-white mb-3">
          Review & Submit
        </h2>

        <p className="text-[#b3b3b3] max-w-2xl">
          Carefully review all your
          details before submitting
          your loan application.
        </p>

      </div>

      {/* Loan Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl p-5">

          <p className="text-[#7a7a7a] text-xs mb-2">
            Loan Amount
          </p>

          <h3 className="text-2xl font-bold text-white">
            {formatINR(
              loanAmount
            )}
          </h3>

        </div>

        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl p-5">

          <p className="text-[#7a7a7a] text-xs mb-2">
            Estimated EMI
          </p>

          <h3 className="text-2xl font-bold text-[#1DB954]">

            {formatINR(emi)}

          </h3>

          <p className="text-xs text-[#7a7a7a] mt-1">
            per month
          </p>

        </div>

        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-2xl p-5">

          <p className="text-[#7a7a7a] text-xs mb-2">
            Interest Rate
          </p>

          <h3 className="text-2xl font-bold text-white">
            {interestRate}%
          </h3>

        </div>

      </div>

      {/* Summary */}
      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-3xl p-6 mb-8">

        <div className="flex items-center justify-between mb-6">

          <h3 className="text-xl font-semibold text-white">
            Application Summary
          </h3>

          <button
            type="button"
            className="text-[#1DB954] text-sm hover:underline"
          >
            Edit Details
          </button>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>

            <p className="text-[#7a7a7a] text-xs mb-1">
              Full Name
            </p>

            <p className="text-white">

              {formData.firstName ||
                "-"}

              {" "}

              {formData.lastName ||
                ""}

            </p>

          </div>

          <div>

            <p className="text-[#7a7a7a] text-xs mb-1">
              Phone Number
            </p>

            <p className="text-white">

              +91{" "}

              {formData.phone ||
                "-"}

            </p>

          </div>

          <div>

            <p className="text-[#7a7a7a] text-xs mb-1">
              Email
            </p>

            <p className="text-white">

              {formData.email ||
                "-"}

            </p>

          </div>

          <div>

            <p className="text-[#7a7a7a] text-xs mb-1">
              Loan Type
            </p>

            <p className="text-white capitalize">

              {formData.loanType ||
                "-"}

            </p>

          </div>

          <div>

            <p className="text-[#7a7a7a] text-xs mb-1">
              Tenure
            </p>

            <p className="text-white">

              {tenureMonths} months

            </p>

          </div>

          <div>

            <p className="text-[#7a7a7a] text-xs mb-1">
              Purpose
            </p>

            <p className="text-white">

              {formData.purpose ||
                "-"}

            </p>

          </div>

        </div>

      </div>

      {/* EMI Breakdown */}
      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-3xl p-6 mb-8">

        <h3 className="text-xl font-semibold text-white mb-5">
          EMI Breakdown
        </h3>

        <div className="space-y-4">

          <div className="flex justify-between items-center">

            <span className="text-[#b3b3b3]">
              Loan Amount
            </span>

            <span className="text-white font-medium">

              {formatINR(
                loanAmount
              )}

            </span>

          </div>

          <div className="flex justify-between items-center">

            <span className="text-[#b3b3b3]">
              Total Interest
            </span>

            <span className="text-white font-medium">

              {formatINR(
                totalInterest
              )}

            </span>

          </div>

          <div className="flex justify-between items-center border-t border-[#2a2a2a] pt-4">

            <span className="text-white font-semibold">
              Total Payment
            </span>

            <span className="text-[#1DB954] text-xl font-bold">

              {formatINR(
                totalPayment
              )}

            </span>

          </div>

        </div>

      </div>

      {/* Consent */}
      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-3xl p-6 mb-8">

        <h3 className="text-xl font-semibold text-white mb-5">
          Consent & Declaration
        </h3>

        <div className="space-y-4">

          <label className="flex items-start gap-3 cursor-pointer">

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
              className="mt-1 accent-[#1DB954]"
            />

            <span className="text-sm text-[#b3b3b3] leading-relaxed">

              I confirm that all
              the information
              provided is accurate
              and complete.

            </span>

          </label>

          <label className="flex items-start gap-3 cursor-pointer">

            <input
              type="checkbox"
              checked={
                agreeCreditCheck
              }
              onChange={() =>
                setAgreeCreditCheck(
                  !agreeCreditCheck
                )
              }
              className="mt-1 accent-[#1DB954]"
            />

            <span className="text-sm text-[#b3b3b3] leading-relaxed">

              I authorize Zetheta
              Finance to perform
              credit verification
              and KYC checks.

            </span>

          </label>

        </div>

      </div>

      {/* Submit */}
      <div className="flex items-center justify-between flex-wrap gap-4">

        <div>

          <p className="text-[#7a7a7a] text-sm">
            By clicking submit,
            your application will
            be securely processed.
          </p>

        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-8 py-4 rounded-2xl text-sm font-bold transition-all duration-300 shadow-lg shadow-[#1DB954]/20"
        >
          Submit Application →
        </button>

      </div>

      {/* Success */}
      {submitted && (
        <div className="mt-8 bg-[#1DB954]/10 border border-[#1DB954]/30 rounded-2xl p-5">

          <h3 className="text-[#1DB954] text-xl font-bold mb-2">
            🎉 Application
            Submitted
          </h3>

          <p className="text-[#b3b3b3] text-sm">

            Your loan application
            has been submitted
            successfully. Our team
            will contact you
            shortly.

          </p>

        </div>
      )}

    </div>
  );
}

export default Step8Review;