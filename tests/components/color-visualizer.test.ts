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

  it('renders authentic exterior and interior colors for all 10 official models without graphic distortion', () => {
    const fs = require('fs');
    const path = require('path');
    const models = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'models.json'), 'utf-8'));
    const colors = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'colors.json'), 'utf-8'));

    expect(models.length).toBe(10);
    for (const m of models) {
      const modelColors = colors.filter((c: any) => c.modelSlug === m.slug);
      expect(modelColors.length, `${m.slug} must have colors`).toBeGreaterThanOrEqual(1);

      const html = renderComponentHtml(
        React.createElement(ColorVisualizer, {
          colors: modelColors,
          modelName: m.name,
          mainImage: m.mainImage,
        })
      );
      expect(html).toContain('Interaktiv Visualizator');
      expect(html).toContain('aspect-[16/9]');
      expect(html).toContain('object-contain');
      expect(html).toContain(m.name);
    }
  });
});
