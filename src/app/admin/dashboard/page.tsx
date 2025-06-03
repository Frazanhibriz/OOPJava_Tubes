"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { logout as authLogout, isLoggedIn } from '@/utils/authUtils';
import axiosInstance from '@/utils/axiosInstance';
import { ArrowPathIcon, ArchiveBoxIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

interface AdminStats {
  totalOrders?: number;
  totalMenuItems?: number;
}

interface UserDetails {
  name: string;
  role: string;
}

export default function AdminDashboardPage() {
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState<AdminStats>({ totalOrders: 0, totalMenuItems: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [adminUsername, setAdminUsername] = useState("Admin");
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/admin/login');
      return;
    }
    
    const fetchAdminData = async () => {
      setIsLoadingStats(true);
      let isAdminRoleVerified = false;

      try {
        const userDetailsResponse = await axiosInstance.get<UserDetails>('/auth/me');
        if (userDetailsResponse.data && userDetailsResponse.data.name) {
          if (userDetailsResponse.data.role?.toUpperCase() === 'ADMIN') {
            setAdminUsername(userDetailsResponse.data.name);
            isAdminRoleVerified = true;
          } else {
            authLogout();
            localStorage.removeItem('guestCart');
            router.replace('/admin/login?error=not_admin');
            return;
          }
        } else {
           throw new Error("Data pengguna tidak lengkap dari /auth/me");
        }

        if (isAdminRoleVerified) {
            let menuCount = 0;
            let orderCount = 0;

            try {
                const menuResponse = await axiosInstance.get<{ count: number }>('/menu/count'); 
                menuCount = menuResponse.data.count;
            } catch (menuError) {
                console.warn("Gagal mengambil jumlah menu, menggunakan nilai default 0:", menuError);
            }

            try {
                const orderResponse = await axiosInstance.get<{ count: number }>('/order/count');
                orderCount = orderResponse.data.count;
            } catch (orderError) {
                console.warn("Gagal mengambil jumlah pesanan, menggunakan nilai default 0:", orderError);
            }
            
            setStats({
                totalMenuItems: menuCount,
                totalOrders: orderCount,
            });
        }

      } catch (error: any) {
        console.error("Gagal mengambil data admin atau statistik:", error.isAxiosError ? error.response?.data || error.message : error);
        if (error.response?.status === 401 || error.response?.status === 403) {
            authLogout();
            localStorage.removeItem('guestCart');
            router.replace('/admin/login?error=session_expired');
        } else {
            setStats({ totalMenuItems: 0, totalOrders: 0 }); 
        }
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchAdminData();
  }, [router]);


  const toggleDropdown = () => {
    setIsDropdownActive(prev => !prev);
  };

  const openModal = () => {
    setIsModalOpen(true);
    setIsDropdownActive(false); 
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const confirmLogout = () => {
    authLogout();
    localStorage.removeItem('guestCart'); 
    router.push('/admin/login'); 
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('user-dropdown');
      const button = document.getElementById('user-dropdown-button');
      if (dropdown && button && !dropdown.contains(event.target as Node) && !button.contains(event.target as Node)) {
        setIsDropdownActive(false);
      }
    };
    if (isDropdownActive) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownActive]);

  const statCards = [
    { title: "Total Pesanan", value: stats?.totalOrders, icon: ClipboardDocumentListIcon, color: "bg-sky-500", href: "/admin/daftar_pesanan" },
    { title: "Total Item Menu", value: stats?.totalMenuItems, icon: ArchiveBoxIcon, color: "bg-emerald-500", href: "/admin/daftar_menu" },
  ];

  return (
    <div className="bg-gray-100 flex min-h-screen">
      <aside className="w-64 bg-white shadow-md flex-shrink-0">
        <div className="flex items-center justify-center h-20 border-b">
          <Image 
            src="/images/saung.png"
            alt="Logo" 
            width={100} 
            height={48} 
            className="h-12 w-auto" 
            priority 
          />
        </div>
        <nav className="px-6 py-4 space-y-1 text-sm">
          <Link href="/admin/dashboard" className="flex items-center px-3 py-2.5 rounded-lg text-green-700 font-semibold bg-green-100">
            <span className="mr-3 text-lg">🏠</span> Dashboard
          </Link>
          <Link href="/admin/daftar_pesanan" className="flex items-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600">
            <span className="mr-3 text-lg">💳</span> Daftar Pesanan
          </Link>
          <Link href="/admin/daftar_menu" className="flex items-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600">
            <span className="mr-3 text-lg">📁</span> Daftar Menu
          </Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-md h-20 flex items-center justify-between px-6 flex-shrink-0">
          <div className="text-2xl cursor-pointer lg:hidden">☰</div>
          <div className="lg:block hidden"></div>
          <div className="relative">
            <button id="user-dropdown-button" onClick={toggleDropdown} className="flex items-center text-sm text-gray-700 focus:outline-none p-2 rounded-md hover:bg-gray-100">
              {adminUsername}
              <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${isDropdownActive ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isDropdownActive && (
              <div id="user-dropdown" className="absolute right-0 mt-2 w-40 bg-white shadow-xl rounded-md py-1 z-50 border border-gray-200">
                <button onClick={openModal} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600">
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-600">Home / Dashboard</p>
          </div>

          {isLoadingStats ? (
            <div className="flex justify-center items-center h-40">
              <ArrowPathIcon className="w-8 h-8 text-gray-500 animate-spin" />
              <p className="ml-3 text-gray-600">Memuat statistik...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {statCards.map((card) => (
                <Link key={card.title} href={card.href} legacyBehavior={card.href === "#" ? undefined : true}>
                  <a className={`block p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-white ${card.color}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold">{card.value !== undefined ? card.value : '-'}</p>
                        <p className="text-sm opacity-90">{card.title}</p>
                      </div>
                      <card.icon className="w-10 h-10 opacity-75" />
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6"> {/* Diubah menjadi 1 kolom untuk aktivitas cepat */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Aktivitas Cepat</h2>
               <div className="space-y-3">
                <Link href="/admin/daftar_menu" className="block w-full text-center py-2.5 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
                    Kelola Daftar Menu
                </Link>
                 <Link href="/admin/daftar_pesanan" className="block w-full text-center py-2.5 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                    Lihat Semua Pesanan
                </Link>
               </div>
            </div>
          </div>
        </main>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-2xl transform transition-all duration-300 ease-in-out scale-100">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Konfirmasi Logout</h2>
              <p className="text-sm text-gray-600 mb-6">Apakah Anda yakin ingin keluar dari sesi ini?</p>
              <div className="flex justify-center gap-4">
                <button onClick={confirmLogout} className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium">
                  Ya, Logout
                </button>
                <button onClick={closeModal} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}