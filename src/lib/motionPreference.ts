let paused = false;
const listeners = new Set<() => void>();
export const motionPaused = () => paused;
export function subscribeMotion(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function toggleMotion() {
  paused = !paused;
  listeners.forEach((listener) => listener());
}
