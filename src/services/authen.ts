import axios from "axios";

const API = axios.create({
  baseURL: 'http://172.18.9.182:5000/api', 
  headers: { "Content-Type": "application/json" },
});

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

export interface Equipment {
  id: number;
  item_name: string;
}

// ✅ ເພີ່ມ Interface ສໍາລັບ Catering
export interface CateringItem {
  Id: number;
  Name: string;
  Unit: string;
  price: number;
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
  equipments?: { equipment_id: number; quantity: number }[];
  // ✅ ເພີ່ມຟີວສໍາລັບ Catering ທີ່ຈະສົ່ງໄປ Backend
  caterings?: { catering_item_id: number; quantity: number }[]; 
  
  room?: { room_name: string };
  user?: { full_name: string };
  booking_equipments?: any[]; 
  booking_caterings?: any[]; // ✅ ສໍາລັບຮັບຂໍ້ມູນມາສະແດງຜົນ
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
  getAll: async () => {
    try {
      const res = await API.get("/bookings");
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

  getEquipments: async () => {
    try {
      const res = await API.get("/equipments");
      return Array.isArray(res.data) ? res.data : (res.data.data || []);
    } catch (error) {
      console.error("Error fetching equipments:", error);
      return [];
    }
  },

  // ✅ ເພີ່ມຟັງຊັນດຶງຂໍ້ມູນ Catering
  getCateringItems: async () => {
    try {
      const res = await API.get("/catering-items");
      return Array.isArray(res.data) ? res.data : (res.data.data || []);
    } catch (error) {
      console.error("Error fetching catering items:", error);
      return [];
    }
  },

  create: (data: Booking) => API.post("/bookings", data),

  update: (id: number | string, data: Booking) => {
    if (!id) {
      console.error("❌ Update Error: ບໍ່ມີ ID ສົ່ງມາ");
      return Promise.reject(new Error("Missing Booking ID"));
    }
    // ແຍກ object ທີ່ບໍ່ກ່ຽວຂ້ອງອອກກ່ອນສົ່ງ payload
    const { booking_id, id: _, room, user, booking_equipments, booking_caterings, ...payload } = data as any; 
    return API.put(`/bookings/${id}`, payload);
  },

  delete: (id: number | string) => API.delete(`/bookings/${id}`),
};

export default API;