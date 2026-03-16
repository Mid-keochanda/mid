import axios from "axios";

const API = axios.create({
  baseURL: 'http://172.18.9.175:5000/api', 
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// --- Interfaces (ຮັກສາໄວ້ຄືເກົ່າທັງໝົດ) ---

export interface LoginResponse {
  message: string;
  access_token: string;
  data?: any;
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
    // ແຍກ metadata ທີ່ບໍ່ກ່ຽວຂ້ອງກັບ DB ອອກ
    const { id, booking_id, room, user, booking_equipments, booking_caterings, ...rest } = data as any;
    
    const payload = {
      ...rest,
      // ຮັບປະກັນວ່າເປັນ ISO String ເພື່ອໃຫ້ Backend Parse ໄດ້ 100%
      start_time: new Date(data.start_time).toISOString(),
      end_time: new Date(data.end_time).toISOString(),
      is_recurring: data.is_recurring ? 1 : 0,
      recurring_pattern: data.recur_pattern || 'none',
      caterings: (data.caterings || []).map(item => ({
        // ໃຊ້ cateringItem_id ໃຫ້ກົງກັບ Backend Controller ທີ່ໃຊ້ sequelize.transaction
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
    // ປັບ Payload ໃຫ້ກົງກັບ Sequelize Transaction ຂອງ Backend
    const payload = {
      title: data.title,
      room_id: Number(data.room_id),
      user_id: Number(data.user_id),
      start_time: new Date(data.start_time).toISOString(),
      end_time: new Date(data.end_time).toISOString(),
      attendeeCount: Number(data.attendeeCount),
      status: data.status,
      is_recurring: data.is_recurring ? 1 : 0,
      recur_pattern: data.recur_pattern || 'none', // ໃຊ້ Key ໃຫ້ຕົງກັບ Interface
      caterings: (data.caterings || []).map(item => ({
        // ສົ່ງ cateringItem_id ເທົ່ານັ້ນ (ບໍ່ເອົາ id ຂອງ Pivot table ໄປກວນ)
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