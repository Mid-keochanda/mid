import { Modal } from "@/components/Modals/modals";

export interface DepartmentFormData {
  department: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface DepartmentModalProps {
  isOpen: boolean;
  isUpdate: number;
  formData: DepartmentFormData;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

export function DepartmentModal({
  isOpen,
  isUpdate,
  formData,
  onClose,
  onChange,
  onSubmit,
}: DepartmentModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isUpdate ? "ແກ້ໄຂຝ່າຍ" : "ເພີ່ມຝ່າຍໃໝ່"}
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isUpdate ? "ແກ້ໄຂຝ່າຍ" : "ເພີ່ມຝ່າຍໃໝ່"}
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="ປ້ອນຊື່ຝ່າຍ"
            value={formData.department}
            name="department"
            onChange={onChange}
          />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            ບັນທຶກຂໍ້ມູນ
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ຍົກເລິກ
          </button>
        </div>
      </div>
    </Modal>
  );
}
