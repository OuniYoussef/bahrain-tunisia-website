const unavailableStorage = new Map<string, unknown>();
export function readStored<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') ?? unavailableStorage.get(key) ?? fallback;
  } catch {
    return (unavailableStorage.get(key) as T | undefined) ?? fallback;
  }
}
export function store(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    unavailableStorage.set(key, value);
  }
}
let memoryId: string | undefined;
export function deviceId() {
  const existing = readStored<string | null>('bt.vault.device.v1', null);
  if (
    typeof existing === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(existing)
  )
    return existing;
  memoryId ??= crypto.randomUUID();
  store('bt.vault.device.v1', memoryId);
  return memoryId;
}
