"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isLoggedIn, logout as authLogout } from "@/utils/authUtils"; // Ganti nama import logout

export default function Navbar() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  // Panggil ulang pengecekan login jika pengguna navigasi kembali ke halaman
  // Ini membantu jika token berubah di tab lain atau setelah redirect
  useEffect(() => {
    const handleRouteChange = () => {
      setLoggedIn(isLoggedIn());
    };
    // Meskipun tidak ada event spesifik di App Router untuk ini,
    // seringkali re-render komponen karena navigasi sudah cukup.
    // Jika ada masalah state login tidak update, ini bisa jadi area investigasi.
    // Untuk sekarang, kita andalkan useEffect dependency kosong untuk mount awal.
    // Anda juga bisa memicu re-check dari context jika menggunakan global state.

    // Memastikan state update jika user menggunakan tombol back/forward browser
    const handlePopState = () => {
        setLoggedIn(isLoggedIn());
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
        window.removeEventListener('popstate', handlePopState);
    };

  }, []);


  const handleLogout = () => {
    authLogout(); // Menghapus token dari localStorage
    localStorage.removeItem('guestCart'); // Eksplisit hapus guestCart
    setLoggedIn(false);
    // Menggunakan window.location.href untuk full reload dan membersihkan state di seluruh aplikasi
    window.location.href = "/login"; 
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-[#2C2C2C]/90 sticky top-0 z-40 backdrop-blur-sm">
      <div className="w-12 h-12">
        <Link href="/">
          <Image
            src="/images/saung.png"
            alt="Logo Saung"
            width={48}
            height={48}
            className="object-contain"
            priority
          />
        </Link>
      </div>
      <div className="text-white space-x-3 sm:space-x-4 text-xs sm:text-sm font-medium flex items-center">
        <Link href="/" className="hover:text-[#D4B895] transition-colors px-1 sm:px-2 py-1 rounded-md">
          BERANDA
        </Link>
        <span className="text-white/40">|</span>
        <Link href="/menu/allmenu" className="hover:text-[#D4B895] transition-colors px-1 sm:px-2 py-1 rounded-md">
          MENU
        </Link>
        <span className="text-white/40">|</span>
        <Link href="/pesanan-saya" className="hover:text-[#D4B895] transition-colors px-1 sm:px-2 py-1 rounded-md">
          PESANAN SAYA
        </Link>

        {loggedIn ? (
          <>
            <span className="text-white/40">|</span>
            <button
              onClick={handleLogout}
              className="hover:text-red-400 transition-colors px-1 sm:px-2 py-1 rounded-md"
              title="Logout"
            >
              LOGOUT
            </button>
          </>
        ) : (
          <>
            <span className="text-white/40">|</span>
            <Link href="/login" className="hover:text-[#D4B895] transition-colors px-1 sm:px-2 py-1 rounded-md">
              LOGIN
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}