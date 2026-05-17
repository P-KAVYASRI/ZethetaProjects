import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { IndianRupee, Zap, ShieldCheck, FileCheck } from "lucide-react";
import useAutoSave from "../../hooks/useAutoSave";

import { step1Schema } from "../../schemas/step1Schema";
import { step2Schema } from "../../schemas/step2Schema";
import { step3Schema } from "../../schemas/step3Schema";
import { step4Schema } from "../../schemas/step4Schema";
import { step5Schema } from "../../schemas/step5Schema";
import { step6Schema } from "../../schemas/step6Schema";

import Step1LoanDetails  from "../steps/Step1LoanType";
import Step2PersonalInfo from "../steps/Step2PersonalInfo";
import Step3KYC          from "../steps/Step3KYC";
import Step4Address      from "../steps/Step4Address";
import Step5Employment   from "../steps/Step5Employment";
import Step6CoApplicant  from "../steps/Step6CoApplicant";
import Step7Documents    from "../steps/Step7Documents";
import Step8Review       from "../steps/Step8Review";

const stepSchemas = [
  step1Schema, step2Schema, step3Schema,
  step4Schema, step5Schema, step6Schema,
];

const stepLabels = [
  "Loan Details", "Personal Info", "KYC",
  "Address", "Employment", "Co-Applicant",
  "Documents", "Review",
];

const DEFAULT_VALUES = {
  // Step 1
  loanType: "", amount: 500000, tenure: "", purpose: "", referral: "",
  // Step 2
  firstName: "", lastName: "", dob: "", gender: "", maritalStatus: "", phone: "", email: "",
  // Step 3
  pan: "", aadhaar: "", voterId: "", passport: "",
  // Step 4
  addressLine1: "", addressLine2: "", pinCode: "", city: "", state: "",
  sameAsCurrent: true,
  permAddressLine1: "", permAddressLine2: "", permPinCode: "", permCity: "", permState: "",
  // Step 5
  employmentType: "salaried", companyName: "", designation: "", companyType: "",
  employmentSince: "", monthlySalary: "", salaryMode: "",
  businessName: "", businessType: "", businessSince: "", annualTurnover: "",
  // Step 6
  hasCoApplicant: false, coName: "", coRelation: "", coPhone: "", coEmployment: "", coIncome: "",
  // Step 7
  documents: {}, documentsMeta: {}, signature: null,
};

