"use client";
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import axiosClient from '@/libs/axiosClient';

const API_PATH = '/users'; 

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // ✅ ຍ້າຍມາໄວ້ໃນນີ້

  const initialUserState = { 
    user_id: "", 
    full_name: "", 
    email: "", 
    password: "", 
    role: "user", 
    department: "" 
  };
  const [currentUser, setCurrentUser] = useState<any>(initialUserState);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(API_PATH);
      const rawData = Array.isArray(res.data) ? res.data : (res.data.users || res.data.data || []);
      const sanitizedData = rawData.map((item: any) => ({
        ...item,
        user_id: item.user_id || item.id, 
        full_name: item.full_name || item.fullname || "ບໍ່ມີຊື່"
      }));
      setUsers(sanitizedData);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentUser.user_id) {
        await axiosClient.put(`${API_PATH}/${currentUser.user_id}`, currentUser);
        toast.success("ອັບເດດຂໍ້ມູນສຳເລັດ");
      } else {
        await axiosClient.post(API_PATH, currentUser);
        toast.success("ເພີ່ມຜູ້ໃຊ້ໃໝ່ແລ້ວ");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error("ບັນທຶກບໍ່ສຳເລັດ");
    }
  };

  const deleteUser = async (id: any) => {
    if(!id) return toast.error("ບໍ່ພົບ ID");
    if(confirm("ຢືນຢັນການລຶບຂໍ້ມູນນີ້?")) {
      try {
        await axiosClient.delete(`${API_PATH}/${id}`);
        toast.success("ລົບຂໍ້ມູນສຳເລັດ");
        fetchUsers();
      } catch (error) {
        toast.error("ບໍ່ສາມາດລົບໄດ້");
      }
    }
  };

  // ✅ ກັ່ນຕອງຂໍ້ມູນກ່ອນສະແດງ
  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center font-bold text-blue-600 text-2xl">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      ກຳລັງໂຫຼດ...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-4 md:p-10 font-['Phetsarath_OT']">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">ລາຍຊື່ພະນັກງານທັງໝົດ</h1>
            <p className="text-slate-500 font-bold mt-1">ຈັດການຂໍ້ມູນຜູ້ໃຊ້ໃນລະບົບ (ມີທັງໝົດ: {users.length} ຄົນ)</p>
          </div>
          <button 
            onClick={() => { setCurrentUser(initialUserState); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-200 active:scale-95"
          >
            + ເພີ່ມພະນັກງານໃໝ່
          </button>
        </div>

        {/* --- 🔍 Search Bar (ວາງຢູ່ນອກ Table) --- */}
        <div className="mb-6 relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <span className="text-xl">🔍</span>
          </div>
          <input 
            type="text"
            placeholder="ຄົ້ນຫາດ້ວຍ ຊື່, ອີເມວ ຫຼື ພະແນກ..."
            className="w-full bg-white p-6 pl-16 rounded-[2rem] outline-none shadow-xl shadow-slate-200/50 border border-white focus:ring-2 focus:ring-blue-500 font-bold transition-all text-slate-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* --- 📋 Table --- */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-xs font-black uppercase text-slate-400 border-b border-slate-100">
                  <th className="p-8">ID</th>
                  <th className="p-8">ຊື່ພະນັກງານ</th>
                  <th className="p-8">ອີເມວ</th>
                  <th className="p-8">ລະຫັດຜ່ານ</th>
                  <th className="p-8">ພະແນກ</th>
                  <th className="p-8 text-center">ບົດບາດ</th>
                  <th className="p-8 text-right">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="p-8 font-mono text-slate-400 text-sm">#{user.user_id}</td>
                    <td className="p-8 font-black text-slate-800">{user.full_name}</td>
                    <td className="p-8 text-blue-500 font-bold italic">{user.email}</td>
                    <td className="p-8 text-slate-300 font-mono text-xs">••••••••••</td>
                    <td className="p-8">
                      <span className="bg-slate-100 px-4 py-2 rounded-xl font-bold text-slate-600 text-sm">
                        {user.department || '---'}
                      </span>
                    </td>
                    <td className="p-8 text-center">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setCurrentUser(user); setIsModalOpen(true); }} className="text-amber-600 font-black px-4 py-2 hover:bg-amber-50 rounded-xl">ແກ້ໄຂ</button>
                        <button onClick={() => deleteUser(user.user_id)} className="text-red-500 font-black px-4 py-2 hover:bg-red-50 rounded-xl">ລົບ</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="p-24 text-center">
                       <div className="flex flex-col items-center gap-2 opacity-30">
                          <span className="text-6xl text-slate-300">🔎</span>
                          <span className="font-black text-slate-400 text-xl">ບໍ່ພົບຂໍ້ມູນທີ່ທ່ານຄົ້ນຫາ</span>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-12 border border-white">
              <h2 className="text-3xl font-black text-slate-800 mb-8">{currentUser.user_id ? 'ແກ້ໄຂພະນັກງານ' : 'ເພີ່ມພະນັກງານໃໝ່'}</h2>
              <form onSubmit={handleSave} className="space-y-5">
                <input required placeholder="ຊື່ ແລະ ນາມສະກຸນ" className="w-full bg-slate-50 p-5 rounded-3xl outline-none font-bold" 
                  value={currentUser.full_name} onChange={e => setCurrentUser({...currentUser, full_name: e.target.value})} />
                <input type="email" required placeholder="ອີເມວ" className="w-full bg-slate-50 p-5 rounded-3xl outline-none font-bold" 
                  value={currentUser.email} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} />
                {!currentUser.user_id && (
                  <input type="password" required placeholder="ລະຫັດຜ່ານ" className="w-full bg-slate-50 p-5 rounded-3xl outline-none font-bold" 
                    value={currentUser.password} onChange={e => setCurrentUser({...currentUser, password: e.target.value})} />
                )}
                <div className="grid grid-cols-2 gap-5">
                  <select className="w-full bg-slate-50 p-5 rounded-3xl font-bold outline-none" value={currentUser.role} onChange={e => setCurrentUser({...currentUser, role: e.target.value})}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                  </select>
                  <input placeholder="ພະແນກ" className="w-full bg-slate-50 p-5 rounded-3xl outline-none font-bold" 
                      value={currentUser.department} onChange={e => setCurrentUser({...currentUser, department: e.target.value})} />
                </div>
                <div className="flex gap-4 pt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 font-black text-slate-400">ຍົກເລີກ</button>
                  <button type="submit" className="flex-[2] bg-blue-600 text-white py-5 rounded-[2rem] font-black shadow-xl">ບັນທຶກ</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}