"use client";
import { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import axiosClient from '@/libs/axiosClient';
import { 
  FiBox, FiPlus, FiEdit3, FiTrash2, FiSearch, 
  FiTag, FiLayers, FiDollarSign, FiChevronRight, FiHash
} from 'react-icons/fi';

const API_PATH = '/catering'; 

export default function CateringItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const initialItemState = { id: "", Name: "", Unit: "", price: "", isActive: true };
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...currentItem, price: String(currentItem.price) };
    try {
      if (currentItem.id) {
        await axiosClient.put(`${API_PATH}/${currentItem.id}`, payload);
        toast.success("ແກ້ໄຂສຳເລັດ");
      } else {
        await axiosClient.post(API_PATH, payload);
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

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F8F9FD] font-bold">ກຳລັງໂຫຼດ...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-6 lg:p-10 font-sans text-slate-600">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#108553] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <FiBox size={30} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#1A2233] tracking-tight">ຈັດການ <span className="text-[#108553]">ອາຫານ</span></h1>
              <div className="flex items-center gap-2 text-slate-400 text-[12px] font-bold uppercase tracking-widest mt-1">
                <span>Dashboard</span> <FiChevronRight /> <span>Catering Items</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                placeholder="ຄົ້ນຫາຊື່ ຫຼື ລະຫັດ..." 
                className="bg-white border border-slate-200 pl-11 pr-5 py-3 rounded-xl w-full md:w-72 shadow-sm focus:ring-2 focus:ring-emerald-500/10 outline-none text-sm font-medium transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setCurrentItem(initialItemState); setIsModalOpen(true); }}
              className="bg-[#101828] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md active:scale-95"
            >
              <FiPlus size={20} /> <span className="text-sm">ເພີ່ມໃໝ່</span>
            </button>
          </div>
        </div>

        {/* --- Table Section: ແຍກ ID ແລະ Name ອອກຈາກກັນ --- */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[15px] font-black uppercase text-slate-400 tracking-[0.1em]">ລະຫັດ (ID)</th>
                  <th className="px-8 py-5 text-[15px] font-black uppercase text-slate-400 tracking-[0.1em]">ຊື່ລາຍການ (NAME)</th>
                  <th className="px-8 py-5 text-[15px] font-black uppercase text-slate-400 tracking-[0.1em] text-center">ຫົວໜ່ວຍ</th>
                  <th className="px-8 py-5 text-[15px] font-black uppercase text-slate-400 tracking-[0.1em] text-center">ລາຄາ</th>
                  <th className="px-8 py-5 text-[15px] font-black uppercase text-slate-400 tracking-[0.1em] text-center">ສະຖານະ</th>
                  <th className="px-8 py-5 text-[15px] font-black uppercase text-slate-400 tracking-[0.1em] text-right">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="font-mono text-[15px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                        #{item.id}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm border border-emerald-100 uppercase">
                          {item.Name?.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700 text-base">{item.Name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-sm font-bold text-slate-500 bg-white border border-slate-100 px-3 py-1.5 rounded-lg shadow-sm">
                        {item.Unit}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="font-black text-slate-800 text-base">
                        {Number(item.price).toLocaleString()}
                        <span className="text-[10px] text-emerald-500 ml-1 uppercase">Kip</span>
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1.5 bg-[#E8F5EE] text-[#108553] px-3 py-1.5 rounded-full text-[12px] font-black border border-[#D1E9DB]">
                          <span className="w-1.5 h-1.5 bg-[#108553] rounded-full"></span> ເປີດໃຊ້
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-400 px-3 py-1.5 rounded-full text-[12px] font-black">
                          ປິດ
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setCurrentItem(item); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><FiEdit3 size={18} /></button>
                        <button onClick={() => deleteItem(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><FiTrash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- Modal Section --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#101828] p-6 text-white text-center">
              <h2 className="text-xl font-bold">{currentItem.id ? 'ແກ້ໄຂຂໍ້ມູນ' : 'ເພີ່ມລາຍການໃໝ່'}</h2>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-1">ຊື່ລາຍການ</label>
                <input required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 transition-all" 
                  value={currentItem.Name} onChange={e => setCurrentItem({...currentItem, Name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 ml-1">ຫົວໜ່ວຍ</label>
                  <input required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold text-sm text-center outline-none focus:border-emerald-500 transition-all" 
                    value={currentItem.Unit} onChange={e => setCurrentItem({...currentItem, Unit: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 ml-1">ລາຄາ</label>
                  <input type="number" required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-black text-sm text-center text-emerald-600 outline-none focus:border-emerald-500 transition-all" 
                    value={currentItem.price} onChange={e => setCurrentItem({...currentItem, price: e.target.value})} />
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <input type="checkbox" className="w-5 h-5 accent-[#108553] cursor-pointer" checked={currentItem.isActive} onChange={e => setCurrentItem({...currentItem, isActive: e.target.checked})} id="active-check"/>
                <label htmlFor="active-check" className="text-xs font-bold text-slate-500 cursor-pointer">ເປີດໃຊ້ງານລາຍການນີ້</label>
              </div>
               <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-[1] bg-red-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-red-100 hover:bg-red-700 transition-all uppercase text-[15px] tracking-widest">ຍົກເລີກ</button>
                <button type="submit" className="flex-[1] bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all uppercase text-[15px] tracking-widest">
                  ບັນທຶກຂໍ້ມູນ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}