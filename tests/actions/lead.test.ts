import { describe, it, expect } from 'vitest';
import { leadFormSchema } from '@/lib/validations/lead';

describe('Lead Form Zod Validation', () => {
  it('should validate valid Uzbekistan phone number and reject invalid ones', () => {
    const valid = leadFormSchema.safeParse({
      fullName: 'Sardor Rahimiy',
      phone: '+998901234567',
      modelId: 'model-123',
    });
    expect(valid.success).toBe(true);

    const validFormatted = leadFormSchema.safeParse({
      fullName: 'Islombek Davronov',
      phone: '901234567',
      modelId: 'model-456',
    });
    expect(validFormatted.success).toBe(true);

    const invalid = leadFormSchema.safeParse({
      fullName: 'S',
      phone: '123',
    });
    expect(invalid.success).toBe(false);
  });

  it('should reject empty fullName or missing phone', () => {
    const result = leadFormSchema.safeParse({
      fullName: '',
      phone: '',
    });
    expect(result.success).toBe(false);
  });
});
