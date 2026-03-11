import axiosClient from '@/lib/axiosClient';


const API_PATH = '/rooms'; 

export const getAllRooms = async () => {
  try {
    const res = await axiosClient.get(API_PATH);
    const rawData = Array.isArray(res.data) ? res.data : (res.data.rooms || res.data.data || []);
    
    return rawData.map((item: any) => ({
      ...item,
      room_id: item.room_id || item.id,
      room_name: item.room_name,
      location: item.location,
      capacity: item.capacity,
      image_url: item.image_url,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
  } catch (error) {
    console.error("Fetch Rooms Error:", error);
    throw error; // ໂຍນ Error ໄປໃຫ້ໜ້າ Page ຈັບເພື່ອໂຊ Toast
  }
};

export const insertRoom = (data: any) => axiosClient.post(API_PATH, data);
export const updateRoom = (id: any, data: any) => axiosClient.put(`${API_PATH}/${id}`, data);
// ປ່ຽນຊື່ເປັນ deleteRoomApi ເພື່ອບໍ່ໃຫ້ຊ້ຳກັບ Function ໃນໜ້າ UI
export const deleteRoomApi = (id: any) => axiosClient.delete(`${API_PATH}/${id}`);