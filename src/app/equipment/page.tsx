"use client";
import { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import axiosClient from '@/lib/axiosClient';
import { 
  FiEdit2, FiTrash2, FiPlus, FiPackage, FiCalendar, 
  FiClock, FiBox, FiSearch, FiTag, FiCheckCircle, FiXCircle 
} from 'react-icons/fi';

const API_PATH = '/equipment'; 

export default function EquipmentPage() {
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // ປ່ຽນ item_type ມາໃຊ້ isActive (Boolean) ເພື່ອໃຫ້ຄືກັບ Catering
  const initialItemState = { id: null, item_name: "", unit: "", isActive: true, total_quantity: 0 };
  const [currentItem, setCurrentItem] = useState<any>(initialItemState);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(API_PATH);
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setItems(data);
    } catch (error) {
      toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const formatDateTime = (dateVal: any) => {
    if (!dateVal) return "---";
    const d = new Date(dateVal);
    return d.toLocaleDateString('lo-LA', { day: '2-digit', month: '2-digit', year: '2-digit' }) + 
           " " + d.toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredItems = items.filter(item => 
    item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.unit?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...currentItem, total_quantity: Number(currentItem.total_quantity) };
      if (currentItem.id) {
        await axiosClient.put(`${API_PATH}/${currentItem.id}`, payload);
        toast.success("ອັບເດດສຳເລັດ");
      } else {
        await axiosClient.post(API_PATH, payload);
        toast.success("ບັນທຶກສຳເລັດ");
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (error) {
      toast.error("ເກີດຂໍ້ຜິດພາດ");
    }
  };

  const handleDelete = async (item: any) => {
    if (!window.confirm(`ຢືນຢັນການລົບ: ${item.item_name}?`)) return;
    try {
      await axiosClient.delete(`${API_PATH}/${item.id}`);
      toast.success("ລົບແລ້ວ");
      fetchItems();
    } catch (error) {
      toast.error("ລົບບໍ່ສຳເລັດ");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-6 font-sans text-slate-900">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Section */}
        <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 rounded-xl text-white shadow-md flex-shrink-0">
              <FiPackage size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">ສາງພັດສະດຸ</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Inventory Control</p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto items-center">
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                placeholder="ຄົ້ນຫາອຸປະກອນ..."
                className="w-full bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 rounded-xl font-bold outline-none focus:border-slate-900 transition-all text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setCurrentItem(initialItemState); setIsModalOpen(true); }}
              className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-xs transition-all active:scale-95 shadow-sm"
            >
              <FiPlus size={16} strokeWidth={3} /> ເພີ່ມໃໝ່
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-100 tracking-widest">
                  <th className="py-3 px-4 w-16 text-center">ID</th>
                  <th className="py-3 px-4">ຊື່ອຸປະກອນ</th>
                  <th className="py-3 px-4 w-32">ຫົວໜ່ວຍ</th>
                  <th className="py-3 px-4 w-28 text-center">ສະຖານະ</th>
                  <th className="py-3 px-4 w-24 text-center">ຈຳນວນ</th>
                  <th className="py-3 px-4 w-40">ວັນທີສ້າງ</th>
                  <th className="py-3 px-4 w-40 text-indigo-600">ອັບເດດລ່າສຸດ</th>
                  <th className="py-3 px-4 w-24 text-center">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-2.5 px-4 text-center font-mono text-[11px] text-slate-300 font-bold">#{item.id}</td>
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-slate-800 text-[13px] flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                        <FiTag className="text-slate-300" size={12} /> {item.item_name}
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1.5 w-fit">
                        <FiBox size={11} /> {item.unit || item.item_unit || '-'}
                      </span>
                    </td>

                    {/* ປັບປຸງສະຖານະໃຫ້ຄືກັບ Catering */}
                    <td className="py-2.5 px-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        item.isActive || item.item_type === 'equipment' 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}>
                        {(item.isActive || item.item_type === 'equipment') ? <FiCheckCircle size={10}/> : <FiXCircle size={10}/>}
                        {(item.isActive || item.item_type === 'equipment') ? 'ເອົາ' : 'ບໍ່ເອົາ'}
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-center text-lg font-black text-slate-800 tabular-nums">
                      {item.total_quantity ?? 0}
                    </td>
                    <td className="py-2.5 px-4 text-[10px] font-bold text-slate-400 whitespace-nowrap">
                       <FiCalendar className="inline mr-1" size={11}/> {formatDateTime(item.createdAt || item.created_at)}
                    </td>
                    <td className="py-2.5 px-4 text-[10px] font-bold text-indigo-500 bg-indigo-50/30 whitespace-nowrap">
                       <FiClock className="inline mr-1" size={11}/> {formatDateTime(item.updatedAt || item.updated_at)}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex justify-center gap-1.5">
                        <button onClick={() => { setCurrentItem(item); setIsModalOpen(true); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <FiEdit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(item)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <FiTrash2 size={14} />
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

      {/* Modal - ປັບປຸງໃຫ້ເປັນ Toggle ເອົາ/ບໍ່ເອົາ ແບບດຽວກັບ Catering */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2 uppercase border-b pb-3">
              <div className="bg-slate-900 p-1.5 rounded-lg text-white shadow-sm"><FiPackage size={16}/></div>
              {currentItem.id ? 'ແກ້ໄຂພັດສະດຸ' : 'ເພີ່ມພັດສະດຸໃໝ່'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">ຊື່ອຸປະກອນ</label>
                <input required className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-[13px] font-bold text-slate-900 outline-none focus:border-slate-900 transition-all shadow-sm" 
                  value={currentItem.item_name || ""} onChange={e => setCurrentItem({...currentItem, item_name: e.target.value})} />
              </div>

              {/* ປັບເປັນ Toggle Switch ແບບ Catering */}
              <div 
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  (currentItem.isActive || currentItem.item_type === 'equipment') ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}
                onClick={() => setCurrentItem({...currentItem, isActive: !currentItem.isActive, item_type: currentItem.isActive ? 'consumable' : 'equipment'})}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">ສະຖານະການເລືອກ</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                    {(currentItem.isActive || currentItem.item_type === 'equipment') ? 'ເອົາ' : 'ບໍ່ເອົາ'}
                  </span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${ (currentItem.isActive || currentItem.item_type === 'equipment') ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${ (currentItem.isActive || currentItem.item_type === 'equipment') ? 'left-6' : 'left-1'}`}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">ຫົວໜ່ວຍ</label>
                  <input required className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-[13px] font-bold text-slate-900 outline-none" 
                    value={currentItem.unit || currentItem.item_unit || ""} onChange={e => setCurrentItem({...currentItem, unit: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">ຈຳນວນ</label>
                  <input type="number" required className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-[13px] font-bold text-slate-900 outline-none" 
                    value={currentItem.total_quantity ?? 0} onChange={e => setCurrentItem({...currentItem, total_quantity: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border border-slate-200 text-slate-500 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all uppercase tracking-widest">ຍົກເລີກ</button>
                <button type="submit" className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all uppercase tracking-widest">ບັນທຶກ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}