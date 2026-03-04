"use client";
import { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import axiosClient from '@/libs/axiosClient';
import { 
  FiCalendar, FiClock, FiUserPlus, FiEdit, FiTrash2, 
  FiMail, FiLock, FiBriefcase, FiUsers, FiSearch, FiShield, FiHash 
} from 'react-icons/fi';

const API_PATH = '/users'; 

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const initialUserState = { 
    user_id: "", 
    full_name: "", 
    email: "", 
    password: "", 
    role: "user", 
    department: "" 
  };
  const [currentUser, setCurrentUser] = useState<any>(initialUserState);

  const formatDate = (dateString: string) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleString('lo-LA', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(API_PATH);
      // Sanitizing data to ensure user_id is always present
      const rawData = Array.isArray(res.data) ? res.data : (res.data.users || res.data.data || []);
      const sanitizedData = rawData.map((item: any) => ({
        ...item,
        user_id: item.user_id || item.id,
      }));
      setUsers(sanitizedData);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error(error.response?.data?.message || "ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentUser.user_id) {
        // Edit Mode
        await axiosClient.put(`${API_PATH}/${currentUser.user_id}`, currentUser);
        toast.success("ອັບເດດຂໍ້ມູນສຳເລັດ");
      } else {
        // Add Mode
        await axiosClient.post(API_PATH, currentUser);
        toast.success("ເພີ່ມພະນັກງານໃໝ່ແລ້ວ");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      // ✅ ຈັດການ Error 401 ໂດຍສະເພາະ
      if (error.response?.status === 401) {
        toast.error("ທ່ານບໍ່ມີສິດຈັດການຂໍ້ມູນ ຫຼື Token ໝົດອາຍຸ");
      } else {
        toast.error(error.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ");
      }
    }
  };

  const deleteUser = async (id: any) => {
    if(!id) return toast.error("ບໍ່ພົບ ID ຜູ້ໃຊ້");
    
    if(window.confirm(`ຢືນຢັນການລົບພະນັກງານ ID: ${id}?`)) {
      try {
        await axiosClient.delete(`${API_PATH}/${id}`);
        toast.success("ລົບສຳເລັດ");
        fetchUsers();
      } catch (error: any) {
        // ✅ ຈັດການ Error 401 ໂດຍສະເພາະ
        if (error.response?.status === 401) {
          toast.error("ທ່ານບໍ່ມີສິດລົບຂໍ້ມູນ (Unauthorized)");
        } else {
          toast.error(error.response?.data?.message || "ບໍ່ສາມາດລົບໄດ້");
        }
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="font-black text-blue-600 animate-pulse text-xl uppercase tracking-tighter">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <Toaster position="top-right" reverseOrder={false} />
      
      <div className="max-w-full mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-300">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
              <FiUsers size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">ລາຍຊື່ພະນັກງານ</h1>
              <p className="text-[13px] text-indigo-400 font-bold uppercase tracking-widest mt-1 flex items-center justify-center md:justify-start gap-0">
                <FiHash size={10}/> Total: {users.length} Users
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                placeholder="ຄົ້ນຫາຊື່ ຫຼື ອີເມວ..." 
                className="bg-slate-50 border border-slate-200 px-6 py-3 pl-12 rounded-2xl outline-none focus:border-blue-500 focus:bg-white w-full font-bold text-sm transition-all shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setCurrentUser(initialUserState); setIsModalOpen(true); }}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-blue-100 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <FiUserPlus strokeWidth={3} /> ເພີ່ມພະນັກງານ
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[15px] font-black uppercase text-slate-400 border-b border-slate-100 tracking-wider">
                  <th className="p-6">ID</th>
                  <th className="p-6">ຊື່ພະນັກງານ</th>
                  <th className="p-6">ອີເມວ</th>
                  <th className="p-6">ພະແນກ / ບົດບາດ</th>
                  <th className="p-6">ວັນທີສ້າງ</th>
                  <th className="p-6">ອັບເດດລ່າສຸດ</th>
                  <th className="p-6 text-right">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-blue-50/30 transition-all group">
                      <td className="p-6 font-mono text-[15px] text-slate-300">#{user.user_id}</td>
                      <td className="p-6 text-slate-800">{user.full_name}</td>
                      <td className="p-6 text-sm text-blue-500/80 italic tracking-tight">{user.email}</td>
                      <td className="p-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-slate-600">{user.department || 'General'}</span>
                          <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-black uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            {user.role}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-[12px] text-slate-400 whitespace-nowrap">
                        <FiCalendar className="inline mr-1" /> {formatDate(user.createdAt)}
                      </td>
                      <td className="p-6 text-[12px] text-blue-600/70 bg-blue-50/30 whitespace-nowrap">
                        <FiClock className="inline mr-1" /> {user.updatedAt ? formatDate(user.updatedAt) : '---'}
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <button 
                            onClick={() => { setCurrentUser(user); setIsModalOpen(true); }} 
                            title="ແກ້ໄຂ"
                            className="p-2.5 text-amber-500 hover:bg-amber-50 rounded-xl border border-amber-100 bg-white shadow-sm"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button 
                            onClick={() => deleteUser(user.user_id)} 
                            title="ລົບ"
                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl border border-red-100 bg-white shadow-sm"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400 font-medium">ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Section */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 md:p-10 shadow-2xl scale-in-center animate-in zoom-in-95">
            <h2 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tighter flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                {currentUser.user_id ? <FiEdit /> : <FiUserPlus />}
              </div>
              {currentUser.user_id ? 'ແກ້ໄຂພະນັກງານ' : 'ເພີ່ມພະນັກງານໃໝ່'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="relative">
                <FiUsers className="absolute left-4 top-4 text-slate-300" />
                <input required placeholder="ຊື່ ແລະ ນາມສະກຸນ" className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all" 
                  value={currentUser.full_name || ''} onChange={e => setCurrentUser({...currentUser, full_name: e.target.value})} />
              </div>
              
              <div className="relative">
                <FiMail className="absolute left-4 top-4 text-slate-300" />
                <input type="email" required placeholder="ອີເມວ" className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all" 
                  value={currentUser.email || ''} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} />
              </div>

              {!currentUser.user_id && (
                <div className="relative">
                  <FiLock className="absolute left-4 top-4 text-slate-300" />
                  <input type="password" required placeholder="ລະຫັດຜ່ານ" className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all" 
                    value={currentUser.password || ''} onChange={e => setCurrentUser({...currentUser, password: e.target.value})} />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <FiShield className="absolute left-4 top-4 text-slate-300 pointer-events-none" />
                  <select className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl font-bold outline-none appearance-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer text-slate-700" value={currentUser.role} onChange={e => setCurrentUser({...currentUser, role: e.target.value})}>
                      <option value="user">USER</option>
                      <option value="admin">ADMIN</option>
                  </select>
                </div>
                <div className="relative">
                  <FiBriefcase className="absolute left-4 top-4 text-slate-300" />
                  <input placeholder="ພະແນກ" className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl font-bold focus:border-blue-500 focus:bg-white outline-none transition-all" 
                    value={currentUser.department || ''} onChange={e => setCurrentUser({...currentUser, department: e.target.value})} />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-[1] bg-red-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-red-100 hover:bg-red-700 active:scale-90 transition-all uppercase text-[15px] tracking-widest">ຍົກເລີກ</button>
                <button type="submit" className="flex-[1] bg-blue-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-90 transition-all uppercase text-[15px] tracking-widest">ບັນທຶກຂໍ້ມູນ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}