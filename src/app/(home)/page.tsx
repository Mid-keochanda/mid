"use client";
import React, { useEffect, useState } from "react";
import { FiBox, FiCheckCircle, FiClock, FiUsers, FiTrendingUp, FiMapPin, FiRefreshCw, FiArrowRight, FiActivity, FiCalendar, FiExternalLink } from "react-icons/fi";
import { dashboardService } from "@/services/homes";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation"; // ເພີ່ມຕົວນີ້ເຂົ້າມາສຳລັບການປ່ຽນໜ້າ

export default function DashboardPage() {
  const router = useRouter(); // ເອີ້ນໃຊ້ router
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const stats = await dashboardService.getStats();
    if (stats) {
      setData(stats);
    } else {
      toast.error("ບໍ່ສາມາດດຶງຂໍ້ມູນສະຖິຕິໄດ້");
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const recurringCount = data?.bookingTypes?.recurring || 0;
  const singleCount = data?.bookingTypes?.single || 0;
  const totalBookings = recurringCount + singleCount;
  const recurringPercent = totalBookings > 0 ? (recurringCount / totalBookings) * 100 : 0;
  const singlePercent = totalBookings > 0 ? (singleCount / totalBookings) * 100 : 0;

  // ເພີ່ມ path ສຳລັບ link ໄປໜ້າອື່ນໆ ໃຫ້ຕົງກັບໂປຣເຈັກເຈົ້າ
  const statsConfig = [
    { label: "ລໍຖ້າອະນຸມັດ", value: data?.pendingApprovals || 0, icon: <FiClock />, color: "text-amber-500", glow: "shadow-amber-200", bg: "bg-amber-50", link: "/approvals" }, // ໄປໜ້າອະນຸມັດ
    { label: "ອັດຕາອະນຸມັດ", value: data?.approvalRate || "0%", icon: <FiTrendingUp />, color: "text-emerald-500", glow: "shadow-emerald-200", bg: "bg-emerald-50", link: "/"}, // ໄປໜ້າລາຍງານ
    { label: "ການຈອງມື້ນີ້", value: data?.todayBookings || 0, icon: <FiCheckCircle />, color: "text-blue-500", glow: "shadow-blue-200", bg: "bg-blue-50", link: "/bookings" }, // ໄປໜ້າການຈອງ
    { label: "ຜູ້ໃຊ້ທັງໝົດ", value: data?.totalUsers || 0, icon: <FiUsers />, color: "text-purple-500", glow: "shadow-purple-200", bg: "bg-purple-50", link: "/user" }, // ໄປໜ້າຈັດການຜູ້ໃຊ້
  ];

  return (
    <div className="p-6 md:p-10 bg-gradient-to-br from-slate-50 to-[#F4F7FE] min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* --- HEADER SECTION --- */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-4">
            <span className="w-3 h-10 bg-gradient-to-b from-indigo-500 to-violet-600 rounded-full shadow-lg shadow-indigo-200" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              Dashboard Overview
            </span>
          </h1>
          <p className="text-slate-500 font-medium mt-2 ml-7">ຍິນດີຕ້ອນຮັບ, ຕິດຕາມສະຖານະການຈອງ ແລະ ອຸປະກອນແບບ Real-time.</p>
        </div>
        <button 
          onClick={loadData} 
          disabled={loading}
          className="group flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-sm text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all duration-300 active:scale-95 disabled:opacity-50"
        >
          <FiRefreshCw className={`${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} text-indigo-500`} /> 
          ຣີເຟຣດຂໍ້ມູນ
        </button>
      </div>

      {/* --- STATS CARDS (ກົດໄດ້ແລ້ວ) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statsConfig.map((item, i) => (
          <div 
            key={i} 
            onClick={() => router.push(item.link)} // ສັ່ງໃຫ້ປ່ຽນໜ້າເວລາກົດ
            className="cursor-pointer relative bg-white p-7 rounded-[28px] border border-slate-100 shadow-xl shadow-slate-200/40 group hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
            title={`ກົດເພື່ອໄປໜ້າ ${item.label}`}
          >
            {/* Background Decoration */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-2xl transition-all duration-500 group-hover:scale-150 ${item.bg}`} />
            
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className={`${item.bg} ${item.color} w-14 h-14 rounded-[18px] flex items-center justify-center text-2xl shadow-lg ${item.glow} group-hover:scale-110 transition-transform duration-500`}>
                {item.icon}
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </div>
                {/* ໄອຄອນລູກສອນບອກວ່າກົດໄດ້ */}
                <FiExternalLink className="text-slate-300 group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100" />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{item.label}</p>
              <h3 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                {loading ? <span className="inline-block w-20 h-10 bg-slate-100 animate-pulse rounded-xl" /> : item.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- UPCOMING TABLE --- */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white/50">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><FiCalendar /></div>
              ລາຍການຈອງທີ່ຈະມາເຖິງ
            </h3>
            {/* ປຸ່ມເບິ່ງທັງໝົດ ກົດແລ້ວໄປໜ້າ Bookings */}
            <button 
              onClick={() => router.push('/bookings')} 
              className="px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300 flex items-center gap-2 group"
            >
              ເບິ່ງທັງໝົດ <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="overflow-x-auto flex-1 p-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 text-[11px] font-black uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-5">ຂໍ້ມູນການຈອງ</th>
                  <th className="px-6 py-5">ສະຖານທີ່ / ຫ້ອງ</th>
                  <th className="px-6 py-5">ວັນທີ & ເວລາ</th>
                  <th className="px-6 py-5 text-center">ສະຖານະ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr><td colSpan={4} className="py-16 text-center text-slate-400 animate-pulse font-medium">ກຳລັງໂຫຼດຂໍ້ມູນ...</td></tr>
                ) : data?.upcoming?.length > 0 ? (
                  data.upcoming.map((item: any) => (
                    // ແຖວຕາຕະລາງກໍສາມາດກົດໄປເບິ່ງລາຍລະອຽດໄດ້
                    <tr 
                      key={item.id} 
                      onClick={() => router.push(`/bookings/${item.id}`)}
                      className="group hover:bg-slate-50/80 transition-all duration-200 cursor-pointer"
                      title="ກົດເພື່ອເບິ່ງລາຍລະອຽດການຈອງ"
                    >
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{item.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 group-hover:text-indigo-400">Booking ID: #{item.id}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 bg-white border border-slate-100 px-3 py-1.5 rounded-lg shadow-sm group-hover:border-indigo-100 transition-colors">
                          <FiMapPin className="text-indigo-400" />
                          {item.room?.room_name || 'ບໍ່ລະບຸ'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs font-bold text-slate-700">{item.start_time?.split(' ')[0]}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5 bg-slate-100 inline-block px-1.5 rounded group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">{item.start_time?.split(' ')[1]}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-[10px] font-black border ${
                          item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                   <tr><td colSpan={4} className="py-16 text-center text-slate-400 italic">ບໍ່ມີລາຍການຈອງທີ່ຈະມາເຖິງ</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ... (ສ່ວນ Insight Sidebar ທີ່ເຫຼືອຄືເກົ່າເລີຍ) ... */}
        {/* INSIGHTS SIDEBAR */}
        <div className="space-y-8">
          
          {/* 💎 Premium Gradient Card */}
          <div 
            onClick={() => router.push('/equipments')} // ກົດກ່ອງນີ້ໄປໜ້າອຸປະກອນ
            className="cursor-pointer bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 rounded-[32px] p-8 text-white shadow-2xl shadow-purple-500/30 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
          >
            {/* ... ເນື້ອຫາທາງໃນຄືເກົ່າ ... */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:translate-x-1/4 transition-transform duration-1000" />
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-900/40 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
             <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="font-black text-white/90 text-xs uppercase tracking-widest flex items-center gap-2">
                    <FiActivity /> ຍອດນິຍົມສູງສຸດ
                  </h4>
                  <FiExternalLink className="opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-5 p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl hover:bg-white/20 transition-colors">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl shadow-inner">
                      <FiMapPin />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-wide">ຫ້ອງທີ່ໃຊ້ຫຼາຍສຸດ</p>
                      <p className="text-lg font-black text-white">{data?.topRoom || "ກຳລັງໂຫຼດ..."}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-5 p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl hover:bg-white/20 transition-colors">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl shadow-inner">
                      <FiBox />
                    </div>
                    <div className="w-full overflow-hidden">
                      <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-wide">ອຸປະກອນທີ່ຖືກຢືມຫຼາຍສຸດ</p>
                      <p className="text-lg font-black text-white truncate">{data?.totalEquipment || "ກຳລັງໂຫຼດ..."}</p>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* ... (Progress Circle Card ຄືເກົ່າ) ... */}
        </div>
      </div>
    </div>
  );
}