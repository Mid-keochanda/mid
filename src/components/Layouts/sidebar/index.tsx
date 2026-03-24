"use client";

import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
// 🟢 ເອີ້ນໃຊ້ getNavData
import { getNavData } from "./data"; 
import { ArrowLeftIcon, ChevronUp } from "./icons";
import { MenuItem } from "./menu-item";
import { useSidebarContext } from "./sidebar-context";

export function Sidebar() {
  const pathname = usePathname();
  const { setIsOpen, isOpen, isMobile, toggleSidebar } = useSidebarContext();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // 🟢 ໃຊ້ useMemo ເພື່ອໃຫ້ຂໍ້ມູນ Nav ອັບເດດຕາມ Role ແລະ ບໍ່ Render ມົ່ວ
  const navData = useMemo(() => getNavData(), []);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? [] : [title]));
  };

  useEffect(() => {
    navData.some((section) => {
      return section.items.some((item: any) => {
        return item.items?.some((subItem: any) => {
          if (subItem.url === pathname) {
            if (!expandedItems.includes(item.title)) {
              toggleExpanded(item.title);
            }
            return true;
          }
          return false;
        });
      });
    });
  }, [pathname, navData]);

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "max-w-[290px] overflow-hidden border-r border-gray-200 bg-white transition-[width] duration-200 ease-linear dark:border-gray-800 dark:bg-gray-dark",
          isMobile ? "fixed bottom-0 top-0 z-50" : "sticky top-0 h-screen",
          isOpen ? "w-full" : "w-0",
        )}
      >
        <div className="flex h-full flex-col py-10 pl-[25px] pr-[7px]">
          <div className="relative pr-4.5">
            <Link href={"/"} className="px-0 py-2.5 min-[850px]:py-0">
              <Logo />
            </Link>
            {isMobile && (
              <button onClick={toggleSidebar} className="absolute left-3/4 top-1/2 -translate-y-1/2">
                <ArrowLeftIcon className="ml-auto size-7" />
              </button>
            )}
          </div>

          <div className="custom-scrollbar mt-6 flex-1 overflow-y-auto pr-3 min-[850px]:mt-10">
            {navData.map((section) => (
              <div key={section.label} className="mb-6">
                <h2 className="mb-5 text-sm font-medium text-dark-4 dark:text-dark-6">
                  {section.label}
                </h2>

                <nav>
                  <ul className="space-y-2">
                    {section.items.map((item: any) => (
                      <li key={item.title}>
                        {item.items && item.items.length > 0 ? (
                          <div>
                            <MenuItem
                              isActive={item.items.some((sub: any) => sub.url === pathname)}
                              onClick={() => toggleExpanded(item.title)}
                            >
                              <item.icon className="size-6 shrink-0" />
                              <span>{item.title}</span>
                              <ChevronUp className={cn("ml-auto rotate-180 transition-transform", expandedItems.includes(item.title) && "rotate-0")} />
                            </MenuItem>

                            {expandedItems.includes(item.title) && (
                              <ul className="ml-9 space-y-1.5 pt-2">
                                {item.items.map((subItem: any) => (
                                  <li key={subItem.title}>
                                    <MenuItem as="link" href={subItem.url} isActive={pathname === subItem.url}>
                                      <span>{subItem.title}</span>
                                    </MenuItem>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : (
                          <MenuItem
                            as="link"
                            href={item.url || "/"}
                            isActive={pathname === item.url}
                            className="flex items-center gap-3 py-3"
                          >
                            <item.icon className="size-6 shrink-0" />
                            <span>{item.title}</span>
                          </MenuItem>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}