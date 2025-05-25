"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Home() {
const [menuOpen, setMenuOpen] = useState(false);

useEffect(() => {
document.body.style.overflow = menuOpen ? "hidden" : "auto";
}, [menuOpen]);

return (
<div className="relative min-h-screen overflow-hidden">
{/* Background image with fade-in & scale animation */}
<motion.div
initial={{ opacity: 0, scale: 1.05 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 1 }}
className="absolute inset-0"
>
<img src="/images/bg-home.jpg" alt="Background" className="w-full h-full object-cover filter blur-[2px]" />
<div className="absolute inset-0 bg-black/40 z-10" />
</motion.div>
  {/* Menu Toggle - Always visible */}
  <div className="absolute top-5 right-6 z-40">
    <button
      onClick={() => setMenuOpen((prev) => !prev)}
      className="text-white bg-white/20 p-2 rounded-full hover:bg-white/30 transition"
      aria-label="Toggle Menu"
    >
      {menuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
    </button>
  </div>

  {/* Dropdown menu */}
  <AnimatePresence>
    {menuOpen && (
      <motion.div
        key="dropdown"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="absolute top-16 right-5 w-[330px] bg-white rounded-2xl shadow-2xl p-4 z-30"
      >
        {/* Admin login content */}
        <div className="flex items-center gap-4 mt-1 mb-4">
          <div className="bg-gray-100 p-2 rounded-xl border-2 border-yellow-400">
            <img
              src="/admin-icon.jpg"
              alt="admin icon"
              className="w-12 h-12"
            />
          </div>
          <h2 className="text-lg font-bold text-black">Login as Admin</h2>
        </div>

        <Link
          href="/admin/login"
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-full"
          onClick={() => setMenuOpen(false)}
        >
          Login
        </Link>
      </motion.div>
    )}
  </AnimatePresence>

  {/* Main content */}
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
    className="relative z-20 flex flex-col items-center justify-center text-white text-center h-screen px-4"
  >
    <h1 className="text-5xl md:text-7xl font-bold mb-4">
      Lesehan Sederhana
    </h1>
    <p className="text-xl md:text-2xl mb-8">Nikmati Sederhananya!</p>
    <Link
      href="/menu/allmenu"
      className="bg-[#D4B895] text-black px-8 py-3 rounded-full text-lg font-semibold hover:bg-[#C4A885] transition-colors inline-block"
    >
      Lihat Menu
    </Link>
  </motion.div>
</div>
);
}