"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import allLocales from '@fullcalendar/core/locales-all'; 
import { bookingService } from '@/services/authen'; 

// --- 1. ເພີ່ມ Interface ເພື່ອປິດຂີດແດງ (ກຳນົດ Type ໃຫ້ຊັດເຈນ) ---
interface CateringItem {
  cateringItem_id: number;
  quantity: number;
}

interface EquipmentItem {
  equipment_id: number;
  quantity: number;
}

export default function BookingCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [allEquipments, setAllEquipments] = useState<any[]>([]);
  const [allCaterings, setAllCaterings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // ⭐ ປະກາດ State ໂດຍໃຊ້ Interface ທີ່ສ້າງໄວ້ທາງເທິງ
  const [selectedCaterings, setSelectedCaterings] = useState<CateringItem[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<EquipmentItem[]>([]);

 // Fetch Data
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

// Actions for Catering
const addCateringField = () => setSelectedCaterings([...selectedCaterings, { cateringItem_id: 0, quantity: 1 }]);
const removeCateringField = (index: number) => setSelectedCaterings(selectedCaterings.filter((_, i) => i !== index));

const updateCatering = (index: number, field: string, value: any) => {
  const newItems = [...selectedCaterings] as any[];
  
  // ບັງຄັບໃຫ້ Key ທີ່ເກັບ ID ເປັນ cateringItem_id ສະເໝີ
  const finalField = (field === 'catering_item_id' || field === 'id' || field === 'cateringItem_id') 
    ? 'cateringItem_id' 
    : field;
  
  const finalValue = (finalField === 'cateringItem_id' || finalField === 'quantity') 
    ? (Number(value) || 0) 
    : value;
    
  newItems[index] = { ...newItems[index], [finalField]: finalValue };
  setSelectedCaterings(newItems);
};

// Actions for Equipment
const addEquipmentField = () => setSelectedEquipments([...selectedEquipments, { equipment_id: 0, quantity: 1 }]);
const removeEquipmentField = (index: number) => setSelectedEquipments(selectedEquipments.filter((_, i) => i !== index));

const updateEquipment = (index: number, field: string, value: any) => {
  const newItems = [...selectedEquipments] as any[];
  const finalValue = (field === 'equipment_id' || field === 'quantity') 
    ? (Number(value) || 0) 
    : value;
  newItems[index] = { ...newItems[index], [field]: finalValue };
  setSelectedEquipments(newItems);
};

const filteredEvents = useMemo(() => {
  return events.filter((event: any) => event.title.toLowerCase().includes(searchTerm.toLowerCase()));
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
  const realId = info.event.id?.includes('-rec-') 
                ? info.event.id.split('-rec-')[0] 
                : (info.event.id || data.booking_id || data.id);

  setSelectedBooking({
      ...data,
      booking_id: realId,
      id: realId
  });
  setIsViewModalOpen(true); 
};

const handleDelete = async () => {
  const currentId = selectedBooking?.booking_id || selectedBooking?.id;
  if (!currentId || isNaN(Number(currentId))) {
    alert("❌ ບໍ່ພົບ ID ຂອງການຈອງ");
    return;
  }
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
  const currentId = selectedBooking?.booking_id || selectedBooking?.id;

  // 1. ກວດສອບ ແລະ ປັບປຸງຂໍ້ມູນ Catering ກ່ອນສົ່ງ
  const cateringPayload = selectedCaterings
    .map((i: any) => ({
      // ດຶງ ID ຈາກທຸກບ່ອນທີ່ເປັນໄປໄດ້ ເພື່ອປ້ອງກັນການເປັນ 0
      cateringItem_id: Number(i.cateringItem_id || i.catering_item_id || i.id || 0),
      quantity: Number(i.quantity || 1)
    }))
    .filter(item => item.cateringItem_id > 0); // ສົ່ງສະເພາະອັນທີ່ມີ ID ແທ້ໆ

  // 2. ກວດສອບ ແລະ ປັບປຸງຂໍ້ມູນ Equipment ກ່ອນສົ່ງ
  const equipmentPayload = selectedEquipments
    .map((i: any) => ({
      equipment_id: Number(i.equipment_id || i.id || 0),
      quantity: Number(i.quantity || 1)
    }))
    .filter(item => item.equipment_id > 0);

  const payload: any = {
    title: formData.get("title") as string,
    room_id: Number(formData.get("room_id")),
    user_id: Number(selectedBooking?.user_id || 1),
    start_time: formData.get("start_time"), 
    end_time: formData.get("end_time"),
    attendeeCount: Number(formData.get("attendeeCount")),
    status: formData.get("status") || "Pending", 
    is_recurring: formData.get("is_recurring") === "true" ? 1 : 0,
    recurring_pattern: formData.get("recurring_pattern") || "none",
    
    equipments: equipmentPayload,
    caterings: cateringPayload
  };

  try {
    if (currentId) {
      // ຖ້າ Backend ບໍ່ມີ API Update ໂດຍກົງ, ການ Delete ແລ້ວ Create ໃໝ່ຕ້ອງໝັ້ນໃຈວ່າຂໍ້ມູນເກົ່າອອກໝົດແລ້ວ
      await bookingService.delete(currentId); 
      await bookingService.create(payload);
      alert("✅ ແກ້ໄຂຂໍ້ມູນສຳເລັດ!");
    } else {
      await bookingService.create(payload);
      alert("✅ ບັນທຶກການຈອງໃໝ່ສຳເລັດ!");
    }
    setIsModalOpen(false);
    await fetchData(); // ໂຫຼດຂໍ້ມູນໃໝ່ທັນທີ
  } catch (err: any) {
    console.error("Submit Error:", err);
    alert("❌ ຜິດພາດ: " + (err.response?.data?.message || "ບໍ່ສາມາດບັນທຶກໄດ້"));
  }
};

return (
  <div className="p-4 md:p-10 bg-[#f8fafc] dark:bg-slate-950 min-h-screen font-sans text-slate-700 dark:text-slate-200 transition-colors duration-300">
    <style>{`
    /* ເພີ່ມການກຳນົດ Font ໃຫ້ກັບທຸກ Element ພາຍໃນໜ້ານີ້ */
      * {
        font-family: 'Phetsarath OT', 'Phetsarath', sans-serif !important;
      }
      .fc { color: inherit; }
      .fc-theme-standard td, .fc-theme-standard th { border-color: #e2e8f0; }
      .dark .fc-theme-standard td, .dark .fc-theme-standard th { border-color: #334155; }
      .dark .fc-col-header-cell { background: #1e293b !important; }
      
      /* ແກ້ໄຂບ່ອນນີ້: ເວລາ Hover ໃຫ້ເປັນສີຟ້າ */
      .fc-daygrid-day:hover { background: rgba(59, 246, 118, 0.1) !important; cursor: pointer; }
      .dark .fc-daygrid-day:hover { background: rgba(59, 246, 103, 0.2) !important; }
      
      .fc-highlight { background: rgba(59, 130, 246, 0.15) !important; }
      .fc-button { background-color: #ffffff !important; color: #1e293b !important; border: 1px solid #e2e8f0 !important; font-weight: 600 !important; border-radius: 12px !important; }
      .dark .fc-button { background-color: #1e293b !important; color: #f8fafc !important; border-color: #334155 !important; }
      .fc-button-primary:not(:disabled).fc-button-active { background-color: #3b82f6 !important; color: white !important; }
      .fc-event { cursor: pointer; padding: 4px 8px; border-radius: 8px; border: none !important; }
      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
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

    {/* 1. Modal View Detail - ປັບຄວາມກວ້າງເປັນ max-w-6xl */}
    {isViewModalOpen && selectedBooking && (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 text-slate-700 dark:text-slate-200">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-6xl shadow-2xl overflow-hidden border dark:border-slate-800 flex flex-col max-h-[90vh]">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b dark:border-slate-800 flex justify-between items-center shrink-0">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">ລາຍລະອຽດການຈອງ</h2>
            <button onClick={() => setIsViewModalOpen(false)} className="text-4xl text-slate-300 hover:text-slate-500 transition-colors">&times;</button>
          </div>
          
          <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase mb-2 tracking-widest">ຫົວຂໍ້ການປະຊຸມ</p>
                <p className="text-4xl font-bold text-slate-800 dark:text-white leading-tight">{selectedBooking.title}</p>
              </div>
              <div className="shrink-0 text-right">
                 <p className="text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">ສະຖານະ</p>
                 <span className={`inline-block px-8 py-3 rounded-full text-base font-black shadow-sm ${
                  selectedBooking.status === 'Approved' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 
                  selectedBooking.status === 'Rejected' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                 }`}>
                  {selectedBooking.status === 'Approved' ? 'ອະນຸມັດ' : selectedBooking.status === 'Rejected' ? 'ປະຕິເສດ' : 'ລໍຖ້າກວດສອບ'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
              <div className="border-r border-slate-200 dark:border-slate-700 last:border-0">
                <p className="text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">🏢 ຫ້ອງປະຊຸມ</p>
                <p className="text-xl font-bold">{selectedBooking.room?.room_name || 'ບໍ່ໄດ້ລະບຸ'}</p>
              </div>
              <div className="border-r border-slate-200 dark:border-slate-700 last:border-0 md:pl-6">
                <p className="text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">👤 ປະເພດຜູ້ໃຊ້</p>
                <p className="text-xl font-bold capitalize">{selectedBooking.user?.role === 'admin' ? 'ຜູ້ດູແລລະບົບ' : 'ຜູ້ໃຊ້ທົ່ວໄປ'}</p>
              </div>
              <div className="md:pl-6">
                <p className="text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">👥 ຈຳນວນຄົນ</p>
                <p className="text-xl font-bold">{selectedBooking.attendeeCount || 0} ຄົນ</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {(selectedBooking.booking_caterings?.length > 0 || selectedBooking.caterings?.length > 0) && (
                <div className="p-8 bg-orange-50/30 dark:bg-orange-900/10 rounded-[2.5rem] border border-orange-100/50 dark:border-orange-900/30">
                    <p className="text-[10px] font-black text-orange-500 uppercase mb-4 tracking-widest">🍽️ ອາຫານ ແລະ ເຄື່ອງດື່ມ</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(selectedBooking.booking_caterings || selectedBooking.caterings).map((bc: any, idx: number) => {
                        const itemId = bc.cateringItem_id || bc.catering_item_id || bc.id || bc.catering_item?.id;
                        const itemInfo = allCaterings.find((c:any) => (c.id === itemId) || (c.Id === itemId));
                        return (
                            <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <span className="text-sm font-bold">{itemInfo?.name || itemInfo?.Name || bc.catering_item?.name || 'ລາຍການອາຫານ'}</span>
                            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-xs font-black">x{bc.quantity}</span>
                            </div>
                        );
                        })}
                    </div>
                </div>
                )}

                {(selectedBooking.booking_equipments?.length > 0 || selectedBooking.equipments?.length > 0) && (
                <div className="p-8 bg-blue-50/30 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100/50 dark:border-blue-900/30">
                    <p className="text-[10px] font-black text-blue-500 uppercase mb-4 tracking-widest">🛠️ ອຸປະກອນທີ່ພ່ວງມາ</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(selectedBooking.booking_equipments || selectedBooking.equipments).map((be: any, idx: number) => {
                        const itemId = be.equipment_id || be.id || be.equipment?.id;
                        const itemInfo = allEquipments.find((e:any) => (e.id === itemId) || (e.Id === itemId));
                        return (
                            <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <span className="text-sm font-bold">{itemInfo?.item_name || be.equipment?.item_name || 'ອຸປະກອນ'}</span>
                            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-xs font-black">x{be.quantity}</span>
                            </div>
                        );
                        })}
                    </div>
                </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">📅 ກຳນົດເວລາ</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                    <span className="text-xs text-green-500 font-black mb-1">ເລີ່ມ</span>
                    <span className="font-bold text-xl">{selectedBooking.start_time}</span>
                  </div>
                  <div className="flex flex-col items-center bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm">
                    <span className="text-xs text-red-500 font-black mb-1">ສິ້ນສຸດ</span>
                    <span className="font-bold text-xl">{selectedBooking.end_time}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">🔁 ການຈອງແບບຊ້ຳ</p>
                <div className={`h-[110px] p-6 rounded-[2rem] border flex items-center gap-6 ${ (selectedBooking.is_recurring == 1 || selectedBooking.is_recurring === true) ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200' : 'bg-slate-50 dark:bg-slate-800/30'}`}>
                    <span className="text-4xl">{(selectedBooking.is_recurring == 1 || selectedBooking.is_recurring === true) ? '🔁' : '🔘'}</span>
                    <div>
                      <p className="text-xl font-bold">{(selectedBooking.is_recurring == 1 || selectedBooking.is_recurring === true) ? 'ມີການຈອງແບບຊ້ຳ' : 'ບໍ່ມີການຈອງແບບຊ້ຳ'}</p>
                      {(selectedBooking.is_recurring == 1 || selectedBooking.is_recurring === true) && (
                        <p className="text-orange-600 font-black capitalize">{(selectedBooking.recurring_pattern || selectedBooking.recur_pattern)}</p>
                      )}
                    </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-6">
              <button 
                onClick={() => {
                  const bookingEquips = selectedBooking.booking_equipments || selectedBooking.equipments || [];
                  const mappedEquips = bookingEquips.map((be: any) => ({
                      equipment_id: Number(be.equipment_id || be.id),
                      quantity: Number(be.quantity)
                  }));
                  const bookingCats = selectedBooking.booking_caterings || selectedBooking.caterings || [];
                  const mappedCats = bookingCats.map((bc: any) => ({
                      cateringItem_id: Number(bc.cateringItem_id || bc.catering_item_id || bc.id || bc.catering_item?.id),
                      quantity: Number(bc.quantity)
                  }));
                  const formattedBooking = {
                      ...selectedBooking,
                      start_time: selectedBooking.start_time ? selectedBooking.start_time.replace(' ', 'T').substring(0, 16) : "",
                      end_time: selectedBooking.end_time ? selectedBooking.end_time.replace(' ', 'T').substring(0, 16) : ""
                  };
                  setSelectedEquipments(mappedEquips);
                  setSelectedCaterings(mappedCats);
                  setSelectedBooking(formattedBooking);
                  setIsViewModalOpen(false);
                  setIsModalOpen(true);
                }}
                className="flex-1 bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-blue-700 transition-all shadow-xl active:scale-95"
              > ແກ້ໄຂຂໍ້ມູນ </button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-red-700 transition-all shadow-xl active:scale-95"> ລົບ </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* 2. Modal Form - ປັບຄວາມກວ້າງເປັນ max-w-6xl ໃຫ້ເທົ່າກັບໜ້າ View */}
    {isModalOpen && (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[999] p-4 text-slate-700 dark:text-slate-200">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-6xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col border dark:border-slate-800">
          <div className="bg-blue-600 p-8 text-white flex justify-between items-center shrink-0">
            <h2 className="text-2xl font-bold">{(selectedBooking?.booking_id || selectedBooking?.id) ? '📝 ແກ້ໄຂການຈອງ' : '📅 ຟອມການຈອງ'}</h2>
            <button onClick={() => setIsModalOpen(false)} className="text-3xl hover:scale-110 transition-transform">&times;</button>
          </div>
          
          <form key={selectedBooking?.booking_id || 'new'} onSubmit={handleSubmit} className="p-10 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-widest">👤 ປະເພດຜູ້ໃຊ້</label>
                    <select name="user_role" defaultValue={selectedBooking?.user?.role || "user"} className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl outline-none text-base dark:text-white border dark:border-slate-700 focus:ring-2 focus:ring-blue-500">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-widest">🏢 ເລືອກຫ້ອງ</label>
                    <select name="room_id" defaultValue={selectedBooking?.room_id || ""} className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl outline-none text-base dark:text-white border dark:border-slate-700 focus:ring-2 focus:ring-blue-500" required>
                      <option value="">-- ເລືອກຫ້ອງ --</option>
                      {rooms.map((r: any) => ( <option key={r.id} value={r.id}>{r.room_name}</option> ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-widest">📝 ຫົວຂໍ້ການປະຊຸມ</label>
                  <input name="title" defaultValue={selectedBooking?.title || ""} className="w-full bg-slate-100 dark:bg-slate-800 p-5 rounded-2xl outline-none dark:text-white border dark:border-slate-700 focus:ring-2 focus:ring-blue-500 text-lg" placeholder="ລະບຸຫົວຂໍ້..." required />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-widest">🕒 ເລີ່ມຕົ້ນ</label>
                    <input type="datetime-local" name="start_time" defaultValue={selectedBooking?.start_time} className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl outline-none text-base dark:text-white border dark:border-slate-700" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-widest">🕒 ສິ້ນສຸດ</label>
                    <input type="datetime-local" name="end_time" defaultValue={selectedBooking?.end_time} className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl outline-none text-base dark:text-white border dark:border-slate-700" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-widest">👥 ຈຳນວນຄົນ</label>
                    <input type="number" name="attendeeCount" defaultValue={selectedBooking?.attendeeCount || 1} className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl outline-none dark:text-white border dark:border-slate-700" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-widest">🚦 ສະຖານະ</label>
                    <select name="status" defaultValue={selectedBooking?.status || "Pending"} className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl outline-none text-base dark:text-white border dark:border-slate-700">
                      <option value="Pending">ລໍຖ້າກວດສອບ</option>
                      <option value="Approved">ອະນຸມັດ</option>
                      <option value="Rejected">ປະຕິເສດ</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-3 p-6 bg-orange-50/20 dark:bg-orange-900/5 rounded-3xl border border-orange-100 dark:border-orange-900/20">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">🍽️ ສັ່ງອາຫານ/ເຄື່ອງດື່ມ</label>
                    <button type="button" onClick={addCateringField} className="bg-orange-500 text-white px-4 py-1.5 rounded-full font-bold hover:bg-orange-600 transition-colors shadow-sm">+ ເພີ່ມ</button>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {selectedCaterings.map((item: any, index: number) => (
                      <div key={index} className="flex gap-3 group">
                        <select 
                          value={item.cateringItem_id} 
                          onChange={(e) => updateCatering(index, 'cateringItem_id', e.target.value)} 
                          className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-xl outline-none text-sm dark:text-white border dark:border-slate-700 shadow-sm"
                        >
                          <option value="0">ເລືອກລາຍການ</option>
                          {allCaterings.map((cat: any) => (
                            <option key={cat.id || cat.Id} value={cat.id || cat.Id}>
                              {cat.Name || cat.name} ({cat.price} ກີບ)
                            </option>
                          ))}
                        </select>
                        <input type="number" min="1" value={item.quantity} onChange={(e) => updateCatering(index, 'quantity', e.target.value)} className="w-20 bg-white dark:bg-slate-800 p-3 rounded-xl outline-none text-center text-sm dark:text-white border dark:border-slate-700" />
                        <button type="button" onClick={() => removeCateringField(index)} className="text-red-400 px-1 font-bold text-2xl hover:text-red-600 transition-colors">&times;</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 p-6 bg-blue-50/20 dark:bg-blue-900/5 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">🛠️ ອຸປະກອນເສີມ</label>
                    <button type="button" onClick={addEquipmentField} className="bg-blue-500 text-white px-4 py-1.5 rounded-full font-bold hover:bg-blue-600 transition-colors shadow-sm">+ ເພີ່ມ</button>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {selectedEquipments.map((item: any, index: number) => (
                      <div key={index} className="flex gap-3">
                        <select 
                          value={item.equipment_id} 
                          onChange={(e) => updateEquipment(index, 'equipment_id', e.target.value)} 
                          className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-xl outline-none text-sm dark:text-white border dark:border-slate-700 shadow-sm"
                        >
                          <option value="0">ເລືອກອຸປະກອນ</option>
                          {allEquipments.map((eq: any) => ( <option key={eq.id || eq.Id} value={eq.id || eq.Id}>{eq.item_name || eq.name}</option> ))}
                        </select>
                        <input type="number" min="1" value={item.quantity} onChange={(e) => updateEquipment(index, 'quantity', e.target.value)} className="w-20 bg-white dark:bg-slate-800 p-3 rounded-xl outline-none text-center text-sm dark:text-white border dark:border-slate-700" />
                        <button type="button" onClick={() => removeEquipmentField(index)} className="text-red-400 px-1 font-bold text-2xl hover:text-red-600 transition-colors">&times;</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-indigo-50/30 dark:bg-indigo-900/10 p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30 space-y-4">
                  <div className="flex items-center gap-4">
                    <input type="checkbox" name="is_recurring" value="true" defaultChecked={selectedBooking?.is_recurring == 1 || selectedBooking?.is_recurring === true} className="w-6 h-6 accent-indigo-600 cursor-pointer shadow-sm" id="recur-check" />
                    <label htmlFor="recur-check" className="font-black text-indigo-900 dark:text-indigo-300 text-base cursor-pointer uppercase tracking-wider">ຈອງແບບຊ້ຳ (Recurring)</label>
                  </div>
                  <select name="recurring_pattern" defaultValue={selectedBooking?.recurring_pattern || selectedBooking?.recur_pattern || "none"} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl text-base dark:text-white border dark:border-slate-700 focus:ring-2 focus:ring-indigo-500">
                    <option value="none">-- ບໍ່ມີ --</option>
                    <option value="daily">ປະຈຳວັນ (Daily)</option>
                    <option value="weekly">ປະຈຳອາທິດ (Weekly)</option>
                    <option value="monthly">ປະຈຳເດືອນ (Monthly)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-center shrink-0">
              <button type="submit" className="w-full max-w-md bg-blue-600 text-white py-6 rounded-3xl font-black text-2xl hover:bg-blue-700 shadow-2xl shadow-blue-200 dark:shadow-none transition-all active:scale-95">
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