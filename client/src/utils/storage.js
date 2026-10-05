// Safe wrappers: some embedded browsers (e.g. VS Code's built-in browser,
// private windows) block localStorage and throw. Fall back to memory.
const memory = {};

export const storage = {
  get(key) {
    try { return window.localStorage.getItem(key); } catch { return memory[key] ?? null; }
  },
  set(key, value) {
    try { window.localStorage.setItem(key, value); } catch { memory[key] = value; }
  },
  remove(key) {
    try { window.localStorage.removeItem(key); } catch { delete memory[key]; }
  },
};
