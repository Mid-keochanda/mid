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
  room_id: number;
  user_id: number;
  title: string;
  start_time: string; 
  end_time: string;   
  status: 'Pending' | 'Approved' | 'Rejected';
  is_recurring: boolean;
  recur_pattern: 'none' | 'daily' | 'weekly' | 'monthly';
  attendeeCount: number; 
}

// --- Functions ---

// ຟັງຊັນ Login (ໂຕເດີມຂອງທ່ານ)
export async function login(data: any): Promise<LoginResponse> {
  const response = await API.post<LoginResponse>("/users/login", data);
  if (response.data.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }
  return response.data;
}

// ຟັງຊັນຈັດການຂໍ້ມູນການຈອງ (Booking Service)
export const bookingService = {
  getAll: () => API.get("/bookings"),
  
  // ດຶງຂໍ້ມູນຫ້ອງ ແລະ ຈັດການໃຫ້ເປັນ Array
  getRooms: async () => {
    const res = await API.get("/rooms");
    return Array.isArray(res.data) ? res.data : res.data.data || [];
  },

  // ດຶງຂໍ້ມູນຜູ້ໃຊ້ (ສຳລັບເອົາມາໃສ່ໃນ Dropdown)
  getUsers: async () => {
    const res = await API.get("/users");
    return Array.isArray(res.data) ? res.data : res.data.data || [];
  },

  create: (data: Booking) => API.post("/bookings", data),
  update: (id: number, data: Booking) => API.put(`/bookings/${id}`, data),
  delete: (id: number) => API.delete(`/bookings/${id}`),
};

export default API;