"use client";
import { Toaster } from 'react-hot-toast';
import { useCateringLogic } from '@/services/catering-items'; 
import { 
  FiBox, FiPlus, FiEdit2, FiTrash2, FiSearch, 
  FiClock, FiCalendar, FiCheckCircle, FiXCircle 
} from 'react-icons/fi';

export default function CateringItemsPage() {
  const {
    searchTerm, setSearchTerm, loading, isModalOpen, setIsModalOpen,
    currentItem, setCurrentItem, filteredItems, handleSave, handleDelete,
    openAddModal, openEditModal
  } = useCateringLogic();

  // --- ປັບ Format ວັນທີໃຫ້ເປັນຕົວເລກ (DD/MM/YYYY HH:mm) ---
  const formatDate = (dateString: string) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="w-9 h-9 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
     <div className="min-h-screen bg-[#F8FAFC] p-3 md:p-5 font-sans text-slate-900 text-[13px]">
      <Toaster position="top-right" />
      
      <div className="max-w-full mx-auto space-y-2">
        {/* --- Header & Search --- */}
        <div className="bg-white px-3 py-1.5 rounded-2xl shadow-sm border border-orange-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-900 p-2.5 rounded-xl text-white shadow-lg shadow-slate-200">
              <FiBox size={15} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-700">ຈັດການ Catering</h1>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Inventory Management</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative group">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <input 
                type="text" placeholder="ຄົ້ນຫາລາຍການ..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-72 bg-orange-50 border border-orange-200 pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-orange-900 focus:bg-white transition-all font-medium"
              />
            </div>
            <button onClick={openAddModal} className="bg-orange-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-800 transition-all active:scale-95 shadow-md shadow-slate-200">
              <FiPlus /> ເພີ່ມໃໝ່
            </button>
          </div>
        </div>

        {/* --- Table Section --- */}
           <div className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-orange-50/80 text-[15px] font-bold uppercase text-orange-500 border-b border-orange-200">
                  <th className="py-1 px-2 text-center">ID</th>
                  <th className="py-1 px-2 text-center">ຊື່ລາຍການ</th>
                  <th className="py-1 px-2 text-center">ຫົວໜ່ວຍ</th>
                  <th className="py-1 px-2 text-center">ສະຖານະ</th>
                  <th className="py-1 px-5 ">ວັນທີບັນທຶກ</th>
                  <th className="py-1 px-5 ">ອັບເດດລ່າສຸດ</th>
                  <th className="py-1 px-5 text-center">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-sm">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="py-1 px-2 text-center text-slate-400 font-mono text-xs">#{item.id}</td>
                    <td className="py-1 px-2 font-bold text-center text-slate-800 text-[12px]">{item.Name}</td>
                    <td className="py-1 px-2 text-center">
                      <span className="bg-slate-100 text-center text-slate-600 px-2 py-1 rounded-lg text-xs font-black border border-slate-200">
                        {item.Unit}
                      </span>
                    </td>
                    <td className="py-1 px-2 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black uppercase border ${
                        item.isActive ? 'bg-orange-30 border-orange-300 text-orange-700' : 'bg-slate-30 border-slate-300 text-slate-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isActive ? 'bg-orange-500' : 'bg-slate-500'}`}></span>
                        {item.isActive ? 'ເອົາ' : 'ບໍ່ເອົາ'}
                      </span>
                    </td>
                    
                    {/* ວັນທີບັນທຶກ (ຕົວເລກ) */}
                    <td className="py-1 px-2 text-center">
                      <div className="text-[10px] text-slate-600 font-bold flex items-center gap-1 whitespace-nowrap">
                        <FiCalendar className="text-slate-300" size={13} />
                        {formatDate(item.createdAt)}
                      </div>
                    </td>

                    {/* ວັນທີອັບເດດ (ຕົວເລກ) */}
                    <td className="py-1 px-2 text-center">
                      <div className="text-[10px] text-orange-600 font-bold flex items-center whitespace-nowrap bg-orange-50/50 px-3 py-1.5 rounded-lg border border-orange-100 w-fit">
                        <FiClock className="text-orange-300" size={13} />
                        {formatDate(item.updatedAt)}
                      </div>
                    </td>

                   <td className="py-1 px-5">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEditModal(item)} className="p-1 text-amber-500 hover:bg-amber-50 rounded border border-amber-100 bg-white shadow-sm transition-all">
                          <FiEdit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1 text-red-500 hover:bg-red-50 rounded border border-red-100 bg-white shadow-sm transition-all">
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredItems.length === 0 && (
            <div className="py-20 text-center bg-white">
              <p className="text-slate-400 font-bold">ບໍ່ພົບຂໍ້ມູນທີ່ທ່ານຄົ້ນຫາ...</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Modal (Add/Edit) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[24px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2.5 bg-orange-900 rounded-xl text-white"><FiBox size={20}/></div>
               <h2 className="text-xl font-black text-slate-800 tracking-tight">
                {currentItem.id ? 'ແກ້ໄຂລາຍການ' : 'ເພີ່ມລາຍການໃໝ່'}
              </h2>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-wider">ຊື່ລາຍການ</label>
                <input required placeholder="ປ້ອນຊື່ລາຍການ..." className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none focus:border-slate-900 focus:bg-white font-bold transition-all text-slate-800" 
                  value={currentItem.Name} onChange={e => setCurrentItem({...currentItem, Name: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-wider">ຫົວໜ່ວຍ</label>
                <input required placeholder="ເຊັ່ນ: ກ່ອງ, ອັນ, ກິໂລ..." className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl outline-none focus:border-slate-900 focus:bg-white font-bold transition-all text-slate-800" 
                  value={currentItem.Unit} onChange={e => setCurrentItem({...currentItem, Unit: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-wider">ສະຖານະການໃຊ້ງານ</label>
                <button type="button" 
                  className={`w-full p-4 rounded-xl border flex justify-between items-center font-bold transition-all ${currentItem.isActive ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                  onClick={() => setCurrentItem({...currentItem, isActive: !currentItem.isActive})}>
                  <span className="flex items-center gap-2">
                    {currentItem.isActive ? <FiCheckCircle /> : <FiXCircle />}
                    {currentItem.isActive ? 'ເອົາ' : 'ບໍ່ເອົາ'}
                  </span>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${currentItem.isActive ? 'bg-orange-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${currentItem.isActive ? 'left-6' : 'left-1'}`}></div>
                  </div>
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-colors">ຍົກເລີກ</button>
                <button type="submit" className="flex-1 bg-orange-900 text-white py-3.5 rounded-xl font-bold hover:bg-orange-800 transition-all shadow-lg shadow-slate-200 active:scale-95">ບັນທຶກຂໍ້ມູນ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}