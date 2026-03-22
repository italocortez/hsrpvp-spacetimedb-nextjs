/**
 * Mock for spacetimedb/server used in unit tests.
 *
 * Only mocks what the helper functions actually import.
 * Add more exports here as needed for new unit tests.
 */

export class SenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SenderError';
  }
}

// schema(), table(), t — only needed if unit-testing table definitions
export function schema(...args: any[]) { return {}; }
export function table(...args: any[]) { return {}; }

// Fully recursive proxy — any property access or function call returns another proxy
function deepProxy(): any {
  return new Proxy(() => deepProxy(), {
    get: (_target, _prop) => deepProxy(),
  });
}
export const t = deepProxy();
