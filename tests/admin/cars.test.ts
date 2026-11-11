import { describe, it, expect } from 'vitest';
import { carModelFormSchema } from '@/lib/validations/car';

describe('Car Model Admin Validation', () => {
  it('should validate car model specifications', () => {
    const result = carModelFormSchema.safeParse({
      name: 'Zeekr 001',
      slug: 'zeekr-001',
      tagline: 'Shooting brake',
      basePriceUSD: 45000,
      rangeKm: 741,
      acceleration0100: 3.8,
      batteryKwh: 100,
      powerHp: 544,
      topSpeedKmH: 200,
      chargingTimeMin: 15,
      mainImage: '/images/cars/001-main.jpg',
      description: 'Elektr flagman',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid or missing required numeric values', () => {
    const result = carModelFormSchema.safeParse({
      name: 'Zeekr 001',
      slug: 'zeekr-001',
      basePriceUSD: -100,
    });
    expect(result.success).toBe(false);
  });
});

