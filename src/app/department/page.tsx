
import Signin from "@/components/Auth/Signin";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DepartmentTable } from "./table";
import { DepartmentSkeleton } from "./table/skeleton";
import { Suspense } from "react";


export const metadata: Metadata = {
  title: "Department",
};

export default function Department() {
  return (
    <>
      <Breadcrumb pageName="ຈັດການຂໍ້ມູນຝ່າຍ" />

      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <Suspense fallback={<DepartmentSkeleton />}>
          <DepartmentTable />
        </Suspense>
      </div>
    </>
  );
}
