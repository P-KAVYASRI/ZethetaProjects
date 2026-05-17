import { useMemo, useState, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { calculateEMI } from "../../utils/emiCalculator";
import {
  Home, User, ShieldCheck, MapPin, Briefcase, Users, FolderOpen, PenLine,
  BarChart2, ClipboardList, IndianRupee, Car, GraduationCap, Gem,
  Building2, FileText, Image, AlertTriangle, CheckCircle2, PartyPopper,
  Pencil, X, Check,
} from "lucide-react";

/* ─── Signature session-storage key (must match Step7) ─────────────────────── */
const SIG_KEY = "loanSignatureDataUrl";

/* ─── Constants ──────────────────────────────────────────────────────────── */
const interestRates = { home: 8.5, personal: 12, car: 9, education: 10, business: 14, gold: 11 };
const loanIcons     = { home: "🏠", personal: "👤", car: "🚗", education: "🎓", business: "💼", gold: "✨" };
const loanLabels    = { home: "Home Loan", personal: "Personal Loan", car: "Car Loan", education: "Education Loan", business: "Business Loan", gold: "Gold Loan" };

const HIGH_AMOUNT_THRESHOLD = 1000000; // ₹10 Lakhs — mirrors Step6

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatINR(value) {
  if (!value || isNaN(value)) return "—";
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
function val(v) {
  return v && String(v).trim() ? String(v).trim() : "—";
}
function cap(str) {
  if (!str || str === "—") return str;
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, " ");
}
function tenureLabel(months) {
  if (!months) return "—";
  const m = Number(months);
  if (m < 12) return `${m} months`;
  if (m % 12 === 0) return `${m / 12} years`;
  return `${m} months`;
}
function calcAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/* ─── AnimatedNumber ─────────────────────────────────────────────────────── */
function AnimatedNumber({ value, prefix = "", duration = 900 }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    const target = Number(value) || 0;
    const start  = Date.now();
    const tick   = () => {
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

/* ─── UI Atoms ───────────────────────────────────────────────────────────── */
function InfoRow({ label, value, accent, fullWidth }) {
  return (
    <div style={{ gridColumn: fullWidth ? "1 / -1" : undefined }}>
      <p style={{ color: "#555", fontSize: 10, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 600 }}>
        {label}
      </p>
      <p style={{ color: accent ? "#1DB954" : "#e0e0e0", fontSize: 13, fontWeight: 500, wordBreak: "break-word" }}>
        {value || "—"}
      </p>
    </div>
  );
}

function Card({ children, style, accent }) {
  return (
    <div style={{
      background: "#0e0e0e",
      border: `1px solid ${accent ? "#1DB954/30" : "#1e1e1e"}`,
      borderColor: accent ? "rgba(29,185,84,0.25)" : "#1e1e1e",
      borderRadius: 18,
      padding: "22px 24px",
      marginBottom: 14,
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, step, onEdit }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <h3 style={{ color: "#fff", fontSize: 14, fontWeight: 700, letterSpacing: "0.2px", margin: 0 }}>{title}</h3>
      </div>
      <button
        type="button"
        onClick={() => onEdit(step)}
        style={{
          background: "transparent", border: "1px solid #2a2a2a", borderRadius: 8,
          padding: "4px 12px", color: "#1DB954", fontSize: 11, fontWeight: 600,
          cursor: "pointer", letterSpacing: "0.3px", transition: "all 0.15s",
        }}
        onMouseOver={e => { e.target.style.background = "#1DB954"; e.target.style.color = "#000"; }}
        onMouseOut={e =>  { e.target.style.background = "transparent"; e.target.style.color = "#1DB954"; }}
      >
        ✏ Edit
      </button>
    </div>
  );
}

function Grid({ cols = 2, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "14px 20px" }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "#1a1a1a", margin: "16px 0" }} />;
}

/* ─── EMI Visual Bar ─────────────────────────────────────────────────────── */
function EMIBreakdownBar({ principal, interest }) {
  const total = principal + interest;
  const pPct  = total ? Math.round((principal / total) * 100) : 0;
  const iPct  = 100 - pPct;
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", height: 8, marginBottom: 8 }}>
        <div style={{ width: `${pPct}%`, background: "#1DB954", transition: "width 0.8s ease" }} />
        <div style={{ width: `${iPct}%`, background: "#2a5a3a" }} />
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: "#1DB954" }} />
          <span style={{ color: "#aaa", fontSize: 10 }}>Principal {pPct}%</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: "#2a5a3a" }} />
          <span style={{ color: "#aaa", fontSize: 10 }}>Interest {iPct}%</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Step8Review ────────────────────────────────────────────────────────── */
