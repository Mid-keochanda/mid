"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import allLocales from '@fullcalendar/core/locales-all'; 
import { bookingService } from '@/services/authen'; 

export default function BookingPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [allEquipments, setAllEquipments] = useState<any[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<{equipment_id: number, quantity: number}[]>([]);
  const [allCaterings, setAllCaterings] = useState<any[]>([]);
  const [selectedCaterings, setSelectedCaterings] = useState<{catering_item_id: number, quantity: number}[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); 
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [resB, roomsData, usersData, equipData, cateringData] = await Promise.all([
        bookingService.getAll(),
        bookingService.getRooms(),
        bookingService.getUsers(),
        bookingService.getEquipments(),
        bookingService.getCateringItems()
      ]);
      const rawBookings = Array.isArray(resB.data) ? resB.data : (resB.data?.data || []);
      
      const expandedEvents: any[] = [];
      rawBookings.forEach((b: any) => {
        const isRec = b.is_recurring == 1 || b.is_recurring === true || b.is_recurring === "true";
        const pattern = (b.recurring_pattern || b.recur_pattern || 'none').toLowerCase();

        if (isRec && pattern !== 'none') {
          for (let i = 0; i < 10; i++) {
            const start = new Date(b.start_time);
            const end = new Date(b.end_time);
            if (pattern === 'daily') { start.setDate(start.getDate() + i); end.setDate(end.getDate() + i); }
            else if (pattern === 'weekly') { start.setDate(start.getDate() + (i * 7)); end.setDate(end.getDate() + (i * 7)); }
            else if (pattern === 'monthly') { start.setMonth(start.getMonth() + i); end.setMonth(end.getMonth() + i); }

            expandedEvents.push({
              id: `${b.booking_id || b.id}-rec-${i}`, 
              title: `${b.title} (${b.room?.room_name || 'ຫ້ອງທົ່ວໄປ'})`,
              start: start.toISOString(),
              end: end.toISOString(),
              backgroundColor: b.status === 'Approved' ? '#10b981' : b.status === 'Rejected' ? '#ef4444' : '#3b82f6',
              borderColor: 'transparent',
              extendedProps: { ...b, is_recurring: isRec, display_pattern: pattern }
            });
          }
        } else {
          expandedEvents.push({
            id: (b.booking_id || b.id)?.toString(), 
            title: `${b.title} (${b.room?.room_name || 'ຫ້ອງທົ່ວໄປ'})`,
            start: b.start_time, 
            end: b.end_time,
            backgroundColor: b.status === 'Approved' ? '#10b981' : b.status === 'Rejected' ? '#ef4444' : '#3b82f6',
            borderColor: 'transparent',
            extendedProps: { ...b, is_recurring: isRec, display_pattern: pattern } 
          });
        }
      });
      setEvents(expandedEvents);
      setRooms(roomsData);
      setUsers(usersData);
      setAllEquipments(equipData);
      setAllCaterings(cateringData);
    } catch (err) {
      console.error("❌ Fetch Error:", err);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addCateringField = () => setSelectedCaterings([...selectedCaterings, { catering_item_id: 0, quantity: 1 }]);
  const removeCateringField = (index: number) => setSelectedCaterings(selectedCaterings.filter((_, i) => i !== index));
  const updateCatering = (index: number, field: string, value: any) => {
    const newItems = [...selectedCaterings] as any;
    newItems[index][field] = Number(value);
    setSelectedCaterings(newItems);
  };

  const addEquipmentField = () => setSelectedEquipments([...selectedEquipments, { equipment_id: 0, quantity: 1 }]);
  const removeEquipmentField = (index: number) => setSelectedEquipments(selectedEquipments.filter((_, i) => i !== index));
  const updateEquipment = (index: number, field: string, value: any) => {
    const newItems = [...selectedEquipments] as any;
    newItems[index][field] = Number(value);
    setSelectedEquipments(newItems);
  };

  const filteredEvents = useMemo(() => {
    return events.filter(event => event.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [events, searchTerm]);

  const handleDateSelect = (selectInfo: any) => {
    const selectedDate = selectInfo.startStr.split('T')[0];
    setSelectedBooking({
      start_time: `${selectedDate}T08:00`,
      end_time: `${selectedDate}T09:00`,
      status: 'Pending',
      attendeeCount: 1,
      is_recurring: false,
      recurring_pattern: 'none'
    });
    setSelectedEquipments([]); 
    setSelectedCaterings([]);
    setIsModalOpen(true);
  };

  const handleEventClick = (info: any) => {
    const data = info.event.extendedProps;
    setSelectedBooking({
        ...data,
        booking_id: info.event.id?.split('-rec-')[0] || data.booking_id || data.id
    });
    setIsViewModalOpen(true); 
  };

  const handleDelete = async () => {
    const currentId = selectedBooking?.booking_id || selectedBooking?.id;
    if (!currentId) return;
    if (window.confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບການຈອງນີ້?")) {
      try {
        await bookingService.delete(currentId);
        alert("✅ ລົບຂໍ້ມູນສຳເລັດ!");
        setIsViewModalOpen(false);
        setSelectedBooking(null);
        await fetchData();
      } catch (err: any) {
        alert("❌ ຜິດພາດໃນການລົບ: " + (err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ"));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const roleType = formData.get("user_role");
    const targetUser = users.find(u => u.role === roleType) || users[0];
    const isRecurring = formData.get("is_recurring") === "true";
    const formatDT = (val: any) => (!val) ? "" : val.toString().replace('T', ' ').substring(0, 16) + ":00";

    const payload: any = {
      title: formData.get("title") as string,
      room_id: Number(formData.get("room_id")), 
      user_id: targetUser?.user_id || 1, 
      start_time: formatDT(formData.get("start_time")),
      end_time: formatDT(formData.get("end_time")),
      attendeeCount: Number(formData.get("attendeeCount")),
      status: formData.get("status"),
      is_recurring: isRecurring,
      recurring_pattern: isRecurring ? (formData.get("recurring_pattern") || "none") : "none",
      equipments: selectedEquipments.filter(item => item.equipment_id > 0),
      caterings: selectedCaterings.filter(item => item.catering_item_id > 0)
    };

    try {
      const currentId = selectedBooking?.booking_id || selectedBooking?.id;
      if (currentId && isModalOpen && selectedBooking.title) {
          await bookingService.update(currentId, payload);
          alert("✅ ແກ້ໄຂຂໍ້ມູນສຳເລັດ!");
      } else {
          await bookingService.create(payload);
          alert("✅ ບັນທຶກການຈອງໃໝ່ສຳເລັດ!");
      }
      setIsModalOpen(false);
      setSelectedBooking(null);
      setSelectedEquipments([]);
      setSelectedCaterings([]);
      await fetchData(); 
    } catch (err: any) {
      alert("❌ ຜິດພາດ: " + (err.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ"));
    }
  };

  return (
    <div className="p-4 md:p-10 bg-[#f8fafc] dark:bg-slate-950 min-h-screen font-sans text-slate-700 dark:text-slate-200 transition-colors duration-300">
      <style>{`
        .fc { color: inherit; }
        .fc-theme-standard td, .fc-theme-standard th { border-color: #e2e8f0; }
        .dark .fc-theme-standard td, .dark .fc-theme-standard th { border-color: #334155; }
        .dark .fc-col-header-cell { background: #1e293b !important; }
        .dark .fc-daygrid-day:hover { background: #0f172a; }
        .fc-highlight { background: rgba(59, 130, 246, 0.15) !important; }
        .fc-button { background-color: #ffffff !important; color: #1e293b !important; border: 1px solid #e2e8f0 !important; font-weight: 600 !important; border-radius: 12px !important; }
        .dark .fc-button { background-color: #1e293b !important; color: #f8fafc !important; border-color: #334155 !important; }
        .fc-button-primary:not(:disabled).fc-button-active { background-color: #3b82f6 !important; color: white !important; }
        .fc-event { cursor: pointer; padding: 4px 8px; border-radius: 8px; border: none !important; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <span className="w-2 h-10 bg-blue-600 rounded-full"></span> ປະຕິທິນການຈອງ
          </h1>
          <div className="relative w-full md:w-80">
            <input 
              type="text"
              placeholder="🔍 ຄົ້ນຫາຊື່ຫົວຂໍ້ປະຊຸມ..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 dark:text-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locales={allLocales} 
            locale="lo"           
            events={filteredEvents}
            selectable={true} 
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateSelect}
            eventClick={handleEventClick} 
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }}
            height="70vh"
          />
        </div>
      </div>

      {/* 1. Modal View Detail */}
      {isViewModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">ລາຍລະອຽດການຈອງ</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-4xl text-slate-300 hover:text-slate-500 transition-colors">&times;</button>
            </div>
            
            <div className="p-10 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">ຫົວຂໍ້ການປະຊຸມ</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-white leading-tight">{selectedBooking.title}</p>
                </div>
                <div className="shrink-0">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">ສະຖານະ</p>
                   <span className={`inline-block px-5 py-2 rounded-full text-sm font-black shadow-sm ${
                    selectedBooking.status === 'Approved' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 
                    selectedBooking.status === 'Rejected' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {selectedBooking.status === 'Approved' ? 'ອະນຸມັດ' : selectedBooking.status === 'Rejected' ? 'ປະຕິເສດ' : 'ລໍຖ້າກວດສອບ'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ຫ້ອງປະຊຸມ</p>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{selectedBooking.room?.room_name || 'ບໍ່ໄດ້ລະບຸ'}</p>
                </div>
                <div>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">ປະເພດຜູ້ໃຊ້</p>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-300 capitalize">{selectedBooking.user?.role === 'admin' ? 'ຜູ້ດູແລລະບົບ' : 'ຜູ້ໃຊ້ທົ່ວໄປ'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ຈຳນວນຄົນ</p>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{selectedBooking.attendeeCount || 0} ຄົນ</p>
                </div>
              </div>

              {/* ປັບປຸງການສະແດງ Catering */}
              {(selectedBooking.booking_caterings?.length > 0 || selectedBooking.caterings?.length > 0) && (
                <div className="p-6 bg-orange-50/30 dark:bg-orange-900/10 rounded-[2rem] border border-orange-100/50 dark:border-orange-900/30">
                   <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-3">🍽️ ອາຫານ ແລະ ເຄື່ອງດື່ມ</p>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(selectedBooking.booking_caterings || selectedBooking.caterings).map((bc: any, idx: number) => {
                        const itemInfo = allCaterings.find(c => c.Id === (bc.catering_item_id || bc.catering_item?.Id));
                        return (
                          <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                            <span className="text-sm font-bold">{itemInfo?.Name || bc.catering_item?.Name || 'ລາຍການອາຫານ'}</span>
                            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-md text-xs font-black">x{bc.quantity}</span>
                          </div>
                        );
                      })}
                   </div>
                </div>
              )}

              {/* ປັບປຸງການສະແດງ Equipment */}
              {(selectedBooking.booking_equipments?.length > 0 || selectedBooking.equipments?.length > 0) && (
                <div className="p-6 bg-blue-50/30 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100/50 dark:border-blue-900/30">
                   <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">🛠️ ອຸປະກອນທີ່ພ່ວງມາ</p>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(selectedBooking.booking_equipments || selectedBooking.equipments).map((be: any, idx: number) => {
                        const itemInfo = allEquipments.find(e => e.id === (be.equipment_id || be.equipment?.id));
                        return (
                          <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                            <span className="text-sm font-bold">{itemInfo?.item_name || be.equipment?.item_name || 'ອຸປະກອນ'}</span>
                            <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-md text-xs font-black">x{be.quantity}</span>
                          </div>
                        );
                      })}
                   </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ກຳນົດເວລາ</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-slate-500 dark:text-slate-400 text-sm">ເລີ່ມ:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{selectedBooking.start_time}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-slate-500 dark:text-slate-400 text-sm">ສິ້ນສຸດ:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{selectedBooking.end_time}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ການຈອງແບບຊ້ຳ</p>
                  <div className={`h-full p-6 rounded-2xl border flex flex-col justify-center ${ (selectedBooking.is_recurring == 1 || selectedBooking.is_recurring === true) ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{(selectedBooking.is_recurring == 1 || selectedBooking.is_recurring === true) ? '🔁' : '🔘'}</span>
                      <div>
                        <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                          {(selectedBooking.is_recurring == 1 || selectedBooking.is_recurring === true) ? 'ມີການຈອງແບບຊ້ຳ' : 'ບໍ່ມີການຈອງແບບຊ້ຳ'}
                        </p>
                        {(selectedBooking.is_recurring == 1 || selectedBooking.is_recurring === true) && (
                          <p className="text-orange-600 dark:text-orange-400 font-black">
                            { (selectedBooking.recurring_pattern || selectedBooking.recur_pattern)?.toLowerCase() === 'daily' ? '📅 ປະຈຳວັນ' :
                              (selectedBooking.recurring_pattern || selectedBooking.recur_pattern)?.toLowerCase() === 'weekly' ? '📅 ປະຈຳອາທິດ' :
                              (selectedBooking.recurring_pattern || selectedBooking.recur_pattern)?.toLowerCase() === 'monthly' ? '📅 ປະຈຳເດືອນ' : 
                              `📅 ${selectedBooking.recurring_pattern || 'ບໍ່ລະບຸ'}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => { 
                    setIsViewModalOpen(false); 
                    // ເອົາຂໍ້ມູນອາຫານ ແລະ ອຸປະກອນ ຈາກ selectedBooking ມາໃສ່ State ຂອງ Form
                    const bookingEquips = selectedBooking.booking_equipments || selectedBooking.equipments || [];
                    const bookingCats = selectedBooking.booking_caterings || selectedBooking.caterings || [];
                    
                    setSelectedEquipments(bookingEquips.map((be: any) => ({
                        equipment_id: be.equipment_id || be.equipment?.id,
                        quantity: be.quantity
                    })));
                    
                    setSelectedCaterings(bookingCats.map((bc: any) => ({
                        catering_item_id: bc.catering_item_id || bc.catering_item?.Id,
                        quantity: bc.quantity
                    })));

                    setIsModalOpen(true); 
                    setSelectedBooking({
                        ...selectedBooking,
                        start_time: selectedBooking.start_time?.replace(' ', 'T').substring(0, 16),
                        end_time: selectedBooking.end_time?.replace(' ', 'T').substring(0, 16)
                    });
                  }}
                  className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98]"
                > ແກ້ໄຂຂໍ້ມູນ </button>
                <button onClick={handleDelete} className="flex-[2] bg-red-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-[0.98]"> ລົບ </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[999] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col border dark:border-slate-800">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold">{(selectedBooking?.booking_id || selectedBooking?.id) ? '📝 ແກ້ໄຂການຈອງ' : '📅 ຟອມການຈອງ'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-2xl hover:scale-110 transition-transform">&times;</button>
            </div>
            
            <form key={selectedBooking?.booking_id || 'new'} onSubmit={handleSubmit} className="p-8 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1: ຂໍ້ມູນຫຼັກ */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">ປະເພດຜູ້ໃຊ້</label>
                      <select name="user_role" defaultValue={selectedBooking?.user?.role || "user"} className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl outline-none text-sm dark:text-white border dark:border-slate-700">
                        <option value="user">👤 User</option>
                        <option value="admin">🛡️ Admin</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">ເລືອກຫ້ອງ</label>
                      <select name="room_id" defaultValue={selectedBooking?.room_id || ""} className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl outline-none text-sm dark:text-white border dark:border-slate-700" required>
                        <option value="">-- ເລືອກຫ້ອງ --</option>
                        {rooms.map((r: any) => ( <option key={r.id} value={r.id}>{r.room_name}</option> ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">ຫົວຂໍ້ການປະຊຸມ</label>
                    <input name="title" defaultValue={selectedBooking?.title || ""} className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl outline-none dark:text-white border dark:border-slate-700" placeholder="ລະບຸຫົວຂໍ້..." required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">ເລີ່ມຕົ້ນ</label>
                      <input type="datetime-local" name="start_time" defaultValue={selectedBooking?.start_time} className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl outline-none text-sm dark:text-white border dark:border-slate-700" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">ສິ້ນສຸດ</label>
                      <input type="datetime-local" name="end_time" defaultValue={selectedBooking?.end_time} className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl outline-none text-sm dark:text-white border dark:border-slate-700" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">ຈຳນວນຄົນ</label>
                      <input type="number" name="attendeeCount" defaultValue={selectedBooking?.attendeeCount || 1} className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl outline-none dark:text-white border dark:border-slate-700" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">ສະຖານະ</label>
                      <select name="status" defaultValue={selectedBooking?.status || "Pending"} className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl outline-none text-sm dark:text-white border dark:border-slate-700">
                        <option value="Pending">ລໍຖ້າກວດສອບ</option>
                        <option value="Approved">ອະນຸມັດ</option>
                        <option value="Rejected">ປະຕິເສດ</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Column 2: ອາຫານ, ອຸປະກອນ ແລະ Recurring */}
                <div className="space-y-6">
                  {/* Catering */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">🍽️ ສັ່ງອາຫານ/ເຄື່ອງດື່ມ</label>
                      <button type="button" onClick={addCateringField} className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-bold hover:bg-orange-200 transition-colors">+ ເພີ່ມ</button>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {selectedCaterings.map((item, index) => (
                        <div key={index} className="flex gap-2 animate-in slide-in-from-right-2 duration-200">
                          <select 
                            value={item.catering_item_id} 
                            onChange={(e) => updateCatering(index, 'catering_item_id', e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl outline-none text-sm dark:text-white border dark:border-slate-700"
                          >
                            <option value="0">ເລືອກລາຍການ</option>
                            {allCaterings.map((cat: any) => (
                              <option key={cat.Id} value={cat.Id}>{cat.Name} ({cat.price} ກີບ)</option>
                            ))}
                          </select>
                          <input type="number" min="1" value={item.quantity} onChange={(e) => updateCatering(index, 'quantity', e.target.value)} className="w-16 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl outline-none text-center text-sm dark:text-white border dark:border-slate-700" />
                          <button type="button" onClick={() => removeCateringField(index)} className="text-red-500 px-2 font-bold text-xl hover:scale-125 transition-transform">&times;</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Equipments */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">🛠️ ອຸປະກອນເສີມ</label>
                      <button type="button" onClick={addEquipmentField} className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-bold hover:bg-blue-200 transition-colors">+ ເພີ່ມ</button>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {selectedEquipments.map((item, index) => (
                        <div key={index} className="flex gap-2 animate-in slide-in-from-right-2 duration-200">
                          <select value={item.equipment_id} onChange={(e) => updateEquipment(index, 'equipment_id', e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl outline-none text-sm dark:text-white border dark:border-slate-700">
                            <option value="0">ເລືອກອຸປະກອນ</option>
                            {allEquipments.map((eq: any) => ( <option key={eq.id} value={eq.id}>{eq.item_name}</option> ))}
                          </select>
                          <input type="number" min="1" value={item.quantity} onChange={(e) => updateEquipment(index, 'quantity', e.target.value)} className="w-16 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl outline-none text-center text-sm dark:text-white border dark:border-slate-700" />
                          <button type="button" onClick={() => removeEquipmentField(index)} className="text-red-500 px-2 font-bold text-xl hover:scale-125 transition-transform">&times;</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recurring */}
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-[1.5rem] border border-blue-100 dark:border-blue-900/30 space-y-3">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" name="is_recurring" value="true" defaultChecked={selectedBooking?.is_recurring == 1 || selectedBooking?.is_recurring === true} className="w-5 h-5 accent-blue-600 cursor-pointer" id="recur-check" />
                      <label htmlFor="recur-check" className="font-bold text-slate-600 dark:text-slate-400 text-sm cursor-pointer">ຈອງແບບຊ້ຳ (Recurring)</label>
                    </div>
                    <select name="recurring_pattern" defaultValue={selectedBooking?.recurring_pattern || selectedBooking?.recur_pattern || "none"} className="w-full bg-white dark:bg-slate-800 p-3 rounded-xl text-sm dark:text-white border dark:border-slate-700">
                      <option value="none">ບໍ່ມີ</option>
                      <option value="daily">ປະຈຳວັນ</option>
                      <option value="weekly">ປະຈຳອາທິດ</option>
                      <option value="monthly">ປະຈຳເດືອນ</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98]">
                  ຢືນຢັນການບັນທຶກ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}