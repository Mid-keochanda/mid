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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); 
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    try {
      console.log("🔄 ກຳລັງໂຫລດຂໍ້ມູນ...");
      const [resB, roomsData, usersData] = await Promise.all([
        bookingService.getAll(),
        bookingService.getRooms(),
        bookingService.getUsers()
      ]);

      const rawBookings = Array.isArray(resB.data) ? resB.data : (resB.data?.data || []);
      
      const formattedEvents = rawBookings.map((b: any) => ({
        // ✅ ໃຊ້ String ID ເພື່ອໃຫ້ FullCalendar ເຮັດວຽກໄດ້ສະຖຽນ
        id: (b.booking_id || b.id)?.toString(), 
        title: `${b.title} (${b.room?.room_name || 'ບໍ່ລະບຸຫ້ອງ'})`,
        start: b.start_time, 
        end: b.end_time,
        backgroundColor: b.status === 'Approved' ? '#10b981' : b.status === 'Rejected' ? '#ef4444' : '#3b82f6',
        borderColor: 'transparent',
        extendedProps: { ...b } 
      }));

      setEvents(formattedEvents);
      setRooms(roomsData);
      setUsers(usersData);
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
      start_time: `${selectedDate}T08:00`,
      end_time: `${selectedDate}T09:00`,
      status: 'Pending',
      attendeeCount: 1,
      is_recurring: false,
      recur_pattern: 'none'
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (info: any) => {
    const data = info.event.extendedProps;
    // ✅ ລວມ ID ເຂົ້າໄປໃຫ້ຊັດເຈນເພື່ອໃຊ້ໃນການ Update
    setSelectedBooking({
        ...data,
        booking_id: info.event.id || data.booking_id || data.id
    });
    setIsViewModalOpen(true); 
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const roleType = formData.get("user_role");
    const targetUser = users.find(u => u.role === roleType) || users[0];
    const isRecurring = formData.get("is_recurring") === "true";

    // ✅ ປັບ Format ເວລາ: ປ່ຽນ 'T' ເປັນ ' ' ເພື່ອໃຫ້ Backend (SQL) ອ່ານໄດ້ຄົບຖ້ວນ
    const formatDT = (val: any) => {
        if(!val) return "";
        return val.toString().replace('T', ' ').substring(0, 16) + ":00";
    }
    
    const payload: any = {
      title: formData.get("title") as string,
      room_id: Number(formData.get("room_id")), 
      user_id: targetUser?.user_id || 1, 
      start_time: formatDT(formData.get("start_time")),
      end_time: formatDT(formData.get("end_time")),
      attendeeCount: Number(formData.get("attendeeCount")),
      status: formData.get("status"), // ດຶງຄ່າ 'Pending', 'Approved', 'Rejected'
      is_recurring: isRecurring,
      recur_pattern: isRecurring ? (formData.get("recur_pattern") || "none") : "none",
    };

    try {
      // ✅ ກວດ ID ເພື່ອແຍກ Update/Create
      const currentId = selectedBooking?.booking_id || selectedBooking?.id;

      if (currentId && !isModalOpen) { // ຖ້າມີ ID ແລະ ມາຈາກການກົດ Edit
         // ຖ້າເຈົ້າຢູ່ໜ້າ Form ແລ້ວມີ ID ແປວ່າກຳລັງແກ້ໄຂ
      }

      // Logic ແຍກການທຳງານ
      if (currentId && (selectedBooking as any).title !== undefined && isModalOpen) {
          // ຖ້າກຳລັງເປີດ Modal Form ແລະ ມີຂໍ້ມູນເກົ່າຢູ່ ແປວ່າແມ່ນການ Update
          await bookingService.update(currentId, payload);
          alert("✅ ແກ້ໄຂຂໍ້ມູນສຳເລັດ!");
      } else {
          await bookingService.create(payload);
          alert("✅ ບັນທຶກການຈອງໃໝ່ສຳເລັດ!");
      }
      
      setIsModalOpen(false);
      setSelectedBooking(null);
      await fetchData(); 
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ";
      alert("❌ ຜິດພາດ: " + errorMsg);
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
            events={events}
            selectable={true} 
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateSelect}
            eventClick={handleEventClick} 
            headerToolbar={{ 
                left: 'prev,next today', 
                center: 'title', 
                right: 'dayGridMonth,timeGridWeek' 
            }}
            height="70vh"
          />
        </div>
      </div>

      {/* 1. Modal View Detail */}
      {isViewModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">ລາຍລະອຽດການຈອງ</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-3xl text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">ຫົວຂໍ້ການປະຊຸມ</p>
                <p className="text-xl font-bold text-slate-800 leading-tight">{selectedBooking.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ຫ້ອງປະຊຸມ</p>
                  <p className="font-bold text-slate-700">{selectedBooking.room?.room_name || 'ບໍ່ໄດ້ລະບຸ'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ສະຖານະ</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-black ${
                    selectedBooking.status === 'Approved' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {selectedBooking.status}
                  </span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">ເລີ່ມຕົ້ນ:</span>
                  <span className="font-bold text-slate-700">{selectedBooking.start_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">ສິ້ນສຸດ:</span>
                  <span className="font-bold text-slate-700">{selectedBooking.end_time}</span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => { 
                    setIsViewModalOpen(false); 
                    setIsModalOpen(true); 
                    // ✅ ແປງ Format ເວລາໃຫ້ datetime-local input ອ່ານອອກ
                    setSelectedBooking({
                        ...selectedBooking,
                        start_time: selectedBooking.start_time?.replace(' ', 'T').substring(0, 16),
                        end_time: selectedBooking.end_time?.replace(' ', 'T').substring(0, 16)
                    });
                  }}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 shadow-lg shadow-blue-200"
                >
                  ແກ້ໄຂຂໍ້ມູນ
                </button>
                <button onClick={() => setIsViewModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black">
                  ປິດອອກ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[999] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold">{(selectedBooking?.booking_id || selectedBooking?.id) ? '📝 ແກ້ໄຂການຈອງ' : '📅 ຟອມການຈອງ'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-2xl">&times;</button>
            </div>
            
            <form key={selectedBooking?.booking_id || 'new'} onSubmit={handleSubmit} className="p-8 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">ປະເພດຜູ້ໃຊ້</label>
                  <select name="user_role" className="w-full bg-slate-100 p-4 rounded-2xl outline-none text-sm">
                    <option value="user">👤 User</option>
                    <option value="admin">🛡️ Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">ເລືອກຫ້ອງ</label>
                  <select name="room_id" defaultValue={selectedBooking?.room_id || ""} className="w-full bg-slate-100 p-4 rounded-2xl outline-none text-sm" required>
                    <option value="">-- ເລືອກຫ້ອງ --</option>
                    {rooms.map((r: any) => (
                      <option key={r.id} value={r.id}>{r.room_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">ຫົວຂໍ້ການປະຊຸມ</label>
                <input name="title" defaultValue={selectedBooking?.title || ""} className="w-full bg-slate-100 p-4 rounded-2xl outline-none" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">ເລີ່ມຕົ້ນ</label>
                  <input type="datetime-local" name="start_time" defaultValue={selectedBooking?.start_time} className="w-full bg-slate-100 p-4 rounded-2xl outline-none text-sm" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">ສິ້ນສຸດ</label>
                  <input type="datetime-local" name="end_time" defaultValue={selectedBooking?.end_time} className="w-full bg-slate-100 p-4 rounded-2xl outline-none text-sm" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">ຈຳນວນຄົນ</label>
                  <input type="number" name="attendeeCount" defaultValue={selectedBooking?.attendeeCount || 1} className="w-full bg-slate-100 p-4 rounded-2xl outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">ສະຖານະ</label>
                  <select name="status" defaultValue={selectedBooking?.status || "Pending"} className="w-full bg-slate-100 p-4 rounded-2xl outline-none text-sm">
                    {/* ✅ ປ່ຽນ Value ເປັນພາສາອັງກິດລ້ວນໆ ເພື່ອໃຫ້ Backend ອ່ານໄດ້ */}
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50/50 p-5 rounded-[1.5rem] border border-blue-100 space-y-3">
                <div className="flex items-center gap-3">
                  <input type="checkbox" name="is_recurring" value="true" defaultChecked={selectedBooking?.is_recurring} className="w-5 h-5 accent-blue-600" />
                  <label className="font-bold text-slate-600 text-sm">ຈອງແບບຊ້ຳ (Recurring)</label>
                </div>
                <select name="recur_pattern" defaultValue={selectedBooking?.recur_pattern || "none"} className="w-full bg-white p-3 rounded-xl text-sm">
                  <option value="none">ບໍ່ມີ</option>
                  <option value="daily">ປະຈຳວັນ</option>
                  <option value="weekly">ອາທິດ</option>
                  <option value="monthly">ເດືອນ</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl transition-all active:scale-[0.98]">
                ຢືນຢັນການບັນທຶກ  
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}