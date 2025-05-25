// src/components/CartItemRow.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image"; // Menggunakan Next.js Image untuk optimasi
import { PlusIcon, MinusIcon, TrashIcon } from "@heroicons/react/24/solid";

export interface CartItemProps {
  id: number;
  name: string;
  price: number; // Harga satuan
  quantity: number;
  imageUrl?: string;
  onQuantityChange: (id: number, newQuantity: number) => void;
  onRemove: (id: number) => void;
}

const CartItemRow: React.FC<CartItemProps> = ({
  id,
  name,
  price,
  quantity,
  imageUrl,
  onQuantityChange,
  onRemove,
}) => {
  const subtotal = price * quantity;

  const handleIncrement = () => {
    onQuantityChange(id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(id, quantity - 1);
    } else {
      onRemove(id);
    }
  };

  // Logika pembentukan URL gambar dan fallback, mirip dengan AllMenuPage
  const imageSource = imageUrl 
    ? `http://localhost:8080${imageUrl}` 
    : "/images/placeholder-food.png"; // Fallback jika imageUrl tidak ada atau kosong

  // Fallback jika terjadi error saat memuat gambar utama
  const [currentImageSrc, setCurrentImageSrc] = useState(imageSource);
  const handleImageError = () => {
    setCurrentImageSrc("/images/placeholder-food.png"); // Ganti ke placeholder jika ada error
  };

  return (
    <div className="flex items-center py-4 border-b border-[#A5A58D]/50 last:border-b-0">
      <div className="w-16 h-16 relative mr-4 rounded-md overflow-hidden flex-shrink-0 bg-[#A5A58D]"> {/* Tambahkan bg color untuk fallback */}
        <Image
          src={currentImageSrc} // Menggunakan state untuk source gambar
          alt={name}
          fill // Menggunakan prop 'fill' untuk mengisi parent div
          style={{ objectFit: "cover" }} // Styling object-fit
          onError={handleImageError} // Menangani error pemuatan gambar
          // Jika Anda ingin unoptimized untuk gambar dari localhost selama development (opsional):
          // unoptimized={currentImageSrc.startsWith("http://localhost")}
        />
      </div>
      <div className="flex-grow">
        <h4 className="text-base font-semibold text-[#3E3E32] mb-0.5">{name}</h4>
        <p className="text-xs text-[#6B6B5A]">
          Harga Satuan: Rp {price.toLocaleString("id-ID")}
        </p>
      </div>
      <div className="flex items-center mx-4 w-28 justify-center">
        <button
          onClick={handleDecrement}
          className="p-1.5 rounded-full text-[#D4B895] hover:bg-[#D4B895]/20 transition-colors"
          aria-label="Kurangi jumlah"
        >
          <MinusIcon className="w-4 h-4 text-[#2C2C2C]" />
        </button>
        <span className="mx-3 text-base font-medium text-[#2C2C2C] w-8 text-center">
          {quantity}
        </span>
        <button
          onClick={handleIncrement}
          className="p-1.5 rounded-full text-[#D4B895] hover:bg-[#D4B895]/20 transition-colors"
          aria-label="Tambah jumlah"
        >
          <PlusIcon className="w-4 h-4 text-[#2C2C2C]" />
        </button>
      </div>
      <div className="w-24 text-right mr-4">
        <p className="text-sm font-semibold text-[#2C2C2C]">
          Rp {subtotal.toLocaleString("id-ID")}
        </p>
      </div>
      <div className="w-10 text-right">
        <button
          onClick={() => onRemove(id)}
          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
          aria-label="Hapus item"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CartItemRow;