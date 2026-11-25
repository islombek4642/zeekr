import { describe, it, expect } from 'vitest';
import { carModelFormSchema, inventoryItemFormSchema } from '@/lib/validations/car';

const baseModelPayload = {
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
};

describe('Car Model Admin Validation', () => {
  it('should validate car model specifications', () => {
    const result = carModelFormSchema.safeParse(baseModelPayload);
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

  it('should accept relative asset paths and valid http/https URLs', () => {
    expect(
      carModelFormSchema.safeParse({
        ...baseModelPayload,
        mainImage: '  /images/cars/zeekr-001/main.jpg  ',
        galleryImages: ['/uploads/test.webp', 'https://cdn.example.com/car.jpg'],
      }).success
    ).toBe(true);

    expect(
      inventoryItemFormSchema.safeParse({
        trimId: 'trim-1',
        exteriorColor: 'Polar White',
        interiorColor: 'Black',
        year: 2026,
        status: 'IN_STOCK',
        priceUSD: 48000,
        images: ['/images/cars/zeekr-001/main.jpg'],
      }).success
    ).toBe(true);
  });

  it('should reject unsafe schemes, protocol-relative URLs, path traversal, and whitespace-only paths', () => {
    const badInputs = [
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      '//evil.com/x.jpg',
      '/images/../secret.jpg',
      '   ',
      '/images/cars/bad\\path.jpg',
    ];

    for (const badPath of badInputs) {
      expect(
        carModelFormSchema.safeParse({
          ...baseModelPayload,
          mainImage: badPath,
        }).success,
        `carModelFormSchema should reject ${badPath}`
      ).toBe(false);

      expect(
        inventoryItemFormSchema.safeParse({
          trimId: 'trim-1',
          exteriorColor: 'Polar White',
          interiorColor: 'Black',
          year: 2026,
          status: 'IN_STOCK',
          priceUSD: 48000,
          images: [badPath],
        }).success,
        `inventoryItemFormSchema should reject ${badPath}`
      ).toBe(false);
    }
  });
});
