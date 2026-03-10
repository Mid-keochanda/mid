"use client";
import { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import axiosClient from '@/lib/axiosClient';
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
    user_id: "", full_name: "", email: "", password: "", role: "user", department: "" 
  };
  const [currentUser, setCurrentUser] = useState<any>(initialUserState);

  const formatDate = (dateString: string) => {
    if (!dateString) return "---";
    const d = new Date(dateString);
    return d.toLocaleDateString('lo-LA', { day: '2-digit', month: '2-digit', year: '2-digit' }) + 
           " " + d.toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' });
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(API_PATH);
      const rawData = Array.isArray(res.data) ? res.data : (res.data.users || res.data.data || []);
      setUsers(rawData.map((item: any) => ({ ...item, user_id: item.user_id || item.id })));
    } catch (error: any) {
      toast.error("ໂຫຼດຂໍ້ມູນບໍ່ໄດ້");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentUser.user_id) {
        await axiosClient.put(`${API_PATH}/${currentUser.user_id}`, currentUser);
        toast.success("ອັບເດດແລ້ວ");
      } else {
        await axiosClient.post(API_PATH, currentUser);
        toast.success("ເພີ່ມແລ້ວ");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error("ເກີດຂໍ້ຜິດພາດ");
    }
  };

  const deleteUser = async (id: any) => {
    if(window.confirm(`ຢືນຢັນການລົບ?`)) {
      try {
        await axiosClient.delete(`${API_PATH}/${id}`);
        toast.success("ລົບສຳເລັດ");
        fetchUsers();
      } catch (error: any) {
        toast.error("ລົບບໍ່ໄດ້");
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-6 font-sans text-slate-900 text-[14px]">
      <Toaster position="top-right" />
      
      <div className="max-w-full mx-auto space-y-4">
        {/* Header Section */}
        <div className="bg-white px-5 py-3.5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-100">
              <FiUsers size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">ລາຍຊື່ພະນັກງານ</h1>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total: {users.length}</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                placeholder="ຄົ້ນຫາຊື່ ຫຼື ອີເມວ..." 
                className="bg-slate-50 border border-slate-200 py-2 pl-9 pr-3 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 w-full text-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setCurrentUser(initialUserState); setIsModalOpen(true); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-blue-700 transition-all shadow-sm"
            >
              <FiUserPlus /> ເພີ່ມ
            </button>
          </div>
        </div>

        {/* Table Section - Separate Role and Department */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-100">
                  <th className="py-3 px-4 w-10 text-center">#</th>
                  <th className="py-3 px-4">ຊື່ພະນັກງານ</th>
                  <th className="py-3 px-4">ອີເມວ</th>
                  <th className="py-3 px-4">ພະແນກ</th>
                  <th className="py-3 px-4">ບົດບາດ</th>
                  <th className="py-3 px-4">ວັນທີສ້າງ</th>
                  <th className="py-3 px-4">ອັບເດດ</th>
                  <th className="py-3 px-4 text-center">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user, idx) => (
                  <tr key={user.user_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-4 text-center text-xs text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800 text-[14px]">{user.full_name}</td>
                    <td className="py-2.5 px-4 text-[13px] text-blue-600/80 font-medium">{user.email}</td>
                    <td className="py-2.5 px-4 text-[13px] text-slate-600 font-medium">{user.department || 'ທົ່ວໄປ'}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[11px] text-slate-400 whitespace-nowrap">
                      <FiCalendar className="inline mr-1 opacity-60" size={10} /> {formatDate(user.createdAt)}
                    </td>
                    <td className="py-2.5 px-4 text-[11px] text-indigo-400 whitespace-nowrap bg-indigo-50/20">
                      <FiClock className="inline mr-1 opacity-60" size={10} /> {user.updatedAt ? formatDate(user.updatedAt) : '---'}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex justify-center gap-1.5">
                        <button 
                          onClick={() => { setCurrentUser(user); setIsModalOpen(true); }} 
                          className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg border border-amber-50 transition-all"
                          title="ແກ້ໄຂ"
                        >
                          <FiEdit size={14} />
                        </button>
                        <button 
                          onClick={() => deleteUser(user.user_id)} 
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-red-50 transition-all"
                          title="ລົບ"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Section (ຄືເກົ່າແຕ່ປັບ UI ໃຫ້ສະອາດຂຶ້ນ) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600"><FiUserPlus size={18}/></div>
              {currentUser.user_id ? 'ແກ້ໄຂຂໍ້ມູນ' : 'ເພີ່ມພະນັກງານ'}
            </h2>
            <form onSubmit={handleSave} className="space-y-3">
              <input required placeholder="ຊື່ ແລະ ນາມສະກຸນ" className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 transition-all" 
                value={currentUser.full_name || ''} onChange={e => setCurrentUser({...currentUser, full_name: e.target.value})} />
              
              <input type="email" required placeholder="ອີເມວ" className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 transition-all" 
                value={currentUser.email || ''} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} />

              {!currentUser.user_id && (
                <input type="password" required placeholder="ລະຫັດຜ່ານ" className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 transition-all" 
                  value={currentUser.password || ''} onChange={e => setCurrentUser({...currentUser, password: e.target.value})} />
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">ບົດບາດ</label>
                  <select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none cursor-pointer" value={currentUser.role} onChange={e => setCurrentUser({...currentUser, role: e.target.value})}>
                      <option value="user">USER</option>
                      <option value="admin">ADMIN</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">ພະແນກ</label>
                  <input placeholder="ພະແນກ" className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-blue-500 transition-all" 
                    value={currentUser.department || ''} onChange={e => setCurrentUser({...currentUser, department: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">ຍົກເລີກ</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all">ບັນທຶກ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}