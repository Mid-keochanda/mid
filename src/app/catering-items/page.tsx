"use client";
import { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import axiosClient from '@/lib/axiosClient';
import { 
  FiBox, FiPlus, FiEdit2, FiTrash2, FiSearch, 
  FiClock, FiCheckCircle, FiXCircle 
} from 'react-icons/fi';

// ==========================================
// 1. ນີ້ຄື Hook Logic (ລວມໄວ້ບ່ອນດຽວກັນເລີຍ)
// ==========================================
const API_PATH = '/catering'; 

function useCateringLogic() {
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const initialItemState = { id: null, Name: "", Unit: "", isActive: true };
  const [currentItem, setCurrentItem] = useState<any>(initialItemState);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { 
        Name: currentItem.Name,
        Unit: currentItem.Unit,
        isActive: currentItem.isActive ? 1 : 0 
      };

      if (currentItem.id) {
        await axiosClient.put(`${API_PATH}/${currentItem.id}`, payload);
        toast.success("ອັບເດດສຳເລັດ!");
      } else {
        await axiosClient.post(API_PATH, payload);
        toast.success("ເພີ່ມສຳເລັດ!");
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (error) {
      toast.error("ເກີດຂໍ້ຜິດພາດ");
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
    if (!window.confirm(`ຢືນຢັນການລຶບ ID: ${id}?`)) return;
    try {
      await axiosClient.delete(`${API_PATH}/${id}`);
      toast.success("ລຶບສຳເລັດ");
      fetchItems();
    } catch (error) {
      toast.error("ລຶບບໍ່ສຳເລັດ");
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

// ==========================================
// 2. ນີ້ຄື UI Page
// ==========================================
export default function CateringItemsPage() {
  const {
    searchTerm, setSearchTerm, loading, isModalOpen, setIsModalOpen,
    currentItem, setCurrentItem, filteredItems, handleSave, handleDelete,
    openAddModal, openEditModal
  } = useCateringLogic();

  const formatDateTime = (dateVal: any) => {
    if (!dateVal) return "-";
    const d = new Date(dateVal);
    return d.toLocaleString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).replace(',', '');
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-700 font-sans antialiased">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2.5 rounded-lg text-white">
              <FiBox size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">ຈັດການລາຍການ Catering</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Inventory System</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="ຄົ້ນຫາ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-slate-900 font-bold text-sm transition-all"
              />
            </div>
            <button 
              onClick={openAddModal}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg"
            >
              <FiPlus size={18} /> ເພີ່ມໃໝ່
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 text-[15px] font-black uppercase text-slate-500 border-b border-slate-200">
                  <th className="py-1 px-5 text-center w-24">ID</th>
                  <th className="py-1 px-3">ຊື່ລາຍການ</th>
                  <th className="py-1 px-3 text-center">ຫົວໜ່ວຍ</th>
                  <th className="py-1 px-3 text-center">ສະຖານະ</th>
                  <th className="py-1 px-3">ອັບເດດລ່າສຸດ</th>
                  <th className="py-1 px-5 text-center">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-all">
                    <td className="py-1 px-6 text-center font-mono text-slate-400 text-[11px] font-bold">#{item.id}</td>
                    <td className="py-1 px-4 font-bold text-slate-800 text-[15px]">{item.Name}</td>
                    <td className="py-1 px-4 text-center">
                      <span className="bg-slate-100 px-3 py-1 rounded-lg text-[12px] font-bold text-slate-600">
                        {item.Unit}
                      </span>
                    </td>
                    <td className="py-1 px-3 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                        item.isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}>
                        {item.isActive ? <FiCheckCircle size={14}/> : <FiXCircle size={14}/>}
                        {item.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </td>
                    <td className="py-1 px-3">
                      <div className="text-[11px] font-bold text-blue-600 bg-blue-50/50 px-2 py-1 rounded border border-blue-100 w-fit flex items-center gap-1.5">
                        <FiClock size={14}/> {formatDateTime(item.updatedAt)}
                      </div>
                    </td>
                    <td className="py-1 px-5 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEditModal(item)} className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"><FiEdit2 size={16}/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><FiTrash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black mb-6 text-slate-800">
              {currentItem.id ? 'ແກ້ໄຂລາຍການ' : 'ເພີ່ມລາຍການໃໝ່'}
            </h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ຊື່ລາຍການ</label>
                <input required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none focus:border-slate-900 font-bold text-sm transition-all" 
                  value={currentItem.Name} onChange={e => setCurrentItem({...currentItem, Name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ຫົວໜ່ວຍ</label>
                <input required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none focus:border-slate-900 font-bold text-sm transition-all" 
                  value={currentItem.Unit} onChange={e => setCurrentItem({...currentItem, Unit: e.target.value})} />
              </div>

              <div 
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  currentItem.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}
                onClick={() => setCurrentItem({...currentItem, isActive: !currentItem.isActive})}
              >
                <span className="text-sm font-bold text-slate-700">ສະຖານະ</span>
                <div className={`w-12 h-6 rounded-full relative transition-colors ${currentItem.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${currentItem.isActive ? 'left-7' : 'left-1'}`}></div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl font-bold">ຍົກເລີກ</button>
                <button type="submit" className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg">ບັນທຶກ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}