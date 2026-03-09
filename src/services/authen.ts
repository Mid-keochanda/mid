import axios from "axios";

const API = axios.create({
  baseURL: 'http://172.18.9.166:5000/api', 
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
  actual_end_time?: string | null; 
  status: 'Pending' | 'Approved' | 'Rejected';
  is_recurring: boolean | number; 
  recur_pattern: 'none' | 'daily' | 'weekly' | 'monthly';
  attendeeCount: number;
  equipments?: { equipment_id: number; quantity: number }[];
  caterings?: { catering_item_id: number; quantity: number }[]; 
  
  room?: { room_name: string };
  user?: { full_name: string };
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
      // ✅ ປ່ຽນເປັນ /equipment (ເອກະພົດ) ຕາມ Controller ຂອງເຈົ້າ
      const res = await API.get("/equipment"); 
      // ✅ Backend ສົ່ງມາເປັນ Array ເລີຍ, ບໍ່ຕ້ອງຜ່ານ .data.data
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("Error fetching equipment:", error);
      return [];
    }
  },

  getCateringItems: async () => {
    try {
      // ✅ ປ່ຽນເປັນ /catering ຕາມ Controller ທີ່ເຈົ້າສົ່ງມາ
      const res = await API.get("/catering"); 
      // ✅ ດຶງ res.data ອອກໄປໂດຍກົງ ເພາະ Backend ສົ່ງ items ມາເປັນ Array ເລີຍ
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("Error fetching catering items:", error);
      return [];
    }
  },

  create: (data: Booking) => {
    const payload = {
      ...data,
      is_recurring: data.is_recurring ? 1 : 0
    };
    return API.post("/bookings", payload);
  },

  update: (id: number | string, data: Booking) => {
    if (!id) {
      console.error("❌ Update Error: ບໍ່ມີ ID ສົ່ງມາ");
      return Promise.reject(new Error("Missing Booking ID"));
    }
    const { booking_id, id: _, room, user, booking_equipments, booking_caterings, ...rest } = data as any; 
    
    const payload = {
      ...rest,
      is_recurring: rest.is_recurring ? 1 : 0,
      recur_pattern: rest.recur_pattern || 'none'
    };
    
    return API.put(`/bookings/${id}`, payload);
  },

  delete: (id: number | string) => API.delete(`/bookings/${id}`),
};

export default API;