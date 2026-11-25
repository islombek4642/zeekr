import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'fs';
import path from 'path';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('a', { href, ...props }, children),
}));

import { ModelShowcase } from '@/components/home/ModelShowcase';
import { InStockCarousel } from '@/components/home/InStockCarousel';
import { VehicleCard } from '@/components/inventory/VehicleCard';
import { ReserveModal } from '@/components/inventory/ReserveModal';
import { CarImage } from '@/components/ui/CarImage';

describe('Card Layout CSS Architecture and Image Fallbacks', () => {
  it('ModelShowcase renders uniform card layout classes and model images', () => {
    const html = renderToStaticMarkup(
      React.createElement(ModelShowcase, {
        rate: 12700,
        models: [
          {
            id: 'm1',
            slug: 'zeekr-001',
            name: 'Zeekr 001',
            tagline: 'Shooting Brake',
            basePriceUSD: 45000,
            acceleration0100: 3.8,
            rangeKm: 741,
            batteryKwh: 100,
            mainImage: '/images/cars/zeekr-001/main.jpg',
          },
        ],
      })
    );

    expect(html).toContain('aspect-[16/10]');
    expect(html).toContain('shrink-0');
    expect(html).toContain('h-full');
    expect(html).toContain('mt-auto');
    expect(html).toContain('object-cover');
    expect(html).toContain('/images/cars/zeekr-001/main.jpg');
    expect(html).toContain('/models/zeekr-001');
  });

  it('InStockCarousel renders uniform card CSS and resolves image fallbacks cleanly', () => {
    const html = renderToStaticMarkup(
      React.createElement(InStockCarousel, {
        rate: 12700,
        items: [
          {
            id: 'inv-1',
            vinOrCode: 'VIN-1',
            exteriorColor: 'White',
            interiorColor: 'Black',
            year: 2026,
            status: 'IN_STOCK',
            priceUSD: 48000,
            images: ['/images/cars/zeekr-007/main.jpg'],
            trim: {
              name: 'ME',
              model: { name: 'Zeekr 007', slug: 'zeekr-007' },
            },
          },
          {
            id: 'inv-2',
            vinOrCode: 'VIN-2',
            exteriorColor: 'Black',
            interiorColor: 'Cream',
            year: 2026,
            status: 'IN_STOCK',
            priceUSD: 52000,
            images: [],
            trim: {
              name: 'WE',
              model: { name: 'Zeekr 009', slug: 'zeekr-009' },
            },
          },
          {
            id: 'inv-3',
            vinOrCode: 'VIN-3',
            exteriorColor: 'Grey',
            interiorColor: 'Black',
            year: 2026,
            status: 'IN_STOCK',
            priceUSD: 35000,
            images: [],
            trim: {
              name: 'ME',
              model: { name: 'Zeekr Default', slug: '' },
            },
          },
        ],
      })
    );

    expect(html).toContain('aspect-[16/10]');
    expect(html).toContain('shrink-0');
    expect(html).toContain('h-full');
    expect(html).toContain('mt-auto');
    expect(html).toContain('object-cover');
    expect(html).toContain('/images/cars/zeekr-007/main.jpg');
    expect(html).toContain('/images/cars/zeekr-009/main.jpg');
    expect(html).toContain('/images/cars/zeekr-001/main.jpg');
    expect(html).toContain('/inventory?reserve=inv-1');
  });

  it('VehicleCard renders uniform card CSS and falls back from empty images to model mainImage', () => {
    const html = renderToStaticMarkup(
      React.createElement(VehicleCard, {
        usdRate: 12700,
        onReserve: () => {},
        item: {
          id: 'veh-1',
          vinOrCode: 'ZEEKR-X-01',
          year: 2026,
          status: 'IN_STOCK',
          exteriorColor: 'Mist Grey',
          interiorColor: 'Blue',
          priceUSD: 32000,
          images: [''],
          trim: {
            id: 'trim-1',
            name: 'YOU AWD',
            driveType: 'AWD',
            rangeKm: 512,
            acceleration: 3.7,
            model: {
              id: 'm-x',
              name: 'Zeekr X',
              slug: 'zeekr-x',
              mainImage: '/images/cars/zeekr-x/main.jpg',
            },
          },
        },
      })
    );

    expect(html).toContain('aspect-[16/10]');
    expect(html).toContain('shrink-0');
    expect(html).toContain('h-full');
    expect(html).toContain('mt-auto');
    expect(html).toContain('object-cover');
    expect(html).toContain('/images/cars/zeekr-x/main.jpg');
  });

  it('CarImage renders <img> for valid src and accessible fallback placeholder when src is empty', () => {
    const validHtml = renderToStaticMarkup(
      React.createElement(CarImage, {
        src: '/images/cars/zeekr-001/main.jpg',
        alt: 'Zeekr 001',
      })
    );
    expect(validHtml).toContain('<img');
    expect(validHtml).toContain('/images/cars/zeekr-001/main.jpg');

    const emptyHtml = renderToStaticMarkup(
      React.createElement(CarImage, {
        src: '',
        alt: 'Missing Car',
      })
    );
    expect(emptyHtml).toContain('role="img"');
    expect(emptyHtml).toContain('aria-label="Missing Car"');
    expect(emptyHtml).not.toContain('<img');
  });

  it('ReserveModal prioritizes item.images[0] and falls back to model.mainImage via CarImage', () => {
    const withCustomImg = renderToStaticMarkup(
      React.createElement(ReserveModal, {
        isOpen: true,
        onClose: () => {},
        usdRate: 12700,
        item: {
          id: 'res-1',
          vinOrCode: 'VIN-RES-1',
          year: 2026,
          exteriorColor: 'Black',
          interiorColor: 'Black',
          priceUSD: 49000,
          images: ['/images/cars/zeekr-007/interior.jpg'],
          trim: {
            id: 't1',
            name: 'YOU',
            driveType: 'AWD',
            rangeKm: 616,
            acceleration: 2.8,
            model: {
              id: 'm7',
              name: 'Zeekr 007',
              slug: 'zeekr-007',
              mainImage: '/images/cars/zeekr-007/main.jpg',
            },
          },
        },
      })
    );
    expect(withCustomImg).toContain('role="dialog"');
    expect(withCustomImg).toContain('/images/cars/zeekr-007/interior.jpg');

    const fallbackImg = renderToStaticMarkup(
      React.createElement(ReserveModal, {
        isOpen: true,
        onClose: () => {},
        usdRate: 12700,
        item: {
          id: 'res-2',
          vinOrCode: 'VIN-RES-2',
          year: 2026,
          exteriorColor: 'White',
          interiorColor: 'Cream',
          priceUSD: 49000,
          images: [],
          trim: {
            id: 't1',
            name: 'YOU',
            driveType: 'AWD',
            rangeKm: 616,
            acceleration: 2.8,
            model: {
              id: 'm7',
              name: 'Zeekr 007',
              slug: 'zeekr-007',
              mainImage: '/images/cars/zeekr-007/main.jpg',
            },
          },
        },
      })
    );
    expect(fallbackImg).toContain('/images/cars/zeekr-007/main.jpg');
  });

  it('CarImage resets hasError when src changes and InStockCarousel has no unreachable fallback', () => {
    const carImageSource = fs.readFileSync(
      path.join(process.cwd(), 'src/components/ui/CarImage.tsx'),
      'utf-8'
    );
    expect(carImageSource).toMatch(/useEffect\s*\(/);
    expect(carImageSource).toMatch(/setHasError\s*\(\s*false\s*\)/);
    expect(carImageSource).toMatch(/\[\s*src\s*\]/);

    const carouselSource = fs.readFileSync(
      path.join(process.cwd(), 'src/components/home/InStockCarousel.tsx'),
      'utf-8'
    );
    expect(carouselSource).not.toContain('`/images/cars/${item.trim.model.slug}/main.jpg` ||');
  });
});
