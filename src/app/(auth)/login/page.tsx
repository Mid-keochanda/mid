"use client";

import React, { useState } from "react";
import { Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { login } from "@/services/authen";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
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
      const result = await login(formData);
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
    <div className="min-h-screen w-full bg-white flex items-center justify-center text-black font-['Phetsarath_OT',_sans-serif]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Phetsarath+OT&display=swap');
        body {
          font-family: 'Phetsarath OT', sans-serif;
          margin: 0;
          padding: 0;
        }
      `}</style>

      {/* ປັບໃຫ້ມີ Container ຄຸມເພື່ອໃຫ້ຝັ່ງຊ້າຍ ແລະ ຂວາ ຍັບເຂົ້າມາໃກ້ກັນ */}
      <div className="w-full max-w-[1000px] flex flex-col md:flex-row items-center justify-between p-6">
        
        {/* ຝັ່ງຊ້າຍ: Illustration (ປັບຂະໜາດໃຫ້ພໍດີ) */}
        <div className="hidden md:flex flex-1 items-center justify-center relative">
           <div className="relative">
              <div className="absolute -top-12 -left-12 text-blue-400 opacity-40 text-2xl">○</div>
              <div className="absolute top-0 -right-16 text-green-400 opacity-40 text-xl">△</div>
              <div className="absolute bottom-10 -left-16 text-green-400 opacity-40 text-xl">△</div>
              <div className="absolute -bottom-12 right-10 text-blue-400 opacity-40 text-2xl">○</div>
              
              <div className="w-72 h-72 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                <div className="w-52 h-36 bg-[#3d4451] rounded-2xl relative flex items-center justify-center border-b-[8px] border-gray-600 shadow-xl">
                   <div className="w-14 h-14 border-2 border-gray-400 rounded-full flex items-center justify-center">
                      <div className="w-8 h-4 border-t-2 border-gray-400 rounded-t-full mt-4"></div>
                   </div>
                </div>
              </div>
           </div>
        </div>

        {/* ຝັ່ງຂວາ: Login Form (ປັບໃຫ້ຍັບເຂົ້າມາຫາຝັ່ງຊ້າຍ) */}
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="w-full max-w-sm">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">Member Login</h1>
              <p className="text-gray-400 text-xs">Welcome back! Please login to your account.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {errorMessage && (
                <div className="bg-red-50 p-3 rounded-2xl flex items-start gap-2 text-red-600 text-xs border border-red-100">
                  <AlertCircle size={18} className="flex-shrink-0" /> 
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text" 
                  required
                  className="w-full pl-14 pr-6 py-3.5 bg-[#f0f2f5] border-none rounded-full outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
                  placeholder="Email"
                  value={formData.identity}
                  onChange={(e) => setFormData({...formData, identity: e.target.value})}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-14 pr-14 py-3.5 bg-[#f0f2f5] border-none rounded-full outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm font-sans"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#57b846] text-white rounded-full font-bold uppercase tracking-widest hover:bg-[#4caf50] transition-all shadow-lg active:scale-[0.98] disabled:bg-gray-300 text-sm"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="text-center pt-2">
                <p className="text-[11px] text-gray-400">
                  Forgot <span className="text-gray-600 hover:text-green-600 cursor-pointer font-medium transition-colors">Username / Password?</span>
                </p>
              </div>

              <div className="text-center pt-16">
                <button type="button" className="text-[13px] font-bold text-gray-700 hover:text-green-600 flex items-center justify-center gap-2 mx-auto transition-all group">
                  Create your Account 
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}