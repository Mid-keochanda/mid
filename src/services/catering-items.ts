import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import axiosClient from '@/lib/axiosClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const API_PATH = '/catering'; 

export function useCateringLogic() {
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State ເບື້ອງຕົ້ນ
  const initialItemState = { 
    id: null, 
    Name: "", 
    Unit: "", 
    isActive: true 
  };
  const [currentItem, setCurrentItem] = useState<any>(initialItemState);

  // --- 1. ດຶງຂໍ້ມູນ (Fetch Data) ---
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`${API_URL}${API_PATH}`);
      
      // ຮອງຮັບທັງ Array ກົງໆ ຫຼື { data: [] }
      const rawData = Array.isArray(res.data) 
        ? res.data 
        : (res.data.data || res.data.items || []);
      
      // Mapping ຂໍ້ມູນໃຫ້ເປັນ Standard format
      const formattedData = rawData.map((item: any) => ({
        ...item,
        id: item.id || item.item_id,
        Name: item.Name || item.item_name || "",
        Unit: item.Unit || item.unit || "-",
        isActive: item.isActive === true || item.isActive === 1,
        updatedAt: item.updatedAt || item.updated_at
      }));

      setItems(formattedData);
    } catch (error: any) {
      console.error("Fetch Catering Error:", error);
      toast.error("ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // --- 2. ບັນທຶກຂໍ້ມູນ (Save / Update) ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation ເບື້ອງຕົ້ນ
    if (!currentItem.Name.trim()) return toast.error("ກະລຸນາໃສ່ຊື່ລາຍການ");

    try {
      const payload = { 
        Name: currentItem.Name.trim(),
        Unit: currentItem.Unit.trim(),
        isActive: currentItem.isActive ? 1 : 0 
      };

      if (currentItem.id) {
        // ແກ້ໄຂ
        await axiosClient.put(`${API_URL}${API_PATH}/${currentItem.id}`, payload);
        toast.success("ອັບເດດສຳເລັດ!");
      } else {
        // ເພີ່ມໃໝ່
        await axiosClient.post(`${API_URL}${API_PATH}`, payload);
        toast.success("ເພີ່ມລາຍການໃໝ່ສຳເລັດ!");
      }

      setIsModalOpen(false);
      fetchItems(); // Refresh ຂໍ້ມູນ
    } catch (error: any) {
      const msg = error.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ";
      toast.error(msg);
    }
  };

  // --- 3. Modal Control ---
  const openEditModal = (item: any) => {
    setCurrentItem({ 
      ...item, 
      isActive: item.isActive === true || item.isActive === 1 
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setCurrentItem(initialItemState);
    setIsModalOpen(true);
  };

  // --- 4. ລຶບຂໍ້ມູນ (Delete) ---
  const handleDelete = async (id: any) => {
    if (!window.confirm(`ຢືນຢັນການລຶບ ID: ${id}?`)) return;
    try {
      await axiosClient.delete(`${API_URL}${API_PATH}/${id}`);
      toast.success("ລຶບສຳເລັດ");
      fetchItems();
    } catch (error) {
      toast.error("ລຶບບໍ່ສຳເລັດ");
    }
  };

  // --- 5. Search Filter ---
  const filteredItems = items.filter(item => 
    item.Name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.id?.toString().includes(searchTerm)
  );

  return {
    searchTerm, setSearchTerm, loading, isModalOpen, setIsModalOpen,
    currentItem, setCurrentItem, filteredItems, handleSave, handleDelete,
    openAddModal, openEditModal
  };
}