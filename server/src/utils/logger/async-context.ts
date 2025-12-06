import { AsyncLocalStorage } from 'async_hooks';

const asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

export const AsyncContext = {
  run: <T>(callback: () => T) => asyncLocalStorage.run(new Map(), callback),
  set: (key: string, value: any) => {
    const store = asyncLocalStorage.getStore();
    if (store) {
      store.set(key, value);
    }
  },
  get: (key: string) => {
    const store = asyncLocalStorage.getStore();
    return store ? store.get(key) : null;
  },
};
