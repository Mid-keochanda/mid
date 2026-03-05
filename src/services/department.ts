import axios from "axios";

// ສ້າງ instance ຂອງ axios
const API = axios.create({
  baseURL: "http://172.18.9.211:5000/api", 
  headers: { "Content-Type": "application/json" },
});

// ແນບ Token ເຂົ້າ Header ອັດຕະໂນມັດ (Interceptor)
API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// --- Interfaces ---

export interface LoginResponse {
  message: string;
  access_token: string;
  data?: any;
}

export interface Booking {
  booking_id?: number;
  id?: number; 
  room_id: number;
  user_id: number;
  title: string;
  start_time: string; 
  end_time: string;   
  status: 'Pending' | 'Approved' | 'Rejected';
  is_recurring: boolean;
  recur_pattern: 'none' | 'daily' | 'weekly' | 'monthly';
  attendeeCount: number;
  // ເພີ່ມເພື່ອຮອງຮັບຂໍ້ມູນທີ່ມາຈາກ Relation ຂອງ Database
  room?: { room_name: string };
  user?: { full_name: string };
}

// --- Functions ---

export async function login(data: any): Promise<LoginResponse> {
  const response = await API.post<LoginResponse>("/users/login", data);
  if (response.data.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }
  return response.data;
}

export const bookingService = {
  // 🚩 ປັບປຸງ getAll: ເພື່ອໃຫ້ແນ່ໃຈວ່າຂໍ້ມູນທີ່ໄດ້ມາ ມີໂຄງສ້າງທີ່ຄົບຖ້ວນ
  getAll: async () => {
    try {
      const res = await API.get("/bookings");
      // ຖ້າ Backend ສົ່ງມາໃນຮູບແບບ { data: [...] } ຫຼື [...] ເລີຍ
      const rawData = Array.isArray(res.data) ? res.data : (res.data.data || []);
      return { ...res, data: rawData }; 
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error;
    }
  },
  
  getRooms: async () => {
    try {
      const res = await API.get("/rooms");
      return Array.isArray(res.data) ? res.data : (res.data.data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      return [];
    }
  },

  getUsers: async () => {
    try {
      const res = await API.get("/users");
      return Array.isArray(res.data) ? res.data : (res.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  create: (data: Booking) => API.post("/bookings", data),

  // 🚩 ສ່ວນ Update: ກວດເຊັກ ID ແລະ ກັ່ນຕອງຂໍ້ມູນກ່ອນສົ່ງ
  update: (id: number | string, data: Booking) => {
    if (!id) {
      console.error("❌ Update Error: ບໍ່ມີ ID ສົ່ງມາ");
      return Promise.reject(new Error("Missing Booking ID"));
    }
    
    // ແຍກຂໍ້ມູນທີ່ບໍ່ກ່ຽວຂ້ອງກັບ Database Table ອອກກ່ອນສົ່ງ (ເຊັ່ນ object ຂອງ room ຫຼື user)
    // ເພື່ອປ້ອງກັນ Error ຈາກ Backend ທີ່ກວດສອບ Payload ເຂັ້ມງວດ
    const { booking_id, id: _, room, user, ...payload } = data as any; 
    
    return API.put(`/bookings/${id}`, payload);
  },

  delete: (id: number | string) => API.delete(`/bookings/${id}`),
};

export default API;