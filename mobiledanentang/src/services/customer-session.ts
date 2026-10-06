import type { NguoiDung } from '@/services/shop-api';

const STORAGE_KEY = 'volleymart.activeCustomerId';

let cachedCustomerId: number | null = readStoredCustomerId();

type WebStorageLike = {
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
  setItem: (key: string, value: string) => void;
};

function getStorage(): WebStorageLike | null {
  const maybeStorage = (globalThis as { localStorage?: WebStorageLike }).localStorage;

  return maybeStorage ?? null;
}

function readStoredCustomerId() {
  const storage = getStorage();
  const storedValue = storage?.getItem(STORAGE_KEY);
  const numericValue = storedValue ? Number(storedValue) : NaN;

  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null;
}

export function getActiveCustomerId() {
  return cachedCustomerId;
}

export function setActiveCustomer(customer: Pick<NguoiDung, 'ma_nguoi_dung'> | number, persist = true) {
  const customerId = typeof customer === 'number' ? customer : customer.ma_nguoi_dung;

  cachedCustomerId = customerId;

  if (persist) {
    getStorage()?.setItem(STORAGE_KEY, String(customerId));
  } else {
    getStorage()?.removeItem(STORAGE_KEY);
  }
}

export function clearActiveCustomer() {
  cachedCustomerId = null;
  getStorage()?.removeItem(STORAGE_KEY);
}
