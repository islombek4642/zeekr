export interface LoanCalculationParams {
  carPriceUSD: number;
  downPaymentPercent: number; // e.g. 30 for 30%
  termMonths: number; // e.g. 12, 24, 36, 48
  annualInterestRatePercent: number; // e.g. 22 for 22%
}

export interface LoanCalculationResult {
  carPriceUSD: number;
  downPaymentUSD: number;
  loanAmountUSD: number;
  monthlyUSD: number;
  totalRepaymentUSD: number;
  totalInterestUSD: number;
}

export function calculateMonthlyLoanPayment(params: LoanCalculationParams): LoanCalculationResult {
  const { carPriceUSD, downPaymentPercent, termMonths, annualInterestRatePercent } = params;

  const downPaymentUSD = Math.round((carPriceUSD * downPaymentPercent) / 100);
  const loanAmountUSD = carPriceUSD - downPaymentUSD;

  if (loanAmountUSD <= 0) {
    return {
      carPriceUSD,
      downPaymentUSD,
      loanAmountUSD: 0,
      monthlyUSD: 0,
      totalRepaymentUSD: 0,
      totalInterestUSD: 0,
    };
  }

  if (annualInterestRatePercent <= 0) {
    const monthlyUSD = Math.round(loanAmountUSD / termMonths);
    return {
      carPriceUSD,
      downPaymentUSD,
      loanAmountUSD,
      monthlyUSD,
      totalRepaymentUSD: loanAmountUSD,
      totalInterestUSD: 0,
    };
  }

  // Monthly interest rate: r = (annualRate / 100) / 12
  const r = annualInterestRatePercent / 100 / 12;
  const n = termMonths;

  // Annuity formula: P = L * [r * (1 + r)^n] / [(1 + r)^n - 1]
  const numerator = r * Math.pow(1 + r, n);
  const denominator = Math.pow(1 + r, n) - 1;
  const monthlyPayment = loanAmountUSD * (numerator / denominator);

  const monthlyUSD = Math.round(monthlyPayment);
  const totalRepaymentUSD = monthlyUSD * n;
  const totalInterestUSD = totalRepaymentUSD - loanAmountUSD;

  return {
    carPriceUSD,
    downPaymentUSD,
    loanAmountUSD,
    monthlyUSD,
    totalRepaymentUSD,
    totalInterestUSD,
  };
}
