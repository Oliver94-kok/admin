import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SidebarDropdown = ({ item, expanded, isMobile }: any) => {
  const pathname = usePathname();

  return (
    <ul
      className={`my-2 flex flex-col gap-1.5 pl-9 transition-all duration-300 ease-in-out
      ${expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}
    >
      {item.map((child: any, index: number) => (
        <li key={index}>
          <Link
            href={child.route}
            onClick={() => {
              // 手机端点击子菜单后关闭 Sidebar
              if (isMobile) window.dispatchEvent(new Event("sidebar-close"));
            }}
            className={`relative flex rounded-[7px] px-3.5 py-2 font-medium duration-300 ease-in-out
              ${isMobile ? "text-sm" : "text-base"}
              ${pathname === child.route
                ? "bg-primary/[.07] text-primary dark:bg-white/10 dark:text-white"
                : "text-dark-4 hover:bg-gray-2 hover:text-dark dark:text-gray-5 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
          >
            {child.label}
            {child.pro && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md bg-primary px-1.5 py-px text-[10px] font-medium leading-[17px] text-white">
                Pro
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default SidebarDropdown;
