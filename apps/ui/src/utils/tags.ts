import { Tag, TagRef } from 'schemas';

// A tag as the UI holds it: saved tags have an id, new ones only a name until they're saved
export interface TagValue {
  id?: string;
  name: string;
  color?: string | null;
}

export const sameTagName = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

export const tagKey = (tag: TagValue) =>
  tag.id ?? `new:${tag.name.trim().toLowerCase()}`;

export const toTagRef = (tag: TagValue): TagRef =>
  tag.id ? { id: tag.id } : { name: tag.name.trim() };

export const sameTagSet = (a: TagValue[], b: TagValue[]) => {
  const keys = new Set(a.map(tagKey));
  return a.length === b.length && b.every((t) => keys.has(tagKey(t)));
};

const byName = (a: TagValue, b: TagValue) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

// Saved tags plus names that are only pending so far, so they can be reused before Save
export const tagOptions = (saved: Tag[], pending: TagValue[]): TagValue[] => {
  const options: TagValue[] = [...saved];
  for (const tag of pending) {
    if (!tag.id && !options.some((o) => sameTagName(o.name, tag.name))) {
      options.push({ name: tag.name.trim() });
    }
  }
  return options.sort(byName);
};

export const addTags = (current: TagValue[], toAdd: TagValue[]) => [
  ...current,
  ...toAdd.filter((t) => !current.some((c) => sameTagName(c.name, t.name))),
];

export const removeTags = (current: TagValue[], toRemove: TagValue[]) =>
  current.filter((c) => !toRemove.some((t) => sameTagName(c.name, t.name)));
