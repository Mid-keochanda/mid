import axiosClient from "../lib/axiosClient";

// ໃຊ້ NEXT_PUBLIC ເພື່ອໃຫ້ໃຊ້ໄດ້ທັງ Client ແລະ Server
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function login(data: any) {
  try {
    const response = await axiosClient.post(`${API_URL}/users/login`, data);
    return response.data;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
}

export async function getAllUser() {
  try {
    const response = await axiosClient.get(`${API_URL}/users`);
    // ກວດສອບໂຄງສ້າງຂໍ້ມູນທີ່ສົ່ງມາຈາກ Backend
    return response.data.data || response.data.users || response.data;
  } catch (error) {
    console.error("Get Users Error:", error);
    return [];
  }
}

export async function insertUser(data: any) {
  try {
    const response = await axiosClient.post(`${API_URL}/users`, data);
    return response.data;
  } catch (error) {
    console.error("Insert User Error:", error);
    throw error;
  }
}

export async function updateUser(id: string, data: any) {
  try {
    const response = await axiosClient.put(`${API_URL}/users/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update User Error:", error);
    throw error;
  }
}

export async function deleteUser(id: string) {
  try {
    const response = await axiosClient.delete(`${API_URL}/users/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete User Error:", error);
    throw error;
  }
}