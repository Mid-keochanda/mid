import axios from "axios";

const BASE_URL = "https://688c72ebcd9d22dda5cd2bde.mockapi.io/department";

export interface Department {
  id: string;
  department: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentPayload {
  department: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export async function getDepartments(): Promise<Department[]> {
  try {
    const response = await axios.get<Department[]>(BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching department data:", error);
    throw error;
  }
}

export async function createDepartment(
  data: DepartmentPayload
): Promise<Department> {
  try {
    const response = await axios.post<Department>(BASE_URL, data);
    return response.data;
  } catch (error) {
    console.error("Error creating department:", error);
    throw error;
  }
}

export async function updateDepartment(
  id: string | number,
  data: DepartmentPayload
): Promise<Department> {
  try {
    const response = await axios.put<Department>(`${BASE_URL}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating department:", error);
    throw error;
  }
}

export async function deleteDepartment(id: string): Promise<void> {
  try {
    await axios.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    console.error("Error deleting department:", error);
    throw error;
  }
}