function WizardForm() {
  const [currentStep, setCurrentStep] = useState(0);

  const methods = useForm({
    resolver: zodResolver(stepSchemas[currentStep] || step1Schema),
    mode: "onChange",
    shouldUnregister: false,
    defaultValues: DEFAULT_VALUES,
  });

  const totalSteps = stepLabels.length;
  const formValues = methods.watch();
  useAutoSave(formValues, currentStep);

  /* ── Restore draft on mount ── */
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("loanApplicationDraft");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed?.formData) {
          methods.reset({ ...DEFAULT_VALUES, ...parsed.formData, documents: {}, signature: null });
        }
        if (parsed?.currentStep >= 0) setCurrentStep(parsed.currentStep);
      }
      const savedSig = localStorage.getItem("loanSignature");
      if (savedSig) {
        methods.setValue("signature", savedSig, { shouldDirty: true, shouldTouch: true });
      }
    } catch (_) {}
  }, []); // eslint-disable-line

  /* ── Persist signature whenever it changes ── */
  useEffect(() => {
    const sub = methods.watch((values) => {
      if (values.signature) {
        try { localStorage.setItem("loanSignature", values.signature); } catch (_) {}
      }
    });
    return () => sub.unsubscribe();
  }, [methods]);

  const nextStep     = () => { if (currentStep < totalSteps - 1) setCurrentStep(p => p + 1); };
  const prevStep     = () => { if (currentStep > 0) setCurrentStep(p => p - 1); };
  const goToStep     = (index) => { if (index >= 0 && index < totalSteps) setCurrentStep(index); };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <Step1LoanDetails />;
      case 1: return <Step2PersonalInfo />;
      case 2: return <Step3KYC />;
      case 3: return <Step4Address />;
      case 4: return <Step5Employment />;
      case 5: return <Step6CoApplicant />;
      case 6: return <Step7Documents />;
      case 7: return <Step8Review onGoToStep={goToStep} />;
      default: return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen flex items-center justify-center bg-[#121212] p-6">
        <div className="w-full max-w-5xl bg-[#121212] rounded-3xl overflow-hidden border border-[#2a2a2a] shadow-2xl">

          {/* Top Info Bar */}
          <div className="bg-white/[0.04] border border-white/[0.08] border-b-2 border-b-green-500 rounded-2xl p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-xl bg-white/[0.08] border border-white/[0.12] flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-white/80" />
                </div>
                <div>
                  <h3 className="text-white text-base font-medium tracking-tight">Zetheta Finance</h3>
                  <p className="text-white/45 text-[13px] mt-0.5">AI-powered digital lending experience</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <div className="flex items-center gap-2 bg-white/[0.06] border border-white/10 px-3.5 py-2 rounded-lg">
                  <Zap className="w-[15px] h-[15px] text-amber-400 shrink-0" />
                  <span className="text-white text-[13px] font-medium whitespace-nowrap">Instant Eligibility</span>
                </div>
                <div className="flex items-center gap-2 bg-white/[0.06] border border-white/10 px-3.5 py-2 rounded-lg">
                  <ShieldCheck className="w-[15px] h-[15px] text-green-400 shrink-0" />
                  <span className="text-white text-[13px] font-medium whitespace-nowrap">Bank-grade Security</span>
                </div>
                <div className="flex items-center gap-2 bg-white/[0.06] border border-white/10 px-3.5 py-2 rounded-lg">
                  <FileCheck className="w-[15px] h-[15px] text-blue-400 shrink-0" />
                  <span className="text-white text-[13px] font-medium whitespace-nowrap">100% Paperless</span>
                </div>
              </div>
            </div>
          </div>

          {/* Green Header */}
          <div className="p-8" style={{ background: "linear-gradient(180deg, #1DB954 0%, #158a3e 100%)" }}>
            <h1 className="text-4xl font-bold text-white">Loan Application</h1>
            <p className="mt-2 text-sm text-white/80">Complete your application in simple steps</p>
            <div className="mt-8">
              <div className="w-full bg-white/25 rounded-full h-1.5">
                <div
                  className="bg-white h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-3 flex-wrap gap-2">
                {stepLabels.map((label, index) => (
                  <span key={index} className={`text-xs font-semibold ${index === currentStep ? "text-white" : "text-white/40"}`}>
                    | {label} |
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-[#121212] p-8 min-h-[350px] relative z-0">
            <p className="text-[#1DB954] text-xs font-semibold uppercase tracking-[3px] mb-6">
              Step {currentStep + 1} of {totalSteps} — | {stepLabels[currentStep]} |
            </p>
            {renderStep()}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-8 bg-[#1e1e1e] border-t border-[#2a2a2a] relative z-50">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-6 py-3 rounded-full text-sm font-semibold border transition-all duration-300
                ${currentStep === 0
                  ? "border-[#2a2a2a] text-[#3a3a3a] cursor-not-allowed"
                  : "border-[#3a3a3a] text-[#b3b3b3] hover:border-[#b3b3b3] hover:text-white"
                }`}
            >
              Previous
            </button>

            <span className="text-xs text-[#b3b3b3]">
              Step <span className="text-[#1DB954] font-semibold">{currentStep + 1}</span> of {totalSteps}
            </span>

            <button
              type="button"
              onClick={nextStep}
              className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-6 py-3 rounded-full text-sm font-semibold cursor-pointer relative z-50"
            >
              Next Step →
            </button>
          </div>

        </div>
      </div>
    </FormProvider>
  );
}

export default WizardForm;