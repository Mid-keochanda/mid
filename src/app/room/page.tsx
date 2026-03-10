"use client";
import { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import axiosClient from '@/lib/axiosClient';
import { 
  FiCalendar, FiClock, FiPlus, FiEdit2, FiTrash2, 
  FiMapPin, FiUsers, FiHome, FiSearch, FiLayers, FiImage, FiActivity 
} from 'react-icons/fi';

const API_PATH = '/rooms'; 

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const initialRoomState = { 
    room_id: "", room_name: "", location: "", capacity: 0, image_url: "", status: "active" 
  };
  const [currentRoom, setCurrentRoom] = useState<any>(initialRoomState);

  // ຟັງຊັນຈັດຮູບແບບວັນທີໃຫ້ສັ້ນ ແລະ ອ່ານງ່າຍ
  const formatDate = (dateString: string) => {
    if (!dateString) return "---";
    const d = new Date(dateString);
    return d.toLocaleDateString('lo-LA', { day: '2-digit', month: '2-digit', year: '2-digit' }) + 
           " " + d.toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' });
  };

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(API_PATH);
      const rawData = Array.isArray(res.data) ? res.data : (res.data.rooms || res.data.data || []);
      setRooms(rawData.map((item: any) => ({ ...item, room_id: item.room_id || item.id })));
    } catch (error) {
      toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentRoom.room_id) {
        await axiosClient.put(`${API_PATH}/${currentRoom.room_id}`, currentRoom);
        toast.success("ອັບເດດແລ້ວ");
      } else {
        await axiosClient.post(API_PATH, currentRoom);
        toast.success("ເພີ່ມແລ້ວ");
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (error) {
      toast.error("ເກີດຂໍ້ຜິດພາດ");
    }
  };

  const deleteRoom = async (id: any) => {
    if(confirm("ຢືນຢັນການລົບ?")) {
      try {
        await axiosClient.delete(`${API_PATH}/${id}`);
        toast.success("ລົບສຳເລັດ");
        fetchRooms();
      } catch (error) {
        toast.error("ລົບບໍ່ໄດ້");
      }
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.room_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-6 font-sans text-slate-900">
      <Toaster position="top-right" />
      
      <div className="max-w-full mx-auto space-y-5">
        {/* --- Header Section --- */}
        <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-lg flex-shrink-0">
              <FiHome size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">ຈັດການຫ້ອງປະຊຸມ</h1>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">ຈຳນວນທັງໝົດ: {rooms.length}</p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto items-center">
            <div className="relative flex-1 md:w-72">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                placeholder="ຄົ້ນຫາຊື່ຫ້ອງ ຫຼື ສະຖານທີ່..." 
                className="bg-slate-50 border border-slate-200 py-2.5 pl-10 pr-4 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-full text-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setCurrentRoom(initialRoomState); setIsModalOpen(true); }}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-emerald-700 transition-all shadow-md active:scale-95 flex-shrink-0"
            >
              <FiPlus size={18} /> ເພີ່ມໃໝ່
            </button>
          </div>
        </div>

        {/* --- Table Section: Separate Created and Updated Columns --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 px-5 w-16 text-center text-[10px] font-bold uppercase text-slate-400 tracking-widest">ID</th>
                  <th className="py-4 px-4 w-24 text-center text-[10px] font-bold uppercase text-slate-400 tracking-widest">ຮູບພາບ</th>
                  <th className="py-4 px-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">ຊື່ຫ້ອງປະຊຸມ</th>
                  <th className="py-4 px-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">ສະຖານທີ່</th>
                  <th className="py-4 px-5 text-center text-[10px] font-bold uppercase text-slate-400 tracking-widest">ຄວາມຈຸ</th>
                  <th className="py-4 px-5 text-center text-[10px] font-bold uppercase text-slate-400 tracking-widest">ສະຖານະ</th>
                  <th className="py-4 px-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest">ວັນທີສ້າງ</th>
                  <th className="py-4 px-5 text-[10px] font-bold uppercase text-slate-400 tracking-widest text-emerald-600">ອັບເດດລ່າສຸດ</th>
                  <th className="py-4 px-5 text-center text-[10px] font-bold uppercase text-slate-400 tracking-widest">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRooms.map((room) => (
                  <tr key={room.room_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-5 text-center text-xs text-slate-400 font-mono">#{room.room_id}</td>
                    <td className="py-3.5 px-4">
                      <div className="w-14 h-9 bg-slate-100 rounded-lg overflow-hidden mx-auto border border-slate-200 shadow-sm flex items-center justify-center">
                        {room.image_url ? (
                          <img src={room.image_url} className="w-full h-full object-cover" alt="room" />
                        ) : (
                          <FiImage className="text-slate-300" size={16} />
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-800 text-[14px]">{room.room_name}</td>
                    <td className="py-3.5 px-5 text-[13px] text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <FiMapPin className="text-slate-400" size={14}/> {room.location}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                       <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg font-bold text-[11px] border border-blue-100">
                          {room.capacity} ຄົນ
                       </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${room.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {room.status === 'active' ? 'ພ້ອມໃຊ້' : 'ປິດປັບປຸງ'}
                      </span>
                    </td>
                    {/* --- ແຍກ Column ວັນທີສ້າງ --- */}
                    <td className="py-3.5 px-5 text-[11px] text-slate-400 whitespace-nowrap">
                      <FiCalendar className="inline mr-1" size={12}/> {formatDate(room.createdAt)}
                    </td>
                    {/* --- ແຍກ Column ອັບເດດລ່າສຸດ --- */}
                    <td className="py-3.5 px-5 text-[11px] text-emerald-600 font-semibold whitespace-nowrap bg-emerald-50/30">
                      <FiClock className="inline mr-1" size={12}/> {formatDate(room.updatedAt)}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => { setCurrentRoom(room); setIsModalOpen(true); }} 
                          className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl border border-amber-200 bg-white shadow-sm transition-all"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button 
                          onClick={() => deleteRoom(room.room_id)} 
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl border border-red-200 bg-white shadow-sm transition-all"
                        >
                          <FiTrash2 size={15} />
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

      {/* --- Modal (ຄືເກົ່າ) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl border border-white animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-5">
              <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><FiHome size={20}/></div>
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">
                {currentRoom.room_id ? 'ແກ້ໄຂຫ້ອງປະຊຸມ' : 'ເພີ່ມຫ້ອງປະຊຸມໃໝ່'}
              </h2>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 tracking-wider">ຊື່ຫ້ອງປະຊຸມ</label>
                <input required className="w-full bg-slate-50 border border-slate-200 py-3 px-4 rounded-xl text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium" 
                  value={currentRoom.room_name} onChange={e => setCurrentRoom({...currentRoom, room_name: e.target.value})} />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 tracking-wider">ສະຖານທີ່</label>
                <input required className="w-full bg-slate-50 border border-slate-200 py-3 px-4 rounded-xl text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium" 
                  value={currentRoom.location} onChange={e => setCurrentRoom({...currentRoom, location: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 tracking-wider">ຄວາມຈຸ</label>
                  <input type="number" className="w-full bg-slate-50 border border-slate-200 py-3 px-4 rounded-xl text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium" 
                    value={currentRoom.capacity} onChange={e => setCurrentRoom({...currentRoom, capacity: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 tracking-wider">ສະຖານະ</label>
                  <select className="w-full bg-slate-50 border border-slate-200 py-3 px-4 rounded-xl text-sm outline-none appearance-none focus:border-emerald-500 focus:bg-white transition-all font-medium cursor-pointer" value={currentRoom.status} onChange={e => setCurrentRoom({...currentRoom, status: e.target.value})}>
                      <option value="active">ພ້ອມໃຊ້ງານ</option>
                      <option value="inactive">ປິດປັບປຸງ</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 tracking-wider">URL ຮູບພາບ</label>
                <input className="w-full bg-slate-50 border border-slate-200 py-3 px-4 rounded-xl text-sm outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium" 
                  value={currentRoom.image_url} onChange={e => setCurrentRoom({...currentRoom, image_url: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all">ຍົກເລີກ</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg hover:bg-emerald-700 transition-all">ບັນທຶກ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}