import { useState } from "react";

import Step1LoanDetails from "../steps/Step1LoanType";
import Step2PersonalInfo from "../steps/Step2PersonalInfo";
import Step3KYC from "../steps/Step3KYC";
import Step4Address from "../steps/Step4Address";
import Step5Employment from "../steps/Step5Employment";
import Step6CoApplicant from "../steps/Step6CoApplicant";
import Step7Documents from "../steps/Step7Documents";
import Step8Review from "../steps/Step8Review";

const stepLabels = [
  "Loan Details",
  "Personal Info",
  "KYC",
  "Address",
  "Employment",
  "Co-Applicant",
  "Documents",
  "Review",
];

function WizardForm() {
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({});

  const totalSteps = stepLabels.length;

  const handleDataChange = (stepData) => {
    setFormData((prev) => ({
      ...prev,
      ...stepData,
    }));
  };

  const nextStep = () => {
    console.log("NEXT CLICKED");

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1LoanDetails
            onDataChange={handleDataChange}
          />
        );

      case 1:
        return (
          <Step2PersonalInfo
            onDataChange={handleDataChange}
          />
        );

      case 2:
        return (
          <Step3KYC
            onDataChange={handleDataChange}
          />
        );

      case 3:
        return (
          <Step4Address
            onDataChange={handleDataChange}
          />
        );

      case 4:
        return (
          <Step5Employment
            onDataChange={handleDataChange}
          />
        );

      case 5:
        return (
          <Step6CoApplicant
            onDataChange={handleDataChange}
          />
        );

      case 6:
        return (
          <Step7Documents
            onDataChange={handleDataChange}
          />
        );

      case 7:
        return (
          <Step8Review
            formData={formData}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-6">

      <div className="w-full max-w-5xl bg-[#121212] rounded-3xl overflow-hidden border border-[#2a2a2a] shadow-2xl">

        {/* Navbar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#2a2a2a] bg-[#181818]">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-2xl bg-[#1DB954] flex items-center justify-center text-black font-bold text-xl">
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

        </div>

        {/* Header */}
        <div
          className="p-8"
          style={{
            background:
              "linear-gradient(180deg, #1DB954 0%, #158a3e 100%)",
          }}
        >

          <h1 className="text-4xl font-bold text-white">
            Loan Application
          </h1>

          <p className="mt-2 text-sm text-white/80">
            Complete your application in simple steps
          </p>

          {/* Progress */}
          <div className="mt-8">

            <div className="w-full bg-white/25 rounded-full h-1.5">

              <div
                className="bg-white h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    ((currentStep + 1) /
                      totalSteps) *
                    100
                  }%`,
                }}
              />

            </div>

            <div className="flex justify-between mt-3">

              {stepLabels.map(
                (label, index) => (
                  <span
                    key={index}
                    className={`text-xs font-semibold
                    ${
                      index === currentStep
                        ? "text-white"
                        : "text-white/40"
                    }`}
                  >
                    {label}
                  </span>
                )
              )}

            </div>

          </div>

        </div>

        {/* Content */}
       <div className="bg-[#121212] p-8 min-h-[350px] relative z-0">

          <p className="text-[#1DB954] text-xs font-semibold uppercase tracking-[3px] mb-6">

            Step {currentStep + 1} of{" "}
            {totalSteps} —{" "}
            {stepLabels[currentStep]}

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
    of {totalSteps}
  </span>

  <button
    type="button"
    onClick={() => {
      console.log("BUTTON CLICKED");
      nextStep();
    }}
    className="bg-[#1DB954] hover:bg-[#1ed760] text-black px-6 py-3 rounded-full text-sm font-semibold cursor-pointer relative z-50"
  >
    Next Step →
  </button>

</div>

      </div>

    </div>
  );
}

export default WizardForm;