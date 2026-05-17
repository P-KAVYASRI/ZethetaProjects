import { useMemo, useState, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { calculateEMI } from "../../utils/emiCalculator";

const interestRates = { home: 8.5, personal: 12, car: 9, education: 10, business: 14, gold: 11 };
const loanIcons     = { home: "🏠", personal: "👤", car: "🚗", education: "🎓", business: "💼", gold: "✨" };

function formatINR(value) {
  return "₹" + Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function formatSize(bytes) {
  if (!bytes) return "";
  const kb = bytes / 1024;
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
}

function getFileIcon(type) {
  if (!type) return "📄";
  if (type === "application/pdf") return "📋";
  if (type.startsWith("image/")) return "🖼️";
  return "📄";
}

/* ── AnimatedNumber ── */
function AnimatedNumber({ value, prefix = "", duration = 800 }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    const target = Number(value);
    const start  = Date.now();
    const tick = () => {
      const elapsed  = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);
  return <span>{prefix}{display.toLocaleString("en-IN")}</span>;
}

/* ── InfoRow ── */
function InfoRow({ label, value, accent }) {
  return (
    <div>
      <p style={{ color: "#555", fontSize: 11, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
      <p style={{ color: accent ? "#1DB954" : "#fff", fontSize: 14, fontWeight: 500 }}>{value}</p>
    </div>
  );
}

/* ── Section card ── */
function Card({ children, style }) {
  return (
    <div style={{
      background: "#111", border: "1px solid #222", borderRadius: 20,
      padding: "24px 28px", marginBottom: 16, ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 style={{ color: "#fff", marginBottom: 20, fontSize: 15, fontWeight: 600, letterSpacing: "0.2px" }}>
      {children}
    </h3>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   Step8Review
───────────────────────────────────────────────────────────────────────── */
export default function Step8Review() {
  const { watch, reset } = useFormContext();
  const formData = watch();

  // ── Key fix: read documentsMeta (plain objects) not documents (File objects)
  // documentsMeta is always serialisable and survives step navigation
  const documentsMeta    = formData.documentsMeta || {};
  const signaturePreview = formData.signature     || null;
  const hasDocuments     = Object.keys(documentsMeta).length > 0;

  const [agreeTerms,       setAgreeTerms]       = useState(false);
  const [agreeCreditCheck, setAgreeCreditCheck] = useState(false);
  const [submitted,        setSubmitted]         = useState(false);
  const [submitting,       setSubmitting]        = useState(false);
  const [errors,           setErrors]            = useState({});

  const loanAmount   = Number(formData.amount || 500000);
  const tenureMonths = Number(formData.tenure || 60);
  const interestRate = interestRates[formData.loanType] || 10;

  const emi = useMemo(
    () => calculateEMI(loanAmount, interestRate, tenureMonths),
    [loanAmount, interestRate, tenureMonths],
  );
  const totalPayment  = emi * tenureMonths;
  const totalInterest = totalPayment - loanAmount;

  const handleSubmit = () => {
    const newErrors = {};
    if (!agreeTerms)       newErrors.terms  = true;
    if (!agreeCreditCheck) newErrors.credit = true;
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      try {
        const payload = { ...formData };
        delete payload.documents; // File objects not serialisable
        const existing = JSON.parse(localStorage.getItem("submittedApplications") || "[]");
        existing.push({ ...payload, submittedAt: new Date().toISOString() });
        localStorage.setItem("submittedApplications", JSON.stringify(existing));
      } catch (_) {}
      setSubmitted(true);
    }, 1800);
  };

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Application Submitted!</h2>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 32 }}>We'll review your application and get back to you shortly.</p>
        <button
          onClick={() => { reset(); localStorage.removeItem("loanApplicationDraft"); localStorage.removeItem("loanSignature"); window.location.reload(); }}
          style={{ background: "#1DB954", color: "#000", border: "none", borderRadius: 14, padding: "14px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
        >
          Start New Application
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 30, fontWeight: 700, color: "#fff" }}>Review & Submit</h2>
        <p style={{ color: "#555", marginTop: 6, fontSize: 13 }}>Please review all details carefully before submitting.</p>
      </div>

      {/* ── Personal Information ── */}
      <Card>
        <SectionTitle>👤 Personal Information</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
          <InfoRow label="Full Name" value={`${formData.firstName || ""} ${formData.lastName || ""}`.trim() || "—"} />
          <InfoRow label="Phone"     value={formData.phone ? `+91 ${formData.phone}` : "—"} />
          <InfoRow label="Email"     value={formData.email || "—"} />
          <InfoRow label="PAN"       value={formData.pan   || "—"} accent />
        </div>
      </Card>

      {/* ── Loan Details ── */}
      <Card>
        <SectionTitle>💰 Loan Details</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px 24px" }}>
          <InfoRow label="Loan Type"      value={`${loanIcons[formData.loanType] || ""} ${formData.loanType || "—"}`} />
          <InfoRow label="Loan Amount"    value={formatINR(loanAmount)}   accent />
          <InfoRow label="Monthly EMI"    value={<AnimatedNumber value={emi} prefix="₹" />} accent />
          <InfoRow label="Interest Rate"  value={`${interestRate}% p.a.`} accent />
          <InfoRow label="Total Interest" value={formatINR(totalInterest)} accent />
          <InfoRow label="Total Payment"  value={formatINR(totalPayment)}  accent />
        </div>
      </Card>

      {/* ── Uploaded Documents ── */}
      <Card>
        <SectionTitle>📁 Uploaded Documents</SectionTitle>

        {hasDocuments ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {Object.entries(documentsMeta).map(([id, meta]) => (
              <div key={id} style={{
                background: "#181818",
                border: "1px solid #2a2a2a",
                borderRadius: 14,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
                {/* File type icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "#222", border: "1px solid #2a2a2a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                }}>
                  {getFileIcon(meta.type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Document category label */}
                  <p style={{ color: "#666", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>
                    {meta.label}
                  </p>
                  {/* File name */}
                  <p style={{ color: "#fff", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {meta.name}
                  </p>
                  {/* File size + verified badge */}
                  <p style={{ color: "#1DB954", fontSize: 11, marginTop: 2 }}>
                    ✓ Verified • {formatSize(meta.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: "24px", textAlign: "center",
            border: "1px dashed #2a2a2a", borderRadius: 14,
          }}>
            <p style={{ color: "#f87171", fontSize: 13 }}>
              ⚠ No documents uploaded. Please go back to Step 7.
            </p>
          </div>
        )}
      </Card>

      {/* ── Digital Signature ── */}
      <Card>
        <SectionTitle>✍️ Digital Signature</SectionTitle>

        {signaturePreview ? (
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{
              background: "#fff", borderRadius: 14, padding: "12px 16px",
              border: "1px solid #2a2a2a", display: "inline-block",
            }}>
              <img
                src={signaturePreview}
                alt="Your signature"
                style={{ height: 80, maxWidth: 260, objectFit: "contain", display: "block" }}
              />
            </div>
            <div>
              <p style={{ color: "#1DB954", fontSize: 13, fontWeight: 600 }}>✓ Signature captured</p>
              <p style={{ color: "#555", fontSize: 12, marginTop: 4 }}>
                Your digital signature has been recorded and will be attached to the application.
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            padding: "24px", textAlign: "center",
            border: "1px dashed #2a2a2a", borderRadius: 14,
          }}>
            <p style={{ color: "#f87171", fontSize: 13 }}>
              ⚠ No signature found. Please go back to Step 7 and sign.
            </p>
          </div>
        )}
      </Card>

      {/* ── Consent ── */}
      <Card>
        <SectionTitle>📋 Consent & Declaration</SectionTitle>

        <label style={{
          display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start",
          color: errors.terms ? "#f87171" : "#aaa", cursor: "pointer",
        }}>
          <input type="checkbox" checked={agreeTerms}
            onChange={() => { setAgreeTerms(!agreeTerms); setErrors((e) => ({ ...e, terms: false })); }}
            style={{ marginTop: 2, accentColor: "#1DB954", width: 14, height: 14 }}
          />
          I confirm that all information provided in this application is accurate and complete.
        </label>

        <label style={{
          display: "flex", gap: 12, alignItems: "flex-start",
          color: errors.credit ? "#f87171" : "#aaa", cursor: "pointer",
        }}>
          <input type="checkbox" checked={agreeCreditCheck}
            onChange={() => { setAgreeCreditCheck(!agreeCreditCheck); setErrors((e) => ({ ...e, credit: false })); }}
            style={{ marginTop: 2, accentColor: "#1DB954", width: 14, height: 14 }}
          />
          I authorize the lender to perform a credit verification check on my profile.
        </label>

        {(errors.terms || errors.credit) && (
          <p style={{ color: "#f87171", fontSize: 12, marginTop: 12 }}>
            ⚠ Please accept both declarations to proceed.
          </p>
        )}
      </Card>

      {/* ── Submit ── */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          background: submitting ? "#156f34" : "#1DB954",
          color: "#000", border: "none", borderRadius: 14,
          padding: "16px 28px", fontSize: 15, fontWeight: 700,
          cursor: submitting ? "not-allowed" : "pointer",
          width: "100%", transition: "background 0.2s", letterSpacing: "0.3px",
        }}
      >
        {submitting ? "Processing your application…" : "Submit Application →"}
      </button>

    </div>
  );
}