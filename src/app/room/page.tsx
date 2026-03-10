"use client";
import { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { 
  FiCalendar, FiClock, FiPlus, FiEdit2, FiTrash2, 
  FiMapPin, FiHome, FiSearch, FiImage, FiX 
} from 'react-icons/fi';
import { getAllRooms, insertRoom, updateRoom, deleteRoomApi } from '@/services/rooms';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null); // State ສຳລັບເບິ່ງຮູບໃຫຍ່
  const [searchQuery, setSearchQuery] = useState("");

  const initialRoomState = { 
    room_id: "", room_name: "", location: "", capacity: 0, image_url: "", status: "active" 
  };
  const [currentRoom, setCurrentRoom] = useState<any>(initialRoomState);

  const formatDate = (dateString: string) => {
    if (!dateString) return "---";
    const d = new Date(dateString);
    return d.toLocaleDateString('lo-LA', { day: '2-digit', month: '2-digit', year: '2-digit' }) + 
           " " + d.toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' });
  };

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllRooms();
      setRooms(data);
    } catch (error) {
      toast.error("ໂຫຼດຂໍ້ມູນບໍ່ໄດ້");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentRoom.room_id) {
        await updateRoom(currentRoom.room_id, currentRoom);
        toast.success("ອັບເດດແລ້ວ");
      } else {
        await insertRoom(currentRoom);
        toast.success("ເພີ່ມແລ້ວ");
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (error) {
      toast.error("ເກີດຂໍ້ຜິດພາດ");
    }
  };

  const handleDelete = async (id: any) => {
    if(confirm("ຢືນຢັນການລົບ?")) {
      try {
        await deleteRoomApi(id);
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
      <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-3 md:p-5 font-sans text-slate-900 text-[13px]">
      <Toaster position="top-right" />
      
      <div className="max-w-full mx-auto space-y-2">
        {/* --- Header --- */}
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-green-300 flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded text-white shadow-sm flex-shrink-0">
              <FiHome size={16} />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-slate-800">ຈັດການຫ້ອງປະຊຸມ</h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Total: {rooms.length}</p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto items-center">
            <div className="relative flex-1 md:w-56">
              <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              <input 
                placeholder="ຄົ້ນຫາ..." 
                className="bg-green-50 border border-green-200 py-1.5 pl-8 pr-2 rounded text-[11px] outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500 w-full transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setCurrentRoom(initialRoomState); setIsModalOpen(true); }}
              className="bg-emerald-600 text-white px-3 py-1.5 rounded font-bold flex items-center gap-1 text-[11px] hover:bg-emerald-700 transition-all shadow-sm"
            >
              <FiPlus size={14} /> ເພີ່ມ
            </button>
          </div>
        </div>

        {/* --- Table --- */}
        <div className="bg-white rounded-lg shadow-sm border border-green-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-green-60/80 text-[15px] font-bold uppercase text-green-500 border-b border-green-100">
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">ຮູບ</th>
                  <th className="py-2 px-3">ຊື່ຫ້ອງ</th>
                  <th className="py-2 px-3">ສະຖານທີ່</th>
                  <th className="py-2 px-3">ຄວາມຈຸ</th>
                  <th className="py-2 px-3">ສະຖານະ</th>
                  <th className="py-2 px-3">ວັນທີສ້າງ</th>
                  <th className="py-2 px-3">ອັບເດດລ່າສຸດ</th>
                  <th className="py-2 px-3">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRooms.map((room) => (
                  <tr key={room.room_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-1.5 px-3 text-center text-[10px] text-slate-400 font-mono">#{room.room_id}</td>
                    <td className="py-1.5 px-2">
                      <div 
                        onClick={() => room.image_url && setPreviewImage(room.image_url)}
                        className={`w-9 h-6 bg-slate-100 rounded border border-slate-200 mx-auto flex items-center justify-center overflow-hidden shadow-sm ${room.image_url ? 'cursor-zoom-in hover:opacity-80 transition-all' : ''}`}
                      >
                        {room.image_url ? <img src={room.image_url} className="w-full h-full object-cover" alt="" /> : <FiImage className="text-slate-300" size={10} />}
                      </div>
                    </td>
                    <td className="py-1.5 px-3 font-bold text-slate-800 text-[12px]">{room.room_name}</td>
                    <td className="py-1.5 px-3 text-[11px] text-slate-600 font-medium">
                      <div className="flex items-center gap-1">
                        <FiMapPin className="text-slate-400" size={10}/> {room.location}
                      </div>
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold text-[11px] text-blue-600">{room.capacity} ຄົນ</td>
                    <td className="py-1.5 px-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${room.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {room.status === 'active' ? 'ພ້ອມ' : 'ປິດ'}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-[10px] text-slate-400 whitespace-nowrap"><FiCalendar className="inline mr-1" size={9}/> {formatDate(room.createdAt)}</td>
                    <td className="py-1.5 px-3 text-[10px] text-emerald-600 font-bold whitespace-nowrap bg-emerald-50/30"><FiClock className="inline mr-1" size={9}/> {formatDate(room.updatedAt)}</td>
                    <td className="py-1.5 px-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => { setCurrentRoom(room); setIsModalOpen(true); }} className="p-1 text-amber-500 hover:bg-amber-50 rounded border border-amber-100 bg-white shadow-sm transition-all"><FiEdit2 size={11} /></button>
                        <button onClick={() => handleDelete(room.room_id)} className="p-1 text-red-500 hover:bg-red-50 rounded border border-red-100 bg-white shadow-sm transition-all"><FiTrash2 size={11} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- Image Preview Modal (ສ່ວນທີ່ເພີ່ມໃໝ່) --- */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl">
            <button 
              className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md transition-all z-10"
              onClick={() => setPreviewImage(null)}
            >
              <FiX size={20} />
            </button>
            <img 
              src={previewImage} 
              className="w-full h-auto max-h-[85vh] object-contain animate-in zoom-in-95 duration-200" 
              alt="Room Preview" 
            />
          </div>
        </div>
      )}

      {/* --- Add/Edit Modal (ຄືເກົ່າ) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg w-full max-w-[320px] p-5 shadow-2xl border border-white animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
              <div className="bg-emerald-100 p-1 rounded text-emerald-600"><FiHome size={14}/></div>
              <h2 className="text-sm font-bold text-slate-800 uppercase">{currentRoom.room_id ? 'ແກ້ໄຂ' : 'ເພີ່ມໃໝ່'}</h2>
            </div>
            <form onSubmit={handleSave} className="space-y-2.5">
              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-0.5">ຊື່ຫ້ອງ</label>
                <input required className="w-full bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded text-[11px] outline-none focus:border-emerald-500 transition-all font-medium" 
                  value={currentRoom.room_name} onChange={e => setCurrentRoom({...currentRoom, room_name: e.target.value})} />
              </div>
              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-0.5">ສະຖານທີ່</label>
                <input required className="w-full bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded text-[11px] outline-none focus:border-emerald-500 transition-all font-medium" 
                  value={currentRoom.location} onChange={e => setCurrentRoom({...currentRoom, location: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-0.5">ຄວາມຈຸ</label>
                  <input type="number" className="w-full bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded text-[11px] outline-none focus:border-emerald-500 transition-all font-medium" 
                    value={currentRoom.capacity} onChange={e => setCurrentRoom({...currentRoom, capacity: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-0.5">ສະຖານະ</label>
                  <select className="w-full bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded text-[11px] outline-none cursor-pointer focus:border-emerald-500 transition-all font-medium" value={currentRoom.status} onChange={e => setCurrentRoom({...currentRoom, status: e.target.value})}>
                      <option value="active">ພ້ອມໃຊ້</option>
                      <option value="inactive">ປິດ</option>
                  </select>
                </div>
              </div>
              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase ml-0.5">URL ຮູບ</label>
                <input className="w-full bg-slate-50 border border-slate-200 py-1.5 px-2.5 rounded text-[11px] outline-none focus:border-emerald-500 transition-all font-medium" 
                  value={currentRoom.image_url} onChange={e => setCurrentRoom({...currentRoom, image_url: e.target.value})} />
              </div>
              <div className="flex gap-2 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-500 py-1.5 rounded font-bold text-[10px] hover:bg-slate-200 transition-all">ຍົກເລີກ</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-1.5 rounded font-bold text-[10px] shadow-sm hover:bg-emerald-700 transition-all">ບັນທຶກ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}