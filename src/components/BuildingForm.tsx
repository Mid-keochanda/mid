import { useState, useEffect } from 'react';

interface BuildingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any; // ຖ້າມີຂໍ້ມູນມາແດງ ແມ່ນການ "ແກ້ໄຂ"
}

export default function BuildingForm({ isOpen, onClose, onSubmit, initialData }: BuildingFormProps) {
  const [formData, setFormData] = useState({ name: '', description: '' });

  // ຖ້າມີຂໍ້ມູນເກົ່າ (Edit mode) ໃຫ້ເອົາມາໃສ່ໃນ Form
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: '', description: '' }); // Reset ຖ້າເປັນການເພີ່ມໃໝ່
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? 'ແກ້ໄຂຂໍ້ມູນອາຄານ' : 'ເພີ່ມອາຄານໃໝ່'}
        </h2>
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
          <div className="mb-4">
            <label className="block mb-1">ຊື່ອາຄານ (Lao/Eng):</label>
            <input 
              className="w-full border p-2 rounded"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">ລາຍລະອຽດ:</label>
            <textarea 
              className="w-full border p-2 rounded"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">ຍົກເລີກ</button>
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded">ບັນທຶກ</button>
          </div>
        </form>
      </div>
    </div>
  );
}