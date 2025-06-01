'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
// Anda mungkin perlu mengimpor axiosInstance jika mengambil data dari backend
// import axiosInstance from '@/utils/axiosInstance';

// Interface untuk data ringkasan pesanan (sesuaikan dengan respons API Anda)
interface OrderSummaryData {
  orderId: number;
  customerName: string;
  tableNumber: number;
  status: string;
  // Tambahkan field lain jika diperlukan di tabel daftar pesanan
}

// Interface untuk data detail pesanan (sesuaikan dengan respons API detail)
interface OrderDetailData {
  orderId: number;
  customerName: string;
  tableNumber: number;
  status: string;
  queueNumber: number;
  totalPrice: number;
  items: Array<{ 
    name: string;
    quantity: number;
    price: number; 
  }>;
}

export default function DaftarPesananPage() {
  const [orders, setOrders] = useState<OrderSummaryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailData | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    // Fungsi untuk mengambil daftar pesanan dari backend
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Ganti URL_API_DAFTAR_PESANAN dengan endpoint API yang sebenarnya
        // const response = await axiosInstance.get('/URL_API_DAFTAR_PESANAN');
        // setOrders(response.data);

        // Data mock untuk pengembangan sementara
        const mockOrders: OrderSummaryData[] = [
          { orderId: 101, customerName: 'Rahmat', tableNumber: 5, status: 'IN_QUEUE' },
          { orderId: 102, customerName: 'Raisa', tableNumber: 7, status: 'PREPARING' },
          { orderId: 103, customerName: 'Budi', tableNumber: 8, status: 'SERVED' },
          // Tambahkan pesanan mock lainnya jika perlu
        ];
        setOrders(mockOrders);

      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Gagal memuat daftar pesanan.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []); // Array kosong menandakan efek hanya berjalan sekali setelah render pertama

  const fetchOrderDetail = async (orderId: number) => {
    setIsDetailLoading(true);
    setDetailError(null);
    try {
      // Ganti URL_API_DETAIL_PESANAN dengan endpoint API yang sebenarnya
      // const response = await axiosInstance.get(`/URL_API_DETAIL_PESANAN/${orderId}`);
      // setSelectedOrder(response.data);

      // Data mock detail untuk pengembangan sementara
      const mockDetail: OrderDetailData = {
          orderId: orderId,
          customerName: `Pelanggan ${orderId}`,
          tableNumber: orderId % 10, // Contoh data mock
          status: orderId === 101 ? 'IN_QUEUE' : orderId === 102 ? 'PREPARING' : 'SERVED', // Contoh data mock
          queueNumber: orderId + 90, // Contoh data mock
          totalPrice: orderId * 100 + 30000, // Contoh data mock
          items: [
              { name: 'Ayam Bakar', quantity: (orderId % 3) + 1, price: 15000 },
              { name: 'Nasi Goreng', quantity: (orderId % 2), price: 10000 },
              // Tambahkan item mock lainnya
          ]
      };
      setSelectedOrder(mockDetail);

    } catch (err) {
      console.error("Failed to fetch order detail:", err);
      setDetailError("Gagal memuat detail pesanan.");
    } finally {
      setIsDetailLoading(false);
    }
  };


  const handleDetailClick = (orderId: number) => {
    fetchOrderDetail(orderId);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
    setDetailError(null);
  };

  return (
    <div className="bg-gray-100 font-sans flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="flex items-center justify-center h-20 border-b">
          {/* Replace with Next.js Image component if available */}
          <img src="/public/images/saung.png" alt="Logo" className="h-12" />
        </div>
        <nav className="px-6 py-4 space-y-3 text-sm">
          <Link href="/admin/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-green-600">
            <span>🏠</span><span>Dashboard</span>
          </Link>
          <Link href="/admin/daftar_pesanan" className="flex items-center space-x-2 text-green-700 font-semibold">
            <span>💳</span><span>Daftar Pesanan</span>
          </Link>
          <Link href="/admin/daftar_menu" className="flex items-center space-x-2 text-gray-700 hover:text-green-600">
            <span>📁</span><span>Daftar Menu</span>
          </Link>
        </nav>
      </aside>

      {/* Konten Utama */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-white shadow-md h-20 flex items-center justify-between px-6">
          <div className="text-2xl cursor-pointer">☰</div> {/* Consider making this functional */}
          <div className="text-sm text-gray-700">username ▾</div> {/* Replace with actual logged-in username and dropdown */}
        </header>

        {/* Konten */}
        <main className="flex-1 p-6 bg-gray-100">
          <div className="bg-white p-4 rounded-lg shadow-md h-full flex flex-col">
            <div className="bg-gray-200 p-4 rounded-t-lg">
              <h1 className="text-xl font-bold text-gray-800">Daftar Pesanan</h1>
              <p className="text-sm text-gray-600">Home / Daftar Pesanan</p>
            </div>

            {/* Pencarian */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Cari ID, Nama Pelanggan, No Meja......"
                className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Tabel */}
            <div className="flex-1 mt-4 overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Nama Pelanggan</th>
                    <th className="py-3 px-4">No Meja</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center">Memuat pesanan...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-red-600">Error: {error}</td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center">Belum ada pesanan.</td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.orderId} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{order.orderId}</td>
                        <td className="py-3 px-4">{order.customerName}</td>
                        <td className="py-3 px-4">{order.tableNumber}</td>
                        <td className="py-3 px-4">
                          {/* Ganti dengan select dinamis jika diperlukan status update dari admin */}
                          {order.status}
                          {/* <select className="border border-gray-300 px-2 py-1 rounded text-sm">
                            <option>{order.status}</option>
                            {/* Tambahkan opsi status lain jika memungkinkan */}
                          {/* </select> */}
                        </td>
                        <td className="py-3 px-4">
                          {/* Menggunakan button untuk memicu modal */}
                          <button onClick={() => handleDetailClick(order.orderId)} className="text-blue-600 hover:underline focus:outline-none">
                            Detail Pesanan
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Overlay */}
      {showDetailModal && (
        <div className="modal-bg fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          {isDetailLoading ? (
             <div className="bg-white w-[400px] rounded-lg p-6 text-sm shadow-xl flex items-center justify-center">
                Memuat detail...
             </div>
          ) : detailError ? (
            <div className="bg-white w-[400px] rounded-lg p-6 text-sm shadow-xl flex flex-col items-center">
              <p className="text-red-600 mb-4">Error: {detailError}</p>
              <button onClick={handleCloseModal} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">Tutup</button>
            </div>
          ) : selectedOrder ? (
            <div className="bg-white w-[400px] rounded-lg p-6 text-sm shadow-xl">
              <h2 className="text-center font-semibold mb-4 text-gray-800">Detail Pesanan #{selectedOrder.orderId}</h2>

              {/* Tabel Item Pesanan */}
              <table className="w-full mb-4 text-left border-b border-gray-300">
                <thead>
                  <tr>
                    <th className="pb-2">Item</th>
                    <th className="pb-2 text-center">Pcs</th>
                    <th className="pb-2 text-right">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-2">{item.name}</td>
                      <td className="py-2 text-center">{item.quantity}</td>
                      <td className="py-2 text-right">{item.price.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Info Tambahan */}
              <div className="space-y-2 text-gray-700">
                <p><strong>Nama Pelanggan:</strong> {selectedOrder.customerName}</p>
                <p><strong>No Meja:</strong> {selectedOrder.tableNumber}</p>
                <p><strong>Status:</strong> {selectedOrder.status}</p>
                <p><strong>Nomor Antrian:</strong> {selectedOrder.queueNumber}</p>
                <p className="text-lg font-semibold text-gray-900">Total: Rp {selectedOrder.totalPrice.toLocaleString('id-ID')}</p>
              </div>

              <div className="mt-6 text-center">
                <button onClick={handleCloseModal} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Tutup</button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}