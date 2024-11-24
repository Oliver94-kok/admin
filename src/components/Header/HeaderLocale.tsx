import React, { useState } from "react";
import { getLocale, setLocale } from "@/locales/dictionary"; // Assuming these are correctly defined
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLanguage } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import ClickOutside from "@/components/ClickOutside"; // Assuming you have a ClickOutside component

const HeaderLocale = ({ currentLocale }: { currentLocale: string }) => {
  const [locale, setLocaleState] = useState(currentLocale);
  const [dropdownOpen, setDropdownOpen] = useState(false); // Dropdown visibility state

  const handleLanguageChange = (newLocale: "en" | "zh") => {
    setLocaleState(newLocale);
    setLocale(newLocale); // Assuming setLocale properly updates your locale globally
    setDropdownOpen(false); // Close the dropdown after changing the language
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      {/* Language Dropdown Button */}
      <Link
        onClick={(e) => {
          e.preventDefault();
          setDropdownOpen(!dropdownOpen); // Toggle dropdown visibility
        }}
        className="relative flex h-12 w-12 items-center justify-center rounded-full border border-stroke bg-gray-2 text-dark hover:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:hover:text-white"
        href="#"
      >
        <FontAwesomeIcon
          icon={faLanguage}
          size="lg"
          className="relative"
        />
      </Link>

      {/* Language Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-7.5 p-3 flex w-[160px] flex-col rounded-lg border-[0.5px] border-stroke bg-white shadow-default dark:border-dark-3 dark:bg-gray-dark">
          <div
            onClick={() => handleLanguageChange("en")}
            className={`px-4 py-2 flex items-center p-5 gap-2.5 text-sm font-medium text-dark-4 hover:bg-gray-200 cursor-pointer rounded-lg ${locale === 'en' ? 'bg-light' : ''}`}
          >
            English
          </div>

          <div
            onClick={() => handleLanguageChange("zh")}
            className={`px-4 py-2 flex items-center p-5 gap-2.5 text-sm font-medium text-dark-4 hover:bg-gray-200 cursor-pointer rounded-lg ${locale === 'zh' ? 'bg-light' : ''}`}
          >
            简体中文
          </div>
        </div>
      )}
    </ClickOutside>
  );
};

export default HeaderLocale;
