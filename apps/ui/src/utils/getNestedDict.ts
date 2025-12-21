/* eslint-disable @typescript-eslint/no-explicit-any */
export const getNestedDict = (obj: any, path: string): any => {
  console.log(obj, path);
  console.log(path.split('.').reduce((acc, key) => acc?.[key], obj));
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
};

export const getTranslatedError = (key: string, translations: any) => {
  return getNestedDict(translations, key.toUpperCase()) ?? key;
};
