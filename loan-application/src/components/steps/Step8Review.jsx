import { useMemo, useState, useEffect, useRef } from "react";

import { useFormContext } from "react-hook-form";
import { calculateEMI } from "../../utils/emiCalculator";

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
  return (
    "₹" +
    Number(value).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })
  );
}

function AnimatedNumber({ value, prefix = "", suffix = "", duration = 800 }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const target = Number(value);
    const start = Date.now();
    startRef.current = start;

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export default function Step8Review() {
  const { watch, reset, setValue } = useFormContext();
  const formData = watch() || {};

  // Resolve signature from RHF → sessionStorage → localStorage (in that order).
  // Stored as state so the preview is reactive and doesn't flicker.
  const [signaturePreview, setSignaturePreview] = useState(
    formData.signature ||
    sessionStorage.getItem("loan_signature") ||
    localStorage.getItem("loan_signature") ||
    null
  );

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeCreditCheck, setAgreeeCreditCheck] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);

  // On mount: re-check all sources in case RHF hadn't hydrated yet
  useEffect(() => {
    const fromRHF = formData.signature;
    const fromSession = sessionStorage.getItem("loan_signature");
    const fromLocal = localStorage.getItem("loan_signature");
    const resolved = fromRHF || fromSession || fromLocal || null;
    if (resolved) {
      setSignaturePreview(resolved);
      // Sync back into RHF so subsequent watch() calls reflect it
      if (!fromRHF) {
        setValue("signature", resolved, { shouldDirty: true });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  const loanAmount = Number(formData.amount || 500000);
  const tenureMonths = Number(formData.tenure || 60);
  const interestRate = interestRates?.[formData?.loanType] || 10;

  const emi = useMemo(() => {
    return calculateEMI(loanAmount, interestRate, tenureMonths);
  }, [loanAmount, interestRate, tenureMonths]);

  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - loanAmount;

  const handleSubmit = () => {
    const newErrors = {};
    if (!agreeTerms) newErrors.terms = true;
    if (!agreeCreditCheck) newErrors.credit = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);

      const existingApps =
        JSON.parse(localStorage.getItem("submittedApplications")) || [];

      existingApps.push({
        ...formData,
        submittedAt: new Date().toISOString(),
      });

      localStorage.setItem("submittedApplications", JSON.stringify(existingApps));

      setSubmitted(true);
    }, 1800);
  };

  if (submitted) {
    return (
      <div className="text-center py-20">
        <div className="text-white text-3xl">🎉 Application Submitted Successfully</div>
        <button
          onClick={() => {
            reset();
            localStorage.removeItem("loanApplicationDraft");
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
        margin: "0 auto",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff" }}>Review & Submit</h2>
      </div>

      {/* PERSONAL INFORMATION */}
      <div
        style={{
          background: "#111",
          border: "1px solid #222",
          borderRadius: 20,
          padding: "24px 28px",
          marginBottom: 16,
        }}
      >
        <h3 style={{ color: "#fff", marginBottom: 20 }}>Personal Information</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px 24px",
          }}
        >
          <div>
            <p style={{ color: "#666" }}>Full Name</p>
            <p style={{ color: "#fff" }}>
              {formData.firstName} {formData.lastName}
            </p>
          </div>
          <div>
            <p style={{ color: "#666" }}>Phone</p>
            <p style={{ color: "#fff" }}>+91 {formData.phone}</p>
          </div>
          <div>
            <p style={{ color: "#666" }}>Email</p>
            <p style={{ color: "#fff" }}>{formData.email}</p>
          </div>
          <div>
            <p style={{ color: "#666" }}>PAN</p>
            <p style={{ color: "#1DB954" }}>{formData.pan}</p>
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
        <h3 style={{ color: "#fff", marginBottom: 20 }}>Loan Details</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px 24px",
          }}
        >
          <div>
            <p style={{ color: "#666" }}>Loan Type</p>
            <p style={{ color: "#fff" }}>
              {loanIcons[formData.loanType]} {formData.loanType}
            </p>
          </div>
          <div>
            <p style={{ color: "#666" }}>Loan Amount</p>
            <p style={{ color: "#1DB954" }}>{formatINR(loanAmount)}</p>
          </div>
          <div>
            <p style={{ color: "#666" }}>EMI</p>
            <p style={{ color: "#1DB954" }}>
              <AnimatedNumber value={emi} prefix="₹" />
            </p>
          </div>
          <div>
            <p style={{ color: "#666" }}>Interest Rate</p>
            <p style={{ color: "#1DB954" }}>{interestRate}%</p>
          </div>
          <div>
            <p style={{ color: "#666" }}>Total Interest</p>
            <p style={{ color: "#1DB954" }}>{formatINR(totalInterest)}</p>
          </div>
          <div>
            <p style={{ color: "#666" }}>Total Payment</p>
            <p style={{ color: "#1DB954" }}>{formatINR(totalPayment)}</p>
          </div>
        </div>
      </div>

      {/* UPLOADED DOCUMENTS + SIGNATURE PREVIEW — side by side */}
      {(formData.documents || signaturePreview) && (
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 16,
            alignItems: "flex-start",
          }}
        >
          {/* Uploaded Documents */}
          {formData.documents && Object.keys(formData.documents).length > 0 && (
            <div
              style={{
                flex: 1,
                background: "#111",
                border: "1px solid #222",
                borderRadius: 20,
                padding: "24px 28px",
              }}
            >
              <h3 style={{ color: "#fff", marginBottom: 20 }}>Uploaded Documents</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 12,
                }}
              >
                {Object.entries(formData.documents).map(([key, file]) => (
                  <div
                    key={key}
                    style={{
                      border: "1px solid #222",
                      borderRadius: 14,
                      padding: "10px 14px",
                      background: "#181818",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>📄</span>
                    <div>
                      <p
                        style={{
                          color: "#aaa",
                          fontSize: 11,
                          textTransform: "capitalize",
                          marginBottom: 2,
                        }}
                      >
                        {key}
                      </p>
                      <p style={{ color: "#1DB954", fontSize: 13 }}>
                        ✓ {file?.name || "Uploaded"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Digital Signature Preview */}
          {signaturePreview && (
            <div
              style={{
                width: 220,
                flexShrink: 0,
                background: "#111",
                border: "1px solid #222",
                borderRadius: 20,
                padding: "24px 28px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <h3 style={{ color: "#fff", marginBottom: 16, fontSize: 15 }}>
                Digital Signature
              </h3>
              <div
                style={{
                  width: "100%",
                  background: "#fff",
                  borderRadius: 12,
                  padding: 10,
                  border: "1px solid #333",
                }}
              >
                <img
                  src={signaturePreview}
                  alt="signature"
                  style={{
                    width: "100%",
                    height: 100,
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              </div>
              <p style={{ color: "#1DB954", fontSize: 12, marginTop: 10 }}>
                ✓ Signature verified
              </p>
            </div>
          )}
        </div>
      )}

      {/* CONSENT */}
      <div
        style={{
          background: "#111",
          border: "1px solid #222",
          borderRadius: 20,
          padding: "24px 28px",
          marginBottom: 24,
        }}
      >
        <label
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            color: errors.terms ? "#f87171" : "#aaa",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={() => {
              setAgreeTerms(!agreeTerms);
              setErrors((e) => ({ ...e, terms: false }));
            }}
          />
          I confirm all information is correct.
        </label>

        <label
          style={{
            display: "flex",
            gap: 12,
            color: errors.credit ? "#f87171" : "#aaa",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={agreeCreditCheck}
            onChange={() => {
              setAgreeeCreditCheck(!agreeCreditCheck);
              setErrors((e) => ({ ...e, credit: false }));
            }}
          />
          I authorize credit verification.
        </label>

        {(errors.terms || errors.credit) && (
          <p style={{ color: "#f87171", fontSize: 12, marginTop: 12 }}>
            ⚠ Please accept both checkboxes to proceed.
          </p>
        )}
      </div>

      {/* SUBMIT */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          background: submitting ? "#156f34" : "#1DB954",
          color: "#000",
          border: "none",
          borderRadius: 14,
          padding: "14px 28px",
          fontSize: 14,
          fontWeight: 700,
          cursor: submitting ? "not-allowed" : "pointer",
          width: "100%",
          transition: "background 0.2s",
        }}
      >
        {submitting ? "Processing..." : "Submit Application"}
      </button>
    </div>
  );
}