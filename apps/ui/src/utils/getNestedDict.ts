/* eslint-disable @typescript-eslint/no-explicit-any */
export const getNestedDict = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
};

export const getTranslatedError = (key: string, translations: any) => {
  return getNestedDict(translations, key.toUpperCase()) ?? key;
};
