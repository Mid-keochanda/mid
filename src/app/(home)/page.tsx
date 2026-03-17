"use client";
import React, { useEffect, useState } from "react";
import { 
  FiCheckCircle, FiClock, FiUsers, FiTrendingUp, FiRefreshCw, 
  FiCalendar, FiHome, FiCoffee, FiLayers, FiAlertCircle, FiFileText, 
  FiBarChart2, FiActivity 
} from "react-icons/fi";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as AreaTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip 
} from "recharts";
import { dashboardService } from "@/services/homes";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setMounted(true);
    loadData();
  }, [router]);

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

  const STATUS_COLORS: { [key: string]: string } = {
    Approved: "#10B981", 
    Pending: "#F59E0B",  
    Rejected: "#EF4444" 
  };

  if (!mounted) return null;

  return (
    <div className="p-6 md:p-8 bg-[#F1F5F9] min-h-screen font-sans">
      
      {/* 1. HEADER */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ພາບລວມລະບົບ</h1>
          <p className="text-slate-400 text-xs font-medium">ສະຖິຕິ ແລະ ຂໍ້ມູນການຈອງທັງໝົດ</p>
        </div>
        <button onClick={loadData} className="p-2.5 bg-white rounded-xl border shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 text-xs font-bold text-slate-600">
          <FiRefreshCw className={`${loading ? "animate-spin" : ""}`} /> ຣີເຟຣດຂໍ້ມູນ
        </button>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "ລໍຖ້າອະນຸມັດ", value: data?.pendingApprovals, icon: <FiClock />, border: "border-orange-500", text: "text-orange-500" },
          { label: "ອັດຕາການອະນຸມັດ", value: data?.approvalRate, icon: <FiTrendingUp />, border: "border-emerald-500", text: "text-emerald-500" },
          { label: "ການຈອງມື້ນີ້", value: data?.todayBookings, icon: <FiCheckCircle />, border: "border-blue-500", text: "text-blue-500" },
          { label: "ຜູ້ໃຊ້ທັງໝົດ", value: data?.totalUsers, icon: <FiUsers />, border: "border-purple-500", text: "text-purple-500" },
        ].map((item, i) => (
          <div key={i} className={`bg-white p-5 rounded-2xl shadow-sm border-l-4 ${item.border} flex items-center justify-between`}>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
              <h3 className="text-xl font-black text-slate-800 mt-1">{loading ? "..." : item.value}</h3>
            </div>
            <div className={`${item.text} text-2xl opacity-20`}>{item.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* 3. AREA CHART */}
        <div className="xl:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2">
            <FiBarChart2 className="text-indigo-500" /> ແນວໂນ້ມການຈອງ 7 ວັນຜ່ານມາ
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.charts?.dailyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8'}} 
                  tickFormatter={(v)=>v.split('-').reverse().slice(0,2).join('/')} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <AreaTooltip />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorIndigo)" />
                <defs>
                  <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. PIE CHART STATUS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <h3 className="text-sm font-bold text-slate-700 mb-6 self-start flex items-center gap-2">
            <FiLayers className="text-indigo-600" /> ສະຫຼຸບສະຖານະການຈອງ
          </h3>
          <div className="h-[180px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data?.charts?.statusSummary || []} 
                  innerRadius={55} 
                  outerRadius={75} 
                  paddingAngle={5} 
                  dataKey="count" 
                  nameKey="status" 
                  stroke="none"
                >
                  {data?.charts?.statusSummary?.map((entry: any, index: number) => (
                    <Cell key={index} fill={STATUS_COLORS[entry.status] || "#cbd5e1"} />
                  ))}
                </Pie>
                <PieTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-800">
                  {data?.charts?.statusSummary?.reduce((a:any, b:any)=>a+b.count, 0) || 0}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">ທັງໝົດ</span>
            </div>
          </div>
          <div className="w-full mt-6 space-y-1.5">
            {data?.charts?.statusSummary?.map((s: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-[10px] font-bold bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5 uppercase tracking-tight">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: STATUS_COLORS[s.status]}} /> 
                  {s.status === 'Approved' ? 'ອະນຸມັດແລ້ວ' : s.status === 'Pending' ? 'ລໍຖ້າອະນຸມັດ' : 'ປະຕິເສດ'}
                </span>
                <span className="text-slate-800">{s.count} ລາຍການ</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. TABLE: RECENT BOOKINGS */}
        <div className="xl:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-4">
          <div className="p-5 border-b border-slate-50 flex items-center gap-2">
            <FiCalendar className="text-indigo-600" />
            <h3 className="font-bold text-slate-700 text-sm">ລາຍການຈອງລ່າສຸດ</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F8FAFC] text-[11px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-8 py-4">ຫົວຂໍ້ການຈອງ</th>
                  <th className="px-6 py-4">ຫ້ອງປະຊຸມ</th>
                  <th className="px-6 py-4">ວັນທີ / ເວລາ</th>
                  <th className="px-8 py-4 text-center">ສະຖານະ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data?.upcoming?.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <FiFileText className="text-slate-300" />
                        <span className="text-sm font-bold text-slate-700">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 px-2.5 py-1 rounded text-[11px] font-bold text-slate-600 border border-slate-200">
                        {item.room?.room_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{item.start_time?.split(' ')[0]}</span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.start_time?.split(' ')[1].substring(0,5)} - {item.end_time?.split(' ')[1].substring(0,5)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                        item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        item.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {item.status === 'Approved' ? 'ອະນຸມັດແລ້ວ' : item.status === 'Pending' ? 'ລໍຖ້າອະນຸມັດ' : 'ປະຕິເສດ'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. BOTTOM INSIGHTS - ພາສາລາວ 100% */}
        <div className="xl:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
           <div className="bg-[#1E293B] p-6 rounded-2xl text-white shadow-lg">
              <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-4 flex items-center gap-2"><FiActivity /> ຫ້ອງທີ່ນິຍົມໃຊ້ຫຼາຍສຸດ</h4>
              <p className="text-lg font-black">{data?.topRoom || "ບໍ່ມີຂໍ້ມູນ"}</p>
           </div>
           <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-4 flex items-center gap-2"><FiCoffee /> ອາຫານ ແລະ ເຄື່ອງດື່ມຍອດນິຍົມ</h4>
              <p className="text-lg font-black text-slate-800">{data?.topCatering || "ບໍ່ມີຂໍ້ມູນ"}</p>
           </div>
           <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-4 flex items-center gap-2"><FiHome /> ອຸປະກອນທີ່ຖືກໃຊ້ຫຼາຍສຸດ</h4>
              <p className="text-lg font-black text-slate-800">{data?.topEquipment || "ບໍ່ມີຂໍ້ມູນ"}</p>
           </div>
           <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-4 flex items-center gap-2"><FiAlertCircle /> ລາຍການທີ່ຖືກປະຕິເສດ</h4>
              <p className="text-lg font-black text-red-500">{data?.totalRejected || 0} ລາຍການ</p>
           </div>
        </div>

      </div>
    </div>
  );
}