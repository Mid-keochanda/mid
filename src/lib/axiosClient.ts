import axios from 'axios';

const axiosClient = axios.create({
  baseURL:process.env.NEXT_PUBLIC_API_URL,
});

axiosClient.interceptors.request.use((config) => {
  // 1. ດຶງຄ່າຈາກ localStorage ມາເກັບໄວ້ໃນຕົວແປ rawToken
  const rawToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null; 
  
  if (rawToken) {
    try {
      let finalToken = rawToken;

      // 2. ຖ້າເປັນ JSON string ໃຫ້ Parse ເອົາສະເພາະຕົວ Token ອອກມາ
      if (rawToken.startsWith('{')) {
        const tokenObj = JSON.parse(rawToken);
        finalToken = tokenObj.access_token || tokenObj.token || rawToken;
      }
      
      // 3. ✅ ບອກ TypeScript ວ່າ finalToken ແມ່ນ string ແນ່ນອນ (as string)
      // ແລະ ລ້າງເຄື່ອງໝາຍ " ອອກ
      const cleanToken = (finalToken as string).replace(/"/g, ''); 

      config.headers.Authorization = `Bearer ${cleanToken}`;
      console.log("🚀 Sending Clean Token:", cleanToken.substring(0, 20) + "..."); 
    } catch (e) {
      console.error("❌ Error formatting token:", e);
    }
  } else {
    console.warn("⚠️ No token found in localStorage!");
  }
  return config;
});

export default axiosClient;