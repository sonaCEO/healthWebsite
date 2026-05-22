// import '@testing-library/jest-dom'

// src/setupTests.ts
import { vi } from 'vitest';

// Мок для IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  root = null;
  rootMargin = '';
  thresholds = [];
  takeRecords = vi.fn();
}

window.IntersectionObserver = MockIntersectionObserver as any;