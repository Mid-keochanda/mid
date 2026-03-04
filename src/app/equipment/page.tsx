"use client";
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import axiosClient from '@/libs/axiosClient';
import { FiEdit2, FiTrash2, FiPlus, FiPackage, FiCalendar, FiClock, FiBox, FiSearch, FiTag, FiCheckSquare, FiSquare } from 'react-icons/fi';

const API_PATH = '/equipment'; 

export default function EquipmentPage() {
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const initialItemState = { id: null, item_name: "", unit: "", item_type: "equipment", total_quantity: 0 };
  const [currentItem, setCurrentItem] = useState<any>(initialItemState);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(API_PATH);
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setItems(data);
    } catch (error) {
      toast.error("ບໍ່ສາມາດໂຫລດຂໍ້ມູນໄດ້");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  // ຟັງຊັນແປງຮູບແບບວັນທີ (ຮອງຮັບທັງ CamelCase ແລະ SnakeCase)
  const formatDateTime = (item: any, type: 'create' | 'update') => {
    const dateVal = type === 'create' 
      ? (item.createdAt || item.created_at) 
      : (item.updatedAt || item.updated_at);

    if (!dateVal) return "---";

    return new Date(dateVal).toLocaleString('lo-LA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredItems = items.filter(item => 
    item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.unit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item_unit?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        item_name: currentItem.item_name,
        unit: currentItem.unit,
        item_type: currentItem.item_type,
        total_quantity: Number(currentItem.total_quantity) 
      };

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-900">
      <Toaster position="top-right" />
      
      <div className="max-w-full mx-auto space-y-6">
        {/* Header & Search */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col xl:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shrink-0">
              <FiPackage size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none">ສາງພັດສະດຸ</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Inventory Management</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
            <div className="relative w-full md:w-80">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="ຄົ້ນຫາອຸປະກອນ..."
                className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3.5 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setCurrentItem(initialItemState); setIsModalOpen(true); }}
              className="bg-slate-800 hover:bg-indigo-600 text-white px-15 py-1.5 rounded-2xl font-black transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase"
            >
              <FiPlus strokeWidth={5} /> ເພີ່ມໃໝ່
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[15px] font-black uppercase text-slate-400 tracking-widest border-b">
                  <th className="p-6">ID</th>
                  <th className="p-6">ຊື່ອຸປະກອນ</th>
                  <th className="p-6">ຫົວໜ່ວຍ</th>
                  <th className="p-6">ສະຖານະ</th>
                  <th className="p-6 text-center">ຈຳນວນ</th>
                  <th className="p-6">ວັນທີ ບັນທຶກ/ປັບປຸງ</th>
                  <th className="p-6 text-right">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-50/20 transition-all group">
                    <td className="p-6 font-mono text-[14px] text-slate-300 font-bold">#{item.id}</td>
                    
                    {/* ຊື່ອຸປະກອນ */}
                    <td className="p-6">
                      <div className="font-black text-slate-800 text-base flex items-center gap-2">
                        <FiTag className="text-indigo-300" size={14} /> {item.item_name}
                      </div>
                    </td>

                    {/* ຫົວໜ່ວຍ */}
                    <td className="p-6">
                      <div className="text-sm font-bold text-indigo-500 bg-indigo-50 px-4 py-2 rounded-xl inline-flex items-center gap-2 border border-indigo-100 whitespace-nowrap">
                        <FiBox size={14} /> 
                        {item.unit || item.item_unit || '-'}
                      </div>
                    </td>

                    {/* ປ່ຽນເປັນ ເອົາ/ບໍ່ເອົາ */}
                    <td className="p-6">
                      <span className={`text-[12px] font-black px-5 py-2 rounded-xl uppercase tracking-wider whitespace-nowrap inline-flex items-center justify-center min-w-[90px] ${
                        item.item_type === 'equipment' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-slate-200 text-slate-500'
                      }`}>
                        {item.item_type === 'equipment' ? 'ເອົາ' : 'ບໍ່ເອົາ'}
                      </span>
                    </td>

                    {/* ຈຳນວນ */}
                    <td className="p-6 text-center text-3xl font-black text-slate-900 leading-none">
                      {item.total_quantity ?? 0}
                    </td>

                    {/* ວັນທີສະແດງຜົນ */}
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[13px] font-bold text-slate-400">
                          <FiCalendar size={12}/> {formatDateTime(item, 'create')}
                        </div>
                        <div className="flex items-center gap-2 text-[13px] font-bold text-indigo-400">
                          <FiClock size={12}/> {formatDateTime(item, 'update')}
                        </div>
                      </div>
                    </td>

                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setCurrentItem(item); setIsModalOpen(true); }} className="p-2.5 text-amber-500 hover:bg-amber-50 rounded-xl border border-amber-100 bg-white shadow-sm">
                          <FiEdit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl border border-red-100 bg-white shadow-sm">
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

      {/* Modal - ປຸ່ມຕິກ ເອົາ/ບໍ່ເອົາ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl border border-white">
            <h2 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tighter">
               {currentItem.id ? '✏️ ແກ້ໄຂຂໍ້ມູນ' : '📦 ເພີ່ມລາຍການໃໝ່'}
            </h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">ຊື່ອຸປະກອນ</label>
                <input required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold focus:border-indigo-500 outline-none transition-all" 
                  value={currentItem.item_name || ""} onChange={e => setCurrentItem({...currentItem, item_name: e.target.value})} />
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">ເລືອກສະຖານະ (ປະເພດ)</label>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setCurrentItem({...currentItem, item_type: 'equipment'})}
                    className={`flex-1 py-5 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 border-2 ${
                      currentItem.item_type === 'equipment' 
                      ? 'bg-green-600 border-green-600 text-white shadow-lg' 
                      : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {currentItem.item_type === 'equipment' ? <FiCheckSquare size={20}/> : <FiSquare size={20}/>}
                    ເອົາ
                  </button>
                  <button 
                    type="button"
                    onClick={() => setCurrentItem({...currentItem, item_type: 'consumable'})}
                    className={`flex-1 py-5 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 border-2 ${
                      currentItem.item_type === 'consumable' 
                      ? 'bg-slate-400 border-slate-400 text-white shadow-lg' 
                      : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {currentItem.item_type === 'consumable' ? <FiCheckSquare size={20}/> : <FiSquare size={20}/>}
                    ບໍ່ເອົາ
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">ຫົວໜ່ວຍ</label>
                  <input required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold focus:border-indigo-500 outline-none" 
                    value={currentItem.unit || ""} onChange={e => setCurrentItem({...currentItem, unit: e.target.value})} />
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">ຈຳນວນ</label>
                  <input type="number" required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-black text-xl focus:border-indigo-500 outline-none" 
                    value={currentItem.total_quantity ?? 0} onChange={e => setCurrentItem({...currentItem, total_quantity: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-[1] bg-red-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-red-100 hover:bg-red-700 transition-all uppercase text-[15px] tracking-widest">ຍົກເລີກ</button>
                <button type="submit" className="flex-[1] bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase text-[15px] tracking-widest">
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