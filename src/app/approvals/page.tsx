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
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 text-slate-700 font-sans antialiased">
      <Toaster position="top-right" />
      
      {/* ------------------ REJECT MODAL ------------------ */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center mb-5 text-center">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3">
                <FiMessageSquare size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">ເຫດຜົນການປະຕິເສດ</h3>
              <p className="text-xs text-slate-500 mt-1">ແຈ້ງຜົນໃຫ້ຜູ້ຈອງຊາບ</p>
            </div>
            <textarea
              className="w-full h-28 p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-400 focus:bg-white outline-none transition-all resize-none text-sm font-medium"
              placeholder="ລະບຸເຫດຜົນ..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={() => setIsRejectModalOpen(false)} className="py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all">
                ຍົກເລີກ
              </button>
              <button onClick={handleRejectSubmit} disabled={submitting} className="py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-red-700 transition-all">
                {submitting ? "ກຳລັງສົ່ງ..." : "ຢືນຢັນ"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* ------------------ HEADER ------------------ */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-slate-900 rounded-lg flex items-center justify-center text-white shadow-md">
              <FiCommand size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">ລາຍການອະນຸມັດ</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Pending Approvals</p>
            </div>
          </div>
          <button 
            onClick={fetchData} 
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-white hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 group"
          >
            <FiRefreshCw className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} /> 
            ຣີເຟຣດຂໍ້ມູນ
          </button>
        </div>

        {/* ------------------ LIST ------------------ */}
        <div className="space-y-4">
          {data.length > 0 ? data.map((item) => {
            const equipmentList = item.booking_equipments || item.equipments || [];
            const isPending = item.status === 'Pending';

            return (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row hover:border-blue-200 transition-all group">
                
                {/* ຂໍ້ມູນຫ້ອງ */}
                <div className="lg:w-60 p-5 bg-slate-50/50 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-100 relative">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPending ? 'bg-amber-400' : 'bg-emerald-500'}`}></div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FiHome className="text-slate-400" size={16} />
                      <p className="text-[13px] font-bold text-slate-900 line-clamp-1">{item.room?.room_name || `Room: ${item.room_id}`}</p>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border ${isPending ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                      {isPending ? 'ລໍຖ້າກວດສອບ' : 'ອະນຸມັດແລ້ວ'}
                    </div>
                  </div>
                </div>

                {/* ເນື້ອໃນການຈອງ */}
                <div className="flex-1 p-5 lg:px-8">
                  <h2 className="text-[15px] font-bold text-slate-900 mb-4 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <FiCalendar size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">ວັນທີ</p>
                        <p className="text-[12px] font-bold text-slate-700">{item.start_time?.split(' ')[0]}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <FiClock size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">ເວລາ</p>
                        <p className="text-[12px] font-bold text-slate-700 font-mono">{item.start_time?.split(' ')[1]?.slice(0,5)} - {item.end_time?.split(' ')[1]?.slice(0,5)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <FiUsers size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">ຜູ້ເຂົ້າຮ່ວມ</p>
                        <p className="text-[12px] font-bold text-slate-700">{item.attendeeCount} ທ່ານ</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ອຸປະກອນ (ແບບຫຍໍ້) */}
                <div className="lg:w-64 p-5 bg-slate-50/30 border-y lg:border-y-0 lg:border-x border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-1.5">
                     <FiBox size={12}/> ອຸປະກອນ ({equipmentList.length})
                   </p>
                   <div className="flex flex-wrap gap-1.5">
                      {equipmentList.length > 0 ? equipmentList.slice(0, 3).map((eq: any, idx: number) => (
                        <span key={idx} className="text-[10px] font-bold bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600">
                          {eq.equipment?.item_name || eq.item_name} x{eq.quantity}
                        </span>
                      )) : <span className="text-[10px] text-slate-400 font-medium italic">ບໍ່ມີອຸປະກອນ</span>}
                      {equipmentList.length > 3 && <span className="text-[10px] font-bold text-blue-500">+{equipmentList.length - 3} ອື່ນໆ</span>}
                   </div>
                </div>

                {/* ປຸ່ມກົດ (Actions) */}
                <div className="p-5 flex flex-row lg:flex-col justify-center gap-2 bg-white lg:w-44">
                  <button 
                    onClick={() => handleApprove(item.id)} 
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95"
                  >
                    <FiCheck size={14} /> ອະນຸມັດ
                  </button>
                  <button 
                    onClick={() => openRejectModal(item.id)} 
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 py-2 bg-white text-red-600 border border-red-100 hover:bg-red-50 rounded-lg text-xs font-bold transition-all active:scale-95"
                  >
                    <FiX size={14} /> ປະຕິເສດ
                  </button>
                </div>

              </div>
            );
          }) : (
            <div className="bg-white p-16 rounded-xl text-center border border-slate-200 shadow-sm">
               <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <FiCheck size={32} />
               </div>
               <h3 className="text-base font-bold text-slate-800">ທຸກຢ່າງຮຽບຮ້ອຍ!</h3>
               <p className="text-xs text-slate-500 font-medium">ຍັງບໍ່ມີລາຍການຈອງທີ່ລໍຖ້າການອະນຸມັດ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}