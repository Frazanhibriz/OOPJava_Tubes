"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login as authLogin, isLoggedIn } from "@/utils/authUtils";
import axiosInstance from "@/utils/axiosInstance";
import { motion } from "framer-motion";
import Link from "next/link";

interface BackendCartItem {
  menuId: number;
  quantity: number;
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoggedIn()) {
      const redirectTo = searchParams.get("redirect_to");
      router.replace(redirectTo || "/menu/allmenu");
    }
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const success = await authLogin(username, password);
      if (success) {
        const redirectTo = searchParams.get("redirect_to");

        if (redirectTo === "/my-order") {
          try {
            const cartResponse = await axiosInstance.get<BackendCartItem[]>("/cart");
            if (cartResponse.data && cartResponse.data.length > 0) {
              router.replace("/my-order");
            } else {
              router.replace("/menu/allmenu");
            }
          } catch (cartError) {
            console.error("Gagal mengambil data keranjang (redirect_to /my-order):", cartError);
            router.replace("/menu/allmenu");
          }
        } else if (redirectTo) {
          router.replace(redirectTo);
        } else {
          try {
            const cartResponse = await axiosInstance.get<BackendCartItem[]>("/cart");
            if (cartResponse.data && cartResponse.data.length > 0) {
              router.replace("/my-order");
            } else {
              router.replace("/menu/allmenu");
            }
          } catch (cartError) {
            console.error("Gagal mengambil data keranjang (no redirect_to):", cartError);
            router.replace("/menu/allmenu");
          }
        }
      } else {
        setError("Username atau password salah");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan saat login");
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

          <div className="flex justify-center mb-8 relative mt-4">
            <div className="w-24 h-24 relative">
              <img
                src="/images/saung.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
              <img
                src="/images/leaf-left.svg"
                alt=""
                className="absolute -left-4 bottom-0 w-6 h-6"
              />
              <img
                src="/images/leaf-right.svg"
                alt=""
                className="absolute -right-4 bottom-0 w-6 h-6"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-red-500 text-center text-sm bg-red-100/90 py-2 px-3 rounded-lg border border-red-400">
                {error}
              </div>
            )}
            <input
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4B895]"
              disabled={isLoading}
            />
            <input
              type="password"
              placeholder="password"
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
              {isLoading ? "Memproses..." : "Login"}
            </button>
          </form>

          <p className="text-center text-white text-sm mt-6">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-[#FFE9B1] hover:underline font-medium"
            >
              Daftar di sini
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}