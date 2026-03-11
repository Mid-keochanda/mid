"use client";
import { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { equipmentService } from '@/services/equipment'; 
import { FiBox, FiPlus, FiEdit2, FiTrash2, FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiSearch } from 'react-icons/fi';

export default function EquipmentPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- ສ່ວນທີ່ເພີ່ມໃໝ່: State ສຳລັບການຄົ້ນຫາ ---
  const [searchTerm, setSearchTerm] = useState("");

  const initialForm = { 
    id: null, 
    item_name: "", 
    unit: "", 
    total_quantity: 0, 
    item_type: "consumable" 
  };
  const [formData, setFormData] = useState<any>(initialForm);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await equipmentService.getAll();
      const data = Array.isArray(res) ? res : (res.data || []);
      setItems(data);
    } catch (error) {
      toast.error("ໂຫຼດຂໍ້ມູນບໍ່ໄດ້");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // --- ສ່ວນທີ່ເພີ່ມໃໝ່: Logic ການ Filter ຂໍ້ມູນ ---
  const filteredItems = items.filter(item => 
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id?.toString().includes(searchTerm)
  );

  const formatDateTime = (dateVal: any) => {
    if (!dateVal) return "-";
    const d = new Date(dateVal);
    return d.toLocaleString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }).replace(',', '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { 
        item_name: formData.item_name,
        unit: formData.unit,
        total_quantity: Number(formData.total_quantity),
        item_type: formData.item_type 
      };

      if (formData.id) {
        await equipmentService.update(formData.id, payload);
        toast.success("ແກ້ໄຂສຳເລັດ");
      } else {
        await equipmentService.create(payload);
        toast.success("ເພີ່ມສຳເລັດ");
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (error) {
      toast.error("ບັນທຶກບໍ່ໄດ້");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans antialiased text-slate-700">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-blue-300 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-900 p-2.5 rounded-lg text-white shadow-md">
              <FiBox size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">ຈັດການພັດສະດຸ</h1>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Inventory Management System</p>
            </div>
          </div>

          {/* --- ສ່ວນທີ່ເພີ່ມໃໝ່: ຊ່ອງຄົ້ນຫາ ແລະ ປຸ່ມເພີ່ມ --- */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="ຄົ້ນຫາຊື່ອຸປະກອນ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-blue-50 border border-blue-200 pl-10 pr-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-blue-900 font-medium text-sm transition-all"
              />
            </div>
            <button 
              onClick={() => { setFormData(initialForm); setIsModalOpen(true); }}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-slate-200 whitespace-nowrap"
            >
              <FiPlus size={18} /> ເພີ່ມໃໝ່
            </button>
          </div>
        </div>

        {/* Table Area - ໃຊ້ filteredItems ແທນ items */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-blue-50/80 text-[15px] font-bold uppercase text-blue-500 border-b border-blue-200">
                  <th className="py-2 px-6 text-center w-24">ID</th>
                  <th className="py-2 px-4">ລາຍການອຸປະກອນ</th>
                  <th className="py-2 px-4 text-center">ຈຳນວນ</th>
                  <th className="py-2 px-4 text-center">ຫົວໜ່ວຍ</th>
                  <th className="py-2 px-4 text-center">ສະຖານະ</th>
                  <th className="py-2 px-4">ວັນທີບັນທຶກ</th>
                  <th className="py-2 px-4">ອັບເດດລ່າສຸດ</th>
                  <th className="py-2 px-6 text-center">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="py-1 px-5 text-center font-mono text-slate-400 text-xs">#{item.id}</td>
                      <td className="py-1 px-3 font-semibold text-slate-700 text-sm">{item.item_name}</td>
                      <td className="py-1 px-3 text-center">
                        <span className="inline-block min-w-[20px] py-1 px-2 rounded-lg font-bold text-[13px] text-blue-600 bg-blue-50/50 border border-blue-100">
                          {item.total_quantity}
                        </span>
                      </td>
                      <td className="py-1 px-3 text-center font-medium text-slate-500 text-sm">{item.unit}</td>
                      <td className="py-1 px-3 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold border uppercase ${
                          item.item_type === 'consumable' 
                          ? 'bg-emerald-60 border-emerald-300 text-emerald-700' 
                          : 'bg-slate-60 border-slate-300 text-slate-700'
                        }`}>
                          {item.item_type === 'consumable' ? <FiCheckCircle size={13}/> : <FiXCircle size={13}/>}
                          {item.item_type === 'consumable' ? 'ເອົາ' : 'ບໍ່ເອົາ'}
                        </div>
                      </td>
                      <td className="py-1 px-3">
                        <div className="text-[11px] text-slate-600 flex items-center gap-1.5 whitespace-nowrap">
                          <FiCalendar className="text-slate-400" size={14}/> {formatDateTime(item.createdAt)}
                        </div>
                      </td>
                      <td className="py-1 px-3">
                        <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5 whitespace-nowrap bg-emerald-50/50 px-3 py-1.5 rounded-lg border border-emerald-100 w-fit">
                          <FiClock size={14}/> {formatDateTime(item.updatedAt)}
                        </div>
                      </td>
                      <td className="py-1 px-5 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => { setFormData({...item}); setIsModalOpen(true); }} 
                            className="p-1 text-amber-500 hover:bg-amber-50 rounded border border-amber-100 bg-white shadow-sm transition-all"
                          >
                            <FiEdit2 size={16}/>
                          </button>
                          <button 
                            onClick={async () => { if(confirm('ຢືນຢັນການລຶບ?')) { await equipmentService.delete(item.id); fetchItems(); } }} 
                            className="p-1 text-red-500 hover:bg-red-50 rounded border border-red-100 bg-white shadow-sm transition-all"
                          >
                            <FiTrash2 size={16}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                      ບໍ່ພົບຂໍ້ມູນທີ່ທ່ານຄົ້ນຫາ...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal - Standard Size (ຄືເກົ່າເປະ) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-3">
              <div className="w-2 h-7 bg-slate-900 rounded-full"></div>
              {formData.id ? 'ແກ້ໄຂຂໍ້ມູນພັດສະດຸ' : 'ເພີ່ມພັດສະດຸໃໝ່'}
            </h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">ຊື່ອຸປະກອນ / ລາຍການ</label>
                <input required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-semibold text-sm transition-all" 
                  value={formData.item_name} onChange={e => setFormData({...formData, item_name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">ຫົວໜ່ວຍ</label>
                  <input required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-semibold text-sm transition-all" 
                    value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">ຈຳນວນທັງໝົດ</label>
                  <input required type="number" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-black text-blue-600 text-sm transition-all" 
                    value={formData.total_quantity} onChange={e => setFormData({...formData, total_quantity: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">ສະຖານະການເບີກ</label>
                <div className="relative">
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none font-semibold text-sm focus:border-slate-900 transition-all appearance-none cursor-pointer"
                    value={formData.item_type}
                    onChange={e => setFormData({...formData, item_type: e.target.value})}
                  >
                    <option value="consumable">ເອົາ (Consumable)</option>
                    <option value="Electronic">ບໍ່ເອົາ (Fixed Asset/Electronic)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                    <FiBox size={14}/>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl font-bold uppercase text-[12px] hover:bg-slate-200 transition-all">ຍົກເລີກ</button>
                <button type="submit" className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold uppercase text-[12px] shadow-lg shadow-slate-200 active:scale-95 transition-all">ບັນທຶກຂໍ້ມູນ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}