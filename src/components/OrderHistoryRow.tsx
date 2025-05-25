// src/components/OrderHistoryRow.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, CheckCircleIcon, ClockIcon, CubeIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

// Menggunakan sebagian dari interface OrderData yang sudah ada
// atau buat yang baru yang lebih spesifik untuk ringkasan
interface OrderSummary {
  orderId: number;
  // orderDate?: string; // Jika backend mengirim tanggal
  totalPrice: number;
  status: string;
  queueNumber?: number; // Opsional, mungkin berguna
}

interface OrderHistoryRowProps {
  order: OrderSummary;
}

// Mapping status ke label dan ikon (bisa di-refactor ke util jika dipakai di banyak tempat)
const STATUS_LABELS: { [key: string]: string } = {
  CONFIRMED: "Dikonfirmasi",
  IN_QUEUE: "Dalam Antrian",
  IN_PROGRESS: "Sedang Disiapkan",
  DELIVERED: "Selesai", // Label lebih singkat untuk daftar
};
const STATUS_ICONS: { [key: string]: React.ElementType } = {
  CONFIRMED: ClipboardDocumentListIcon,
  IN_QUEUE: ClockIcon,
  IN_PROGRESS: CubeIcon,
  DELIVERED: CheckCircleIcon,
};
const STATUS_COLORS: { [key: string]: string } = {
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_QUEUE: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
};


const OrderHistoryRow: React.FC<OrderHistoryRowProps> = ({ order }) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/pantau-pesanan/${order.orderId}`);
  };

  const StatusIcon = STATUS_ICONS[order.status.toUpperCase()] || ClipboardDocumentListIcon;
  const statusLabel = STATUS_LABELS[order.status.toUpperCase()] || order.status;
  const statusColor = STATUS_COLORS[order.status.toUpperCase()] || "bg-gray-100 text-gray-700";

  return (
    <div className="bg-[#E0DED3]/70 p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:shadow-lg transition-shadow duration-200">
      <div className="flex-grow">
        <p className="text-sm text-[#6B6B5A]">Order ID: <span className="font-semibold text-[#2C2C2C]">#{order.orderId}</span></p>
        {/* {order.orderDate && <p className="text-xs text-gray-500">Tanggal: {new Date(order.orderDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>} */}
        <p className="text-lg font-bold text-[#2C2C2C] mt-1">
          Rp {order.totalPrice.toLocaleString("id-ID")}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
         <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${statusColor} min-w-[120px] justify-center`}>
          <StatusIcon className="w-4 h-4 mr-1.5" />
          {statusLabel}
        </div>
        <button
          onClick={handleViewDetails}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-[#D4B895] text-[#2C2C2C] text-sm font-semibold rounded-md hover:bg-[#c9ac87] transition-colors focus:outline-none focus:ring-2 focus:ring-[#b89974]"
        >
          <EyeIcon className="w-4 h-4 mr-1.5" />
          Lihat Detail
        </button>
      </div>
    </div>
  );
};

export default OrderHistoryRow;