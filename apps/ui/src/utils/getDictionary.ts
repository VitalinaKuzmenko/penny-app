import 'server-only';

const dictionaries = {
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  // ru: () => import('../dictionaries/ru.json').then((module) => module.default),
  // ua: () => import('../dictionaries/ua.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
  const loader =
    locale in dictionaries
      ? dictionaries[locale as keyof typeof dictionaries]
      : dictionaries.en;

  return loader();
};
