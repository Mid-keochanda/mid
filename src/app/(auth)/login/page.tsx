"use client";

import React, { useState } from "react";
import { Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import { login } from "@/services/authen";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // ໂຄງສ້າງຂໍ້ມູນຄືເກົ່າຕາມທີ່ເຈົ້າຕ້ອງການ
  const [formData, setFormData] = useState({ 
    identity: "", 
    password: "", 
    role: "user" 
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      console.log("ກຳລັງສົ່ງຂໍ້ມູນ:", formData);
      const result = await login(formData);
      
      // ກວດສອບ Token ຈາກ Response
      const token = result.access_token;

      if (token) {
        Cookies.set("token", token, { expires: 7 }); 
        localStorage.setItem("token", token);
        window.location.href = "/"; 
      } else {
        setErrorMessage("ເຂົ້າສູ່ລະບົບສຳເລັດ ແຕ່ຫາ Token ບໍ່ເຫັນ");
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "ຂໍ້ມູນການເຂົ້າລະບົບບໍ່ຖືກຕ້ອງ";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-black font-['Phetsarath_OT',_sans-serif]">
      {/* ປຸ່ມກຳນົດ Font ຜ່ານ Style Tag ເພື່ອຄວາມແນ່ນອນ */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Phetsarath+OT&display=swap');
        body {
          font-family: 'Phetsarath OT', sans-serif;
        }
      `}</style>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
              <User size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-1">ເຂົ້າສູ່ລະບົບ</h1>
          <p className="text-gray-500 text-sm font-medium">ກະລຸນາປ້ອນຂໍ້ມູນເພື່ອເຂົ້າໃຊ້ງານລະບົບ</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {errorMessage && (
            <div className="bg-red-50 p-4 rounded-xl flex items-start gap-3 text-red-600 text-sm border border-red-100 animate-pulse">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" /> 
              <span className="break-words font-bold">{errorMessage}</span>
            </div>
          )}

          {/* ຫ້ອງປ້ອນຂໍ້ມູນ: Identity */}
          <div className="space-y-2">
            <label className="text-sm font-bold ml-1 text-gray-700">ອີເມວ ຫຼື ຊື່ຜູ້ໃຊ້</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text" 
                required
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="ປ້ອນອີເມວ ຫຼື ຊື່ຜູ້ໃຊ້"
                value={formData.identity}
                onChange={(e) => setFormData({...formData, identity: e.target.value})}
              />
            </div>
          </div>

          {/* ຫ້ອງປ້ອນຂໍ້ມູນ: Password */}
          <div className="space-y-2">
            <label className="text-sm font-bold ml-1 text-gray-700">ລະຫັດຜ່ານ</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-sans"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {/* ປຸ່ມ Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                ກຳລັງກວດສອບ...
              </span>
            ) : (
              <>ເຂົ້າສູ່ລະບົບ <ArrowRight size={20} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}