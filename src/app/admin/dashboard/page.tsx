'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authLogout } from '@/utils/authUtils';

export default function AdminDashboardPage() {
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const toggleDropdown = () => {
    setIsDropdownActive(prev => !prev);
  };

  const openModal = () => {
    setIsModalOpen(true);
    setIsDropdownActive(false); // Close dropdown when modal opens
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const confirmLogout = () => {
    // Implement actual logout logic (clear token, call API)
    console.log("Logging out...");
    authLogout(); // Clear token using authUtils
    // Simulate logout redirect
    router.push('/admin/login'); // Redirect to admin login page
  };

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('dropdown');
      const button = document.getElementById('dropdown-button');
      if (dropdown && button && !dropdown.contains(event.target as Node) && !button.contains(event.target as Node)) {
        setIsDropdownActive(false);
      }
    };

    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-gray-100 flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="flex items-center justify-center h-20 border-b">
          {/* Replace with Next.js Image component if available */}
          <img src="/saung.png" alt="Logo" className="h-12" />
        </div>
        <nav className="px-6 py-4 space-y-3 text-sm">
          <Link href="/admin/dashboard" className="flex items-center text-green-700 font-semibold">
            <span className="mr-2">🏠</span> Dashboard
          </Link>
          {/* Update href for other links */}
          <Link href="/admin/daftar_pesanan" className="flex items-center text-gray-700 hover:text-green-600">
            <span className="mr-2">💳</span> Daftar Pesanan
          </Link>
          <Link href="/admin/daftar_menu" 
                className="flex items-center text-gray-700 hover:text-green-600"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/admin/daftar_menu');
                }}>
            <span className="mr-2">📁</span> Daftar Menu
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Header */}
        <header className="bg-white shadow-md h-20 flex items-center justify-between px-6 relative z-10">
          <div className="text-2xl cursor-pointer">☰</div> {/* Consider making this functional */}
          <div className="relative">
            <button id="dropdown-button" onClick={toggleDropdown} className="text-sm text-gray-700 focus:outline-none">
              username ▾ {/* Replace with actual logged-in username */}
            </button>
            <div id="dropdown" className={`dropdown absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-md py-2 z-20 ${isDropdownActive ? 'active' : ''}`}>
              <button onClick={openModal} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Logout</button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Dashboard</h1>
          <p className="text-sm text-gray-600 mb-6">Home / Dashboard</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <h2 className="text-sm text-gray-600">Total Pesanan</h2>
              <p className="text-2xl font-bold text-green-600 mt-2">12</p> {/* Replace with dynamic data */}
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <h2 className="text-sm text-gray-600">Menu Tersedia</h2>
              <p className="text-2xl font-bold text-green-600 mt-2">25</p> {/* Replace with dynamic data */}
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <h2 className="text-sm text-gray-600">Meja Terisi</h2>
              <p className="text-2xl font-bold text-green-600 mt-2">5</p> {/* Replace with dynamic data */}
            </div>
          </div>
        </main>

        {/* Modal Logout */}
        <div id="modal" className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isModalOpen ? '' : 'hidden'}`}>
          <div className="bg-white rounded-xl p-6 w-96 text-center">
            <h2 className="text-lg font-semibold mb-4">Konfirmasi Logout</h2>
            <p className="text-sm text-gray-600 mb-6">Apakah Anda yakin ingin logout?</p>
            <div className="flex justify-center gap-4">
              <button onClick={confirmLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Ya</button>
              <button onClick={closeModal} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">Batal</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}