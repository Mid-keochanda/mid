import axiosClient from '@/lib/axiosClient';

export const dashboardService = {
  getStats: async () => {
    try {
      // 1. ເອີ້ນ API ໂດຍໃຊ້ Path ທີ່ຖືກຕ້ອງ
      const response = await axiosClient.get('/dashboard/stats');
      const resData = response.data;

      // 2. ກວດສອບວ່າເປັນ API ເວີຊັນໃໝ່ທີ່ມີ Object "stats" ຫຼື ບໍ່
      if (resData.success && resData.stats) {
        const s = resData.stats;
        return {
          // --- Mapping ຂໍ້ມູນຈາກ API ໃໝ່ ---
          totalEquipment: s.topEquipment?.total_qty || 0, 
          pendingApprovals: s.totalPending || 0,
          approvedBookings: s.upcoming?.length || 0, 
          totalUsers: s.totalUsers || 0,
          
          // ຂໍ້ມູນເສີມສຳລັບ UI ໃໝ່
          topRoom: s.topRoom?.room?.room_name || "ບໍ່ມີຂໍ້ມູນ",
          approvalRate: s.approvalRate || "0%",
          upcoming: s.upcoming || []
        };
      } 
      
      // 3. ຖ້າບໍ່ແມ່ນ (ກໍລະນີ API ເກົ່າທີ່ສົ່ງມາແບບຮາບພຽງ)
      return {
        totalEquipment: resData.totalEquipment || 0,
        pendingApprovals: resData.pendingApprovals || 0,
        approvedBookings: resData.approvedBookings || 0,
        totalUsers: resData.totalUsers || 0,
        upcoming: [],
        topRoom: "N/A",
        approvalRate: "0%"
      };

    } catch (error) {
      console.error("Fetch Stats Error:", error);
      // ສົ່ງຄ່າ Default ກັບໄປເພື່ອບໍ່ໃຫ້ UI ເພ
      return {
        totalEquipment: 0,
        pendingApprovals: 0,
        approvedBookings: 0,
        totalUsers: 0,
        upcoming: []
      };
    }
  }
};