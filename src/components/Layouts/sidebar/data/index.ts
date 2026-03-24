import * as Icons from "../icons";

interface SubItem {
  title: string;
  url: string;
}

interface MenuItem {
  title: string;
  url?: string;
  icon: any;
  items: SubItem[];
}

interface NavGroup {
  label: string;
  items: MenuItem[];
}

export const getNavData = (): NavGroup[] => {
  // ດຶງ Role ມາ (ຖ້າມັນເປັນ null ໃຫ້ເປັນ user ໄວ້ກ່ອນ)
  const role = typeof window !== "undefined" ? localStorage.getItem("role")?.toLowerCase() : "user";
  
  const isAdmin = role === "admin";

  return [
    {
      label: "ຂໍ້ມູນໜ້າຫຼັກ",
      items: [
        // 🔴 ຖ້າເປັນ Admin ໃຫ້ໂຊ "ລວມຍອດ"
        ...(isAdmin
          ? [
              {
                title: "ລວມຍອດຕ່າງໆ",
                url: "/",
                icon: Icons.HomeIcon,
                items: [],
              },
            ]
          : []),
        {
          title: "ລາຍການສິ່ງຂອງ",
          url: "/catering-items",
          icon: Icons.Table,
          items: [],
        },
        {
          title: "ລາຍການອຸປະກອນ",
          url: "/equipment",
          icon: Icons.Table,
          items: [],
        },
        {
          title: "ການອະນຸມັດ",
          url: "/approvals",
          icon: Icons.Calendar,
          items: [],
        },
        {
          title: "ຈອງຫ້ອງປະຊູມ",
          url: "/bookings",
          icon: Icons.Calendar,
          items: [],
        },
        {
          title: "ຈັດການຫ້ອງປະຊຸມ",
          url: "/room",
          icon: Icons.Calendar,
          items: [],
        },
        // 🔴 ຖ້າເປັນ Admin ໃຫ້ໂຊ "ບັນທຶກພະນັກງານ"
        ...(isAdmin
          ? [
              {
                title: "ບັນທຶກພະນັກງານ",
                url: "/user",
                icon: Icons.User,
                items: [],
              },
            ]
          : []),
      ],
    },
  ];
};