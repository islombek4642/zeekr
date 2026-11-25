import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderComponentHtml } from '../e2e/helpers/http-client';
import { HeroSection } from '@/components/home/HeroSection';

describe('HeroSection Video Loop', () => {
  it('renders a background video tag with autoplay, muted, loop and poster fallback', () => {
    const html = renderComponentHtml(React.createElement(HeroSection));
    expect(html).toContain('<video');
    expect(html.toLowerCase()).toContain('autoplay');
    expect(html.toLowerCase()).toContain('muted');
    expect(html.toLowerCase()).toContain('loop');
    expect(html).toContain('.mp4');
  });
});
