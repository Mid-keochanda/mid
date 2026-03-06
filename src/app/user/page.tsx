"use client";
import { useState, useEffect } from 'react';
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
    user_id: "", // ຕ້ອງເປັນ user_id ເທົ່ານັ້ນ
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(API_PATH);
      // ✅ ກວດເຊັກ ແລະ Mapping ໃຫ້ເປັນ user_id ໃຫ້ໝົດ
      const rawData = Array.isArray(res.data) ? res.data : (res.data.users || res.data.data || []);
      const sanitizedData = rawData.map((item: any) => ({
        ...item,
        user_id: item.user_id || item.id, // ຖ້າ backend ສົ່ງ id ມາ ກໍ່ໃຫ້ປ່ຽນເປັນ user_id
      }));
      setUsers(sanitizedData);
    } catch (error) {
      toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ✅ ໃຊ້ currentUser.user_id ໃນການເຊັກ
      if (currentUser.user_id) {
        await axiosClient.put(`${API_PATH}/${currentUser.user_id}`, currentUser);
        toast.success("ອັບເດດຂໍ້ມູນສຳເລັດ");
      } else {
        await axiosClient.post(API_PATH, currentUser);
        toast.success("ເພີ່ມພະນັກງານໃໝ່ແລ້ວ");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ");
    }
  };

  // ✅ ຟັງຊັນລຶບ: ຕ້ອງຮັບຄ່າ id ມາຈາກ user.user_id
  const deleteUser = async (id: any) => {
    if(!id) return toast.error("ບໍ່ພົບ ID ຜູ້ໃຊ້");
    
    if(confirm("ຢືນຢັນການລົບພະນັກງານຄົນນີ້?")) {
      try {
        await axiosClient.delete(`${API_PATH}/${id}`);
        toast.success("ລົບສຳເລັດ");
        fetchUsers();
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("ບໍ່ສາມາດລົບໄດ້");
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse text-2xl tracking-tighter uppercase">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-full mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg">
                <FiUsers size={24} strokeWidth={2.5} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-800">ລາຍຊື່ພະນັກງານ</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                    <FiHash size={10}/> Total: {users.length} Users
                </p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  placeholder="ຄົ້ນຫາ..." 
                  className="bg-slate-50 border border-slate-200 px-6 py-3 pl-12 rounded-2xl outline-none focus:border-blue-500 w-full font-bold text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <button 
              onClick={() => { setCurrentUser(initialUserState); setIsModalOpen(true); }}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shrink-0 shadow-lg shadow-blue-100"
            >
              <FiUserPlus strokeWidth={3} /> ເພີ່ມພະນັກງານ
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[11px] font-black uppercase text-slate-400 border-b tracking-wider">
                  <th className="p-6">ID</th>
                  <th className="p-6">ຊື່ພະນັກງານ</th>
                  <th className="p-6">ອີເມວ</th>
                  <th className="p-6">ລະຫັດຜ່ານ</th>
                  <th className="p-6">ພະແນກ / ບົດບາດ</th>
                  <th className="p-6">ວັນທີ</th>
                  <th className="p-6 text-right">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-slate-50 transition-all group">
                    <td className="p-6 font-mono text-[10px] text-slate-300 font-bold">#{user.user_id}</td>
                    <td className="p-6 font-black text-slate-800">{user.full_name}</td>
                    <td className="p-6 text-sm font-bold text-blue-500/80 italic flex items-center gap-2">
                      <FiMail size={14} className="opacity-50" /> {user.email}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-slate-300 font-mono tracking-tighter">
                        <FiLock size={12}/> •••••
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5">
                            <FiBriefcase size={12} className="text-slate-300" /> {user.department || 'IT'}
                        </span>
                        <span className={`w-fit px-2 py-0.5 rounded text-[9px] font-black uppercase flex items-center gap-1 ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                          <FiShield size={10} /> {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1 text-[10px] font-bold">
                        <div className="flex items-center gap-1.5 text-slate-400"><FiCalendar size={12}/> {formatDate(user.createdAt)}</div>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        {/* ✅ ປຸ່ມແກ້ໄຂ: ສົ່ງ data ຂອງ user ທັງໝົດເຂົ້າ currentUser */}
                        <button 
                          onClick={() => { setCurrentUser(user); setIsModalOpen(true); }} 
                          className="p-2.5 text-amber-500 hover:bg-amber-50 rounded-xl border border-amber-100 bg-white shadow-sm"
                        >
                          <FiEdit size={16} />
                        </button>
                        {/* ✅ ປຸ່ມລຶບ: ສົ່ງ user_id ໄປຫາຟັງຊັນ */}
                        <button 
                          onClick={() => deleteUser(user.user_id)} 
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl border border-red-100 bg-white shadow-sm"
                        >
                          <FiTrash2 size={16} />
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl">
            <h2 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tighter flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><FiUserPlus /></div>
              {currentUser.user_id ? 'ແກ້ໄຂພະນັກງານ' : 'ເພີ່ມພະນັກງານໃໝ່'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="relative">
                <FiUsers className="absolute left-4 top-4 text-slate-300" />
                <input required placeholder="ຊື່ ແລະ ນາມສະກຸນ" className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl font-bold focus:border-blue-500 outline-none" 
                  value={currentUser.full_name} onChange={e => setCurrentUser({...currentUser, full_name: e.target.value})} />
              </div>
              
              <div className="relative">
                <FiMail className="absolute left-4 top-4 text-slate-300" />
                <input type="email" required placeholder="ອີເມວ" className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl font-bold focus:border-blue-500 outline-none" 
                  value={currentUser.email} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} />
              </div>

              {!currentUser.user_id && (
                <div className="relative">
                  <FiLock className="absolute left-4 top-4 text-slate-300" />
                  <input type="password" required placeholder="ລະຫັດຜ່ານ" className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl font-bold focus:border-blue-500 outline-none" 
                    value={currentUser.password} onChange={e => setCurrentUser({...currentUser, password: e.target.value})} />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <FiShield className="absolute left-4 top-4 text-slate-300 pointer-events-none" />
                  <select className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl font-bold outline-none appearance-none focus:border-blue-500" value={currentUser.role} onChange={e => setCurrentUser({...currentUser, role: e.target.value})}>
                      <option value="user">USER</option>
                      <option value="admin">ADMIN</option>
                  </select>
                </div>
                <div className="relative">
                  <FiBriefcase className="absolute left-4 top-4 text-slate-300" />
                  <input placeholder="ພະແນກ" className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl font-bold focus:border-blue-500 outline-none" 
                    value={currentUser.department} onChange={e => setCurrentUser({...currentUser, department: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-bold text-slate-400 uppercase text-[10px] tracking-widest">ຍົກເລີກ</button>
                <button type="submit" className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg uppercase text-[10px] tracking-widest">
                  บันທຶກ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}