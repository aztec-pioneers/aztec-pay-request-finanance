const identity = (s: string) => s;
export const isColorSupported = false;
export const createColors = () => new Proxy({}, { get: () => identity });
export default { isColorSupported, createColors };
