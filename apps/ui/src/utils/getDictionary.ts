import 'server-only';
import { LanguageType } from './interfaces';

const dictionaries = {
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  ru: () => import('../dictionaries/ru.json').then((module) => module.default),
  ua: () => import('../dictionaries/ua.json').then((module) => module.default),
};

export const getDictionary = async (locale: LanguageType) => dictionaries[locale]();
