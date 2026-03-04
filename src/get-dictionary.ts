import 'server-only';

const dictionaries: { [key: string]: () => Promise<any> } = {
    en: () => import('./dictionaries/en.json').then((module) => module.default),
    'es-ES': () => import('./dictionaries/es-ES.json').then((module) => module.default),
    ca: () => import('./dictionaries/ca.json').then((module) => module.default),
    de: () => import('./dictionaries/de.json').then((module) => module.default),
    ja: () => import('./dictionaries/ja.json').then((module) => module.default),
    'zh-CN': () => import('./dictionaries/zh-CN.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
    if (typeof dictionaries[locale] !== 'function') {
        return dictionaries['en'](); // gracefully fallback to english
    }
    return dictionaries[locale]();
};
