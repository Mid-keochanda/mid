"use client";
import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { bookingService, Booking } from '@/services/department'; 

export default function BookingPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // ໃຊ້ສຳລັບເປີດ/ປິດ Modal ເບິ່ງຂໍ້ມູນ

  // ຟັງຊັນດຶງຂໍ້ມູນ
  const fetchData = useCallback(async () => {
    try {
      console.log("🔄 ກຳລັງໂຫລດຂໍ້ມູນ...");
      const [resB, roomsData, usersData] = await Promise.all([
        bookingService.getAll(),
        bookingService.getRooms(),
        bookingService.getUsers()
      ]);

      // ກວດສອບໂຄງສ້າງຂໍ້ມູນທີ່ໄດ້ມາຈາກ API
      const rawBookings = Array.isArray(resB.data) ? resB.data : (resB.data?.data || []);
      
      const formattedEvents = rawBookings.map((b: any) => ({
        id: b.booking_id?.toString() || Math.random().toString(),
        title: `${b.title} (${b.room?.room_name || 'ບໍ່ລະບຸຫ້ອງ'})`,
        start: b.start_time, // ຕ້ອງເປັນ Format ISO ຫຼື YYYY-MM-DD HH:mm:ss
        end: b.end_time,
        backgroundColor: b.status === 'Approved' ? '#10b981' : b.status === 'Rejected' ? '#ef4444' : '#3b82f6',
        borderColor: 'transparent',
        extendedProps: { ...b } 
      }));

      setEvents(formattedEvents);
      setRooms(roomsData);
      setUsers(usersData);
      console.log("✅ ໂຫລດຂໍ້ມູນສຳເລັດ:", formattedEvents.length, "ລາຍການ");
    } catch (err) {
      console.error("❌ Fetch Error:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDateSelect = (selectInfo: any) => {
    const selectedDate = selectInfo.startStr.split('T')[0];
    setSelectedBooking({
      start_time: `${selectedDate} 08:00:00`,
      end_time: `${selectedDate} 09:00:00`,
      status: 'Pending',
      attendeeCount: 1,
      is_recurring: false,
      recur_pattern: 'none'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const roleType = formData.get("user_role");
    const targetUser = users.find(u => u.role === roleType) || users[0];

    // ປ່ຽນຮູບແບບວັນທີຈາກ T ເປັນຫວ່າງຫວ່າງ ເພື່ອໃຫ້ Database ຮອງຮັບ (YYYY-MM-DD HH:mm)
    const payload: any = {
      title: formData.get("title") as string,
      room_id: Number(formData.get("room_id")), 
      user_id: targetUser?.user_id || 1, 
      start_time: (formData.get("start_time")?.toString() || "").replace('T', ' '),
      end_time: (formData.get("end_time")?.toString() || "").replace('T', ' '),
      attendeeCount: Number(formData.get("attendeeCount")),
      status: formData.get("status"),
      is_recurring: formData.get("is_recurring") === "true",
      recur_pattern: formData.get("recur_pattern") || "none",
    };

    try {
      if (selectedBooking?.booking_id) {
        await bookingService.update(selectedBooking.booking_id, payload as Booking);
      } else {
        await bookingService.create(payload as Booking);
      }
      
      setIsModalOpen(false);
      // ຫຼັງຈາກບັນທຶກໃຫ້ລໍຖ້າແປັບໜຶ່ງແລ້ວດຶງຂໍ້ມູນໃໝ່
      await fetchData(); 
      alert("✅ ບັນທຶກສຳເລັດ!");
    } catch (err: any) {
      alert("❌ ຜິດພາດ: " + (err.response?.data?.message || "Error"));
    }
  };

  return (
    <div className="p-4 md:p-10 bg-[#f8fafc] min-h-screen font-sans text-slate-700">
      <style>{`
        .fc-highlight { background: rgba(59, 130, 246, 0.15) !important; }
        .fc-button { 
          background-color: #ffffff !important; 
          color: #1e293b !important; 
          border: 1px solid #e2e8f0 !important; 
          font-weight: 600 !important;
          border-radius: 12px !important;
          text-transform: capitalize !important;
        }
        .fc-button-primary:not(:disabled).fc-button-active {
          background-color: #3b82f6 !important;
          color: white !important;
          border-color: #3b82f6 !important;
        }
        .fc-toolbar-title { font-weight: 800 !important; color: #1e293b; font-size: 1.5rem !important; }
        .fc-event { cursor: pointer; padding: 4px 8px; border-radius: 8px; border: none !important; margin-bottom: 2px; }
        .fc-daygrid-event-dot { display: none; }
        .fc-col-header-cell { padding: 12px 0 !important; background: #f1f5f9; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <span className="w-2 h-10 bg-blue-600 rounded-full"></span>
            ລະບົບຈອງຫ້ອງປະຊຸມ
          </h1>
           
        </header>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events} // State ຈະຖືກ Update ທີ່ນີ້
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateSelect}
            eventClick={(info) => {
              setSelectedBooking(info.event.extendedProps);
              setIsModalOpen(true);
            }}
            
            headerToolbar={{ 
                left: 'prev,next today', 
                center: 'title', 
                right: 'dayGridMonth,timeGridWeek' 
            }}
            height="70vh"
          />
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[999] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold">{selectedBooking?.booking_id ? '📝 ແກ້ໄຂການຈອງ' : '📅 ຟອມການຈອງ'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition-colors text-2xl">&times;</button>
            </div>
            
            <form key={selectedBooking?.booking_id || 'new'} onSubmit={handleSubmit} className="p-8 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">ປະເພດຜູ້ໃຊ້</label>
                  <select name="user_role" className="w-full bg-slate-100 p-4 rounded-2xl outline-none font-semibold text-sm border-2 border-transparent focus:border-blue-500 transition-all">
                    <option value="user">👤 User</option>
                    <option value="admin">🛡️ Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">ເລືອກຫ້ອງ</label>
                  <select name="room_id" defaultValue={selectedBooking?.room_id || ""} className="w-full bg-slate-100 p-4 rounded-2xl outline-none font-semibold text-sm border-2 border-transparent focus:border-blue-500 transition-all" required>
                    <option value="">-- ເລືອກຫ້ອງ --</option>
                    {rooms.map((r: any) => (
                      <option key={r.id} value={r.id}>{r.room_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">ຫົວຂໍ້ການປະຊຸມ</label>
                <input name="title" defaultValue={selectedBooking?.title || ""} className="w-full bg-slate-100 p-4 rounded-2xl outline-none font-semibold border-2 border-transparent focus:border-blue-500 transition-all" required placeholder="ລະບຸຫົວຂໍ້..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">ເລີ່ມຕົ້ນ</label>
                  <input type="datetime-local" name="start_time" defaultValue={selectedBooking?.start_time?.replace(' ', 'T').substring(0,16)} className="w-full bg-slate-100 p-4 rounded-2xl outline-none font-semibold text-sm border-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">ສິ້ນສຸດ</label>
                  <input type="datetime-local" name="end_time" defaultValue={selectedBooking?.end_time?.replace(' ', 'T').substring(0,16)} className="w-full bg-slate-100 p-4 rounded-2xl outline-none font-semibold text-sm border-none" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">ຈຳນວນຄົນ</label>
                  <input type="number" name="attendeeCount" defaultValue={selectedBooking?.attendeeCount || 1} min="1" className="w-full bg-slate-100 p-4 rounded-2xl outline-none font-semibold border-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">ສະຖານະ</label>
                  <select name="status" defaultValue={selectedBooking?.status || "Pending"} className="w-full bg-slate-100 p-4 rounded-2xl outline-none font-semibold text-sm border-none">
                    <option value="Pending">⏳ ລໍຖ້າຢູ່</option>
                    <option value="Approved">✅ ອະນຸມັດ</option>
                    <option value="Rejected">❌ ປະຕິເສດ</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50/50 p-5 rounded-[1.5rem] border border-blue-100 space-y-3">
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    name="is_recurring" 
                    id="is_recurring"
                    value="true"
                    defaultChecked={selectedBooking?.is_recurring} 
                    className="w-5 h-5 rounded-md accent-blue-600"
                  />
                  <label htmlFor="is_recurring" className="font-bold text-slate-600 text-sm cursor-pointer">ຈອງແບບຊ້ຳ (Recurring)</label>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">ຮູບແບບການຊ້ຳ</label>
                  <select name="recur_pattern" defaultValue={selectedBooking?.recur_pattern || "none"} className="w-full bg-white p-3 rounded-xl outline-none font-semibold text-sm border border-slate-200 focus:ring-2 focus:ring-blue-400">
                    <option value="none">ບໍ່ມີ</option>
                    <option value="daily">ປະຈຳວັນ</option>
                    <option value="weekly">ອາທິດ</option>
                    <option value="monthly">ເດືອນ</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-[0.98] mt-4 uppercase tracking-wider">
                ຢືນຢັນການບັນທຶກ
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}