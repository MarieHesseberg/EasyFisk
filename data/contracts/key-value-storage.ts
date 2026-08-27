/** Minste lagringsgrensesnitt som både localStorage og tester kan tilby. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
