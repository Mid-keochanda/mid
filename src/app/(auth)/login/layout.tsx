import "@/css/style.css"; // ຕ້ອງມີແຖວນີ້ເພື່ອໃຫ້ Tailwind CSS ເຮັດວຽກ
import "@/css/satoshi.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      {children}
    </div>
  );
}