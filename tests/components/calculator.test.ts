import { describe, it, expect } from 'vitest';
import { calculateMonthlyLoanPayment } from '@/lib/calculator';

describe('Auto Loan / Leasing Calculator', () => {
  it('should calculate monthly payment with standard annuity formula', () => {
    // Car price: $50,000; Down payment: 30% ($15,000); Loan: $35,000; 36 months; APR 22%
    const payment = calculateMonthlyLoanPayment({
      carPriceUSD: 50000,
      downPaymentPercent: 30,
      termMonths: 36,
      annualInterestRatePercent: 22,
    });

    // Loan amount: 35,000
    // Monthly rate = 0.22 / 12 = 0.018333...
    // Annuity factor = (r * (1+r)^n) / ((1+r)^n - 1)
    // Monthly payment is approx $1,337
    expect(payment.monthlyUSD).toBeGreaterThan(1300);
    expect(payment.monthlyUSD).toBeLessThan(1400);
    expect(payment.loanAmountUSD).toBe(35000);
    expect(payment.downPaymentUSD).toBe(15000);
  });

  it('should handle zero down payment or zero interest rate gracefully', () => {
    const zeroInterest = calculateMonthlyLoanPayment({
      carPriceUSD: 36000,
      downPaymentPercent: 0,
      termMonths: 36,
      annualInterestRatePercent: 0,
    });
    expect(zeroInterest.monthlyUSD).toBe(1000);
  });
});

