"use client";
import { EditIcon, TrashIcon } from "@/assets/icons";
import { DepartmentModal, DepartmentFormData } from "@/app/department/_components/department-modal";
import { getTopChannels } from "@/components/Tables/fetch";
import { Button } from "@/components/ui-elements/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Department,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/services/department";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const defaultFormData = (): DepartmentFormData => ({
  department: '',
  createdBy: 'admin',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export function DepartmentTable({ className }: { className?: string }) {
  const [dept, setDept] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(0);
  const [formData, setFormData] = useState<DepartmentFormData>(defaultFormData());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (formData.department.trim() === '') {
      toast.error('ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບ');
      return;
    }
    try {
      if (isUpdate) {
        const updated = await updateDepartment(isUpdate, {
          ...formData,
          updatedAt: new Date().toISOString(),
        });
        setDept((prev) =>
          prev.map((item) => (item.id === isUpdate.toString() ? updated : item))
        );
        toast.success('ອັບເດດຝ່າຍແລ້ວສຳແລັດ');
      } else {
        const created = await createDepartment(formData);
        setDept((prev) => [...prev, created]);
        toast.success('ສ້າງຝ່າຍແລ້ວສຳແລັດ');
      }
    } catch (error) {
      toast.error('ສ້າງຝ່າຍບໍ່ສຳແລັດ');
    } finally {
      setIsFormOpen(false);
    }
  };

  const fetchDepts = async () => {
    try {
      setLoading(true);
      const data = await getDepartments();
      setDept(data);
    } catch (error) {
      setDept([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDepartment(id);
      toast.success('ລຶບຝ່າຍແລ້ວສຳແລັດ');
      setDept((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      toast.warning('ລຶບຝ່າຍບໍສຳແລັດ');
    }
  };

  const handleEdit = (item: Department) => {
    setIsUpdate(parseInt(item.id));
    setFormData({
      department: item.department,
      createdBy: item.createdBy,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
    setIsFormOpen(true);
  };

  return (
    <div
      className={cn(
        "grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-end mb-4">
        <Button
          label="ເພີ່ມຝ່າຍໃໝ່"
          shape="rounded"
          size="small"
          onClick={() => {
            setFormData(defaultFormData());
            setIsUpdate(0);
            setIsFormOpen(true);
          }}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <Table>
          <TableHeader className="border-none bg-gray-100 dark:bg-gray-700">
            <TableRow className="border-none uppercase [&>th]:text-center text-sm">
              <TableHead className="!text-left">ລະຫັດ</TableHead>
              <TableHead className="!text-start">ຊື່ຝ່າຍ</TableHead>
              <TableHead className="!text-start">ຜູ້ສ້າງ</TableHead>
              <TableHead>ສ້າງວັນທີ</TableHead>
              <TableHead>ອັບເດດວັນທີ</TableHead>
              <TableHead className="!text-right">ດຳເນີນການ</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {dept.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  <div className="flex flex-col items-center justify-center py-5 text-center">
                    <Image
                      src="/images/no-found.jpg"
                      width={100}
                      height={100}
                      alt="User"


                    />
                    <p> ບໍ່ມີຂໍ້ມູນຝ່າຍ</p>

                  </div>

                </TableCell>
              </TableRow>
            ) : (
              dept.map((item) => (
                <TableRow
                  className="text-center font-mediu dark:text-white"
                  key={item.id}
                >
                  <TableCell className="!text-left ">
                    {item.id}
                  </TableCell>
                  <TableCell className="!text-left ">
                    {item.department}
                  </TableCell>

                  <TableCell className="!text-left">
                    {item.createdBy}
                  </TableCell>

                  <TableCell>
                    {item.createdAt ?
                      new Date(item.createdAt).toLocaleDateString('lo-LA') :
                      'N/A'
                    }
                  </TableCell>

                  <TableCell>
                    {item.updatedAt ?
                      new Date(item.updatedAt).toLocaleDateString('lo-LA') :
                      'N/A'
                    }
                  </TableCell>

                  <TableCell className="xl:pr-7.5">
                    <div className="flex items-center justify-end gap-x-3.5">
                      <button
                        className="hover:text-primary text-blue-500"
                        onClick={() => handleEdit(item)}
                      >
                        <span className="sr-only">View item</span>
                        <EditIcon />
                      </button>

                      <button
                        className="hover:text-red-dark text-red"
                        onClick={() => handleDelete(item.id)}
                      >
                        <span className="sr-only">Delete item</span>
                        <TrashIcon />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}


      <DepartmentModal
        isOpen={isFormOpen}
        isUpdate={isUpdate}
        formData={formData}
        onClose={() => setIsFormOpen(false)}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}