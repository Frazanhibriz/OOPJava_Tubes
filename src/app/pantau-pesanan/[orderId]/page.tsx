// src/app/pantau-pesanan/[orderId]/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { isLoggedIn } from "@/utils/authUtils";
import Navbar from "@/components/navbar";
import Image from "next/image";
import {
  ClockIcon,
  CheckCircleIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  TableCellsIcon,
  CurrencyDollarIcon,
  HashtagIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { ArrowPathIcon, SparklesIcon } from "@heroicons/react/24/solid";

interface OrderItemDetail {
  menuId: number;
  name: string;
  description: string;
  category: string;
  quantity: number;
  price: number;
  unitPrice: number;
  imageUrl?: string;
}

interface OrderData {
  orderId: number;
  customer: {
    id: number;
    name: string;
    username: string;
    noTelp?: string;
    role?: string;
  };
  tableNumber: number;
  status: string;
  paymentStatus: string;
  queueNumber: number;
  totalPrice: number;
  items: OrderItemDetail[];
}

const ORDER_STATUS_FLOW = ["CONFIRMED", "IN_QUEUE", "IN_PROGRESS", "DELIVERED"];
const STATUS_LABELS: { [key: string]: string } = {
  CONFIRMED: "Dikonfirmasi",
  IN_QUEUE: "Dalam Antrian",
  IN_PROGRESS: "Sedang Disiapkan",
  DELIVERED: "Selesai/Diterima",
};
const STATUS_ICONS: { [key: string]: React.ElementType } = {
  CONFIRMED: ClipboardDocumentListIcon,
  IN_QUEUE: ClockIcon,
  IN_PROGRESS: CubeIcon,
  DELIVERED: CheckCircleIcon,
};

export default function PantauPesananPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOrderAcknowledged, setIsOrderAcknowledged] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    if (!isLoggedIn()) {
      router.push(`/login?redirect_to=/pantau-pesanan/${orderId}`);
      return;
    }
    if (!orderId) {
      setError("Order ID tidak valid.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<OrderData[]>("/order/my");
      const specificOrder = response.data.find(
        (o) => o.orderId === parseInt(orderId)
      );

      if (specificOrder) {
        setOrder(specificOrder);
        const acknowledged = localStorage.getItem(
          `order_${specificOrder.orderId}_acknowledged`
        );
        if (
          specificOrder.status.toUpperCase() === "DELIVERED" &&
          acknowledged === "true"
        ) {
          setIsOrderAcknowledged(true);
        } else {
          setIsOrderAcknowledged(false);
        }
      } else {
        setError("Pesanan tidak ditemukan atau Anda tidak memiliki akses.");
      }
    } catch (err) {
      console.error("Gagal mengambil detail pesanan:", err);
      setError("Gagal memuat detail pesanan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const currentStatusIndex = order
    ? ORDER_STATUS_FLOW.indexOf(order.status.toUpperCase())
    : -1;

  const getStatusProgress = () => {
    if (!order) return 0;
    const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status.toUpperCase());
    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / ORDER_STATUS_FLOW.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        <Navbar />
        <div className="fixed inset-0 -z-10">
          <img
            src="/images/bg-home.jpg"
            alt="Latar Belakang"
            className="w-full h-full object-cover filter blur-[2px]"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)] text-center">
          <ArrowPathIcon className="w-12 h-12 text-white animate-spin mb-4" />
          <p className="text-white text-xl">Memuat Detail Pesanan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen">
        <Navbar />
        <div className="fixed inset-0 -z-10">
          <img
            src="/images/bg-home.jpg"
            alt="Latar Belakang"
            className="w-full h-full object-cover filter blur-[2px]"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)] text-center p-4">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mb-4" />
          <p className="text-red-300 text-xl mb-6">{error}</p>
          <button
            onClick={() => router.push("/menu/allmenu")}
            className="px-6 py-2.5 bg-[#D4B895] text-[#2C2C2C] rounded-lg hover:bg-[#c9ac87] font-semibold"
          >
            Kembali ke Menu
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="relative min-h-screen">
        <Navbar />
        <div className="fixed inset-0 -z-10">
          <img
            src="/images/bg-home.jpg"
            alt="Latar Belakang"
            className="w-full h-full object-cover filter blur-[2px]"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="flex justify-center items-center h-[calc(100vh-100px)]">
          <p className="text-white text-xl">Pesanan tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  const isDelivered = order.status.toUpperCase() === "DELIVERED";

  const handlePesananSelesai = () => {
    localStorage.setItem(`order_${order.orderId}_acknowledged`, "true");
    setIsOrderAcknowledged(true);
  };

  return (
    <div className="relative min-h-screen pb-20">
      <Navbar />
      <div className="fixed inset-0 -z-20">
        <img
          src="/images/bg-home.jpg"
          alt="Latar Belakang"
          className="w-full h-full object-cover filter blur-[2px]"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-[#C5C5B3]/90 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#2C2C2C]">
              Status Pesanan Anda
            </h1>
            <p className="text-lg text-[#3E3E32] mt-1">
              Order ID: <span className="font-semibold">#{order.orderId}</span>
            </p>
          </div>

          {!isOrderAcknowledged && (
            <div className="mb-10">
              <div className="flex justify-between mb-1">
                {ORDER_STATUS_FLOW.map((statusKey, index) => (
                  <div
                    key={`${statusKey}-label`} // Membuat key lebih unik
                    className={`text-xs sm:text-sm text-center w-1/4 ${
                      index <= currentStatusIndex
                        ? "text-[#2C2C2C] font-semibold"
                        : "text-gray-500"
                    }`}
                  >
                    {STATUS_LABELS[statusKey]}
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2.5 sm:h-3 overflow-hidden">
                <div
                  className="bg-green-500 h-2.5 sm:h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${getStatusProgress()}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1.5">
                {ORDER_STATUS_FLOW.map((statusKey, index) => {
                  const IconComponent = STATUS_ICONS[statusKey];
                  return (
                    <div
                      key={`${statusKey}-icon`} // Membuat key lebih unik
                      className={`w-1/4 flex justify-center ${
                        index <= currentStatusIndex
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-lg font-semibold text-[#2C2C2C] mt-6">
                Status Saat Ini:{" "}
                <span className="text-green-600">
                  {STATUS_LABELS[order.status.toUpperCase()] || order.status}
                </span>
              </p>
            </div>
          )}

          {isOrderAcknowledged && isDelivered && (
            <div className="my-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-3" />
              <p className="text-xl font-semibold text-green-700">
                Pesanan #{order.orderId} telah selesai!
              </p>
              <p className="text-sm text-green-600">
                Terima kasih telah memesan.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#E0DED3]/70 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-[#2C2C2C] mb-3 border-b pb-2 border-[#A5A58D]/50">
                Info Pemesan & Pesanan
              </h3>
              <div className="space-y-1.5 text-sm text-[#3E3E32]">
                <p className="flex items-center">
                  <UserCircleIcon className="w-5 h-5 mr-2 text-[#8B8B7A]" />{" "}
                  Nama Pemesan:{" "}
                  <span className="font-medium ml-1">
                    {order.customer.name}
                  </span>
                </p>
                <p className="flex items-center">
                  <TableCellsIcon className="w-5 h-5 mr-2 text-[#8B8B7A]" />{" "}
                  Nomor Meja:{" "}
                  <span className="font-medium ml-1">{order.tableNumber}</span>
                </p>
                <p className="flex items-center">
                  <HashtagIcon className="w-5 h-5 mr-2 text-[#8B8B7A]" /> Nomor
                  Antrean:{" "}
                  <span className="font-medium ml-1">{order.queueNumber}</span>
                </p>
                <p className="flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 mr-2 text-[#8B8B7A]" />{" "}
                  Status Pembayaran:{" "}
                  <span className="font-medium ml-1 text-green-600">
                    {order.paymentStatus}
                  </span>
                </p>
              </div>
            </div>
            <div className="bg-[#E0DED3]/70 p-4 rounded-lg shadow flex flex-col justify-center items-end">
              <h3 className="text-lg font-semibold text-[#2C2C2C] mb-1 w-full text-right">
                Total Harga
              </h3>
              <p className="text-3xl font-bold text-[#2C2C2C] text-right">
                Rp {order.totalPrice.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-gray-500 text-right mt-0.5">
                Termasuk semua item
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-[#2C2C2C] mb-4">
              Rincian Item:
            </h3>
            <div className="space-y-3 bg-[#E0DED3]/70 p-4 rounded-lg shadow">
              {order.items.map((item, index) => ( // Tambahkan index jika menuId tidak dijamin unik di sini
                <div
                  key={item.menuId + '-' + index} // Membuat key lebih unik dengan index
                  className="flex items-center pb-3 border-b border-[#A5A58D]/30 last:border-b-0 last:pb-0"
                >
                  <div className="w-16 h-16 relative mr-4 rounded-md overflow-hidden flex-shrink-0 bg-gray-200">
                    {item.imageUrl ? (
                      <Image
                        src={`http://localhost:8080${item.imageUrl}`}
                        alt={item.name}
                        fill
                        style={{ objectFit: "cover" }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/images/placeholder-food.png";
                        }}
                      />
                    ) : (
                      <Image
                        src="/images/placeholder-food.png"
                        alt="Placeholder"
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-[#2C2C2C]">{item.name}</p>
                    <p className="text-xs text-[#6B6B5A]">
                      {item.quantity} pcs x Rp{" "}
                      {(item.unitPrice
                        ? item.unitPrice
                        : item.price / item.quantity
                      ).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <p className="font-medium text-[#3E3E32] w-24 text-right">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            {isDelivered && !isOrderAcknowledged && (
              <button
                onClick={handlePesananSelesai}
                className="w-full sm:w-auto px-8 py-3 bg-green-500 hover:bg-green-600 text-white text-base font-semibold rounded-lg transition-colors shadow-md flex items-center justify-center"
              >
                <SparklesIcon className="h-5 w-5 mr-2" />
                Tandai Pesanan Selesai & Terima
              </button>
            )}
            {(isDelivered && isOrderAcknowledged) || !isDelivered ? (
              <button
                onClick={() => {
                  if (!isDelivered || !isOrderAcknowledged) {
                    const confirmPesanLagi = confirm(
                      "Anda memiliki pesanan yang sedang diproses atau baru saja selesai. Yakin ingin membuat pesanan baru sekarang?"
                    );
                    if (!confirmPesanLagi) return;
                  }
                  if (order) { // Pastikan order tidak null
                    localStorage.removeItem(
                        `order_${order.orderId}_acknowledged`
                    );
                  }
                  router.push("/menu/allmenu");
                }}
                className="w-full sm:w-auto px-8 py-3 bg-[#D4B895] text-[#2C2C2C] text-base font-semibold rounded-lg hover:bg-[#c9ac87] transition-colors shadow-md flex items-center justify-center"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                {isDelivered && isOrderAcknowledged
                  ? "Pesan Lagi"
                  : "Kembali ke Menu"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}