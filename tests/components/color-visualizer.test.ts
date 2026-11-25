import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderComponentHtml } from '../e2e/helpers/http-client';
import { ColorVisualizer } from '@/components/models/ColorVisualizer';

describe('ColorVisualizer Dual Mode', () => {
  const sampleColors = [
    {
      id: 'c1',
      modelSlug: 'zeekr-001',
      name: 'Polar White',
      hexCode: '#FFFFFF',
      imageUrl: '/images/cars/zeekr-001/colors/white.jpg',
      isInterior: false,
    },
    {
      id: 'c2',
      modelSlug: 'zeekr-001',
      name: 'Dark & Green Nappa',
      hexCode: '#24292B',
      imageUrl: '/images/cars/zeekr-001/interior.webp',
      isInterior: true,
    },
  ];

  it('renders both exterior and interior tabs and color swatches', () => {
    const html = renderComponentHtml(
      React.createElement(ColorVisualizer, {
        colors: sampleColors as any,
        modelName: 'Zeekr 001',
        mainImage: '/images/cars/zeekr-001/main.jpg',
      })
    );
    expect(html).toContain('Eksteryer');
    expect(html).toContain('Interyer');
    expect(html).toContain('Polar White');
  });

  it('contains aspect-[16/9] and object-contain to preserve vehicle graphics without distortion', () => {
    const html = renderComponentHtml(
      React.createElement(ColorVisualizer, {
        colors: sampleColors as any,
        modelName: 'Zeekr 001',
        mainImage: '/images/cars/zeekr-001/main.jpg',
      })
    );
    expect(html).toContain('aspect-[16/9]');
    expect(html).toContain('object-contain');
  });
});
