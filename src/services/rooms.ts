import axiosClient from '@/lib/axiosClient';

// ໃຊ້ URL ຈາກ env ຫຼື localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const API_PATH = '/rooms'; 

export async function getAllRooms() {
  try {
    const response = await axiosClient.get(`${API_URL}${API_PATH}`);
    
    // ກວດສອບໂຄງສ້າງຂໍ້ມູນ (ຮອງຮັບທັງ Array ກົງໆ ຫຼື { data: [] } ຫຼື { rooms: [] })
    const rawData = Array.isArray(response.data) 
      ? response.data 
      : (response.data.rooms || response.data.data || []);
    
    // Mapping ຂໍ້ມູນໃຫ້ສະອາດກ່ອນສົ່ງອອກໄປ
    return rawData.map((item: any) => ({
      ...item,
      id: item.room_id || item.id, // ບັງຄັບໃຫ້ມີ id standard
      room_name: item.room_name || item.Name, // ຮອງຮັບທັງ Name ຕົວໃຫຍ່ ແລະ room_name
      location: item.location || "",
      capacity: item.capacity || 0,
      image_url: item.image_url || null,
      status: item.status ?? item.isActive, // ຮອງຮັບທັງ status ແລະ isActive
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
  } catch (error) {
    console.error("Fetch Rooms Error:", error);
    // ສົ່ງ Array ເປົ່າກັບໄປເພື່ອບໍ່ໃຫ້ UI ແຕກ ແຕ່ log error ໄວ້
    return []; 
  }
}

export async function insertRoom(data: any) {
  try {
    const response = await axiosClient.post(`${API_URL}${API_PATH}`, data);
    return response.data;
  } catch (error) {
    console.error("Insert Room Error:", error);
    throw error;
  }
}

export async function updateRoom(id: string | number, data: any) {
  try {
    const response = await axiosClient.put(`${API_URL}${API_PATH}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update Room Error:", error);
    throw error;
  }
}

export async function deleteRoom(id: string | number) {
  try {
    const response = await axiosClient.delete(`${API_URL}${API_PATH}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete Room Error:", error);
    throw error;
  }
}