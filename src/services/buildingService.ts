import axios from 'axios';

// ตรวจสอบ IP ให้ตรงกับใน Postman (ห้ามมีภาษาไทย/ลาวในบรรทัดนี้)
const API_URL = 'http://172.18.9.181:5000/api'; 

export const getBuildings = () => axios.get(API_URL);
export const createBuilding = (data: any) => axios.post(API_URL, data);
export const updateBuilding = (id: any, data: any) => axios.put(`${API_URL}/${id}`, data);
export const deleteBuilding = (id: string) => axios.delete(`${API_URL}/${id}`);