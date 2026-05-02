"use client";

import { useState, useEffect } from "react";
import { translations, Language, TranslationKey } from "./translations";

const STORAGE_KEY = "cutnow_lang";

export function useLanguage() {
  const [lang, setLang] = useState<Language>("de");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved && saved in translations) {
      setLang(saved);
    }
  }, []);

  function changeLang(newLang: Language) {
    setLang(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  }

  function t(key: TranslationKey): string {
    return translations[lang][key];
  }

  return { lang, changeLang, t };
}
