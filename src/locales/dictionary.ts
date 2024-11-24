'use client'

// Import the necessary dictionaries
import { defaultLocale } from '@/locales/config'

const dictionaries = {
  en: () => import('./en/lang.json').then((module) => module.default),
  zh: () => import('./zh/lang.json').then((module) => module.default),
}

type Locale = keyof typeof dictionaries

// Function to get all available locales
export const getLocales = () => Object.keys(dictionaries) as Array<Locale>

// Function to get the current locale (using localStorage)
export const getLocale = (): Locale => {
  // Check if the locale is stored in localStorage
  const localeLocalStorage = typeof window !== "undefined" ? localStorage.getItem('locale') : null

  // Use the stored locale from localStorage or fall back to the default locale
  const locale = localeLocalStorage ?? defaultLocale

  // Check if the stored locale is valid, otherwise return the default locale
  if (!getLocales().includes(locale as Locale)) {
    return defaultLocale
  }

  return locale as Locale
}

// Function to load the dictionary based on the current locale
export const getDictionary = async () => {
  const locale = getLocale()
  return dictionaries[locale]()
}

// Function to change the locale and store it in localStorage
export const setLocale = (locale: Locale) => {
  if (getLocales().includes(locale)) {
    // Update localStorage with the new locale
    localStorage.setItem('locale', locale)
    // Optionally trigger a page reload or state update in your app
    window.location.reload()  // Forces a re-render of the app to reflect the new locale
  }
}
