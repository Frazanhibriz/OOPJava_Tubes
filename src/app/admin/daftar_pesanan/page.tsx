"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Untuk logo
import { useRouter } from 'next/navigation';
import axiosInstance from '@/utils/axiosInstance';
import { isLoggedIn, logout as authLogout } from '@/utils/authUtils'; // Untuk proteksi halaman admin
import { EyeIcon, PencilSquareIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';


interface OrderItemDetailFromBackend {
  menuId: number;
  name: string;
  quantity: number;
  price: number; // Ini subtotal item (harga_satuan * kuantitas)
  unitPrice: number;
  imageUrl?: string;
  description?: string;
  category?: string;
}

interface OrderDataFromBackend {
  orderId: number;
  customer: { id: number; name: string; username: string; };
  tableNumber: number;
  status: string;
  paymentStatus: string;
  queueNumber: number;
  totalPrice: number;
  items: OrderItemDetailFromBackend[];
  // orderTimestamp?: string; // Tambahkan jika backend mengirim ini
}

const AVAILABLE_ORDER_STATUSES = ["CONFIRMED", "IN_QUEUE", "IN_PROGRESS", "DELIVERED"];

export default function DaftarPesananPage() {
  const [orders, setOrders] = useState<OrderDataFromBackend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDataFromBackend | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<Record<number, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>("Semua Status");
  const [adminUsername, setAdminUsername] = useState("Admin"); // Untuk header
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const router = useRouter();

  const fetchAdminDetails = useCallback(async () => {
    try {
      const userDetailsResponse = await axiosInstance.get<{name: string, role: string}>('/auth/me');
      if (userDetailsResponse.data && userDetailsResponse.data.name) {
        if (userDetailsResponse.data.role?.toUpperCase() !== 'ADMIN') {
          authLogout();
          localStorage.removeItem('guestCart');
          router.replace('/admin/login?error=not_admin');
          return false; 
        }
        setAdminUsername(userDetailsResponse.data.name);
        return true;
      }
      throw new Error("Data admin tidak lengkap");
    } catch (error) {
      console.error("Gagal mengambil detail admin:", error);
      authLogout();
      localStorage.removeItem('guestCart');
      router.replace('/admin/login?error=auth_failed');
      return false;
    }
  }, [router]);


  const fetchOrders = useCallback(async () => {
    if (!isLoggedIn()) {
      router.replace('/admin/login?redirect_to=/admin/daftar_pesanan');
      return;
    }
    
    const isAdmin = await fetchAdminDetails();
    if (!isAdmin) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<OrderDataFromBackend[]>('/order');
      setOrders(response.data.sort((a, b) => b.orderId - a.orderId));
    } catch (err) {
      console.error("Gagal mengambil daftar pesanan:", err);
      setError("Gagal memuat daftar pesanan. Silakan coba lagi.");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [router, fetchAdminDetails]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    if (!newStatus || newStatus === "") {
        alert("Pilih status yang valid.");
        return;
    }
    setIsUpdatingStatus(prev => ({...prev, [orderId]: true}));
    try {
      await axiosInstance.put(`/order/${orderId}/status`, `"${newStatus}"`, {
        headers: { 'Content-Type': 'application/json' }
      });
      alert(`Status pesanan #${orderId} berhasil diubah menjadi ${newStatus}`);
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.orderId === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error(`Gagal mengubah status pesanan #${orderId}:`, err);
      alert(`Gagal mengubah status pesanan #${orderId}.`);
    } finally {
        setIsUpdatingStatus(prev => ({...prev, [orderId]: false}));
    }
  };

  const handleDetailClick = (order: OrderDataFromBackend) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  const toggleDropdown = () => setIsDropdownActive(prev => !prev);
  const openLogoutModal = () => { setIsLogoutModalOpen(true); setIsDropdownActive(false); };
  const closeLogoutModal = () => setIsLogoutModalOpen(false);
  const confirmLogout = () => { authLogout(); localStorage.removeItem('guestCart'); router.push('/admin/login'); };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('user-dropdown-admin');
      const button = document.getElementById('user-dropdown-button-admin');
      if (dropdown && button && !dropdown.contains(event.target as Node) && !button.contains(event.target as Node)) {
        setIsDropdownActive(false);
      }
    };
    if (isDropdownActive) { window.addEventListener('click', handleClickOutside); }
    return () => { window.removeEventListener('click', handleClickOutside); };
  }, [isDropdownActive]);

  const filteredOrders = orders.filter(order => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = searchTermLower === "" ||
                          String(order.orderId).includes(searchTermLower) ||
                          order.customer.name.toLowerCase().includes(searchTermLower) ||
                          String(order.tableNumber).includes(searchTermLower);
    const matchesStatus = filterStatus === "Semua Status" || order.status.toUpperCase() === filterStatus.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  if (isLoading && orders.length === 0) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-white shadow-md h-20 flex items-center justify-between px-6 flex-shrink-0"><div></div><div>Memuat...</div></header>
            <div className="flex-1 flex justify-center items-center bg-gray-100">
                <ArrowPathIcon className="w-12 h-12 text-gray-500 animate-spin" />
            </div>
        </div>
    );
  }


  return (
    <div className="bg-gray-100 font-sans flex min-h-screen">
      <aside className="w-64 bg-white shadow-md flex-shrink-0">
        <div className="flex items-center justify-center h-20 border-b">
          <Image src="/images/saung.png" alt="Logo" width={100} height={48} className="h-12 w-auto" priority/>
        </div>
        <nav className="px-6 py-4 space-y-1 text-sm">
          <Link href="/admin/dashboard" className="flex items-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600">
            <span className="mr-3 text-lg">🏠</span>Dashboard
          </Link>
          <Link href="/admin/daftar_pesanan" className="flex items-center px-3 py-2.5 rounded-lg text-green-700 font-semibold bg-green-100">
            <span className="mr-3 text-lg">💳</span>Daftar Pesanan
          </Link>
          <Link href="/admin/daftar_menu" className="flex items-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600">
            <span className="mr-3 text-lg">📁</span>Daftar Menu
          </Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-md h-20 flex items-center justify-between px-6 flex-shrink-0">
          <div className="text-2xl cursor-pointer lg:hidden">☰</div>
          <div className="lg:block hidden"></div>
          <div className="relative">
            <button id="user-dropdown-button-admin" onClick={toggleDropdown} className="flex items-center text-sm text-gray-700 focus:outline-none p-2 rounded-md hover:bg-gray-100">
              {adminUsername}
              <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${isDropdownActive ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isDropdownActive && (
              <div id="user-dropdown-admin" className="absolute right-0 mt-2 w-40 bg-white shadow-xl rounded-md py-1 z-50 border border-gray-200">
                <button onClick={openLogoutModal} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600">Logout</button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 bg-gray-100">
          <div className="bg-white p-4 rounded-lg shadow-md h-full flex flex-col">
            <div className="bg-gray-50 p-4 rounded-t-lg border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-800">Daftar Pesanan</h1>
              <p className="text-sm text-gray-600">Admin / Daftar Pesanan</p>
            </div>

            <div className="py-4 px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              <input
                type="text"
                placeholder="Cari ID, Nama, No Meja..."
                className="w-full sm:w-72 border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="w-full sm:w-auto">
                <select 
                  id="statusFilter"
                  className="w-full sm:w-52 border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="Semua Status">Semua Status</option>
                  {AVAILABLE_ORDER_STATUSES.map(status => (
                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace("_", " ")}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 mt-1 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 sticky top-0">
                  <tr className="border-b border-gray-300">
                    <th className="py-3 px-4 font-semibold text-gray-600">ID</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Customer</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Meja</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Antrian</th>
                    <th className="py-3 px-4 font-semibold text-gray-600 text-right">Total</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Status Bayar</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Status Pesanan</th>
                    <th className="py-3 px-4 font-semibold text-gray-600 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading && orders.length === 0 ? (
                    <tr><td colSpan={8} className="py-10 text-center text-gray-500">Memuat pesanan... <ArrowPathIcon className="inline w-5 h-5 animate-spin ml-2"/></td></tr>
                  ) : error ? (
                    <tr><td colSpan={8} className="py-10 text-center text-red-600">{error} <button onClick={fetchOrders} className="ml-2 text-blue-500 hover:underline">Coba Lagi</button></td></tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr><td colSpan={8} className="py-10 text-center text-gray-500">Tidak ada pesanan yang cocok atau belum ada pesanan.</td></tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-700">#{order.orderId}</td>
                        <td className="py-3 px-4 text-gray-600">{order.customer.name}</td>
                        <td className="py-3 px-4 text-gray-600">{order.tableNumber}</td>
                        <td className="py-3 px-4 text-gray-600">{order.queueNumber}</td>
                        <td className="py-3 px-4 text-gray-600 text-right">Rp {order.totalPrice.toLocaleString('id-ID')}</td>
                        <td className="py-3 px-4"><span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.paymentStatus.toUpperCase() === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{order.paymentStatus}</span></td>
                        <td className="py-3 px-4">
                           <select 
                             value={order.status.toUpperCase()}
                             onChange={(e) => handleUpdateStatus(order.orderId, e.target.value)}
                             disabled={isUpdatingStatus[order.orderId]}
                             className={`border rounded-md px-2 py-1 text-xs w-full focus:ring-1 focus:ring-green-500 focus:border-green-500 ${isUpdatingStatus[order.orderId] ? 'opacity-50 cursor-not-allowed' : ''} ${order.status.toUpperCase() === 'DELIVERED' ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-300'}`}
                           >
                             {AVAILABLE_ORDER_STATUSES.map(status => (
                               <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace("_", " ")}</option>
                             ))}
                           </select>
                           {isUpdatingStatus[order.orderId] && <ArrowPathIcon className="inline w-4 h-4 animate-spin ml-2 text-gray-500"/>}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => handleDetailClick(order)} className="text-sky-600 hover:text-sky-800 hover:underline" title="Lihat Detail">
                            <EyeIcon className="w-5 h-5 inline-block"/>
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

      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-xl p-6 text-sm shadow-xl max-h-[90vh] flex flex-col">
              <h2 className="text-xl text-center font-semibold mb-5 text-gray-800 border-b pb-3">Detail Pesanan #{selectedOrder.orderId}</h2>
              <div className="overflow-y-auto flex-grow pr-2">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4 text-gray-700">
                    <p><strong>Nama Pelanggan:</strong> {selectedOrder.customer.name}</p>
                    <p><strong>No Meja:</strong> {selectedOrder.tableNumber}</p>
                    <p><strong>Status Pesanan:</strong> <span className={`font-semibold ${selectedOrder.status.toUpperCase() === 'DELIVERED' ? 'text-green-600' : 'text-orange-600'}`}>{selectedOrder.status}</span></p>
                    <p><strong>Nomor Antrian:</strong> {selectedOrder.queueNumber}</p>
                    <p><strong>Status Pembayaran:</strong> <span className="font-semibold text-green-600">{selectedOrder.paymentStatus}</span></p>
                </div>

                <h3 className="font-semibold text-gray-700 mb-2 mt-4">Item yang Dipesan:</h3>
                <table className="w-full mb-4 text-left border-t border-b border-gray-200">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                        <th className="py-2 px-3">Item</th>
                        <th className="py-2 px-3 text-center">Pcs</th>
                        <th className="py-2 px-3 text-right">Harga Satuan</th>
                        <th className="py-2 px-3 text-right">Subtotal</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {selectedOrder.items.map((item) => (
                        <tr key={item.menuId + '-' + item.name}>
                        <td className="py-2 px-3 flex items-center">
                            {item.imageUrl && (
                                <Image src={`http://localhost:8080${item.imageUrl}`} alt={item.name} width={40} height={40} className="w-10 h-10 rounded object-cover mr-3"/>
                            )}
                            <span className="font-medium text-gray-800">{item.name}</span>
                        </td>
                        <td className="py-2 px-3 text-center text-gray-600">{item.quantity}</td>
                        <td className="py-2 px-3 text-right text-gray-600">Rp {item.unitPrice.toLocaleString('id-ID')}</td>
                        <td className="py-2 px-3 text-right font-medium text-gray-800">Rp {item.price.toLocaleString('id-ID')}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                <p className="text-xl font-bold text-gray-900 text-right mt-4">Total: Rp {selectedOrder.totalPrice.toLocaleString('id-ID')}</p>
              </div>
              <div className="mt-6 text-center">
                <button onClick={handleCloseModal} className="bg-sky-600 text-white px-8 py-2.5 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition-colors font-medium">Tutup</button>
              </div>
            </div>
        </div>
      )}
      {isLogoutModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] transition-opacity duration-300 ease-in-out">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-2xl transform transition-all duration-300 ease-in-out scale-100">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Konfirmasi Logout</h2>
              <p className="text-sm text-gray-600 mb-6">Apakah Anda yakin ingin keluar dari sesi ini?</p>
              <div className="flex justify-center gap-4">
                <button onClick={confirmLogout} className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium">Ya, Logout</button>
                <button onClick={closeLogoutModal} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium">Batal</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}