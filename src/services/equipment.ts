import axiosClient from '@/lib/axiosClient';

// ກຳນົດ Path ຫຼັກ
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const PATH = '/equipment';

export const equipmentService = {
  // ດຶງຂໍ້ມູນທັງໝົດ
  getAll: async () => {
    try {
      const response = await axiosClient.get(`${API_URL}${PATH}`);
      
      // ກວດສອບໂຄງສ້າງຂໍ້ມູນ (ຮອງຮັບທັງ Array ກົງໆ ຫຼື { data: [] })
      const rawData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.data || []);
      
      // Mapping ຂໍ້ມູນໃຫ້ເປັນ Standard format
      return rawData.map((item: any) => ({
        ...item,
        id: item.id || item.equipment_id,
        Name: item.Name || item.item_name || "ບໍ່ລະບຸຊື່",
        Unit: item.Unit || item.unit || "-",
        isActive: item.isActive === true || item.isActive === 1 || item.is_active === 1,
        updatedAt: item.updatedAt || item.updated_at
      }));
    } catch (error) {
      console.error("Fetch Equipment Error:", error);
      return []; // ສົ່ງ Array ເປົ່າກັບໄປເພື່ອບໍ່ໃຫ້ UI ແຕກ
    }
  },

  // ດຶງຂໍ້ມູນຕາມ ID
  getById: async (id: number | string) => {
    try {
      const response = await axiosClient.get(`${API_URL}${PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Get Equipment ID ${id} Error:`, error);
      throw error;
    }
  },

  // ເພີ່ມຂໍ້ມູນໃໝ່
  create: async (data: any) => {
    try {
      // ປັບ Payload ໃຫ້ກົງກັບ Backend (Name, Unit, isActive)
      const payload = {
        Name: data.Name,
        Unit: data.Unit,
        isActive: data.isActive ? 1 : 0
      };
      const response = await axiosClient.post(`${API_URL}${PATH}`, payload);
      return response.data;
    } catch (error) {
      console.error("Create Equipment Error:", error);
      throw error;
    }
  },

  // ແກ້ໄຂຂໍ້ມູນ
  update: async (id: number | string, data: any) => {
    try {
      const payload = {
        Name: data.Name,
        Unit: data.Unit,
        isActive: data.isActive ? 1 : 0
      };
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