"use client";
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { toast, Toaster } from 'react-hot-toast';
import axiosClient from '@/libs/axiosClient';
import { FiCalendar, FiClock, FiUsers, FiHome, FiX } from 'react-icons/fi';

export default function BookingsPage() {
  // 1. ກຳນົດ Type ເປັນ any[] ເພື່ອແກ້ Error 2345
  const [events, setEvents] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const [formData, setFormData] = useState({
    room_id: '',
    user_id: '',
    title: '',
    start_time: '08:00',
    end_time: '09:00',
    status: 'Pending',
    is_recurring: false,
    recur_pattern: 'none',
    attendeeCount: 1
  });

  const fetchData = async () => {
    try {
      const [resBookings, resRooms, resUsers] = await Promise.all([
        axiosClient.get('/bookings'),
        axiosClient.get('/rooms'),
        axiosClient.get('/users')
      ]);
      
      // ກວດສອບໂຄງສ້າງຂໍ້ມູນ (ຫາກມາໃນ .data.data ຫຼື .data ເລີຍ)
      const bookingList = resBookings.data?.data || resBookings.data || [];
      const roomList = resRooms.data?.data || resRooms.data || [];
      const userList = resUsers.data?.data || resUsers.data || [];

      // ສະແດງໃນ Console ເພື່ອ Check ວ່າຂໍ້ມູນມາແທ້ບໍ່
      console.log("Rooms:", roomList);
      console.log("Users:", userList);

      setEvents(bookingList.map((b: any) => ({
        id: String(b.booking_id || b.id),
        title: b.title,
        start: b.start_time,
        end: b.end_time,
        backgroundColor: b.status === 'Approved' ? '#108553' : '#F59E0B',
        borderColor: 'transparent'
      })));

      setRooms(roomList);
      setUsers(userList);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("ດຶງຂໍ້ມູນບໍ່ສຳເລັດ");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const startDateTime = `${selectedDate} ${formData.start_time}:00`;
    const endDateTime = `${selectedDate} ${formData.end_time}:00`;

    const payload = {
      ...formData,
      start_time: startDateTime,
      end_time: endDateTime,
      is_recurring: formData.is_recurring ? 1 : 0
    };

    try {
      const response = await axiosClient.post('/bookings', payload);
      const newBooking = response.data?.data || response.data;

      // --- ສ້າງ Event ໃໝ່ ແລະ ອັບເດດ State ທັນທີ (Instant Update) ---
      const newEvent = {
        id: String(newBooking.booking_id || Math.random()), 
        title: formData.title,
        start: startDateTime,
        end: endDateTime,
        backgroundColor: '#F59E0B', 
        borderColor: 'transparent'
      };

      setEvents((prev) => [...prev, newEvent]);

      toast.success("ບັນທຶກການຈອງສຳເລັດ!");
      setIsModalOpen(false);
      setFormData(prev => ({ ...prev, title: '' })); // ເຄຼຍຟອມ

    } catch (error: any) {
      toast.error(error.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] p-4 lg:p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex bg-white p-6 rounded-[2rem] shadow-sm items-center gap-5 border border-slate-100">
          <div className="bg-[#108553] p-4 rounded-2xl text-white shadow-lg">
            <FiCalendar size={30} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1A2233]">ລະບົບຈອງຫ້ອງປະຊຸມ</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">Data Sync Active</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            dateClick={handleDateClick}
            height="70vh"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' }}
          />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="bg-[#101828] p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">ຈອງວັນທີ: {selectedDate}</h2>
              <button onClick={() => setIsModalOpen(false)}><FiX size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-5">
              <div className="col-span-2 space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-1">ຫົວຂໍ້ການປະຊຸມ</label>
                <input required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>

              {/* Room Dropdown ພ້ອມ Fallback Check */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-1">ຫ້ອງປະຊຸມ</label>
                <select required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold text-sm outline-none"
                  value={formData.room_id} onChange={e => setFormData({...formData, room_id: e.target.value})}>
                  <option value="">-- ເລືອກຫ້ອງ --</option>
                  {rooms.map((room: any) => (
                    <option key={room.id} value={room.id}>
                      {room.room_name || room.name || "Unknown Room"}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Dropdown ພ້ອມ Fallback Check */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-1">ຜູ້ຈອງ</label>
                <select required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold text-sm outline-none"
                  value={formData.user_id} onChange={e => setFormData({...formData, user_id: e.target.value})}>
                  <option value="">-- ເລືອກຜູ້ໃຊ້ --</option>
                  {users.map((u: any) => (
                    <option key={u.id || u.user_id} value={u.id || u.user_id}>
                      {u.username || u.Name || u.first_name || "Unknown User"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-1">ເວລາເລີ່ມ</label>
                <input type="time" required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold text-sm" 
                  value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-1">ເວລາສິ້ນສຸດ</label>
                <input type="time" required className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-bold text-sm" 
                  value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
              </div>

              <div className="col-span-2 flex gap-4 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-500 py-3.5 rounded-xl font-bold">ຍົກເລີກ</button>
                <button type="submit" disabled={loading} className="flex-1 bg-[#108553] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-100">
                  {loading ? 'ກຳລັງບັນທຶກ...' : 'ຢືນຢັນການຈອງ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}