"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import DarkModeSwitcher from "./DarkModeSwitcher";
import DropdownNotification from "./DropdownNotification";
import DropdownUser from "./DropdownUser";
import Image from "next/image";
import SearchForm from "@/components/Header/SearchForm";
import AddUserButton from "../Buttons/adduserButton";
import HeaderLocale from "./HeaderLocale";
import { getDictionary, getLocale } from "@/locales/dictionary"; // Ensure this function is designed to take locale and return the correct dictionary

const Header = (props: {
  sidebarOpen: string | boolean | undefined;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const [locale, setLocale] = useState<string | null>(null); // Track the locale state
  const [dict, setDict] = useState<Record<string, any>>(getDictionary()); // Initialize with default language

  // Fetch the locale when the component mounts
  useEffect(() => {
    const currentLocale = getLocale(); // Fetch the current locale
    const currentDict = getDictionary(); // Call getDictionary without arguments
    setLocale(currentLocale); // Update the locale state
    setDict(currentDict); // Update the dictionary state

  }, []);

  if (locale === null) {
    return <div>Loading...</div>;  // Optional loading state
  }

  return (
    <header className="sticky z-20 top-0 flex w-full border-b border-stroke bg-white dark:border-stroke-dark dark:bg-gray-dark">
      <div className="flex flex-grow items-center justify-between px-4 py-5 shadow-2 md:px-5 2xl:px-10">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* Hamburger Toggle BTN */}
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="relative block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-dark-3 dark:bg-dark-2 lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-dark delay-[0] duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && "!w-full delay-300"
                    }`}></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-dark delay-150 duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && "delay-400 !w-full"
                    }`}></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-dark delay-200 duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && "!w-full delay-500"
                    }`}></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-dark delay-300 duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && "!h-0 !delay-[0]"}`}></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-dark duration-200 ease-in-out dark:bg-white ${!props.sidebarOpen && "!h-0 !delay-200"
                    }`}></span>
              </span>
            </span>
          </button>
          {/* Hamburger Toggle BTN */}

          <Image width={32} height={32} src={"/images/logo/icon.png"} alt="Logo" />
        </div>

        <div className="hidden xl:block">
        </div>

        <div className="flex items-center justify-normal gap-2 2xsm:gap-4 lg:w-full lg:justify-between xl:w-auto xl:justify-normal">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            {/* Dark Mode Toggle */}
            <DarkModeSwitcher />
            {/* Notification Menu Area */}
            <DropdownNotification />
            {/* Language Selector */}
            <HeaderLocale currentLocale={locale} />
          </ul>
          {/* User Area */}
          <DropdownUser />
        </div>
      </div>
    </header>
  );
};

export default Header;
