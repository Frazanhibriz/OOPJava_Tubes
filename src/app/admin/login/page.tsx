// src/app/admin/login/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios"; 
import axiosInstance from "@/utils/axiosInstance";
import { isLoggedIn, logout as authLogout } from "@/utils/authUtils";
import { motion } from "framer-motion";
import Link from "next/link";

interface UserDetails {
  id: number;
  username: string;
  name: string;
  noTelp: string;
  role: string;
}

export default function AdminLoginPage() {
  const [username, setUsername] = useState(""); // Kosongkan nilai awal, biarkan admin input
  const [password, setPassword] = useState(""); // Kosongkan nilai awal
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoggedIn()) {
        const verifyRoleAndRedirect = async () => {
            try {
                console.log("AdminLoginPage: useEffect - User is logged in, verifying role...");
                const response = await axiosInstance.get<UserDetails>("/auth/me");
                console.log("AdminLoginPage: useEffect - /auth/me response:", response.data);
                if (response.data && response.data.role && response.data.role.toUpperCase() === "ADMIN") {
                    console.log("AdminLoginPage: useEffect - Role ADMIN confirmed, redirecting to dashboard.");
                    router.replace(searchParams.get("redirect_to") || "/admin/dashboard"); 
                } else {
                    console.log("AdminLoginPage: useEffect - Logged in user is not ADMIN or role missing, logging out.");
                    authLogout(); 
                    // Tidak perlu redirect lagi di sini, biarkan di halaman login admin
                }
            } catch (e: any) {
                console.error("AdminLoginPage: useEffect - Gagal verifikasi peran:", e.isAxiosError ? e.response?.data || e.message : e);
                authLogout(); 
            }
        };
        verifyRoleAndRedirect();
    }
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("AdminLoginPage: handleSubmit - Attempting login for username:", username);
      const loginResponse = await axios.post("http://localhost:8080/auth/login", {
        username,
        password,
      });
      console.log("AdminLoginPage: handleSubmit - Response from /auth/login:", loginResponse.data);

      if (loginResponse.data && loginResponse.data.token) {
        const tempToken = loginResponse.data.token;
        localStorage.setItem("token", tempToken);
        console.log("AdminLoginPage: handleSubmit - Token saved to localStorage:", tempToken);
        
        // Penting: Setelah token disimpan, axiosInstance akan menggunakannya untuk request berikutnya
        console.log("AdminLoginPage: handleSubmit - Fetching user details from /auth/me to verify role...");
        const userDetailsResponse = await axiosInstance.get<UserDetails>("/auth/me");
        console.log("AdminLoginPage: handleSubmit - Response from /auth/me:", userDetailsResponse.data);
        
        if (userDetailsResponse.data && userDetailsResponse.data.role && userDetailsResponse.data.role.toUpperCase() === "ADMIN") {
          console.log("AdminLoginPage: handleSubmit - ADMIN role confirmed. Redirecting...");
          const redirectTo = searchParams.get("redirect_to");
          router.replace(redirectTo || "/admin/dashboard"); 
        } else {
          localStorage.removeItem("token"); 
          const roleReceived = userDetailsResponse.data?.role || "tidak diketahui";
          setError(`Akses ditolak. Akun bukan Admin atau peran tidak sesuai (Peran diterima: ${roleReceived}).`);
          console.warn(`AdminLoginPage: handleSubmit - Access denied. Role received: ${roleReceived}`);
        }
      } else {
        setError("Login gagal. Token tidak diterima dari server.");
        console.warn("AdminLoginPage: handleSubmit - Login failed, no token from server.");
      }
    } catch (err: any) {
      console.error("AdminLoginPage: handleSubmit - Login error:", err.isAxiosError ? err.response?.data || err.message : err);
      localStorage.removeItem("token"); 
      if (axios.isAxiosError(err) && err.response) {
         if (err.response.status === 401 || err.response.status === 403) { // 401 biasanya untuk bad credentials dari /auth/login
            setError("Username atau password salah.");
         } else {
            setError(err.response.data?.message || err.response.data || "Terjadi kesalahan jaringan atau server.");
         }
      } else {
        setError("Terjadi kesalahan teknis saat login.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/images/bg-home.jpg" 
          alt="Background"
          className="w-full h-full object-cover filter blur-[2px]"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-20 w-full max-w-md px-4"
      >
        <div className="relative bg-[#8B8B7A]/80 backdrop-blur-md p-8 rounded-3xl shadow-xl">
          <Link
            href="/"
            className="absolute top-4 left-4 z-10"
            title="Kembali ke Beranda"
          >
            <img
              src="/images/icon-home.png" 
              alt="Home"
              className="w-8 h-8 hover:scale-105 transition-transform"
            />
          </Link>

          <div className="flex justify-center mb-6 relative mt-2">
            <div className="w-20 h-20 relative">
              <img
                src="/images/saung.png" 
                alt="Logo"
                className="w-full h-full object-contain"
              />
               <img
                src="/images/leaf-left.svg"
                alt=""
                className="absolute -left-3 bottom-0 w-5 h-5"
              />
              <img
                src="/images/leaf-right.svg"
                alt=""
                className="absolute -right-3 bottom-0 w-5 h-5"
              />
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-center text-white mb-2">
            Login Admin
          </h2>
          <p className="text-xs text-center text-gray-200 mb-6">
            Silakan masukkan kredensial Admin Anda.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-red-400 text-center text-sm bg-red-100/20 py-2 px-3 rounded-lg border border-red-400">
                {error}
              </div>
            )}
            <input
              type="text"
              placeholder="Username Admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4B895]"
              disabled={isLoading}
            />
            <input
              type="password"
              placeholder="Password Admin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4B895]"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`w-full px-4 py-3 rounded-full bg-[#D4B895] text-[#2C2C2C] font-semibold hover:bg-[#C4A885] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4B895] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Login sebagai Admin"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}