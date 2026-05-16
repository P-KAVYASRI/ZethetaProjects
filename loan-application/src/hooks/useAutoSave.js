import { useEffect } from "react";

const STORAGE_KEY =
  "loanApplicationDraft";

function useAutoSave(
  formData,
  currentStep
) {

  useEffect(() => {

   if (
  !formData?.loanType &&
  !formData?.firstName &&
  !formData?.phone
) {
  return;
}

    const interval =
      setInterval(() => {

        const saveData = {
          formData,
          currentStep,
          savedAt:
            new Date().toISOString(),
        };

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            saveData
          )
        );

        console.log(
          "Draft Auto Saved"
        );

      }, 30000);

    return () =>
      clearInterval(
        interval
      );

  }, [formData, currentStep]);

}

export default useAutoSave;