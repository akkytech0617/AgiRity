import '@testing-library/jest-dom/vitest';

// Unit tests always use mock data
process.env.VITE_USE_MOCK_DATA = 'true';

// jsdom lacks ResizeObserver, which HeroUI ScrollShadow uses on mount.
if (!('ResizeObserver' in globalThis)) {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    writable: true,
    value: class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    },
  });
}
