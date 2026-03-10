"use client";
import { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import axiosClient from '@/lib/axiosClient';
import { 
  FiBox, FiPlus, FiEdit2, FiTrash2, FiSearch, 
  FiCalendar, FiClock, FiCheckCircle, FiXCircle 
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
      <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 text-slate-700 font-sans antialiased">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto space-y-4">
        {/* --- Header --- */}
        <div className="bg-white px-5 py-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg text-white shadow-md">
              <FiBox size={20} />
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
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 rounded-lg outline-none focus:bg-white focus:border-slate-900 text-sm transition-all shadow-sm font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setCurrentItem(initialItemState); setIsModalOpen(true); }}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 text-sm shadow-md transition-all active:scale-95"
            >
              <FiPlus size={16} /> ເພີ່ມລາຍການ
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
                  <th className="py-4 px-4 w-[120px]">ຫົວໜ່ວຍ</th>
                  <th className="py-4 px-4 w-[120px] text-center">ສະຖານະ</th>
                  <th className="py-4 px-4 w-[180px]">ວັນທີບັນທຶກ</th>
                  <th className="py-4 px-4 w-[180px] text-blue-600">ອັບເດດລ່າສຸດ</th>
                  <th className="py-4 px-4 w-[100px] text-center">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-4 text-center font-mono text-[11px] text-slate-400 font-bold">#{item.id}</td>
                    
                    <td className="py-4 px-4">
                      <div className="text-[14px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.Name}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-[13px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                        {item.Unit || '-'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                        item.isActive 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}>
                        {item.isActive ? <FiCheckCircle size={12}/> : <FiXCircle size={12}/>}
                        {item.isActive ? 'ເອົາ' : 'ບໍ່ເອົາ'}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                        <FiCalendar size={12}/> {formatDateTime(item.createdAt)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-[11px] font-bold text-blue-600 flex items-center gap-1.5 bg-blue-50/50 w-fit px-2 py-0.5 rounded border border-blue-100">
                        <FiClock size={12}/> {formatDateTime(item.updatedAt)}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button 
                          onClick={() => { setCurrentItem(item); setIsModalOpen(true); }} 
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button 
                          onClick={() => deleteItem(item.id)} 
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <FiTrash2 size={16} />
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <div className="p-2 bg-slate-900 text-white rounded-lg shadow-sm">
                <FiBox size={18} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                {currentItem.id ? 'ແກ້ໄຂຂໍ້ມູນ' : 'ເພີ່ມລາຍການໃໝ່'}
              </h2>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-widest ml-1">ຊື່ລາຍການ Catering</label>
                <input 
                  required 
                  className="w-full border border-slate-200 bg-slate-50 px-4 py-2.5 rounded-xl text-sm outline-none focus:bg-white focus:border-slate-900 font-bold text-slate-900 transition-all shadow-sm" 
                  placeholder="ລະບຸຊື່ລາຍການ..."
                  value={currentItem.Name} 
                  onChange={e => setCurrentItem({...currentItem, Name: e.target.value})} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 mb-1 block uppercase tracking-widest ml-1">ຫົວໜ່ວຍ (Unit)</label>
                <input 
                  required 
                  className="w-full border border-slate-200 bg-slate-50 px-4 py-2.5 rounded-xl text-sm outline-none focus:bg-white focus:border-slate-900 font-bold text-slate-900 transition-all shadow-sm" 
                  placeholder="ເຊັ່ນ: ຈານ, ກ່ອງ, ຄົນ..."
                  value={currentItem.Unit} 
                  onChange={e => setCurrentItem({...currentItem, Unit: e.target.value})} 
                />
              </div>

              {/* Toggle ສະຖານະ ເອົາ/ບໍ່ເອົາ */}
              <div 
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  currentItem.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}
                onClick={() => setCurrentItem({...currentItem, isActive: !currentItem.isActive})}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">ສະຖານະການເລືອກ</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    {currentItem.isActive ? 'ເອົາ' : 'ບໍ່ເອົາ'}
                  </span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${currentItem.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${currentItem.isActive ? 'left-6' : 'left-1'}`}></div>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-50 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 bg-white border border-slate-200 text-slate-500 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  ຍົກເລີກ
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all"
                >
                  ບັນທຶກ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}