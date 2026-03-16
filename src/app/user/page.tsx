"use client";
import { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { 
  FiCalendar, FiClock, FiUserPlus, FiEdit, FiTrash2, 
  FiUsers, FiSearch, FiBriefcase 
} from 'react-icons/fi';
import { getAllUser, insertUser, updateUser, deleteUser } from '@/services/users';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const initialUserState = { 
    user_id: "", full_name: "", email: "", password: "", role: "user", department: "" 
  };
  const [currentUser, setCurrentUser] = useState<any>(initialUserState);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllUser();
      setUsers(data.map((item: any) => ({ 
        ...item, 
        user_id: item.user_id || item.id 
      })));
    } catch (error) {
      toast.error("ບໍ່ສາມາດໂຫລດຂໍ້ມູນໄດ້");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentUser.user_id) {
        await updateUser(currentUser.user_id, currentUser);
        toast.success("ອັບເດດຂໍ້ມູນສຳເລັດ");
      } else {
        await insertUser(currentUser);
        toast.success("ເພີ່ມພະນັກງານໃໝ່ແລ້ວ");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
    }
  };

  const handleDelete = async (id: any) => {
    if(window.confirm(`ຢືນຢັນການລົບພະນັກງານນີ້?`)) {
      try {
        await deleteUser(id);
        toast.success("ລົບຂໍ້ມູນສຳເລັດ");
        fetchUsers();
      } catch (error) {
        toast.error("ລົບບໍ່ໄດ້");
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "---";
    const d = new Date(dateString);
    return d.toLocaleDateString('lo-LA', { day: '2-digit', month: '2-digit', year: '2-digit' }) + 
           " " + d.toLocaleTimeString('lo-LA', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-3 md:p-5 font-sans text-slate-900 text-[13px]">
      <Toaster position="top-right" />
      
      <div className="max-w-full mx-auto space-y-2">
        
        {/* Header Section */}
        <div className="bg-white px-4 py-2.5 rounded-xl shadow-sm border border-red-200 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="bg-red-600 p-1.5 rounded-lg text-white">
              <FiUsers size={16} />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-none">ລາຍຊື່ພະນັກງານ</h1>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total: {users.length}</span>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input 
                placeholder="ຄົ້ນຫາ..." 
                className="bg-red-50 border border-red-200 py-1.5 pl-8 pr-3 rounded-lg outline-none focus:ring-1 focus:ring-red-500 w-full text-[13px] transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => { setCurrentUser(initialUserState); setIsModalOpen(true); }}
              className="bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 text-[13px] hover:bg-red-700 transition-all shadow-sm"
            >
              <FiUserPlus size={14}/> ເພີ່ມ
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-red-60/80 text-[15px] font-bold uppercase text-red-500 border-b border-red-100">
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">ຊື່ພະນັກງານ</th>
                  <th className="py-2 px-3">ອີເມວ</th>
                  <th className="py-2 px-3">ພະແນກ</th>
                  <th className="py-2 px-3">ບົດບາດ</th>
                  <th className="py-2 px-3">ວັນທີບັນທຶກ</th>
                  <th className="py-2 px-3">ວັນທີອັບເດດ</th>
                  <th className="py-2 px-3">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user, idx) => (
                  <tr key={user.user_id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-2 px-3 text-center text-[12px] text-slate-400 font-mono">#{idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-slate-700">{user.full_name}</td>
                    <td className="py-2 px-3 font-bold text-slate-600/100">{user.email}</td>
                    <td className="py-2 px-3">
                       <span className="flex items-center font-bold gap-1 text-slate-600">
                         <FiBriefcase size={11} className="opacity-50" />
                         {user.department || '---'}
                       </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-50 text-blue-500'}`}>
                        {user.role}
                      </span>
                    </td>
                    {/* ວັນທີບັນທຶກ */}
                    <td className="py-2 px-3">
                      <span className="text-slate-500 text-[10px] font-bold flex items-center gap-1">
                        <FiCalendar size={10} className="text-blue-400/60" /> 
                        {formatDate(user.createdAt || user.created_at)}
                      </span>
                    </td>
                    {/* ວັນທີອັບເດດ */}
                    <td className="py-2 px-3">
                      {(user.updatedAt || user.updated_at) ? (
                        <span className="text-red-400/80 text-[10px] font-bold flex items-center gap-1">
                          <FiClock size={10} /> 
                          {formatDate(user.updatedAt || user.updated_at)}
                        </span>
                      ) : (
                        <span className="text-slate-200 text-[10px]">ຍັງບໍ່ມີການປ່ຽນແປງ</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => { setCurrentUser(user); setIsModalOpen(true); }} className="p-1 text-amber-500 hover:bg-amber-50 rounded border border-transparent hover:border-amber-100 transition-all">
                          <FiEdit size={13} />
                        </button>
                        <button onClick={() => handleDelete(user.user_id)} className="p-1 text-red-400 hover:bg-red-50 rounded border border-transparent hover:border-red-100 transition-all">
                          <FiTrash2 size={13} />
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

      {/* Modal - ຄົງຄວາມກະທັດຮັດ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-[1px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-5 shadow-xl border border-slate-100">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <div className="bg-red-50 p-1 rounded text-red-600"><FiUserPlus size={16}/></div>
              {currentUser.user_id ? 'ແກ້ໄຂຂໍ້ມູນ' : 'ເພີ່ມພະນັກງານ'}
            </h2>
            <form onSubmit={handleSave} className="space-y-2.5">
              <input required placeholder="ຊື່ ແລະ ນາມສະກຸນ" className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg outline-none focus:border-red-400 text-[13px]" 
                value={currentUser.full_name || ''} onChange={e => setCurrentUser({...currentUser, full_name: e.target.value})} />
              
              <input type="email" required placeholder="ອີເມວ" className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg outline-none focus:border-red-400 text-[13px]" 
                value={currentUser.email || ''} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} />

              {!currentUser.user_id && (
                <input type="password" required placeholder="ລະຫັດຜ່ານ" className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg outline-none focus:border-red-400 text-[13px]" 
                  value={currentUser.password || ''} onChange={e => setCurrentUser({...currentUser, password: e.target.value})} />
              )}
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">ບົດບາດ</label>
                  <select className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg outline-none text-[13px]" value={currentUser.role} onChange={e => setCurrentUser({...currentUser, role: e.target.value})}>
                      <option value="user">USER</option>
                      <option value="admin">ADMIN</option>
                  </select>
                </div>
                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">ພະແນກ</label>
                  <input placeholder="ພະແນກ" className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg outline-none focus:border-red-400 text-[13px]" 
                    value={currentUser.department || ''} onChange={e => setCurrentUser({...currentUser, department: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-500 py-2 rounded-lg font-bold hover:bg-slate-200">ຍົກເລີກ</button>
                <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold shadow-sm hover:bg-red-700">ບັນທຶກ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}