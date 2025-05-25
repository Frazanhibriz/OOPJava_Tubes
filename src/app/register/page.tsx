// src/app/register/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { isLoggedIn } from "@/utils/authUtils";
import { motion } from "framer-motion";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [noTelp, setNoTelp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      router.replace("/menu/allmenu");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!username || !password || !name || !noTelp) {
      setError("Semua field wajib diisi.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/auth/register", {
        username,
        password,
        name,
        noTelp,
      });

      setSuccess(response.data || "Registrasi berhasil! Silakan login.");
      setUsername("");
      setPassword("");
      setName("");
      setNoTelp("");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      console.error("Registration error:", err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.message || err.response.data || "Registrasi gagal. Username mungkin sudah digunakan atau terjadi kesalahan server.");
      } else {
        setError("Terjadi kesalahan saat registrasi.");
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
        className="relative z-20 w-full max-w-md px-4 py-8"
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

          <h2 className="text-2xl font-semibold text-center text-white mb-6">
            Buat Akun Baru
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-500 text-center text-sm bg-red-100/90 py-2 px-3 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-700 text-center text-sm bg-green-100/90 py-2 px-3 rounded-lg">
                {success}
              </div>
            )}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4B895]"
              disabled={isLoading}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4B895]"
              disabled={isLoading}
            />
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4B895]"
              disabled={isLoading}
            />
            <input
              type="tel"
              placeholder="Nomor Telepon (Contoh: 08123...)"
              value={noTelp}
              onChange={(e) => setNoTelp(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4B895]"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`w-full px-4 py-3 rounded-full bg-[#D4B895] text-[#2C2C2C] font-semibold hover:bg-[#C4A885] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4B895] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? "Mendaftar..." : "Daftar"}
            </button>
          </form>

          <p className="text-center text-white text-sm mt-6">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-[#FFE9B1] hover:underline font-medium"
            >
              Login di sini
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}