"use client";
import React, { useEffect, useState } from "react";
import { 
  FiBox, FiCheckCircle, FiClock, FiUsers, FiTrendingUp, 
  FiRefreshCw, FiActivity, FiCalendar, 
  FiHome, FiCoffee, FiLayers, FiAlertCircle, FiFileText 
} from "react-icons/fi";
import { dashboardService } from "@/services/homes";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const stats = await dashboardService.getStats();
      if (stats) setData(stats);
    } catch (error) {
      toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-[#F8FAFC]" />;

  const statsConfig = [
    { label: "ລໍຖ້າອະນຸມັດ", value: data?.pendingApprovals ?? 0, icon: <FiClock />, color: "from-orange-400 to-amber-500", link: "/approvals" },
    { label: "ອັດຕາອະນຸມັດ", value: data?.approvalRate ?? "0%", icon: <FiTrendingUp />, color: "from-emerald-400 to-teal-500", link: "/approvals" },
    { label: "ການຈອງມື້ນີ້", value: data?.todayBookings ?? 0, icon: <FiCheckCircle />, color: "from-blue-400 to-indigo-500", link: "/bookings", isLive: true },
    { label: "ຜູ້ໃຊ້ທັງໝົດ", value: data?.totalUsers ?? 0, icon: <FiUsers />, color: "from-purple-400 to-fuchsia-500", link: "/user" },
  ];

  return (
    <div className="p-6 md:p-10 bg-[#F8FAFC] min-h-screen font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">
            System <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Overview</span>
          </h1>
          <p className="text-slate-400 font-medium mt-1">ຕິດຕາມສະຖິຕິການຈອງ ແລະ ການນຳໃຊ້ຊັບພະຍາກອນ</p>
        </div>
        <button onClick={loadData} disabled={loading} className="group flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm font-bold text-slate-700 hover:text-indigo-600 hover:border-indigo-200 transition-all">
          <FiRefreshCw className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} /> ຣີເຟຣດຂໍ້ມູນ
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statsConfig.map((item, i) => (
          <div key={i} onClick={() => router.push(item.link)} className="group cursor-pointer bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-2xl mb-5 shadow-lg`}>
              {item.icon}
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
            <h3 className="text-3xl font-black text-slate-800">{loading ? "..." : item.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* TABLE SECTION (UI ໃໝ່ ແຍກຖັນ) */}
        <div className="xl:col-span-2 bg-white rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-black flex items-center gap-3 text-slate-800">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><FiCalendar size={20} /></div>
              ລາຍການຈອງລ່າສຸດ
            </h3>
            <span className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-500 rounded-full text-[11px] font-bold tracking-wider uppercase">
              ທັງໝົດ {data?.upcoming?.length || 0} ລາຍການ
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-widest bg-slate-50/50 border-b border-slate-100/50">
                  <th className="px-8 py-5">ຫົວຂໍ້ການຈອງ</th>
                  <th className="px-6 py-5">ສະຖານທີ່ / ຫ້ອງ</th>
                  <th className="px-6 py-5">ວັນທີ ແລະ ເວລາ</th>
                  <th className="px-8 py-5 text-center">ສະຖານະ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data?.upcoming?.length > 0 ? (
                  data.upcoming.map((item: any) => (
                    <tr key={item.id} onClick={() => router.push(`/bookings/${item.id}`)} className="group hover:bg-indigo-50/30 cursor-pointer transition-colors duration-300">
                      
                      {/* 1. ຖັນຫົວຂໍ້ (ມີ Icon ປະກອບ) */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-50 group-hover:bg-indigo-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0">
                            <FiFileText size={16} />
                          </div>
                          <span className="font-bold text-sm text-slate-800 group-hover:text-indigo-700 transition-colors line-clamp-1">
                            {item.title}
                          </span>
                        </div>
                      </td>

                      {/* 2. ຖັນຫ້ອງ (ແບບ Badge ສວຍງາມ) */}
                      <td className="px-6 py-5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 group-hover:bg-white rounded-lg border border-slate-100 text-xs font-semibold text-slate-600 whitespace-nowrap">
                          <FiHome className="text-slate-400" size={13}/> 
                          {item.room?.room_name || 'N/A'}
                        </div>
                      </td>

                      {/* 3. ຖັນເວລາ (ແຍກວັນທີ ກັບ ເວລາ ຊັດເຈນ) */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-0.5 whitespace-nowrap">
                          <span className="text-[13px] font-bold text-slate-700 font-mono">
                            {item.start_time?.split(' ')[0]}
                          </span>
                          <span className="text-[11px] font-bold text-indigo-500 font-mono bg-indigo-50 w-fit px-1.5 rounded">
                            {item.start_time?.split(' ')[1]?.substring(0, 5)} - {item.end_time?.split(' ')[1]?.substring(0, 5)}
                          </span>
                        </div>
                      </td>

                      {/* 4. ຖັນສະຖານະ */}
                      <td className="px-8 py-5 text-center">
                        <span className={`inline-flex px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                          item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-300">
                        <FiBox size={48} className="mb-4 opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-widest">ບໍ່ມີຂໍ້ມູນການຈອງ</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* INSIGHTS & SUMMARY */}
        <div className="space-y-6">
          <div className="bg-[#0F172A] rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-8 flex items-center gap-2"><FiActivity /> Popular Insights</h4>
            
            <div className="space-y-4 relative z-10">
              <div className="bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">ຫ້ອງທີ່ໃຊ້ຫຼາຍສຸດ</p>
                <p className="text-lg font-black text-white">{data?.topRoom}</p>
              </div>
              <div className="bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">ອຸປະກອນຍອດນິຍົມ</p>
                <p className="text-lg font-black text-white">{data?.topEquipment}</p>
              </div>
              <div className="bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">ອາຫານ/ເຄື່ອງດື່ມ</p>
                <p className="text-lg font-black text-white flex items-center gap-2">
                  <FiCoffee className="text-emerald-400"/> {data?.topCatering}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            <h4 className="text-sm font-black mb-4 flex items-center gap-2 text-slate-800"><FiLayers className="text-indigo-600"/> ປະເພດການຈອງ</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase">ຊ້ຳ (Recurring)</p>
                <p className="text-2xl font-black text-indigo-600 mt-1">{data?.bookingTypes?.recurring}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase">ເທື່ອດຽວ (Single)</p>
                <p className="text-2xl font-black text-slate-800 mt-1">{data?.bookingTypes?.single}</p>
              </div>
            </div>
            {data?.totalRejected > 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 border border-red-100">
                <FiAlertCircle size={14} />
                <p className="text-[10px] font-bold uppercase tracking-wider">ຖືກປະຕິເສດແລ້ວ {data?.totalRejected} ລາຍການ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}