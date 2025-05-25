// src/components/MenuDetailModal.tsx
"use client";

import React from "react";
// Tidak perlu import useRouter atau isLoggedIn di sini jika AllMenuPage yang menangani

interface MenuItem {
  menuId: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

interface MenuDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onAddToCart: (menuId: number) => void; // Ini adalah fungsi incrementOrder dari AllMenuPage
}

const MenuDetailModal: React.FC<MenuDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onAddToCart,
}) => {
  if (!isOpen || !item) {
    return null;
  }

  const handleAddToCartInModal = () => {
    if (item) {
      onAddToCart(item.menuId); // Memanggil incrementOrder (atau fungsi serupa) dari AllMenuPage
    }
    onClose(); // Selalu tutup modal setelah aksi coba dilakukan
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-[#C5C5B3] p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 ease-in-out animate-modal-scale-in">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white rounded-full w-7 h-7 flex items-center justify-center text-lg transition-colors"
          aria-label="Tutup modal"
        >
          &times;
        </button>

        <img
          src={`http://localhost:8080${item.imageUrl || "/images/bg-home.jpg"}`}
          alt={item.name}
          className="w-full h-60 object-cover rounded-lg mb-4 shadow-md"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/bg-home.jpg";
          }}
        />
        <h2 className="text-3xl font-bold text-[#2C2C2C] mb-2">
          {item.name}
        </h2>
        <p className="text-xl text-[#4A4A3A] font-semibold mb-3">
          Rp {item.price.toLocaleString("id-ID")}
        </p>
        <p className="text-base text-[#3D3D32] mb-6 whitespace-pre-wrap">
          {item.description}
        </p>

        <button
          onClick={handleAddToCartInModal}
          className="w-full bg-[#D4B895] text-[#2C2C2C] py-3 px-4 rounded-lg font-semibold hover:bg-[#C4A885] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B8B7A]"
        >
          Tambah ke Keranjang
        </button>
      </div>
    </div>
  );
};

export default MenuDetailModal;