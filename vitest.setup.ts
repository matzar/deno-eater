import '@testing-library/dom';
import '@testing-library/jest-dom';
import { beforeAll, vi } from 'vitest';

// Mock fetch globally with proper Promise structure
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeAll(() => {
  // Ensure URL is available globally
  global.URL = global.URL || require('url').URL;

  // Set default mock return value for fetch
  mockFetch.mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({ success: true, documents: [], documentCount: 0 }),
  } as Response);
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Map()),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
}));

// Set environment variables for tests
process.env.MONGODB_URI = 'mongodb://localhost:27017/test-db';
// NODE_ENV is already set by vitest
