
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import axiosClient from '@/lib/axiosClient';

const API_BASE = 'http://localhost:5000/api'; // ແນ່ໃຈວ່າ Port ນີ້ຖືກກັບ Backend
const API_PATH = '/equipment'; 

export function useEquipment() {
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const initialItemState = { 
    id: null, item_name: "", unit: "", isActive: true, total_quantity: 0 
  };
  const [currentItem, setCurrentItem] = useState<any>(initialItemState);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      // ໃຊ້ axiosClient ທີ່ຕັ້ງຄ່າ baseURL ໄວ້ແລ້ວ
      const res = await axiosClient.get(API_PATH);
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setItems(data);
    } catch (error) {
      toast.error("ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const statusValue = currentItem.isActive ? 1 : 0;
      
      // ✅ Payload ທີ່ສົ່ງໄປຫາ Backend
      const payload = { 
        item_name: currentItem.item_name,
        unit: currentItem.unit,
        total_quantity: Number(currentItem.total_quantity),
        is_active: statusValue, 
        isActive: statusValue,  
        status: statusValue     
      };

      console.log("📤 Sending Payload:", payload);

      if (currentItem.id) {
        // 🚩 ກໍລະນີແກ້ໄຂ (PUT)
        // ໝາຍເຫດ: ຖ້າ axiosClient ມີ baseURL ແລ້ວ ໃຫ້ໃຊ້ `${API_PATH}/${currentItem.id}`
        await axiosClient.put(`${API_PATH}/${currentItem.id}`, payload);
        toast.success("ອັບເດດສຳເລັດແລ້ວ!");
      } else {
        // 🚩 ກໍລະນີເພີ່ມໃໝ່ (POST)
        await axiosClient.post(API_PATH, payload);
        toast.success("ເພີ່ມພັດສະດຸໃໝ່ສຳເລັດ!");
      }

      setIsModalOpen(false);
      fetchItems(); // Refresh list
    } catch (error: any) {
      console.error("❌ Error Update:", error);
      const msg = error.response?.data?.message || "ຍັງປ່ຽນບໍ່ໄດ້!";
      toast.error(msg);
    }
  };

  const openEditModal = (item: any) => {
    // ✅ ແປງຄ່າກ່ອນເປີດ Modal ເພື່ອໃຫ້ Switch ເປັນ True/False ຖືກຕ້ອງ
    const dbStatus = item.is_active ?? item.isActive ?? item.status;
    setCurrentItem({ 
      ...item, 
      isActive: dbStatus == 1 || dbStatus == true 
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setCurrentItem(initialItemState);
    setIsModalOpen(true);
  };

  const handleDelete = async (item: any) => {
    if (!window.confirm(`ຢືນຢັນການລົບ: ${item.item_name}?`)) return;
    try {
      await axiosClient.delete(`${API_PATH}/${item.id}`);
      toast.success("ລົບສຳເລັດ");
      fetchItems();
    } catch (error) {
      toast.error("ລົບບໍ່ໄດ້");
    }
  };

  const filteredItems = items.filter(item => 
    item.item_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    searchTerm, setSearchTerm, loading, isModalOpen, setIsModalOpen,
    currentItem, setCurrentItem, filteredItems, handleSave, handleDelete,
    openAddModal, openEditModal
  };
}