'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

export default function ApprovalPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isFetched = useRef(false);

  const [formData, setFormData] = useState({
    booking_id: '',
    user_id: '',
    status: 'Approved',
    comment: ''
  });

  useEffect(() => {
    const savedData = localStorage.getItem('my_approvals');
    if (savedData) {
      try {
        setApprovals(JSON.parse(savedData));
      } catch (e) {
        console.error("Error parsing data", e);
      }
    } else {
      setApprovals([
        { 
          approval_id: 1, 
          booking_id: 101, 
          user_id: 1, 
          approval_date: new Date().toLocaleString('th-TH'), 
          status: 'Approved', 
          comment: 'เอกสารครบถ้วน' 
        }
      ]);
    }
    isFetched.current = true;
  }, []);

  useEffect(() => {
    if (isFetched.current) {
      localStorage.setItem('my_approvals', JSON.stringify(approvals));
    }
  }, [approvals]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newApproval = {
      ...formData,
      // สร้าง ID ระบบแบบสุ่ม หรือใช้ Timestamp เพื่อให้ไม่ซ้ำกัน
      approval_id: Math.floor(Date.now() / 1000), 
      approval_date: new Date().toLocaleString('th-TH'),
    };
    
    setApprovals(prev => [...prev, newApproval]);
    setIsModalOpen(false);
    setFormData({ booking_id: '', user_id: '', status: 'Approved', comment: '' });
    toast.success("บันทึกการอนุมัติสำเร็จ!");
  };

  const handleDelete = (id: number) => {
    if (confirm("ต้องการลบรายการนี้หรือไม่?")) {
      setApprovals(prev => prev.filter(item => item.approval_id !== id));
      toast.error("ลบข้อมูลแล้ว");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              ✅ ລະບົບຈັດການອະນຸມັດ
            </h1>
            <p className="text-gray-500 mt-1">ຂໍ້ມູນທັງໝົດບັນທືກລົງໃນເຄື່ອງແລ້ວ</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg transition-all active:scale-95"
          >
            ➕ ເພີ່ມການອະນຸມັດໃໝ່
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {/* เพิ่มหัวข้อ ID ระบบ ตรงนี้ */}
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase">ID ລະບົບ</th>
                  <th className="p-4 text-xs font-bold text-gray-600 uppercase">Booking ID</th>
                  <th className="p-4 text-xs font-bold text-gray-600 uppercase">Admin ID</th>
                  <th className="p-4 text-xs font-bold text-gray-600 uppercase">ວັນທີອະນຸມັດ</th>
                  <th className="p-4 text-xs font-bold text-gray-600 uppercase">ສະຖານະ</th>
                  <th className="p-4 text-xs font-bold text-gray-600 uppercase">ໝາຍເຫດ</th>
                  <th className="p-4 text-xs font-bold text-gray-600 uppercase text-center">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {approvals.length > 0 ? (
                  approvals.map((item) => (
                    <tr key={item.approval_id} className="hover:bg-blue-50/30 transition-colors">
                      {/* แสดง ID ระบบ ตรงนี้ */}
                      <td className="p-4 text-gray-400 text-xs font-mono">{item.approval_id}</td>
                      <td className="p-4 font-bold text-blue-600">#{item.booking_id}</td>
                      <td className="p-4 text-gray-600 text-sm">User-{item.user_id}</td>
                      <td className="p-4 text-gray-500 text-xs">{item.approval_date}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {item.status === 'Approved' ? '✅ Approved' : '❌ Rejected'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 text-sm italic max-w-xs truncate">
                        {item.comment || "-"}
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleDelete(item.approval_id)} 
                          className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition-all"
                        >
                          ລົບ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-gray-400">ຍັງບໍ່ມີຂໍ້ມູນຢູ່ໃນລະບົບ</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-600 p-6 text-white">
              <h2 className="text-xl font-bold">📝 ບັນທຶກການຖ້າອະນຸມັດ</h2>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Booking ID</label>
                  <input 
                    type="number" required 
                    className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.booking_id}
                    onChange={(e) => setFormData({...formData, booking_id: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Admin ID</label>
                  <input 
                    type="number" required 
                    className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.user_id}
                    onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">ສະຖານະ</label>
                <select 
                  className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Approved">Approved ✅</option>
                  <option value="Rejected">Rejected ❌</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">ໝາຍເຫດ (Comment)</label>
                <textarea 
                  rows={3}
                  className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="ປ້ອນເຫດຜົນ..."
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)} 
                  className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-gray-500"
                >
                  ຍົກເລີກ
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 py-3 rounded-xl font-bold text-white shadow-lg"
                >
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