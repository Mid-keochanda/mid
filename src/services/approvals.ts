// @/hooks/use-approval-logic.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import axiosClient from '@/lib/axiosClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const API_PATH = '/approvals';

export function useApprovalLogic() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States ສຳລັບ Reject Modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Function ດຶງຂໍ້ມູນ
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/approvals');
      // ກວດສອບໂຄງສ້າງ Data ໃຫ້ຊັດເຈນ
      const result = res.data?.success ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      setData(result);
    } catch (error: any) {
      toast.error("ບໍ່ສາມາດດຶງຂໍ້ມູນໄດ້");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Function ອະນຸມັດ
  const handleApprove = async (id: number) => {
    try {
      const res = await axiosClient.post('/approvals/submit', {
        booking_id: id, 
        status: 'Approved', 
        comment: 'ອະນຸມັດຮຽບຮ້ອຍ'
      });
      if (res.data.success) {
        toast.success("ອະນຸມັດສຳເລັດ");
        fetchData();
      }
    } catch (error) {
      toast.error("ດຳເນີນການບໍ່ສຳເລັດ");
    }
  };

  // Function ເປີດ Modal ປະຕິເສດ
  const openRejectModal = (id: number) => {
    setSelectedId(id);
    setRejectReason("");
    setIsRejectModalOpen(true);
  };

  // Function ສົ່ງການປະຕິເສດ
  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) return toast.error("ກະລຸນາລະບຸເຫດຜົນ");
    try {
      setSubmitting(true);
      const res = await axiosClient.post('/approvals/submit', {
        booking_id: selectedId, 
        status: 'Rejected', 
        comment: rejectReason
      });
      if (res.data.success) {
        toast.success("ປະຕິເສດແລ້ວ");
        setIsRejectModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error("ເກີດຂໍ້ຜິດພາດ");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    data,
    loading,
    fetchData,
    isRejectModalOpen,
    setIsRejectModalOpen,
    rejectReason,
    setRejectReason,
    submitting,
    handleApprove,
    openRejectModal,
    handleRejectSubmit
  };
}