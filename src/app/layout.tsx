"use client";

import "@/css/satoshi.css"; 
import "@/css/style.css";   
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    // ກວດເຊັກການ Login
    if (!token && pathname !== "/login") {
      router.push("/login");
    } 
    
    // Redirect ຖ້າ User ພະຍາຍາມເຂົ້າໜ້າ Admin
    if (storedRole === "user" && pathname === "/") {
      router.push("/user-dashboard");
    }

    setRole(storedRole);
    setMounted(true);
  }, [pathname, router]);

  const isAuthPage = pathname === "/login";

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Providers>
          {isAuthPage ? (
            <main>{children}</main>
          ) : (
            /* Layout ຫຼັກ: ຈັດວາງ Sidebar ແລະ Content ໃຫ້ເຕັມຈໍ */
            <div className="flex h-screen overflow-hidden">
              
              {/* Sidebar: ຈະ Render ເມື່ອ Mounted ແລ້ວ ແລະ ມີ Role (ທັງ Admin/User) */}
              {mounted && role && (
                <Sidebar />
              )}

              {/* ເນື້ອຫາດ້ານຂວາ */}
              <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden bg-gray-2 dark:bg-[#020d1a]">
                
                {/* Header: ມີພຽງອັນດຽວຢູ່ເທິງສຸດ */}
                {mounted && <Header />}
                
                <main>
                  <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                    {children}
                  </div>
                </main>
              </div>

            </div>
          )}
        </Providers>
      </body>
    </html>
  );
}