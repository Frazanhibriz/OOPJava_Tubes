"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { isLoggedIn } from "@/utils/authUtils";
import Navbar from "@/components/navbar";
import OrderHistoryRow from "@/components/OrderHistoryRow"; // Impor komponen baris
import { ArrowPathIcon, ExclamationTriangleIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/solid";

// Interface dari OrderController.java 
interface FullOrderData {
  orderId: number;
  customer: { id: number; name: string; username: string; noTelp?: string; role?: string };
  tableNumber: number;
  status: string;
  paymentStatus: string;
  queueNumber: number;
  totalPrice: number;
  items: Array<{ 
    menuId: number;
    name: string;
    quantity: number;
    price: number; 
    unitPrice: number;
    imageUrl?: string;
  }>;

}


interface OrderSummary {
  orderId: number;
  totalPrice: number;
  status: string;
  queueNumber?: number;
}


export default function PesananSayaPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchOrderHistory = useCallback(async () => {
    if (!isLoggedIn()) {
      router.push("/login?redirect_to=/pesanan-saya");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<FullOrderData[]>("/order/my");
      const summaries: OrderSummary[] = response.data.map(order => ({
        orderId: order.orderId,
        totalPrice: order.totalPrice,
        status: order.status,
        queueNumber: order.queueNumber,
        
      })).sort((a, b) => b.orderId - a.orderId); 
      setOrders(summaries);
    } catch (err) {
      console.error("Failed to fetch order history:", err);
      setError("Gagal memuat riwayat pesanan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrderHistory();
  }, [fetchOrderHistory]);

  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <Navbar />
        <div className="fixed inset-0 -z-10">
          <img src="/images/bg-home.jpg" alt="Background" className="w-full h-full object-cover filter blur-[2px]" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)] text-center">
          <ArrowPathIcon className="w-12 h-12 text-white animate-spin mb-4" />
          <p className="text-white text-xl">Memuat Riwayat Pesanan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen">
        <Navbar />
        {/* ... background ... */}
        <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)] text-center p-4">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mb-4" />
          <p className="text-red-300 text-xl mb-6">{error}</p>
           <button 
            onClick={fetchOrderHistory} 
            className="mt-3 px-4 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20">
      <Navbar />
      <div className="fixed inset-0 -z-20">
        <img src="/images/bg-home.jpg" alt="Background" className="w-full h-full object-cover filter blur-[2px]" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-[#C5C5B3]/90 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#2C2C2C]">
              Riwayat Pesanan Saya
            </h1>
            <p className="text-lg text-[#3E3E32] mt-1">
              Lihat semua transaksi yang pernah Anda lakukan.
            </p>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderHistoryRow key={order.orderId} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-[#3E3E32] mb-2">Anda belum memiliki riwayat pesanan.</p>
              <p className="text-sm text-gray-500 mb-6">Silahkan mulai pesan menu Anda!</p>
              <button
                onClick={() => router.push('/menu/allmenu')}
                className="px-8 py-3 bg-[#D4B895] text-[#2C2C2C] text-base font-semibold rounded-lg hover:bg-[#c9ac87] transition-colors shadow-md"
            >
                Pesan Sekarang
            </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}