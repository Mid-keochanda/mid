import axiosClient from '@/lib/axiosClient';

// ກຳນົດ Path ຫຼັກ - ກວດເບິ່ງ IP ໃຫ້ດີເດີວ່າ .181 ຫຼື .175
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.18.9.181:5000/api";
const PATH = '/equipment';

export const equipmentService = {
  // ດຶງຂໍ້ມູນທັງໝົດ
  getAll: async () => {
    try {
      const response = await axiosClient.get(`${API_URL}${PATH}`);
      // ຖ້າ Backend ສົ່ງມາເປັນ { data: [] } ຫຼື Array ກົງໆ ກໍຮອງຮັບໝົດ
      const rawData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      return rawData;
    } catch (error) {
      console.error("Fetch Equipment Error:", error);
      return [];
    }
  },

  // ເພີ່ມຂໍ້ມູນໃໝ່
  create: async (payload: any) => {
    try {
      // payload ຈະຖືກສົ່ງມາຈາກ Page ເຊິ່ງມີ item_name, unit, total_quantity, item_type ຄົບແລ້ວ
      const response = await axiosClient.post(`${API_URL}${PATH}`, payload);
      return response.data;
    } catch (error) {
      console.error("Create Equipment Error:", error);
      throw error;
    }
  },

  // ແກ້ໄຂຂໍ້ມູນ
  update: async (id: number | string, payload: any) => {
    try {
      const response = await axiosClient.put(`${API_URL}${PATH}/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Update Equipment ID ${id} Error:`, error);
      throw error;
    }
  },

  // ລຶບຂໍ້ມູນ
  delete: async (id: number | string) => {
    try {
      const response = await axiosClient.delete(`${API_URL}${PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete Equipment ID ${id} Error:`, error);
      throw error;
    }
  },
};