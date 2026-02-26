"use client";
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import axiosClient from '@/libs/axiosClient';

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

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(API_PATH);
      const rawData = Array.isArray(res.data) ? res.data : (res.data.rooms || res.data.data || []);
      
      const sanitizedData = rawData.map((item: any) => ({
        ...item,
        room_id: item.room_id || item.id, 
        room_name: item.room_name || "ບໍ່ມີຊື່ຫ້ອງ",
        capacity: item.capacity || 0,
        status: item.status || "active"
      }));

      setRooms(sanitizedData);
    } catch (error) {
      toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນຫ້ອງປະຊຸມໄດ້");
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
        toast.success("ອັບເດດຂໍ້ມູນຫ້ອງສຳເລັດ");
      } else {
        await axiosClient.post(API_PATH, currentRoom);
        toast.success("ເພີ່ມຫ້ອງປະຊຸມໃໝ່ແລ້ວ");
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (error) {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ");
    }
  };

  const deleteRoom = async (id: any) => {
    if(confirm("ຢືນຢັນການລົບຫ້ອງປະຊຸມນີ້?")) {
      try {
        await axiosClient.delete(`${API_PATH}/${id}`);
        toast.success("ລົບສຳເລັດ");
        fetchRooms();
      } catch (error) {
        toast.error("ບໍ່ສາມາດລົບໄດ້");
      }
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.room_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-bold text-blue-600 animate-pulse text-2xl">
      ກຳລັງໂຫຼດຂໍ້ມູນຫ້ອງ...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-4 md:p-10 font-['Phetsarath_OT']">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">ຈັດການຫ້ອງປະຊຸມ</h1>
            <p className="text-slate-500 font-bold mt-1">ທັງໝົດ: {rooms.length} ຫ້ອງ</p>
          </div>
          <button 
            onClick={() => { setCurrentRoom(initialRoomState); setIsModalOpen(true); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl shadow-emerald-200"
          >
            + ເພີ່ມຫ້ອງໃໝ່
          </button>
        </div>

        {/* --- Search Bar --- */}
        <div className="mb-6">
          <input 
            type="text"
            placeholder="ຄົ້ນຫາຊື່ຫ້ອງ ຫຼື ສະຖານທີ່..."
            className="w-full bg-white p-6 rounded-[2rem] outline-none shadow-sm border-none font-bold text-slate-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* --- Table --- */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-black uppercase text-slate-400 border-b border-slate-100">
                  <th className="p-8">ID</th>
                  <th className="p-8 text-center">ຮູບພາບຫ້ອງປະຊຸມ</th>
                  <th className="p-8">ຊື່ຫ້ອງປະຊຸມ</th>
                  <th className="p-8">ສະຖານທີ່</th>
                  <th className="p-8 text-center">ຄວາມຈຸ (ຄົນ)</th>
                  <th className="p-8 text-center">ສະຖານະ</th>
                  <th className="p-8 text-right">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRooms.length > 0 ? filteredRooms.map((room) => (
                  <tr key={room.room_id} className="hover:bg-emerald-50/30 transition-all group">
                    <td className="p-8 font-mono text-slate-400 text-sm">#{room.room_id}</td>
                    {/* ✅ ແຍກ Column ຮູບອອກມາໃຫ້ກົງກັບ Header */}
                    <td className="p-8">
                      <div className="flex justify-center">
                        <div className="w-20 h-14 bg-slate-200 rounded-xl overflow-hidden shadow-inner border border-slate-100">
                           <img 
                             src={room.image_url || 'https://via.placeholder.com/150'} 
                             alt="room" 
                             className="w-full h-full object-cover" 
                           />
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="font-black text-slate-800 text-lg">{room.room_name}</div>
                    </td>
                    <td className="p-8 font-bold text-slate-600">{room.location}</td>
                    <td className="p-8 text-center">
                       <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black">{room.capacity}</span>
                    </td>
                    <td className="p-8 text-center">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${
                        room.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {room.status === 'active' ? 'ພ້ອມໃຊ້ງານ' : 'ປິດປັບປຸງ'}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setCurrentRoom(room); setIsModalOpen(true); }} className="text-amber-600 font-black px-4 py-2 hover:bg-amber-50 rounded-lg">ແກ້ໄຂ</button>
                        <button onClick={() => deleteRoom(room.room_id)} className="text-red-500 font-black px-4 py-2 hover:bg-red-50 rounded-lg">ລຶບ</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="p-24 text-center text-slate-400 font-bold">ບໍ່ພົບຂໍ້ມູນຫ້ອງປະຊຸມ</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- Modal Form --- */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-12">
              <h2 className="text-3xl font-black text-slate-800 mb-8">{currentRoom.room_id ? 'ແກ້ໄຂຫ້ອງ' : 'ເພີ່ມຫ້ອງໃໝ່'}</h2>
              <form onSubmit={handleSave} className="space-y-5">
                <input required placeholder="ຊື່ຫ້ອງປະຊຸມ" className="w-full bg-slate-50 p-5 rounded-3xl outline-none font-bold focus:ring-2 ring-emerald-500 transition-all" 
                  value={currentRoom.room_name} onChange={e => setCurrentRoom({...currentRoom, room_name: e.target.value})} />
                
                <input required placeholder="ສະຖານທີ່ (ຊັ້ນ/ຕຶກ)" className="w-full bg-slate-50 p-5 rounded-3xl outline-none font-bold focus:ring-2 ring-emerald-500 transition-all" 
                  value={currentRoom.location} onChange={e => setCurrentRoom({...currentRoom, location: e.target.value})} />
                
                <div className="grid grid-cols-2 gap-5">
                  <input type="number" placeholder="ຄວາມຈຸ (ຄົນ)" className="w-full bg-slate-50 p-5 rounded-3xl font-bold outline-none focus:ring-2 ring-emerald-500 transition-all" 
                    value={currentRoom.capacity} onChange={e => setCurrentRoom({...currentRoom, capacity: parseInt(e.target.value)})} />
                  
                  <select className="w-full bg-slate-50 p-5 rounded-3xl font-bold outline-none" value={currentRoom.status} onChange={e => setCurrentRoom({...currentRoom, status: e.target.value})}>
                      <option value="active">Active (ພ້ອມໃຊ້)</option>
                      <option value="inactive">Inactive (ປິດປັບປຸງ)</option>
                  </select>
                </div>

                <input placeholder="Link ຮູບພາບຫ້ອງ (URL)" className="w-full bg-slate-50 p-5 rounded-3xl outline-none font-bold" 
                  value={currentRoom.image_url} onChange={e => setCurrentRoom({...currentRoom, image_url: e.target.value})} />

                <div className="flex gap-4 pt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-black text-slate-400 hover:text-slate-600">ຍົກເລີກ</button>
                  <button type="submit" className="flex-[2] bg-emerald-600 text-white py-5 rounded-[2rem] font-black shadow-xl hover:bg-emerald-700 transition-colors">ບັນທຶກຂໍ້ມູນ</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}