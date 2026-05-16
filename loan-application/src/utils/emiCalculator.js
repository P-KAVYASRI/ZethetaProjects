export const calculateEMI = (
  principal,
  annualRate,
  months
) => {

  const monthlyRate =
    annualRate / 12 / 100;

  const emi =
    (principal *
      monthlyRate *
      Math.pow(
        1 + monthlyRate,
        months
      )) /
    (Math.pow(
      1 + monthlyRate,
      months
    ) - 1);

  return isFinite(emi)
    ? Math.round(emi)
    : 0;
};