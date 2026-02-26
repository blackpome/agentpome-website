"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavigationMenu() {
  const navItems = ["Blog", "Home", "Contact"];
  const pathname = usePathname();

  if (pathname.startsWith("/blog/")) return null;

  return (
    <div className="w-full fixed bottom-0 left-0 z-50 mb-20 px-4">
      <div className="flex justify-center py-2 overflow-x-auto">
        <div className="flex p-2 bg-white rounded-full shadow-md overflow-hidden">
          {navItems.map((item) => {
            const isVisibleOnMobile = ["Home", "Contact", "Blog"].includes(item);
            const path = item === "Home" ? "/" : `/${item.toLowerCase()}`;
            const isActive = pathname === path;

            return (
              <Link href={path} key={item}>
                <button
                  className={`px-6 py-3 text-sm rounded-full whitespace-nowrap transition-colors duration-300 ${
                    isActive ? "bg-black text-white shadow-md ring-2 ring-black" : "text-black"
                  } ${isVisibleOnMobile ? "block" : "hidden md:block"}`}
                >
                  {item}
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
