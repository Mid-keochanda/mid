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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6a11cb] to-[#2575fc] p-4 text-black font-['Phetsarath_OT',_sans-serif]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Phetsarath+OT&display=swap');
        body {
          font-family: 'Phetsarath OT', sans-serif;
        }
      `}</style>

      {/* Main Container */}
      <div className="max-w-4xl w-full bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Left Side: Illustration */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-white p-12 relative">
           <div className="relative">
              {/* Decorative shapes */}
              <div className="absolute -top-10 -left-10 text-blue-400 opacity-50">○</div>
              <div className="absolute top-0 -right-10 text-green-400 opacity-50">△</div>
              <div className="absolute bottom-0 -left-5 text-green-400 opacity-50 font-bold">△</div>
              <div className="absolute -bottom-10 right-10 text-blue-400 opacity-50">○</div>
              
              {/* Laptop Icon Mockup */}
              <div className="w-64 h-64 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                <div className="w-40 h-28 bg-[#3d4451] rounded-lg relative flex items-center justify-center border-b-4 border-gray-600">
                   <div className="w-10 h-10 border-2 border-gray-400 rounded-full flex items-center justify-center">
                      <div className="w-6 h-3 border-t-2 border-gray-400 rounded-t-full mt-4"></div>
                   </div>
                </div>
              </div>
           </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 p-8 md:p-16 flex flex-col justify-center">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Member Login</h1> pp
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {errorMessage && (
              <div className="bg-red-50 p-3 rounded-xl flex items-start gap-2 text-red-600 text-xs border border-red-100">
                <AlertCircle size={16} className="flex-shrink-0" /> 
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Input: Identity */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text" 
                required
                className="w-full pl-12 pr-4 py-3 bg-[#e6e6e6] border-none rounded-full outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm"
                placeholder="Email"
                value={formData.identity}
                onChange={(e) => setFormData({...formData, identity: e.target.value})}
              />
            </div>

            {/* Input: Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-12 pr-12 py-3 bg-[#e6e6e6] border-none rounded-full outline-none focus:ring-2 focus:ring-green-500 transition-all text-sm font-sans"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#57b846] text-white rounded-full font-bold uppercase tracking-wider hover:bg-[#4caf50] transition-all shadow-md active:scale-95 disabled:bg-gray-400"
            >
              {loading ? "Loading..." : "Login"}
            </button>

            {/* Links */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                Forgot <span className="hover:text-green-600 cursor-pointer">Username / Password?</span>
              </p>
            </div>

            <div className="text-center mt-20">
              <button type="button" className="text-xs font-bold text-gray-600 hover:text-green-600 flex items-center justify-center gap-1 mx-auto transition-all">
                Create your Account <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}