export default function Step8Review({ onGoToStep }) {
  const { watch, reset } = useFormContext();
  const f = watch(); // entire form data — single source of truth

  /* ── FIX: resolve signature from form value OR sessionStorage backup ── */
  const signaturePreview = f.signature || sessionStorage.getItem(SIG_KEY) || null;

  const documentsMeta = f.documentsMeta || {};
  const hasDocuments  = Object.keys(documentsMeta).length > 0;

  const [agreeTerms,       setAgreeTerms]       = useState(false);
  const [agreeCreditCheck, setAgreeCreditCheck] = useState(false);
  const [submitted,        setSubmitted]         = useState(false);
  const [submitting,       setSubmitting]        = useState(false);
  const [consentErrors,    setConsentErrors]     = useState({});

  /* EMI calculations */
  const loanAmount   = Number(f.amount  || 500000);
  const tenureMonths = Number(f.tenure  || 60);
  const interestRate = interestRates[f.loanType] || 10;
  const emi          = useMemo(() => calculateEMI(loanAmount, interestRate, tenureMonths), [loanAmount, interestRate, tenureMonths]);
  const totalPayment  = emi * tenureMonths;
  const totalInterest = totalPayment - loanAmount;

  /* Co-applicant visibility — same logic as Step6 */
  const loanType = f.loanType || "";
  const amount   = Number(f.amount) || 0;
  const isCoRequired = loanType === "home" || loanType === "business" || amount >= HIGH_AMOUNT_THRESHOLD;
  const showCoApplicant = isCoRequired || f.hasCoApplicant || !!f.coName;

  /* Combined income */
  const primaryIncome   = Number(f.monthlySalary) || Number(f.annualTurnover / 12) || 0;
  const coIncome        = Number(f.coIncome) || 0;
  const combinedIncome  = primaryIncome + coIncome;

  const handleEdit = (stepIndex) => {
    if (typeof onGoToStep === "function") onGoToStep(stepIndex);
  };

  const handleSubmit = () => {
    const errs = {};
    if (!agreeTerms)       errs.terms  = true;
    if (!agreeCreditCheck) errs.credit = true;
    if (Object.keys(errs).length > 0) { setConsentErrors(errs); return; }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      try {
        const payload = { ...f };
        delete payload.documents; // File objects are not serialisable
        const existing = JSON.parse(localStorage.getItem("submittedApplications") || "[]");
        existing.push({ ...payload, submittedAt: new Date().toISOString() });
        localStorage.setItem("submittedApplications", JSON.stringify(existing));
      } catch (_) {}
      setSubmitted(true);
    }, 1800);
  };

  /* ── Success Screen ── */
  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
       <div
  style={{
    marginBottom: 20,
    display: "flex",
    justifyContent: "center",
  }}
>
  <PartyPopper
    size={70}
    color="#FFA726"
    strokeWidth={2.5}
  />
