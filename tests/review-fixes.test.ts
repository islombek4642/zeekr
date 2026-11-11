import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizePhoneNumber, leadFormSchema } from '@/lib/validations/lead';
import { escapeHtml, formatLeadTelegramMessage } from '@/lib/telegram';
import { formatCurrencyUSD, formatCurrencyUZS } from '@/lib/utils';
import { calculateMonthlyLoanPayment } from '@/lib/calculator';
import { getAdminSession, requireAdminSession, signToken } from '@/lib/auth';

describe('Review Fixes Verification Suite', () => {
  describe('C2: Phone Normalization', () => {
    it('should normalize various Uzbekistan phone formats to +998XXXXXXXXX', () => {
      expect(normalizePhoneNumber('901234567')).toBe('+998901234567');
      expect(normalizePhoneNumber('998901234567')).toBe('+998901234567');
      expect(normalizePhoneNumber('+998901234567')).toBe('+998901234567');
      expect(normalizePhoneNumber('+998 (90) 123-45-67')).toBe('+998901234567');
      expect(normalizePhoneNumber('90 123 45 67')).toBe('+998901234567');
    });

    it('should validate and normalize in leadFormSchema', () => {
      const parsed = leadFormSchema.safeParse({
        fullName: 'Ali Valiyev',
        phone: '90 123 45 67',
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.phone).toBe('+998901234567');
      }
    });

    it('should reject invalid non-Uzbekistan phone numbers', () => {
      const parsed = leadFormSchema.safeParse({
        fullName: 'John Doe',
        phone: '+14155552671',
      });
      expect(parsed.success).toBe(false);
    });
  });

  describe('I1: Telegram HTML Escaping', () => {
    it('should escape HTML special characters <, >, &', () => {
      expect(escapeHtml('Narxi < $45000 & chegirma > 5%')).toBe(
        'Narxi &lt; $45000 &amp; chegirma &gt; 5%'
      );
    });

    it('should safely format message without unescaped tags in user data', () => {
      const msg = formatLeadTelegramMessage({
        type: 'TEST_DRIVE',
        fullName: 'Test <User>',
        phone: '+998901234567',
        notes: 'Variantlar: A & B < 100',
      });
      expect(msg).toContain('Test &lt;User&gt;');
      expect(msg).toContain('A &amp; B &lt; 100');
    });
  });

  describe('I3: Currency & Calculator NaN / Zero Protection', () => {
    it('should safely format NaN/undefined currency amounts', () => {
      expect(formatCurrencyUZS(NaN, 12850)).toBe("0 so'm");
      expect(formatCurrencyUZS(100, NaN)).toBe("0 so'm");
      expect(formatCurrencyUSD(NaN)).toBe('$0');
    });

    it('should handle invalid or zero loan terms without Infinity or NaN', () => {
      const result = calculateMonthlyLoanPayment({
        carPriceUSD: 50000,
        downPaymentPercent: 20,
        termMonths: 0,
        annualInterestRatePercent: 22,
      });
      expect(result.monthlyUSD).toBe(0);
      expect(Number.isFinite(result.monthlyUSD)).toBe(true);

      const nanResult = calculateMonthlyLoanPayment({
        carPriceUSD: NaN,
        downPaymentPercent: 20,
        termMonths: 24,
        annualInterestRatePercent: 22,
      });
      expect(nanResult.monthlyUSD).toBe(0);
    });
  });

  describe('C1: Admin Session and Auth Guard', () => {
    it('should verify valid admin token and extract session', async () => {
      const token = await signToken({
        userId: 'admin-1',
        email: 'admin@zeekr-auto.uz',
        role: 'ADMIN',
      });

      const session = await getAdminSession(token);
      expect(session).not.toBeNull();
      expect(session?.email).toBe('admin@zeekr-auto.uz');
    });

    it('should reject invalid or expired token', async () => {
      const session = await getAdminSession('fake-token-payload');
      expect(session).toBeNull();
    });
  });
});
