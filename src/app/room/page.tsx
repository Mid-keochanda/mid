"use client";
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import axiosClient from '@/libs/axiosClient';
// ✅ ເພີ່ມ Icons ທີ່ກ່ຽວກັບຫ້ອງປະຊຸມ: FiHome (ຫ້ອງ), FiSearch (ຄົ້ນຫາ), FiLayers (ຊັ້ນ/ຕຶກ), FiImage (ຮູບ)
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
    room_id: "", 
    room_name: "", 
    location: "", 
    capacity: 0, 
    image_url: "", 
    status: "active" 
  };
  const [currentRoom, setCurrentRoom] = useState<any>(initialRoomState);

  const formatDate = (dateString: string) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleString('lo-LA', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(API_PATH);
      const rawData = Array.isArray(res.data) ? res.data : (res.data.rooms || res.data.data || []);
      const sanitizedData = rawData.map((item: any) => ({
        ...item,
        room_id: item.room_id || item.id,
        createdAt: item.createdAt || item.created_at,
        updatedAt: item.updatedAt || item.updated_at
      }));
      setRooms(sanitizedData);
    } catch (error) {
      toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentRoom.room_id) {
        await axiosClient.put(`${API_PATH}/${currentRoom.room_id}`, currentRoom);
        toast.success("ອັບເດດສຳເລັດ");
      } else {
        await axiosClient.post(API_PATH, currentRoom);
        toast.success("ເພີ່ມຫ້ອງໃໝ່ແລ້ວ");
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
    <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC] gap-4">
      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-emerald-600 text-xl tracking-tighter uppercase animate-pulse">Loading Rooms...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-full mx-auto space-y-6">
        {/* --- Header Section --- */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            {/* ✅ ປ່ຽນໄອຄັອນຫົວຂໍ້ເປັນ FiHome */}
            <div className="bg-emerald-600 p-4 rounded-2xl text-white shadow-lg shadow-emerald-100">
              <FiHome size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">ຈັດການຫ້ອງປະຊຸມ</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Total: {rooms.length} Rooms
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {/* ✅ ເພີ່ມໄອຄັອນໃນຊ່ອງຄົ້ນຫາ */}
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                placeholder="ຄົ້ນຫາຫ້ອງປະຊຸມ..." 
                className="bg-slate-50 border border-slate-200 px-6 py-3 pl-12 rounded-2xl outline-none focus:border-emerald-500 w-full font-bold text-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setCurrentRoom(initialRoomState); setIsModalOpen(true); }}
              className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shrink-0 shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
            >
              <FiPlus size={20} strokeWidth={3} /> ເພີ່ມໃໝ່
            </button>
          </div>
        </div>

        {/* --- Table --- */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[15px] font-black uppercase text-slate-400 border-b tracking-wider">
                  <th className="p-6">ID</th>
                  <th className="p-6 text-center">ຮູບພາບ</th>
                  <th className="p-6">ຊື່ຫ້ອງປະຊຸມ</th>
                  <th className="p-6">ສະຖານທີ່</th>
                  <th className="p-6 text-center">ຄວາມຈຸ</th>
                  <th className="p-6 text-center">ສະຖານະ</th>
                  <th className="p-6">ວັນທີ</th>
                  <th className="p-6 text-right">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRooms.map((room) => (
                  <tr key={room.room_id} className="hover:bg-slate-50/50 group transition-all">
                    <td className="p-6 font-mono text-[15px] text-slate-300 font-bold">#{room.room_id}</td>
                    <td className="p-6">
                      <div className="w-16 h-11 bg-slate-100 rounded-xl overflow-hidden mx-auto border border-slate-200 shadow-inner relative group-hover:border-emerald-200 transition-colors">
                        <img src={room.image_url || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="room" />
                        {!room.image_url && <FiImage className="absolute inset-0 m-auto text-slate-300" />}
                      </div>
                    </td>
                    <td className="p-6 font-black text-slate-500 text-lg tracking-tight group-hover:text-emerald-600 transition-colors">{room.room_name}</td>
                    <td className="p-6">
                      <div className="font-bold text-slate-600 text-sm flex items-center gap-1">
                        {/* ✅ ໄອຄັອນສະຖານທີ່ */}
                        <FiMapPin className="text-emerald-600" size={16}/> {room.location}
                      </div>
                    </td>
                    <td className="p-6 text-center">
                       <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl font-black text-xs flex items-center justify-center gap-1 mx-auto w-fit border border-blue-100">
                          <FiUsers size={14}/> {room.capacity} ຄົນ
                       </span>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[13px] font-black uppercase flex items-center gap-1.5 justify-center w-fit mx-auto ${room.status === 'active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-200 text-slate-500'}`}>
                        <FiActivity size={12} /> {room.status === 'active' ? 'ພ້ອມໃຊ້' : 'ປິດປັບປຸງ'}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1 text-[13px] font-bold">
                        <div className="flex items-center gap-1.5 text-slate-400"><FiCalendar size={12}/> {formatDate(room.createdAt)}</div>
                        <div className="flex items-center gap-1.5 text-emerald-500"><FiClock size={12}/> {formatDate(room.updatedAt)}</div>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button onClick={() => { setCurrentRoom(room); setIsModalOpen(true); }} className="p-2.5 text-amber-500 hover:bg-amber-50 rounded-xl border border-amber-100 bg-white shadow-sm transition-all"><FiEdit2 size={16} /></button>
                        <button onClick={() => deleteRoom(room.room_id)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl border border-red-100 bg-white shadow-sm transition-all"><FiTrash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- Modal Form --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl border border-white animate-in zoom-in duration-200">
            <h2 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tighter flex items-center gap-3">
              <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600"><FiHome /></div>
              {currentRoom.room_id ? 'ແກ້ໄຂຂໍ້ມູນຫ້ອງ' : 'ເພີ່ມຫ້ອງປະຊຸມໃໝ່'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              {/* ✅ ເພີ່ມ Icons ໃນ Inputs */}
              <div className="relative group">
                <FiHome className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                <input required placeholder="ຊື່ຫ້ອງປະຊຸມ" className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl font-bold focus:border-emerald-500 outline-none transition-all" 
                  value={currentRoom.room_name} onChange={e => setCurrentRoom({...currentRoom, room_name: e.target.value})} />
              </div>
              
              <div className="relative group">
                <FiLayers className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                <input required placeholder="ສະຖານທີ່ (ຊັ້ນ/ຕຶກ)" className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl font-bold focus:border-emerald-500 outline-none transition-all" 
                  value={currentRoom.location} onChange={e => setCurrentRoom({...currentRoom, location: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <FiUsers className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                  <input type="number" placeholder="ຄວາມຈຸ" className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl font-bold focus:border-emerald-500 outline-none" 
                    value={currentRoom.capacity} onChange={e => setCurrentRoom({...currentRoom, capacity: parseInt(e.target.value)})} />
                </div>
                <div className="relative">
                  <FiActivity className="absolute left-4 top-4 text-slate-300 pointer-events-none" />
                  <select className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl font-bold outline-none appearance-none focus:border-emerald-500" value={currentRoom.status} onChange={e => setCurrentRoom({...currentRoom, status: e.target.value})}>
                      <option value="active">ພ້ອມໃຊ້ງານ</option>
                      <option value="inactive">ປິດປັບປຸງ</option>
                  </select>
                </div>
              </div>

              <div className="relative group">
                <FiImage className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                <input placeholder="Link ຮູບພາບຫ້ອງ (URL)" className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl outline-none font-bold focus:border-emerald-500" 
                  value={currentRoom.image_url} onChange={e => setCurrentRoom({...currentRoom, image_url: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-[1] bg-red-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-red-100 hover:bg-red-700 transition-all uppercase text-[15px] tracking-widest">ຍົກເລີກ</button>
                <button type="submit" className="flex-[1] bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all uppercase text-[15px] tracking-widest">
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