'use client';

import { useCallback, useEffect, useState } from 'react';
import { Tag } from 'schemas';
import { getTags } from '@/requests/getTags';

// Loaded on the client so the list can be refreshed after new tags are saved
export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getTags()
      .then((result) => {
        if (cancelled) return;
        setTags(result);
        setLoadFailed(false);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Failed to load tags', error);
        setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { tags, loadFailed, reload };
};
