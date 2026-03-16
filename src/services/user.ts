import axiosClient from "../lib/axiosClient";
const API_URL = process.env.API_URL; 
export async function login(data: any) {
  try {
    const respone = await axiosClient.post(`${API_URL}/users/login`, data);
    if (respone) {
      return respone;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function insertUser(data: any) {
  try {
    const respone = await axiosClient.post(`${API_URL}/users`, data);
    if (respone) {
      return respone;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}
export async function getAllUser() {
  try {
    const data = await axiosClient.get(`${API_URL}/users`);
    if (data) {
      return data.data;
    }
  } catch (error) {
    console.log(error);
  }
}
export async function deleteUser(id: string) {
  try {
    const respone = await axiosClient.delete(API_URL + "/users/" + id);
    return respone;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function changePass(data: any) {
  try {
    const respone = await axiosClient.put(
      API_URL + "/users/changepass/" + data?.id,
      data
    );
    return respone;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

 
