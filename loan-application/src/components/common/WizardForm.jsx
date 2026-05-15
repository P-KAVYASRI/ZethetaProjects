import { useState } from "react";

import Step1LoanType from "../steps/Step1LoanType";
import Step2PersonalInfo from "../steps/Step2PersonalInfo";
import Step3KYC from "../steps/Step3KYC";
import Step4Address from "../steps/Step4Address";
import Step5Employment from "../steps/Step5Employment";
import Step6CoApplicant from "../steps/Step6CoApplicant";
import Step7Documents from "../steps/Step7Documents";
import Step8Review from "../steps/Step8Review";

function WizardForm() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    <Step1LoanType />,
    <Step2PersonalInfo />,
    <Step3KYC />,
    <Step4Address />,
    <Step5Employment />,
    <Step6CoApplicant />,
    <Step7Documents />,
    <Step8Review />,
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-6">

      <div className="w-full max-w-5xl bg-[#121212] rounded-3xl overflow-hidden border border-[#2a2a2a] shadow-2xl">

        {/* Top Navbar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#2a2a2a] bg-[#181818]">

          {/* Logo */}
          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-2xl bg-[#1DB954] flex items-center justify-center text-black font-bold text-xl shadow-lg shadow-[#1DB954]/30">
              ₹
            </div>

            <div>
              <h2 className="text-white font-semibold text-lg">
                Zetheta Finance
              </h2>

              <p className="text-[#7a7a7a] text-xs">
                Secure Digital Loan Platform
              </p>
            </div>

          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">

            <div className="hidden md:flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/20 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse"></span>

              <span className="text-[#1DB954] text-xs font-medium">
                100% Secure
              </span>
            </div>

            <button className="bg-[#282828] hover:bg-[#323232] transition-all duration-300 text-white text-sm px-4 py-2 rounded-xl border border-[#3a3a3a]">
              Help
            </button>

          </div>

        </div>

        {/* Header */}
        <div
          className="p-8"
          style={{
            background: "linear-gradient(180deg, #1DB954 0%, #158a3e 100%)",
          }}
        >
          <h1 className="text-4xl font-bold text-white">
            Loan Application
          </h1>

          <p className="mt-2 text-sm text-white/80">
            Complete your application in simple steps
          </p>

          {/* Progress Bar */}
          <div className="mt-8">

            <div className="w-full bg-white/25 rounded-full h-1.5">
              <div
                className="bg-white h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              ></div>
            </div>

            {/* Step Labels */}
            <div className="flex justify-between mt-3">
              {steps.map((_, index) => (
                <span
                  key={index}
                  className={`text-xs font-semibold transition-all duration-300 ${
                    index === currentStep
                      ? "text-white"
                      : "text-white/50"
                  }`}
                >
                  Step {index + 1}
                </span>
              ))}
            </div>

          </div>
        </div>

        {/* Step Content */}
        <div className="bg-[#121212] p-8 min-h-[350px]">

          <p className="text-[#1DB954] text-xs font-semibold uppercase tracking-[3px] mb-6">
            Step {currentStep + 1} of {steps.length}
          </p>

          {steps[currentStep]}

        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-8 bg-[#1e1e1e] border-t border-[#2a2a2a]">

          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-full text-sm font-semibold border transition-all duration-300
              ${
                currentStep === 0
                  ? "border-[#2a2a2a] text-[#3a3a3a] cursor-not-allowed"
                  : "border-[#3a3a3a] text-[#b3b3b3] hover:border-[#b3b3b3] hover:text-white"
              }`}
          >
            Previous
          </button>

          <span className="text-xs text-[#b3b3b3]">
            Step{" "}
            <span className="text-[#1DB954] font-semibold">
              {currentStep + 1}
            </span>{" "}
            of {steps.length}
          </span>

          <button
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
            className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300
              ${
                currentStep === steps.length - 1
                  ? "bg-[#1DB954]/30 text-black/40 cursor-not-allowed"
                  : "bg-[#1DB954] hover:bg-[#1ed760] text-black"
              }`}
          >
            Next Step →
          </button>

        </div>

      </div>

    </div>
  );
}

export default WizardForm;