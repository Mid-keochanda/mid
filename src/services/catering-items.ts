import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import axiosClient from '@/lib/axiosClient';

const API_PATH = '/catering'; 

export function useCatering() {
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const initialItemState = { 
    id: null, 
    Name: "", 
    Unit: "", 
    isActive: true 
  };
  const [currentItem, setCurrentItem] = useState<any>(initialItemState);

  // ดึงข้อมูล
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
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

  // บันทึกข้อมูล
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ປັບ Payload ໃຫ້ກົງກັບ JSON ທີ່ Backend ຕ້ອງການ
      const payload = { 
        Name: currentItem.Name,
        Unit: currentItem.Unit,
        isActive: currentItem.isActive ? 1 : 0 // ສົ່ງເປັນ 1 ຫຼື 0 ຕາມມາດຕະຖານ DB
      };

      if (currentItem.id) {
        await axiosClient.put(`${API_PATH}/${currentItem.id}`, payload);
        toast.success("ອັບເດດສຳເລັດ!");
      } else {
        await axiosClient.post(API_PATH, payload);
        toast.success("ເພີ່ມລາຍການໃໝ່ສຳເລັດ!");
      }

      setIsModalOpen(false);
      fetchItems(); 
    } catch (error: any) {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ");
    }
  };

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

  const handleDelete = async (id: any) => {
    if (!window.confirm(`ຢືນຢັນການລົບ ID: ${id}?`)) return;
    try {
      await axiosClient.delete(`${API_PATH}/${id}`);
      toast.success("ລົບສຳເລັດ");
      fetchItems();
    } catch (error) {
      toast.error("ລົບບໍ່ໄດ້");
    }
  };

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