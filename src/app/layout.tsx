import "@/css/satoshi.css"; //
import "@/css/style.css";   //
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Providers>
          {/* ສ້າງ Container ຫຼັກແບບ Flex */}
          <div className="flex h-screen overflow-hidden">
            
            {/* ເລເຍີ Sidebar */}
            <Sidebar />

            {/* ເລເຍີເນື້ອຫາດ້ານຂວາ */}
            <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden bg-gray-2 dark:bg-[#020d1a]">
              <Header />
              <main>
                <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                  {children}
                </div>
              </main>
            </div>

          </div>
        </Providers>
      </body>
    </html>
  );
}