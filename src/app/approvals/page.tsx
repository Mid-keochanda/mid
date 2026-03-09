"use client";
import { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import axiosClient from '@/lib/axiosClient';
import { 
  FiCalendar, FiClock, FiUsers, FiBox, FiCheck, FiX, 
  FiRefreshCw, FiHome, FiMessageSquare, FiChevronRight, FiCommand
} from 'react-icons/fi';

export default function ApprovalsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/approvals');
      const result = res.data?.success ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      setData(result);
    } catch (error: any) {
      toast.error("ບໍ່ສາມາດດຶງຂໍ້ມູນໄດ້");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (id: number) => {
    try {
      const res = await axiosClient.post('/approvals/submit', {
        booking_id: id, status: 'Approved', comment: 'ອະນຸມັດຮຽບຮ້ອຍ'
      });
      if (res.data.success) {
        toast.success("ອະນຸມັດສຳເລັດ");
        fetchData();
      }
    } catch (error) { toast.error("ດຳເນີນການບໍ່ສຳເລັດ"); }
  };

  const openRejectModal = (id: number) => {
    setSelectedId(id);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) return toast.error("ກະລຸນາລະບຸເຫດຜົນ");
    try {
      setSubmitting(true);
      const res = await axiosClient.post('/approvals/submit', {
        booking_id: selectedId, status: 'Rejected', comment: rejectReason
      });
      if (res.data.success) {
        toast.success("ປະຕິເສດແລ້ວ");
        setIsRejectModalOpen(false);
        fetchData();
      }
    } catch (error) { toast.error("ເກີດຂໍ້ຜິດພາດ"); } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-10 font-sans antialiased text-slate-900 relative overflow-hidden">
      {/* Decorative Background Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/80 to-transparent -z-10 pointer-events-none"></div>

      <Toaster position="top-right" toastOptions={{ className: 'font-bold rounded-2xl shadow-xl' }} />
      
      {/* ------------------ REJECT MODAL ------------------ */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-300 border border-white/50">
            <div className="flex flex-col items-center mb-6 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center mb-4 shadow-inner">
                <FiMessageSquare size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">ລະບຸເຫດຜົນການປະຕິເສດ</h3>
              <p className="text-base text-slate-500 font-medium mt-1">ກະລຸນາແຈ້ງໃຫ້ຜູ້ຈອງຊາບວ່າເປັນຫຍັງຈຶ່ງຖືກປະຕິເສດ</p>
            </div>
            <textarea
              className="w-full h-32 p-5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-400 focus:bg-white focus:outline-none transition-all resize-none text-slate-700 text-base font-medium placeholder:text-slate-400"
              placeholder="ຕົວຢ່າງ: ຫ້ອງຕິດປະຊຸມອື່ນດ່ວນ..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button onClick={() => setIsRejectModalOpen(false)} className="py-4 bg-slate-100 text-slate-600 rounded-2xl text-base font-bold hover:bg-slate-200 hover:text-slate-700 transition-all active:scale-95">
                ຍົກເລີກ
              </button>
              <button onClick={handleRejectSubmit} disabled={submitting} className="py-4 bg-gradient-to-tr from-red-500 to-red-400 text-white rounded-2xl text-base font-bold shadow-lg shadow-red-500/30 hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50">
                {submitting ? "ກຳລັງສົ່ງ..." : "ຢືນຢັນ"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* ------------------ HEADER ------------------ */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-indigo-600">
              <FiCommand size={28} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">
                ລາຍການອະນຸມັດ
              </h1>
              <p className="text-base text-slate-500 font-medium mt-1">ກວດສອບ ແລະ ຄຸ້ມຄອງການຈອງຫ້ອງປະຊຸມ</p>
            </div>
          </div>
          <button 
            onClick={fetchData} 
            className="flex items-center gap-2 px-6 py-3.5 bg-white text-indigo-600 rounded-2xl text-base font-bold shadow-sm border border-slate-200/60 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50 hover:-translate-y-0.5 transition-all active:scale-95 group"
          >
            <FiRefreshCw className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-700"} /> 
            ໂຫຼດຂໍ້ມູນໃໝ່
          </button>
        </div>

        {/* ------------------ LIST ------------------ */}
        <div className="space-y-6">
          {data.length > 0 ? data.map((item) => {
            const equipmentList = item.booking_equipments || item.equipments || [];
            const isPending = item.status === 'Pending';

            return (
              <div key={item.id} className="bg-white rounded-[2rem] border border-slate-200/50 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden flex flex-col lg:flex-row hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 group">
                
                {/* ຂໍ້ມູນຫ້ອງ ແລະ ສະຖານະ */}
                <div className="lg:w-72 p-8 bg-gradient-to-b from-slate-50/80 to-white flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-100 relative">
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isPending ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                  
                  <div className="space-y-5 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                        <FiHome size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">ຫ້ອງປະຊຸມ</p>
                        <p className="text-base font-bold text-slate-800 line-clamp-1">{item.room?.room_name || `ລະຫັດຫ້ອງ: ${item.room_id}`}</p>
                      </div>
                    </div>

                    <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-bold border ${isPending ? 'bg-amber-50 text-amber-700 border-amber-200/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200/50'}`}>
                      {isPending ? (
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                        </span>
                      ) : (
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      )}
                      {isPending ? 'ລໍຖ້າການກວດສອບ' : (item.status === 'Approved' ? 'ອະນຸມັດແລ້ວ' : item.status)}
                    </div>
                  </div>
                </div>

                {/* ເນື້ອໃນການຈອງ */}
                <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center">
                  <h2 className="text-xl font-bold text-slate-800 mb-8 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {item.title}
                  </h2>
                  
                  <div className="flex flex-wrap gap-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                        <FiCalendar size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">ວັນທີ</p>
                        <p className="text-base font-bold text-slate-700">{item.start_time?.split(' ')[0]}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                        <FiClock size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">ເວລາ</p>
                        <p className="text-base font-bold text-slate-700 font-mono tracking-tight">{item.start_time?.split(' ')[1]?.slice(0,5)} - {item.end_time?.split(' ')[1]?.slice(0,5)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                        <FiUsers size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-500 mb-1">ຈຳນວນຄົນ</p>
                        <p className="text-base font-bold text-slate-700">{item.attendeeCount} ທ່ານ</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ລາຍການອຸປະກອນ */}
                <div className="lg:w-[320px] p-8 bg-slate-50/50 border-y lg:border-y-0 lg:border-x border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                      <FiBox /> ອຸປະກອນ
                    </p>
                    <span className="text-sm font-bold bg-slate-200 text-slate-600 px-3 py-1 rounded-full">{equipmentList.length}</span>
                  </div>
                  
                  <div className="space-y-2 overflow-y-auto max-h-[140px] pr-2 custom-scrollbar">
                    {equipmentList.length > 0 ? equipmentList.map((eq: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-white px-4 py-3 rounded-2xl border border-slate-200/60 shadow-sm group/item hover:border-indigo-200 hover:shadow-md transition-all">
                        <span className="text-sm font-bold text-slate-700 flex items-center gap-2 truncate">
                          <FiChevronRight className="text-slate-300 group-hover/item:text-indigo-500 group-hover/item:translate-x-1 transition-all" size={16} />
                          <span className="truncate">{eq.equipment?.item_name || eq.item_name || `ອຸປະກອນ #${eq.equipment_id}`}</span>
                        </span>
                        <span className="text-sm font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-lg ml-2 shrink-0 group-hover/item:bg-indigo-50 group-hover/item:text-indigo-600 transition-colors">
                          x{eq.quantity}
                        </span>
                      </div>
                    )) : (
                      <div className="py-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                        <p className="text-sm text-slate-400 font-bold">ບໍ່ມີອຸປະກອນເພີ່ມເຕີມ</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ປຸ່ມກົດ (Actions) */}
                <div className="p-6 lg:p-8 flex flex-row lg:flex-col justify-center gap-4 bg-white lg:w-48">
                  <button 
                    onClick={() => handleApprove(item.id)} 
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 py-4 bg-gradient-to-tr from-emerald-500 to-emerald-400 text-white rounded-2xl text-base font-bold hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all active:scale-95"
                  >
                    <FiCheck size={20} /> ອະນຸມັດ
                  </button>
                  <button 
                    onClick={() => openRejectModal(item.id)} 
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 py-4 bg-white text-red-500 border-2 border-red-50 hover:border-red-100 hover:bg-red-50 rounded-2xl text-base font-bold transition-all active:scale-95"
                  >
                    <FiX size={20} /> ປະຕິເສດ
                  </button>
                </div>

              </div>
            );
          }) : (
            <div className="bg-white/80 backdrop-blur-sm p-24 lg:p-32 rounded-[3rem] text-center border border-slate-200 shadow-sm flex flex-col items-center">
               <div className="w-24 h-24 bg-gradient-to-tr from-slate-100 to-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-white">
                  <FiCheck size={48} />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">ທຸກຢ່າງຮຽບຮ້ອຍແລ້ວ!</h3>
               <p className="text-base text-slate-500 font-medium">ຍັງບໍ່ມີລາຍການຈອງທີ່ລໍຖ້າການອະນຸມັດໃນເວລານີ້</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `}</style>
    </div>
  );
}