</div>
        <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 700, marginBottom: 10 }}>Application Submitted!</h2>
        <p style={{ color: "#666", fontSize: 13, marginBottom: 12 }}>
          Application ID: <span style={{ color: "#1DB954", fontWeight: 600 }}>ZF-{Date.now().toString().slice(-8)}</span>
        </p>
        <p style={{ color: "#555", fontSize: 13, marginBottom: 32 }}>We'll review your application and get back to you within 2–3 business days.</p>
        <button
          onClick={() => {
            reset();
            sessionStorage.removeItem(SIG_KEY);
            localStorage.removeItem("loanApplicationDraft");
            localStorage.removeItem("loanSignature");
            window.location.reload();
          }}
          style={{ background: "#1DB954", color: "#000", border: "none", borderRadius: 12, padding: "13px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
        >
          Start New Application
        </button>
      </div>
    );
  }

  /* ── Review Page ── */
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>

      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Review & Submit</h2>
        <p style={{ color: "#555", fontSize: 13 }}>
          Review all information carefully. Click <span style={{ color: "#1DB954" }}>Edit</span> on any section to go back and update.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════
          1. LOAN SUMMARY
      ═══════════════════════════════════════════════ */}
      <Card accent>
        <SectionHeader icon="💰" title="Loan Summary" step={0} onEdit={handleEdit} />

        <div style={{
          background: "linear-gradient(135deg, #1a2e1e 0%, #0e1e12 100%)",
          border: "1px solid rgba(29,185,84,0.3)", borderRadius: 14,
          padding: "20px 24px", marginBottom: 20,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <p style={{ color: "#666", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>Monthly EMI</p>
            <p style={{ color: "#1DB954", fontSize: 32, fontWeight: 800, letterSpacing: "-0.5px" }}>
              <AnimatedNumber value={emi} prefix="₹" />
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: "#555", fontSize: 11, marginBottom: 4 }}>{loanLabels[f.loanType] || f.loanType || "—"}</p>
            <p style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{formatINR(loanAmount)}</p>
            <p style={{ color: "#555", fontSize: 11, marginTop: 2 }}>for {tenureLabel(tenureMonths)}</p>
          </div>
        </div>

        <Grid cols={3}>
          <InfoRow label="Loan Type"      value={`${loanIcons[f.loanType] || ""} ${loanLabels[f.loanType] || val(f.loanType)}`} />
          <InfoRow label="Interest Rate"  value={`${interestRate}% p.a.`} accent />
          <InfoRow label="Tenure"         value={tenureLabel(tenureMonths)} />
          <InfoRow label="Principal"      value={formatINR(loanAmount)} accent />
          <InfoRow label="Total Interest" value={formatINR(Math.round(totalInterest))} accent />
          <InfoRow label="Total Payment"  value={formatINR(Math.round(totalPayment))} accent />
        </Grid>

        {f.purpose && (
          <>
            <Divider />
            <Grid cols={2}>
              <InfoRow label="Purpose"      value={val(f.purpose)} />
              {f.referral && <InfoRow label="Referral Code" value={val(f.referral)} accent />}
            </Grid>
          </>
        )}

        <EMIBreakdownBar principal={loanAmount} interest={Math.round(totalInterest)} />
      </Card>

      {/* ═══════════════════════════════════════════════
          2. PERSONAL INFORMATION
      ═══════════════════════════════════════════════ */}
      <Card>
        <SectionHeader icon="👤" title="Personal Information" step={1} onEdit={handleEdit} />
        <Grid cols={2}>
          <InfoRow label="Full Name"      value={`${val(f.firstName)} ${f.lastName || ""}`.trim()} />
          <InfoRow label="Date of Birth"  value={val(f.dob)} />
          <InfoRow label="Gender"         value={cap(val(f.gender))} />
          <InfoRow label="Marital Status" value={cap(val(f.maritalStatus))} />
          <InfoRow label="Phone"          value={f.phone ? `+91 ${f.phone}` : "—"} />
          <InfoRow label="Email"          value={val(f.email)} />
        </Grid>
      </Card>

      {/* ═══════════════════════════════════════════════
          3. KYC INFORMATION
      ═══════════════════════════════════════════════ */}
      <Card>
        <SectionHeader icon="🪪" title="KYC Information" step={2} onEdit={handleEdit} />
        <Grid cols={2}>
          <InfoRow label="PAN Number"     value={val(f.pan)} accent />
          <InfoRow label="Aadhaar Number" value={f.aadhaar ? `XXXX XXXX ${String(f.aadhaar).slice(-4)}` : "—"} />
          {f.voterId   && <InfoRow label="Voter ID"        value={val(f.voterId)} />}
          {f.passport  && <InfoRow label="Passport Number" value={val(f.passport)} />}
        </Grid>
      </Card>

      {/* ═══════════════════════════════════════════════
          4. ADDRESS INFORMATION
      ═══════════════════════════════════════════════ */}
      <Card>
        <SectionHeader icon="🏠" title="Address Information" step={3} onEdit={handleEdit} />

        <p style={{ color: "#1DB954", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12, fontWeight: 600 }}>Current Address</p>
        <Grid cols={2}>
          <InfoRow label="Address Line 1" value={val(f.addressLine1)} fullWidth />
          {f.addressLine2 && <InfoRow label="Address Line 2" value={val(f.addressLine2)} fullWidth />}
          <InfoRow label="PIN Code"        value={val(f.pinCode)} />
          <InfoRow label="City"            value={val(f.city)} />
          <InfoRow label="State"           value={val(f.state)} />
          {f.residenceType && <InfoRow label="Residence Type" value={cap(val(f.residenceType))} />}
          {f.yearsAtAddress && <InfoRow label="Years at Address" value={val(f.yearsAtAddress)} />}
        </Grid>

        {f.sameAsCurrent === false && f.permAddressLine1 ? (
          <>
            <Divider />
            <p style={{ color: "#aaa", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12, fontWeight: 600 }}>Permanent Address</p>
            <Grid cols={2}>
              <InfoRow label="Address Line 1" value={val(f.permAddressLine1)} fullWidth />
              {f.permAddressLine2 && <InfoRow label="Address Line 2" value={val(f.permAddressLine2)} fullWidth />}
              <InfoRow label="PIN Code" value={val(f.permPinCode)} />
              <InfoRow label="City"     value={val(f.permCity)} />
              <InfoRow label="State"    value={val(f.permState)} />
            </Grid>
          </>
        ) : (
          <>
            <Divider />
            <p style={{ color: "#444", fontSize: 11 }}>✓ Permanent address same as current address</p>
          </>
        )}
      </Card>

      {/* ═══════════════════════════════════════════════
          5. EMPLOYMENT DETAILS
      ═══════════════════════════════════════════════ */}
      <Card>
        <SectionHeader icon="💼" title="Employment Details" step={4} onEdit={handleEdit} />

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "#1a1a1a", border: "1px solid #2a2a2a",
          borderRadius: 20, padding: "4px 12px", marginBottom: 16,
        }}>
          <span style={{ fontSize: 12 }}>
            {f.employmentType === "salaried" ? "🏦" : f.employmentType === "business" ? "🏢" : "💼"}
          </span>
          <span style={{ color: "#1DB954", fontSize: 11, fontWeight: 600 }}>
            {f.employmentType === "salaried" ? "Salaried"
              : f.employmentType === "business" ? "Business Owner"
              : "Self-Employed"}
          </span>
        </div>

        {f.employmentType === "salaried" && (
          <Grid cols={2}>
            <InfoRow label="Company Name"   value={val(f.companyName)} />
            <InfoRow label="Designation"    value={val(f.designation)} />
            <InfoRow label="Company Type"   value={cap(val(f.companyType))} />
            <InfoRow label="Employed Since" value={val(f.employmentSince)} />
            <InfoRow label="Monthly Salary" value={f.monthlySalary ? formatINR(f.monthlySalary) : "—"} accent />
            <InfoRow label="Salary Mode"    value={cap(val(f.salaryMode))} />
          </Grid>
        )}

        {f.employmentType === "self-employed" && (
          <Grid cols={2}>
            <InfoRow label="Business Name"     value={val(f.businessNameSE || f.businessName)} />
            <InfoRow label="Annual Turnover"   value={f.annualTurnover ? formatINR(f.annualTurnover) : "—"} accent />
            {f.gstNumber && <InfoRow label="GST Number" value={val(f.gstNumber)} />}
            <InfoRow label="In Business Since" value={val(f.businessSinceSE || f.businessSince)} />
          </Grid>
        )}

        {f.employmentType === "business" && (
          <Grid cols={2}>
            <InfoRow label="Company / Firm"    value={val(f.businessName)} />
            <InfoRow label="Business Structure" value={cap(val(f.businessType))} />
            <InfoRow label="GST Number"         value={val(f.gstNumber)} accent />
            <InfoRow label="Established Since"  value={val(f.businessSince)} />
            <InfoRow label="Annual Turnover"    value={f.annualTurnover ? formatINR(f.annualTurnover) : "—"} accent />
          </Grid>
        )}

        {f.existingEMIs && Number(f.existingEMIs) > 0 && (
          <>
            <Divider />
            <InfoRow label="Monthly Existing EMIs" value={formatINR(f.existingEMIs)} />
          </>
        )}
      </Card>

      {/* ═══════════════════════════════════════════════
          6. CO-APPLICANT DETAILS
          Shows when: home/business loan, amount > ₹10L,
          or user voluntarily added one.
      ═══════════════════════════════════════════════ */}
      {showCoApplicant && (
        <Card>
          <SectionHeader icon="👥" title="Co-Applicant Details" step={5} onEdit={handleEdit} />

          {/* Mandatory reason badge */}
          {isCoRequired && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)",
              borderRadius: 20, padding: "3px 10px", marginBottom: 16,
            }}>
              <span style={{ fontSize: 11 }}>⚠</span>
              <span style={{ color: "#fbbf24", fontSize: 11, fontWeight: 600 }}>
                {loanType === "home"     ? "Mandatory — Home Loan"
                  : loanType === "business" ? "Mandatory — Business Loan"
                  : `Mandatory — Loan above ${formatINR(HIGH_AMOUNT_THRESHOLD)}`}
              </span>
            </div>
          )}

          {/* Core details */}
          <Grid cols={2}>
            <InfoRow label="Full Name"     value={val(f.coName)} />
            <InfoRow label="Relationship"  value={val(f.coRelation)} />
            <InfoRow label="Date of Birth" value={val(f.coDob)} />
            <InfoRow
              label="Age"
              value={calcAge(f.coDob) !== null ? `${calcAge(f.coDob)} years` : "—"}
              accent={calcAge(f.coDob) >= 21 && calcAge(f.coDob) <= 70}
            />
            <InfoRow label="Mobile"        value={f.coPhone ? `+91 ${f.coPhone}` : "—"} />
            <InfoRow label="Occupation"    value={cap(val(f.coOccupation))} />
            <InfoRow label="Monthly Income" value={f.coIncome ? formatINR(f.coIncome) : "—"} accent />
            <InfoRow
              label="Address"
              value={f.coSameAddress ? "Same as primary applicant" : "Separate address"}
            />
          </Grid>

          {/* Combined income card */}
          {combinedIncome > 0 && (
            <>
              <Divider />
              <div style={{
                background: "linear-gradient(135deg, #1a2e1e 0%, #0e1e12 100%)",
                border: "1px solid rgba(29,185,84,0.25)",
                borderRadius: 14, padding: "16px 20px",
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16,
              }}>
                <div>
                  <p style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6, fontWeight: 600 }}>Your Income</p>
                  <p style={{ color: "#e0e0e0", fontSize: 15, fontWeight: 700 }}>{formatINR(primaryIncome)}</p>
                  <p style={{ color: "#444", fontSize: 10, marginTop: 2 }}>/ month</p>
                </div>
                <div>
                  <p style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6, fontWeight: 600 }}>Co-Applicant</p>
                  <p style={{ color: "#1DB954", fontSize: 15, fontWeight: 700 }}>{formatINR(coIncome)}</p>
                  <p style={{ color: "#444", fontSize: 10, marginTop: 2 }}>/ month</p>
                </div>
                <div>
                  <p style={{ color: "#555", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6, fontWeight: 600 }}>Combined</p>
                  <p style={{ color: "#1DB954", fontSize: 17, fontWeight: 800 }}>{formatINR(combinedIncome)}</p>
                  <p style={{ color: "#444", fontSize: 10, marginTop: 2 }}>/ month</p>
                </div>
              </div>
              <p style={{ color: "#444", fontSize: 11, marginTop: 10 }}>
                Combined eligibility ≈{" "}
                <span style={{ color: "#1DB954", fontWeight: 600 }}>
                  {formatINR(Math.min(combinedIncome * 60, 20000000))}
                </span>
              </p>
            </>
          )}
        </Card>
      )}

      {/* ═══════════════════════════════════════════════
          7. UPLOADED DOCUMENTS
      ═══════════════════════════════════════════════ */}
      <Card>
        <SectionHeader icon="📁" title="Uploaded Documents" step={6} onEdit={handleEdit} />

        {hasDocuments ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {Object.entries(documentsMeta).map(([id, meta]) => (
              <div key={id} style={{
                background: "#141414", border: "1px solid #1e1e1e",
                borderRadius: 12, padding: "11px 14px",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 9,
                  background: "#1a2e1e", border: "1px solid rgba(29,185,84,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0,
                }}>
                  {getFileIcon(meta.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#555", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3, fontWeight: 600 }}>
                    {meta.label}
                  </p>
                  <p style={{ color: "#ddd", fontSize: 11, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {meta.name}
                  </p>
                  <p style={{ color: "#1DB954", fontSize: 10, marginTop: 2 }}>✓ {formatSize(meta.size)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "20px", textAlign: "center", border: "1px dashed #2a2a2a", borderRadius: 12 }}>
            <p style={{ color: "#f87171", fontSize: 13 }}>⚠ No documents uploaded. Please go back to Step 7.</p>
          </div>
        )}
      </Card>

      {/* ═══════════════════════════════════════════════
          8. DIGITAL SIGNATURE
          FIX: reads from form value OR sessionStorage backup
      ═══════════════════════════════════════════════ */}
      <Card>
        <SectionHeader icon="✍️" title="Digital Signature" step={6} onEdit={handleEdit} />

        {signaturePreview ? (
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            {/* Signature image — dark background matches canvas (white ink) */}
            <div style={{
              background:   "#121212",
              borderRadius: 12,
              padding:      "12px 20px",
              border:       "1px solid #2a2a2a",
              display:      "inline-flex",
              alignItems:   "center",
              justifyContent: "center",
              minWidth:     200,
            }}>
              <img
                src={signaturePreview}
                alt="Digital signature"
                style={{
                  height:     80,
                  maxWidth:   260,
                  objectFit:  "contain",
                  display:    "block",
                }}
              />
            </div>
            <div>
              <p style={{ color: "#1DB954", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>✓ Signature verified</p>
              <p style={{ color: "#555", fontSize: 11, lineHeight: 1.6 }}>
                Your digital signature has been captured<br />
                and will be attached to the application.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ padding: "20px", textAlign: "center", border: "1px dashed #2a2a2a", borderRadius: 12 }}>
            <p style={{ color: "#f87171", fontSize: 13 }}>⚠ No signature found. Please go back to Step 7 and sign.</p>
          </div>
        )}
      </Card>

      {/* ═══════════════════════════════════════════════
          9. EMI CALCULATION DETAIL
      ═══════════════════════════════════════════════ */}
      <Card>
        <SectionHeader icon="📊" title="EMI Calculation" step={0} onEdit={handleEdit} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          {[
            { label: "Loan Amount",    value: formatINR(loanAmount),               accent: false },
            { label: "Interest Rate",  value: `${interestRate}% p.a.`,             accent: true  },
            { label: "Tenure",         value: tenureLabel(tenureMonths),            accent: false },
            { label: "Monthly EMI",    value: <AnimatedNumber value={emi} prefix="₹" />, accent: true },
            { label: "Total Interest", value: formatINR(Math.round(totalInterest)), accent: true  },
            { label: "Total Payable",  value: formatINR(Math.round(totalPayment)),  accent: true  },
          ].map((item, i) => (
            <div key={i} style={{
              background: "#141414", border: "1px solid #1e1e1e",
              borderRadius: 12, padding: "14px 16px",
            }}>
              <p style={{ color: "#555", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6, fontWeight: 600 }}>{item.label}</p>
              <p style={{ color: item.accent ? "#1DB954" : "#e0e0e0", fontSize: 15, fontWeight: 700 }}>{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ═══════════════════════════════════════════════
          10. CONSENT & DECLARATION
      ═══════════════════════════════════════════════ */}
      <Card>
        <SectionHeader icon="📋" title="Consent & Declaration" step={7} onEdit={() => {}} />

        <label style={{
          display: "flex", gap: 12, marginBottom: 16, alignItems: "flex-start",
          color: consentErrors.terms ? "#f87171" : "#999",
          cursor: "pointer", lineHeight: 1.5, fontSize: 13,
        }}>
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={() => { setAgreeTerms(v => !v); setConsentErrors(e => ({ ...e, terms: false })); }}
            style={{ marginTop: 2, accentColor: "#1DB954", width: 15, height: 15, flexShrink: 0 }}
          />
          I confirm that all information provided in this application is accurate, complete, and truthful.
          I understand that any false information may result in rejection of the application.
        </label>

        <label style={{
          display: "flex", gap: 12, alignItems: "flex-start",
          color: consentErrors.credit ? "#f87171" : "#999",
          cursor: "pointer", lineHeight: 1.5, fontSize: 13,
        }}>
          <input
            type="checkbox"
            checked={agreeCreditCheck}
            onChange={() => { setAgreeCreditCheck(v => !v); setConsentErrors(e => ({ ...e, credit: false })); }}
            style={{ marginTop: 2, accentColor: "#1DB954", width: 15, height: 15, flexShrink: 0 }}
          />
          I authorize Zetheta Finance to perform credit verification, fetch my CIBIL score, and access
          my financial information for the purpose of loan processing.
        </label>

        {(consentErrors.terms || consentErrors.credit) && (
          <p style={{ color: "#f87171", fontSize: 12, marginTop: 12 }}>
            ⚠ Please accept both declarations before submitting.
          </p>
        )}
      </Card>

      {/* ═══════════════════════════════════════════════
          11. SUBMIT BUTTON
      ═══════════════════════════════════════════════ */}
      <div style={{ marginTop: 8 }}>
        {(!signaturePreview || !hasDocuments) && (
          <div style={{
            background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 12, padding: "12px 16px", marginBottom: 14, fontSize: 12, color: "#f87171",
          }}>
            {!signaturePreview && <p>⚠ Signature missing — go back to Step 7</p>}
            {!hasDocuments     && <p style={{ marginTop: !signaturePreview ? 4 : 0 }}>⚠ Documents missing — go back to Step 7</p>}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            background: submitting ? "#156f34" : "#1DB954",
            color: "#000", border: "none", borderRadius: 14,
            padding: "17px 28px", fontSize: 15, fontWeight: 800,
            cursor: submitting ? "not-allowed" : "pointer",
            width: "100%", transition: "all 0.2s", letterSpacing: "0.3px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {submitting ? (
            <>
              <span style={{
                width: 16, height: 16, border: "2px solid #000",
                borderTopColor: "transparent", borderRadius: "50%",
                display: "inline-block", animation: "spin 0.8s linear infinite",
              }} />
              Processing your application…
            </>
          ) : (
            "Submit Application →"
          )}
        </button>

        <p style={{ color: "#444", fontSize: 11, textAlign: "center", marginTop: 12 }}>
          By submitting, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}