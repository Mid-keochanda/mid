import axios from "axios";
import Cookies from "js-cookie"; // ເພີ່ມການຈັດການ Cookie

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, 
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // ກວດເຊັກ Token ຈາກທັງ localStorage ແລະ Cookie
    const token = localStorage.getItem("token") || Cookies.get("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// --- Interfaces (ຮັກສາໄວ້ຄືເກົ່າ) ---

export interface LoginResponse {
  message: string;
  access_token: string;
  data?: any; // ປົກກະຕິ backend ຈະສົ່ງຂໍ້ມູນ user ມາໃນນີ້
}

export interface Equipment {
  id: number;
  item_name: string;
}

export interface CateringItem {
  id: number;
  name: string; 
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
  actual_end_time?: string | null; 
  status: 'Pending' | 'Approved' | 'Rejected';
  is_recurring: boolean | number; 
  recur_pattern: 'none' | 'daily' | 'weekly' | 'monthly';
  recur_count?: number;
  attendeeCount: number;
  equipments?: { equipment_id: number; quantity: number }[];
  caterings?: { 
    catering_item_id?: number; 
    cateringItem_id?: number; 
    quantity: number 
  }[]; 
  room?: { room_name: string };
  user?: { full_name: string; role?: string };
  booking_equipments?: any[]; 
  booking_caterings?: any[]; 
}

// --- Functions ---

export async function login(data: any): Promise<LoginResponse> {
  const response = await API.post<LoginResponse>("/users/login", data);
  
  if (response.data.access_token) {
    const token = response.data.access_token;
    // ດຶງ role ຈາກ response (ປັບໃຫ້ກົງກັບ Backend ຂອງເຈົ້າ ເຊັ່ນ: response.data.data.role)
    const role = response.data.data?.role || "user"; 

    // 1. ເກັບລົງ localStorage (ໄວ້ໃຊ້ໃນ Client components)
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    // 2. ເກັບລົງ Cookie (ສຳຄັນຫຼາຍ: ເພື່ອໃຫ້ Middleware ອ່ານໄດ້ ແລະ ເຊົາກະພິບ)
    Cookies.set("token", token, { expires: 7 }); // ເກັບໄວ້ 7 ວັນ
    Cookies.set("role", role, { expires: 7 });
  }
  return response.data;
}

// ຟັງຊັນ Logout ເພື່ອລຶບຂໍ້ມູນທັງໝົດ
export const logout = () => {
  localStorage.clear();
  Cookies.remove("token");
  Cookies.remove("role");
  window.location.href = "/login";
};

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
      const res = await API.get("/equipment"); 
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("Error fetching equipment:", error);
      return [];
    }
  },

  getCateringItems: async () => {
    try {
      const res = await API.get("/catering"); 
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("Error fetching catering items:", error);
      return [];
    }
  },

  create: async (data: Booking) => {
    const { id, booking_id, room, user, booking_equipments, booking_caterings, ...rest } = data as any;
    
    const payload = {
      ...rest,
      start_time: new Date(data.start_time).toISOString(),
      end_time: new Date(data.end_time).toISOString(),
      is_recurring: data.is_recurring ? 1 : 0,
      recurring_pattern: data.recur_pattern || 'none',
      caterings: (data.caterings || []).map(item => ({
        cateringItem_id: Number(item.catering_item_id || item.cateringItem_id), 
        quantity: Number(item.quantity)
      })),
      equipments: (data.equipments || []).map(item => ({
        equipment_id: Number(item.equipment_id),
        quantity: Number(item.quantity)
      }))
    };

    try {
      return await API.post("/bookings", payload);
    } catch (error: any) {
      console.error("❌ Create Error:", error.response?.data);
      throw error;
    }
  },

  update: async (id: number | string, data: Booking) => {
    const payload = {
      title: data.title,
      room_id: Number(data.room_id),
      user_id: Number(data.user_id),
      start_time: new Date(data.start_time).toISOString(),
      end_time: new Date(data.end_time).toISOString(),
      attendeeCount: Number(data.attendeeCount),
      status: data.status,
      is_recurring: data.is_recurring ? 1 : 0,
      recur_pattern: data.recur_pattern || 'none',
      caterings: (data.caterings || []).map(item => ({
        cateringItem_id: Number(item.cateringItem_id || item.catering_item_id),
        quantity: Number(item.quantity)
      })),
      equipments: (data.equipments || []).map(item => ({
        equipment_id: Number(item.equipment_id),
        quantity: Number(item.quantity)
      }))
    };

    try {
      return await API.put(`/bookings/${id}`, payload);
    } catch (error: any) {
      console.error("❌ Update Error Details:", error.response?.data);
      throw error;
    }
  },

  delete: (id: number | string) => API.delete(`/bookings/${id}`),
};

export default API;