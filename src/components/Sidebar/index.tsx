"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useSession } from "next-auth/react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const dictionaries = {
  en: () => import("../../locales/en/lang.json").then((module) => module.default),
  zh: () => import("../../locales/zh/lang.json").then((module) => module.default),
};

const getLocale = (): "en" | "zh" => {
  // Get the locale from localStorage, default to 'en' if null
  const locale = typeof window !== "undefined" ? localStorage.getItem("locale") : null;
  return locale === "en" || locale === "zh" ? locale : "en"; // Ensure it's either 'en' or 'zh'
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const [pageName, setPageName] = useLocalStorage("selectedMenu", "dashboard");
  const session = useSession();
  const [dict, setDict] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 监听 sidebar-close 事件（移动端点击后收起）
  useEffect(() => {
    const handleClose = () => setSidebarOpen(false);
    window.addEventListener("sidebar-close", handleClose);
    return () => window.removeEventListener("sidebar-close", handleClose);
  }, [setSidebarOpen]);

  // 根据路径自动展开对应菜单
  useEffect(() => {
    if (pathname.includes("usersetting")) {
      setPageName("usersetting");
    } else if (pathname.includes("dashboard")) {
      setPageName("dashboard");
    } else {
      setPageName("");
    }
  }, [pathname, setPageName]);
  // Load dictionary based on locale
  useEffect(() => {
    const locale = getLocale(); // Get the valid locale
    dictionaries[locale]().then((languageDict) => {
      setDict(languageDict); // Set the dictionary in the state
    });
  }, []);

  if (!dict) return <div>Loading...</div>; // Show a loading state until the dictionary is loaded

  const menuGroups = [
    {
      name: dict.title.mainmenu, // Use translated string here
      menuItems: [
        {
          icon: (
            <svg
              className="text- fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.00009 17.2498C8.58588 17.2498 8.25009 17.5856 8.25009 17.9998C8.25009 18.414 8.58588 18.7498 9.00009 18.7498H15.0001C15.4143 18.7498 15.7501 18.414 15.7501 17.9998C15.7501 17.5856 15.4143 17.2498 15.0001 17.2498H9.00009Z"
                fill=""
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 1.25C11.2749 1.25 10.6134 1.44911 9.88928 1.7871C9.18832 2.11428 8.37772 2.59716 7.36183 3.20233L5.90622 4.06943C4.78711 4.73606 3.89535 5.26727 3.22015 5.77524C2.52314 6.29963 1.99999 6.8396 1.65907 7.55072C1.31799 8.26219 1.22554 9.0068 1.25519 9.87584C1.2839 10.717 1.43105 11.7397 1.61556 13.0219L1.90792 15.0537C2.14531 16.7036 2.33368 18.0128 2.61512 19.0322C2.90523 20.0829 3.31686 20.9169 4.05965 21.5565C4.80184 22.1956 5.68984 22.4814 6.77634 22.6177C7.83154 22.75 9.16281 22.75 10.8423 22.75H13.1577C14.8372 22.75 16.1685 22.75 17.2237 22.6177C18.3102 22.4814 19.1982 22.1956 19.9404 21.5565C20.6831 20.9169 21.0948 20.0829 21.3849 19.0322C21.6663 18.0129 21.8547 16.7036 22.0921 15.0537L22.3844 13.0219C22.569 11.7396 22.7161 10.717 22.7448 9.87584C22.7745 9.0068 22.682 8.26219 22.3409 7.55072C22 6.8396 21.4769 6.29963 20.7799 5.77524C20.1047 5.26727 19.2129 4.73606 18.0938 4.06943L16.6382 3.20233C15.6223 2.59716 14.8117 2.11428 14.1107 1.7871C13.3866 1.44911 12.7251 1.25 12 1.25ZM8.09558 4.51121C9.15309 3.88126 9.89923 3.43781 10.5237 3.14633C11.1328 2.86203 11.5708 2.75 12 2.75C12.4293 2.75 12.8672 2.86203 13.4763 3.14633C14.1008 3.43781 14.8469 3.88126 15.9044 4.51121L17.2893 5.33615C18.4536 6.02973 19.2752 6.52034 19.8781 6.9739C20.4665 7.41662 20.7888 7.78294 20.9883 8.19917C21.1877 8.61505 21.2706 9.09337 21.2457 9.82469C21.2201 10.5745 21.0856 11.5163 20.8936 12.8511L20.6148 14.7884C20.3683 16.5016 20.1921 17.7162 19.939 18.633C19.6916 19.5289 19.3939 20.0476 18.9616 20.4198C18.5287 20.7926 17.9676 21.0127 17.037 21.1294C16.086 21.2486 14.8488 21.25 13.1061 21.25H10.8939C9.15124 21.25 7.91405 21.2486 6.963 21.1294C6.03246 21.0127 5.47129 20.7926 5.03841 20.4198C4.60614 20.0476 4.30838 19.5289 4.06102 18.633C3.80791 17.7162 3.6317 16.5016 3.3852 14.7884L3.10643 12.851C2.91437 11.5163 2.77991 10.5745 2.75432 9.82469C2.72937 9.09337 2.81229 8.61505 3.01167 8.19917C3.21121 7.78294 3.53347 7.41662 4.12194 6.9739C4.72482 6.52034 5.54643 6.02973 6.71074 5.33615L8.09558 4.51121Z"
                fill=""
              />
            </svg>
          ),
          label: dict.title.titledashboard, // Use translated string here
          route: "/dashboard",
        },
        {
          icon: (
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.9999 1.25C9.37654 1.25 7.24989 3.37665 7.24989 6C7.24989 8.62335 9.37654 10.75 11.9999 10.75C14.6232 10.75 16.7499 8.62335 16.7499 6C16.7499 3.37665 14.6232 1.25 11.9999 1.25ZM8.74989 6C8.74989 4.20507 10.205 2.75 11.9999 2.75C13.7948 2.75 15.2499 4.20507 15.2499 6C15.2499 7.79493 13.7948 9.25 11.9999 9.25C10.205 9.25 8.74989 7.79493 8.74989 6Z"
                fill=""
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.9999 12.25C9.68634 12.25 7.55481 12.7759 5.97534 13.6643C4.41937 14.5396 3.24989 15.8661 3.24989 17.5L3.24982 17.602C3.24869 18.7638 3.24728 20.222 4.5263 21.2635C5.15577 21.7761 6.03637 22.1406 7.2261 22.3815C8.41915 22.6229 9.97412 22.75 11.9999 22.75C14.0257 22.75 15.5806 22.6229 16.7737 22.3815C17.9634 22.1406 18.844 21.7761 19.4735 21.2635C20.7525 20.222 20.7511 18.7638 20.75 17.602L20.7499 17.5C20.7499 15.8661 19.5804 14.5396 18.0244 13.6643C16.445 12.7759 14.3134 12.25 11.9999 12.25ZM4.74989 17.5C4.74989 16.6487 5.37127 15.7251 6.71073 14.9717C8.02669 14.2315 9.89516 13.75 11.9999 13.75C14.1046 13.75 15.9731 14.2315 17.289 14.9717C18.6285 15.7251 19.2499 16.6487 19.2499 17.5C19.2499 18.8078 19.2096 19.544 18.5263 20.1004C18.1558 20.4022 17.5364 20.6967 16.4761 20.9113C15.4192 21.1252 13.9741 21.25 11.9999 21.25C10.0257 21.25 8.58063 21.1252 7.52368 20.9113C6.46341 20.6967 5.84401 20.4022 5.47348 20.1004C4.79021 19.544 4.74989 18.8078 4.74989 17.5Z"
                fill=""
              />
            </svg>
          ),
          label: dict.title.usersetting, // Use translated string here
          route: "#",
          children: [
            { label: dict.title.adduser, route: "/usersetting/adduser" },
            { label: dict.title.branch, route: "/usersetting/branches" },
            { label: dict.title.usersalary, route: "/usersetting/salary" },
            { label: dict.title.userleave, route: "/usersetting/leave" },
            { label: dict.title.userdata, route: "/usersetting/userdata" },
          ],
        },
        ...(session.data?.user.role === "ADMIN" ? [
          {
            icon: (
              <svg
                className="text-fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"
                  fill="currentColor"
                />
              </svg>
            ),
            label: dict.title.location, // Use translated string here
            route: "/location",
          }
        ] : []),
        // {
        //   icon: (
        //     <svg
        //       className="text-fill-current"
        //       width="24"
        //       height="24"
        //       viewBox="0 0 24 24"
        //       fill="none"
        //       xmlns="http://www.w3.org/2000/svg"
        //     >
        //       <path
        //         d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"
        //         fill="currentColor"
        //       />
        //     </svg>
        //   ),
        //   label: "Dev", // Use translated string here
        //   route: "/dev",
        // }
      ],
    },
  ];

  return (
    <>
      {isMobile ? (
        // 手机端：不使用 ClickOutside
        <aside
          id="sidebar"
          aria-controls="sidebar"
          className={`group h-screen flex flex-col overflow-y-hidden border-r border-stroke bg-white dark:border-stroke-dark dark:bg-gray-dark transition-all duration-300
        ${sidebarOpen ? "w-72.5" : "w-0"}`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-center px-4 py-5.5">
            <Image
              width={sidebarOpen ? 64 : 32}
              height={32}
              src="/images/logo/icon.png"
              alt="Logo"
              priority
              className="object-contain"
            />
          </div>
          {/* Sidebar Menu */}
          <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
            <nav className="mt-1 px-2">
              {menuGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <h3 className="mb-5 text-sm font-medium text-dark-4 dark:text-dark-6 transition-all duration-200">
                    {group.name}
                  </h3>
                  <ul className="mb-6 flex flex-col gap-2">
                    {group.menuItems.map((menuItem, menuIndex) => (
                      <SidebarItem
                        key={menuIndex}
                        item={menuItem}
                        pageName={pageName}
                        setPageName={setPageName}
                        isMobile={isMobile}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>
      ) : (
        // 桌面端：用 ClickOutside 包裹
        <ClickOutside onClick={() => setSidebarOpen(false)}>
          <aside
            id="sidebar"
            aria-controls="sidebar"
            onMouseLeave={() => setPageName("")}
            className={`group h-screen flex flex-col overflow-y-hidden border-r border-stroke bg-white dark:border-stroke-dark dark:bg-gray-dark transition-all duration-300
          w-20 hover:w-72.5`}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-center px-4 py-5.5">
              <Image
                width={32}
                height={32}
                src="/images/logo/icon.png"
                alt="Logo"
                priority
                className={`object-contain ${isMobile ? "" : "group-hover:hidden"}`}
              />
              <Image
                width={128}
                height={32}
                src="/images/logo/icon.png"
                alt="Full Logo"
                priority
                className={`object-contain ${isMobile ? "hidden" : "hidden group-hover:block"}`}
              />
            </div>

            {/* Sidebar Menu */}
            <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
              <nav className="mt-1 px-2">
                {menuGroups.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    <h3 className="mb-5 text-[0px] group-hover:text-sm font-medium text-dark-4 dark:text-dark-6 transition-all duration-200">
                      {group.name}
                    </h3>
                    <ul className="mb-6 flex flex-col gap-2">
                      {group.menuItems.map((menuItem, menuIndex) => (
                        <SidebarItem
                          key={menuIndex}
                          item={menuItem}
                          pageName={pageName}
                          setPageName={setPageName}
                          isMobile={isMobile}
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          </aside>
        </ClickOutside>
      )}
    </>
  );
};

export default Sidebar;