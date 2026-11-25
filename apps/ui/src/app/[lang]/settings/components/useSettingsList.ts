'use client';

import { useCallback, useEffect, useState } from 'react';

// Loads one Settings list on the client and reloads it after each change
export const useSettingsList = <T>(load: () => Promise<T[]>) => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    load()
      .then((result) => {
        if (cancelled) return;
        setItems(result);
        setLoadFailed(false);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Failed to load settings list', error);
        setLoadFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { items, loading, loadFailed, reload };
};
