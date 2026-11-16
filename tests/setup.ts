import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Default to reduced motion in jsdom; browser tests exercise live media changes.
vi.stubGlobal(
  'matchMedia',
  vi.fn((query: string) => ({
    matches: query.includes('reduce') && !query.includes('no-preference'),
    media: query,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
);

afterEach(cleanup);
