"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/ui/dropdown";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation"; // 1. Import useRouter ເຂົ້າມາ
import { useState } from "react";
import { LogOutIcon, SettingsIcon, UserIcon } from "./icons";

export function UserInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter(); // 2. ປະກາດໃຊ້ router

  const USER = {
    name: "John Smith",
    email: "johnson@nextadmin.com",
    img: "/images/user/user-03.png",
  };

  // 3. ສ້າງ Function ສຳລັບ Logout
  const handleLogout = () => {
    setIsOpen(false);
    
    // ຖ້າເຈົ້າມີການເກັບ Token ໃນ Cookie ຫຼື LocalStorage ໃຫ້ລຶບອອກຢູ່ນີ້
    // localStorage.removeItem("token");
    
    // ເດັ້ງໄປໜ້າລ໋ອກອິນ
    router.push("/login"); 
  };

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="rounded align-middle outline-none ring-primary ring-offset-2 focus-visible:ring-1 dark:ring-offset-gray-dark">
        {/* ... ສ່ວນ Trigger ຂອງເຈົ້າ ... */}
        <figure className="flex items-center gap-3 cursor-pointer">
          <Image src={USER.img} className="size-12 rounded-full" alt="User" width={48} height={48} />
          <figcaption className="flex items-center gap-1 font-medium text-dark dark:text-white max-[1024px]:sr-only">
            <span>{USER.name}</span>
            <ChevronUpIcon className={cn("rotate-180 transition-transform", isOpen && "rotate-0")} />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark min-[230px]:min-w-[17.5rem]"
        align="end"
      >
        {/* ... ສ່ວນຂໍ້ມູນຜູ້ໃຊ້ ... */}
        
        <hr className="border-[#E8E8E8] dark:border-dark-3" />

        <div className="p-2">
          {/* 4. ປ່ຽນປຸ່ມ Log out ໃຫ້ມາໃຊ້ handleLogout */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOutIcon />
            <span className="text-base font-medium">Log out</span>
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}