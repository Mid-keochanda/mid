import axiosClient from '@/lib/axiosClient';

export const dashboardService = {
  getStats: async () => {
    try {
      const response = await axiosClient.get('/dashboard/stats');
      const resData = response.data;

      if (resData.success && resData.stats) {
        const s = resData.stats;
        return {
          // Stats Cards
          pendingApprovals: s.totalPending || 0,
          approvalRate: s.approvalRate || "0%",
          todayBookings: s.todayBookings || 0,
          totalUsers: s.totalUsers || 0,

          // Insights
          topRoom: s.topRoom?.room?.room_name || "N/A",
          topEquipment: s.topEquipment?.details?.item_name || "N/A",
          topCatering: s.topCatering?.item_details?.Name || "N/A", 
          
          // Chart Data (Mapping ຈາກ JSON ຂອງມຶງ)
          charts: {
            dailyTrend: s.charts?.dailyTrend || [],
            statusSummary: s.charts?.statusSummary || []
          },

          bookingTypes: s.bookingTypes || { recurring: 0, single: 0 },
          totalRejected: s.totalRejected || 0,
          upcoming: s.upcoming || []
        };
      }
      return null;
    } catch (error) {
      console.error("Fetch Stats Error:", error);
      throw error;
    }
  }
};