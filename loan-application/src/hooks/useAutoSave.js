import { useEffect } from "react";

const STORAGE_KEY = "loanApplicationDraft";

function useAutoSave(formData, currentStep) {
  useEffect(() => {
    // Don't save if form is completely empty
    if (!formData?.loanType && !formData?.firstName && !formData?.phone) return;

    const interval = setInterval(() => {
      try {
        // IMPORTANT: exclude signature and documents from the main draft JSON
        // - signature is a large data URL — stored separately under "loanSignature"
        // - documents are File objects — not serialisable at all
        const { signature, documents, ...serializableData } = formData;

        const saveData = {
          formData: serializableData,
          currentStep,
          savedAt: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
        console.log("Draft auto-saved");
      } catch (err) {
        console.warn("Auto-save failed:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, currentStep]);
}

export default useAutoSave;