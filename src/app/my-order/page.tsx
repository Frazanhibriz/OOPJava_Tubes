// src/app/my-order/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { isLoggedIn } from "@/utils/authUtils";
import Navbar from "@/components/navbar";
import CartItemRow, { CartItemProps as FrontendCartItem } from "@/components/CartItemRow";
import { TableCellsIcon, CreditCardIcon, ExclamationTriangleIcon, CheckCircleIcon, ArrowLeftCircleIcon } from "@heroicons/react/24/outline";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import Link from "next/link";

interface BackendCartItem {
  menuId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  description?: string;
  category?: string;
  subtotal?: number;
}

interface OrderCheckoutResponse {
    orderId: string | number;
    customerName: string; 
    tableNumber: number;
    items: BackendCartItem[];
    paymentStatus: string;
    queueNumber: number;
    status: string;
    totalPrice: number;
}

export default function MyOrderPage() {
  const [cartItems, setCartItems] = useState<FrontendCartItem[]>([]);
  const [tableNumber, setTableNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [processedOrderId, setProcessedOrderId] = useState<string | null>(null);
  
  const router = useRouter();

  const fetchCartItems = useCallback(async () => {
    if (!isLoggedIn()) {
      router.push("/login?redirect_to=/my-order");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<BackendCartItem[]>("/cart");
      const transformedItems: FrontendCartItem[] = response.data.map(item => ({
        id: item.menuId,
        name: item.name,
        price: item.price, 
        quantity: item.quantity,
        imageUrl: item.imageUrl || "/images/placeholder-food.png",
        onQuantityChange: handleQuantityChange, 
        onRemove: handleRemoveItem,
      }));
      setCartItems(transformedItems);
    } catch (err: any) {
      console.error("MyOrderPage - Gagal mengambil item keranjang:", err.isAxiosError ? err.response?.data || err.message : err);
      setError("Gagal memuat keranjang Anda. Pastikan Anda sudah login dan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, [router]); 

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const handleQuantityChange = async (menuId: number, newQuantity: number) => {
    if (!isLoggedIn()) { router.push("/login?redirect_to=/my-order"); return; }
    if (newQuantity <= 0) {
      await handleRemoveItem(menuId);
      return;
    }
    setIsLoading(true);
    try {
      await axiosInstance.post("/cart/add", null, { params: { menuItemId: menuId, quantity: newQuantity } });
      await fetchCartItems(); 
    } catch (err: any) {
      console.error("MyOrderPage - Gagal update kuantitas:", err.isAxiosError ? err.response?.data || err.message : err);
      alert("Gagal memperbarui kuantitas item.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleRemoveItem = async (menuId: number) => {
    if (!isLoggedIn()) { router.push("/login?redirect_to=/my-order"); return; }
    setIsLoading(true);
    try {
      await axiosInstance.delete("/cart/remove", { params: { menuItemId: menuId } });
      await fetchCartItems();
    } catch (err: any) {
      console.error("MyOrderPage - Gagal hapus item:", err.isAxiosError ? err.response?.data || err.message : err);
      alert("Gagal menghapus item dari keranjang.");
    } finally {
        setIsLoading(false);
    }
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );

  const handlePayment = async () => {
    if (!isLoggedIn()) { router.push("/login?redirect_to=/my-order"); return; }
    if (!tableNumber.trim()) {
        alert("Harap masukkan Nomor Meja.");
        return;
    }
    if (cartItems.length === 0) {
        alert("Keranjang Anda kosong.");
        return;
    }

    setIsProcessingPayment(true);
    try {
      const response = await axiosInstance.post<OrderCheckoutResponse>("/cart/checkout", null, { params: { tableNumber: parseInt(tableNumber) } });
      setProcessedOrderId(String(response.data.orderId));
      setShowPaymentSuccess(true);
      setCartItems([]);
      setTableNumber("");
  
      setTimeout(() => {
        setShowPaymentSuccess(false);
        setIsProcessingPayment(false); 
        router.push(`/pantau-pesanan/${response.data.orderId}`);
      }, 3500);
    } catch (err: any) {
        console.error("Checkout gagal:", err.isAxiosError ? err.response?.data || err.message : err);
        alert("Gagal membuat pesanan. Silakan coba lagi.");
        setIsProcessingPayment(false);
    }
  };

  const itemsToDisplay = cartItems.map(item => ({
    ...item,
    onQuantityChange: handleQuantityChange,
    onRemove: handleRemoveItem,
  }));

  if (isLoading && cartItems.length === 0 && !error && !showPaymentSuccess) {
    return (
      <div className="relative min-h-screen">
        <Navbar />
        <div className="fixed inset-0 -z-10"><img src="/images/bg-home.jpg" alt="Background" className="w-full h-full object-cover filter blur-[2px]" /><div className="absolute inset-0 bg-black/40" /></div>
        <div className="flex flex-col justify-center items-center h-[calc(100vh-100px)] text-center">
          <ArrowPathIcon className="w-12 h-12 text-white animate-spin mb-4" />
          <p className="text-white text-xl">Memuat Keranjang Anda...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative min-h-screen pb-20">
      <Navbar />
      <div className="fixed inset-0 -z-20"><img src="/images/bg-home.jpg" alt="Background" className="w-full h-full object-cover filter blur-[2px]" /><div className="absolute inset-0 bg-black/40" /></div>

      {showPaymentSuccess && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: "spring" }} className="bg-[#C5C5B3] p-8 sm:p-12 rounded-2xl shadow-2xl text-center max-w-md w-full">
            <CheckCircleIcon className="w-20 h-20 sm:w-24 sm:h-24 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2C2C2C] mb-3">Pesanan Berhasil Dibuat!</h2>
            <p className="text-base sm:text-lg text-[#3E3E32] mb-1">Status pembayaran Anda: <span className="font-semibold text-green-600">LUNAS</span>.</p>
            {processedOrderId && (<p className="text-sm text-[#6B6B5A] mb-6">Nomor Pesanan Anda: <span className="font-semibold text-[#2C2C2C]">{processedOrderId}</span></p>)}
            <div className="w-full bg-gray-300 rounded-full h-2.5 mb-4 overflow-hidden">
              <motion.div className="bg-green-500 h-2.5 rounded-full" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 3.2, ease: "linear" }} />
            </div>
            <p className="text-xs text-[#6B6B5A]">Anda akan diarahkan secara otomatis...</p>
          </motion.div>
        </div>
      )}

      {!showPaymentSuccess && (
        <div className="relative z-10 max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8 text-center filter drop-shadow-md">Detail Pesanan Anda</h1>
          {error && !isLoading && (
               <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
                  <div className="flex items-center justify-center"><ExclamationTriangleIcon className="h-6 w-6 mr-2"/><p>{error}</p></div>
                  <button onClick={() => fetchCartItems()} className="mt-3 px-4 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600">Coba Lagi</button>
              </div>
          )}
          <div className={`bg-[#C5C5B3]/90 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 ${(isLoading || isProcessingPayment) && !showPaymentSuccess ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-2 bg-[#E0DED3]/70 p-5 sm:p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-[#2C2C2C] mb-1">Item Pesanan:</h2>
                {itemsToDisplay.length > 0 ? (
                  <div className="divide-y divide-[#A5A58D]/30">
                      <div className="hidden sm:flex items-center py-2 text-xs font-medium text-[#6B6B5A] uppercase">
                          <div className="w-16 mr-4 flex-shrink-0"></div><div className="flex-grow">Produk</div>
                          <div className="mx-4 w-28 text-center">Jumlah</div><div className="w-24 text-right mr-4">Subtotal</div>
                          <div className="w-10 text-right"></div>
                      </div>
                    {itemsToDisplay.map((item) => (<CartItemRow key={item.id} {...item} />))}
                  </div>
                ) : ( !isLoading && !error && (<p className="text-center text-[#6B6B5A] py-10">Keranjang Anda masih kosong. Silakan kembali ke <Link href="/menu/allmenu" className="text-[#D4B895] hover:underline">Menu</Link> untuk memilih item.</p>))}
                {itemsToDisplay.length > 0 && (
                  <div className="mt-6 pt-6 border-t-2 border-[#A5A58D]/60">
                    <div className="flex justify-between text-lg font-bold text-[#2C2C2C]"><span>Total Pembayaran</span><span>Rp {totalAmount.toLocaleString("id-ID")}</span></div>
                  </div>
                )}
              </div>
              <div className="lg:col-span-1 bg-[#E0DED3]/70 p-5 sm:p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-[#2C2C2C] mb-5">Info Pesanan:</h2>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="tableNumber" className="block text-sm font-medium text-[#3E3E32] mb-1.5">Nomor Meja <span className="text-red-500">*</span></label>
                    <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><TableCellsIcon className="h-5 w-5 text-[#8B8B7A]" /></div>
                      <input type="text" id="tableNumber" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="Contoh: 15" required className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#A5A58D]/70 bg-[#F0EFEA] focus:ring-2 focus:ring-[#D4B895] focus:border-[#D4B895] outline-none transition-colors text-[#2C2C2C]"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {itemsToDisplay.length > 0 && (
              <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button onClick={() => router.push('/menu/allmenu')} className="w-full sm:w-auto order-2 sm:order-1 inline-flex items-center justify-center px-8 py-3 rounded-lg bg-gray-200 text-gray-700 text-base font-semibold hover:bg-gray-300 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-[#C5C5B3]">
                  <ArrowLeftCircleIcon className="h-5 w-5 mr-2.5" />
                  Kembali ke Menu
                </button>
                <button onClick={handlePayment} disabled={isProcessingPayment || (isLoading && !showPaymentSuccess) } className={`w-full sm:w-auto order-1 sm:order-2 inline-flex items-center justify-center px-12 py-3.5 rounded-lg bg-[#D4B895] text-[#2C2C2C] text-base font-semibold hover:bg-[#c9ac87] transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-[#b89974] focus:ring-offset-2 focus:ring-offset-[#C5C5B3] ${(isProcessingPayment || (isLoading && !showPaymentSuccess)) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isProcessingPayment ? (<><ArrowPathIcon className="animate-spin h-5 w-5 mr-2.5" />Memproses...</>) : (<><CreditCardIcon className="h-5 w-5 mr-2.5" />Pesan & Bayar Sekarang</>)}
                </button>
              </div>
            )}
          </div>
          <p className="text-center text-xs text-white filter drop-shadow-sm mt-8">Pastikan semua pesanan Anda sudah benar sebelum melanjutkan.</p>
        </div>
      )}
    </div>
  );
}