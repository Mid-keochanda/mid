import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "ຂໍ້ມູນໜ້າຫຼັກ",
    items: [
      {
        title: "Dashboard",
         url: "/",
          icon: Icons.HomeIcon,
           items: [],
      },
    {
        title: "ລາຍການສິ່ງຂອງ",
        url: "/catering-items",
        icon: Icons.Table, 
        items: [],
      },
    {
        title: "ເພີ່ມອຸປະກອນກາງ",
        url: "/equipment",
        icon: Icons.Table, // ໃຊ້ໄອຄັອນຕາຕະລາງ ສື່ເຖິງການຈັດການລາຍການສາງ
        items: [],
      },
      {
        title: "ການຈອງຫ້ອງປະຊຸມ",
        url: "/bookings",
        icon: Icons.Calendar, // ໃຊ້ໄອຄັອນປະຕິທິນ ສື່ເຖິງການຈອງ ຫຼື ຕາຕະລາງຫ້ອງປະຊຸມ
        items: [],
      }, 
      {
        title: "ຈັດການຫ້ອງປະຊຸມ",
        url: "/room",
        icon: Icons.Calendar, // ໃຊ້ໄອຄັອນປະຕິທິນ ສື່ເຖິງການຈອງ ຫຼື ຕາຕະລາງຫ້ອງປະຊຸມ
        items: [],
      }, 
      {
        title: "ບັນທຶກພະນັກງານ",
        url: "/user",
        icon: Icons.User, // ໃຊ້ໄອຄັອນຜູ້ໃຊ້ ໂດຍກົງ
        items: [],
      },
      /*{
        title: "ຕົວຢ່າງ",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Form Elements",
            url: "/forms/form-elements",
          },
          {
            title: "Form Layout",
            url: "/forms/form-layout",
          },
        ],
      },
       {
         title: "Tables",
         url: "/tables",
         icon: Icons.Table,
         items: [
           {
             title: "Tables",
             url: "/tables",
           },
         ],
       },
    ],
  },
  {
     label: "OTHERS",
     items: [
       {
         title: "Charts",
         icon: Icons.PieChart,
         items: [
           {
             title: "Basic Chart",
             url: "/charts/basic-chart",
           },
         ],
       },
       {
         title: "UI Elements",
         icon: Icons.FourCircle,
         items: [
           {
             title: "Alerts",
             url: "/ui-elements/alerts",
           },
           {
             title: "Buttons",
             url: "/ui-elements/buttons",
           },
       ],
       },
       {
         title: "Authentication",
         icon: Icons.Authentication,
         items: [
           {
             title: "Sign In",
             url: "/auth/sign-in",
           },
         ],
       },*/
    ],
   },
];
