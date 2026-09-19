import type { KeyValueStorage } from "../contracts/key-value-storage";

// Access can throw even before getItem (private/blocked storage). Defer it to the operation.
export const browserStorage: KeyValueStorage = {
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
};
