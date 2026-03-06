"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider> 
      {/* ປົກກະຕິຈະມີ ThemeProvider ຫຼື ອື່ນໆຢູ່ບ່ອນນີ້ */}
      {children}
    </SidebarProvider>
  );
}
