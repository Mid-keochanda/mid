"use client";
import { Toaster } from 'react-hot-toast';
import { useApprovalLogic } from '@/services/approvals'; 
import { 
  FiCalendar, FiClock, FiUsers, FiCheck, FiX, 
  FiRefreshCw, FiHome, FiMessageSquare, FiCommand
} from 'react-icons/fi';

export default function ApprovalsPage() {
  const {
    data, loading, fetchData,
    isRejectModalOpen, setIsRejectModalOpen,
    rejectReason, setRejectReason,
    submitting, handleApprove, 
    openRejectModal, handleRejectSubmit
  } = useApprovalLogic();

  if (loading && data.length === 0) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-[3px] border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-1 md:p-1 text-slate-700 font-sans antialiased">
      <Toaster position="top-right" />
      
      {/* --- REJECT MODAL --- */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white px-3 py-1.5 w-full max-w-sm rounded-xl shadow-2xl p-4 border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center mb-4 text-center">
              <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
                <FiMessageSquare size={15} />
              </div>
              <h3 className="text-md font-bold text-slate-900">ເຫດຜົນການປະຕິເສດ</h3>
            </div>
            <textarea
              className="w-full h-20 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/10 focus:border-red-400 outline-none transition-all resize-none text-sm font-medium"
              placeholder="ລະບຸເຫດຜົນ..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2 mt-5">
              <button onClick={() => setIsRejectModalOpen(false)} className="py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all">
                ຍົກເລີກ
              </button>
              <button onClick={handleRejectSubmit} disabled={submitting} className="py-2 bg-red-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-red-700 transition-all">
                {submitting ? "ກຳລັງສົ່ງ..." : "ຢືນຢັນ"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* --- HEADER (ປັບໃຫ້ເຕ້ຍລົງ) --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3 bg-white p-2 rounded-xl border border-orange-600 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-orange-900 rounded-lg flex items-center justify-center text-white shadow-sm">
              <FiCommand size={15} />
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-slate-900 leading-tight">ລາຍການອະນຸມັດ</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Pending Approvals</p>
            </div>
          </div>
          <button 
            onClick={fetchData} 
            className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg text-[11px] font-bold hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 group"
          >
            <FiRefreshCw className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} /> 
            ຣີເຟຣດ
          </button>
        </div>

        {/* --- LIST (ປັບ Spacing ພາຍໃນ Card) --- */}
        <div className="space-y-3">
          {data.length > 0 ? data.map((item) => {
            const isPending = item.status === 'Pending';

            return (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row hover:border-blue-200 transition-all group">
                
                {/* ຂໍ້ມູນຫ້ອງ (ປັບຄວາມກວ້າງໃຫ້ Compact) */}
                <div className="lg:w-48 p-4 bg-slate-50/50 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-100 relative">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPending ? 'bg-amber-400' : 'bg-emerald-500'}`}></div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FiHome className="text-slate-400" size={14} />
                      <p className="text-[15px] font-bold text-slate-900 line-clamp-1">{item.room?.room_name || `Room: ${item.room_id}`}</p>
                    </div>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[12px] font-bold border ${isPending ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                      <span className={`w-1 h-1 rounded-full ${isPending ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                      {isPending ? 'ລໍຖ້າກວດສອບ' : 'ອະນຸມັດແລ້ວ'}
                    </div>
                  </div>
                </div>

                {/* ເນື້ອໃນການຈອງ (ປັບ Gap ໃຫ້ແຄບເຂົ້າ) */}
                <div className="flex-1 p-1 lg:px-6">
                  <h2 className="text-[14px] font-bold text-slate-900 mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-100 text-slate-500 rounded-md group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <FiCalendar size={14} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase leading-none mb-0.5">ວັນທີ</p>
                        <p className="text-[11px] font-bold text-slate-700">{item.start_time?.split(' ')[0]}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-100 text-slate-500 rounded-md group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <FiClock size={14} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase leading-none mb-0.5">ເວລາ</p>
                        <p className="text-[11px] font-bold text-slate-700 font-mono">
                          {item.start_time?.split(' ')[1]?.slice(0,5)}-{item.end_time?.split(' ')[1]?.slice(0,5)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-100 text-slate-500 rounded-md group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <FiUsers size={14} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase leading-none mb-0.5">ຜູ້ເຂົ້າຮ່ວມ</p>
                        <p className="text-[11px] font-bold text-slate-700">{item.attendeeCount} ທ່ານ</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ປຸ່ມກົດ Actions (ປັບໃຫ້ Compact) */}
                <div className="p-1 flex flex-row lg:flex-col justify-center gap-2 bg-white lg:w-36 border-t lg:border-t-0 lg:border-l">
                  <button 
                    onClick={() => handleApprove(item.id)} 
                    className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-bold hover:bg-blue-700 shadow-sm transition-all active:scale-95"
                  >
                    <FiCheck size={13} /> ອະນຸມັດ
                  </button>
                  <button 
                    onClick={() => openRejectModal(item.id)} 
                    className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 py-1.5 bg-white text-red-600 border border-red-100 hover:bg-red-50 rounded-lg text-[11px] font-bold transition-all active:scale-95"
                  >
                    <FiX size={13} /> ປະຕິເສດ
                  </button>
                </div>

              </div>
            );
          }) : (
            <div className="bg-white p-12 rounded-xl text-center border border-slate-200 shadow-sm">
               <div className="w-12 h-12 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiCheck size={15} />
               </div>
               <h3 className="text-sm font-bold text-slate-800">ທຸກຢ່າງຮຽບຮ້ອຍ!</h3>
               <p className="text-[11px] text-slate-500 font-medium">ຍັງບໍ່ມີລາຍການຈອງທີ່ລໍຖ້າ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}