"use client";
import { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import axiosClient from '@/lib/axiosClient';
import { 
  FiBox, FiPlus, FiEdit2, FiTrash2, FiSearch, 
  FiCalendar, FiClock 
} from 'react-icons/fi';

const API_PATH = '/catering'; 

export default function CateringItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const initialItemState = { id: "", Name: "", Unit: "", isActive: true };
  const [currentItem, setCurrentItem] = useState<any>(initialItemState);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(API_PATH);
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setItems(data);
    } catch (error: any) {
      toast.error("ບໍ່ສາມາດດຶງຂໍ້ມູນໄດ້");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const formatDateTime = (dateVal: any) => {
    if (!dateVal) return "-";
    const d = new Date(dateVal);
    const date = d.toLocaleDateString('en-GB').replace(/\//g, '-');
    const time = d.toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' });
    return `${date} ${time}`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentItem.id) {
        await axiosClient.put(`${API_PATH}/${currentItem.id}`, currentItem);
        toast.success("ແກ້ໄຂສຳເລັດ");
      } else {
        await axiosClient.post(API_PATH, currentItem);
        toast.success("ເພີ່ມສຳເລັດ");
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (error: any) {
      toast.error("ເກີດຂໍ້ຜິດພາດ");
    }
  };

  const deleteItem = async (id: any) => {
    if(window.confirm(`ຢືນຢັນການລຶບ ID: ${id}?`)) {
      try {
        await axiosClient.delete(`${API_PATH}/${id}`);
        toast.success("ລຶບສຳເລັດ");
        fetchItems();
      } catch (error: any) {
        toast.error("ລຶບບໍ່ສຳເລັດ");
      }
    }
  };

  const filteredItems = items.filter(item => 
    item.Name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.id?.toString().includes(searchQuery)
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 text-slate-700 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto space-y-4">
        {/* --- Header --- */}
        <div className="bg-white px-5 py-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-white shadow-md">
              <FiBox size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">ຈັດການລາຍການ Catering</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Catering System Management</p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                placeholder="ຄົ້ນຫາລາຍການ..."
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 rounded-lg outline-none focus:bg-white focus:border-blue-500 text-sm transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setCurrentItem(initialItemState); setIsModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm shadow-md transition-all active:scale-95"
            >
              <FiPlus size={16} /> ເພີ່ມໃໝ່
            </button>
          </div>
        </div>

        {/* --- Table --- */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[1050px]">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-4 px-4 w-[70px] text-center">ID</th>
                  <th className="py-4 px-4 w-[300px]">ຊື່ລາຍການ</th>
                  <th className="py-4 px-4 w-[110px]">ຫົວໜ່ວຍ</th>
                  <th className="py-4 px-4 w-[110px] text-center">ສະຖານະ</th>
                  <th className="py-4 px-4 w-[170px]">ວັນທີບັນທຶກ</th>
                  <th className="py-4 px-4 w-[170px]">ອັບເດດລ່າສຸດ</th>
                  <th className="py-4 px-4 w-[100px] text-center">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-400">#{item.id}</td>
                    
                    {/* ຊື່ລາຍການ: ປັບເປັນສີດຳເຂັ້ມ ແລະ ໜາ */}
                    <td className="py-3.5 px-4">
                      <div className="text-[14px] font-bold text-slate-900 truncate" title={item.Name}>
                        {item.Name}
                      </div>
                    </td>

                    {/* ຫົວໜ່ວຍ: ປັບເປັນສີດຳເຂັ້ມ ແລະ ໜາ */}
                    <td className="py-3.5 px-4">
                      <div className="text-[13px] font-bold text-slate-900">
                        {item.Unit || '-'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                        item.isActive 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}>
                        {item.isActive ? 'ເປີດໃຊ້' : 'ປິດ'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <FiCalendar className="text-slate-300" size={12}/> {formatDateTime(item.createdAt)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-[11px] text-blue-500 font-semibold flex items-center gap-1.5">
                        <FiClock className="text-blue-300" size={12}/> {formatDateTime(item.updatedAt)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => { setCurrentItem(item); setIsModalOpen(true); }} 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-all border border-transparent hover:border-blue-100"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button 
                          onClick={() => deleteItem(item.id)} 
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-all border border-transparent hover:border-red-100"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-slate-900 mb-5 border-b pb-2">
              {currentItem.id ? 'ແກ້ໄຂຂໍ້ມູນ' : 'ເພີ່ມລາຍການໃໝ່'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase tracking-wide">ຊື່ລາຍການ</label>
                <input required className="w-full border border-slate-200 bg-slate-50 px-3 py-2 rounded-lg text-sm outline-none focus:bg-white focus:border-blue-500 font-bold text-slate-900 transition-all" 
                  value={currentItem.Name} onChange={e => setCurrentItem({...currentItem, Name: e.target.value})} />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase tracking-wide">ຫົວໜ່ວຍ</label>
                <input required className="w-full border border-slate-200 bg-slate-50 px-3 py-2 rounded-lg text-sm outline-none focus:bg-white focus:border-blue-500 font-bold text-slate-900 transition-all" 
                  value={currentItem.Unit} onChange={e => setCurrentItem({...currentItem, Unit: e.target.value})} />
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setCurrentItem({...currentItem, isActive: !currentItem.isActive})}>
                <input type="checkbox" className="w-4 h-4 accent-blue-600 cursor-pointer" checked={currentItem.isActive} readOnly />
                <label className="text-xs font-bold text-slate-600 cursor-pointer">ເປີດໃຊ້ງານລາຍການນີ້</label>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border border-slate-300 text-slate-500 py-2 rounded-lg text-xs font-bold uppercase">ຍົກເລີກ</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold uppercase shadow-lg shadow-blue-100">ບັນທຶກ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}