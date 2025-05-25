"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import axiosInstance from "@/utils/axiosInstance";
import MenuDetailModal from "@/components/MenuDetailModal";
import { isLoggedIn } from "@/utils/authUtils";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";

interface MenuItem {
  menuId: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

interface BackendCartItem {
  menuId: number;
  quantity: number;
}

export default function AllMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [allFetchedMenuItems, setAllFetchedMenuItems] = useState<MenuItem[]>([]);
  const [orderCounts, setOrderCounts] = useState<Record<number, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  const router = useRouter();

  const categories = [
    { key: "all", name: "Semua Menu", endpointValue: "" },
    { key: "Makanan", name: "Makanan", endpointValue: "Makanan" },
    { key: "Minuman", name: "Minuman", endpointValue: "Minuman" },
    { key: "Camilan", name: "Camilan", endpointValue: "Camilan" },
  ];

  const fetchMenuItemsForDisplay = useCallback(async (category: string) => {
    try {
      let url = "http://localhost:8080/menu";
      if (category && category !== "all" && category !== "") {
        url = `http://localhost:8080/menu/filter?category=${encodeURIComponent(category)}`;
      }
      const res = await axios.get<MenuItem[]>(url);
      setMenuItems(res.data);
    } catch (err) {
      console.error("Gagal mengambil item menu untuk ditampilkan:", err);
      setMenuItems([]);
    }
  }, []);

  useEffect(() => {
    const fetchAllItemsForPriceReference = async () => {
      try {
        const res = await axios.get<MenuItem[]>("http://localhost:8080/menu");
        setAllFetchedMenuItems(res.data);
      } catch (err) {
        console.error("Gagal mengambil semua item menu untuk referensi harga:", err);
      }
    };
    fetchAllItemsForPriceReference();
  }, []);

  const fetchUserCart = useCallback(async () => {
    const loggedIn = isLoggedIn();
    setIsUserLoggedIn(loggedIn);

    if (loggedIn) {
      setIsLoadingCart(true);
      try {
        const response = await axiosInstance.get<BackendCartItem[]>("/cart");
        const newOrderCounts: Record<number, number> = {};
        response.data.forEach((item) => {
          newOrderCounts[item.menuId] = item.quantity;
        });
        setOrderCounts(newOrderCounts);
      } catch (error) {
        console.error("Gagal mengambil keranjang backend:", error);
        setOrderCounts({});
      } finally {
        setIsLoadingCart(false);
      }
    } else {
      setOrderCounts({}); 
      localStorage.removeItem("guestCart"); 
    }
  }, []);

  useEffect(() => {
    const categoryToFetch = selectedCategory === "all" ? "" : selectedCategory;
    fetchMenuItemsForDisplay(categoryToFetch);
  }, [selectedCategory, fetchMenuItemsForDisplay]);

  useEffect(() => {
    fetchUserCart();
    const handleLoginChange = () => fetchUserCart();
    window.addEventListener('loginStatusChanged', handleLoginChange); 
    return () => {
        window.removeEventListener('loginStatusChanged', handleLoginChange);
    };
  }, [fetchUserCart]);

  const updateBackendCartItem = async (menuId: number, quantity: number) => {
    try {
      await axiosInstance.post("/cart/add", null, { params: { menuItemId: menuId, quantity: quantity } });
      return true;
    } catch (error) {
      console.error("Gagal update item keranjang backend:", error);
      alert("Gagal memperbarui keranjang di server.");
      return false;
    }
  };

  const removeBackendCartItem = async (menuId: number) => {
    try {
      await axiosInstance.delete("/cart/remove", { params: { menuItemId: menuId } });
      return true;
    } catch (error) {
      console.error("Gagal hapus item keranjang backend:", error);
      alert("Gagal menghapus item dari keranjang di server.");
      return false;
    }
  };

  const handleAddToCartAction = async (menuId: number, newQuantity: number) => {
    if (!isUserLoggedIn) {
      alert("Anda harus login terlebih dahulu untuk menambahkan item ke keranjang.");
      router.push(`/login?redirect_to=/menu/allmenu`);
      return;
    }

    let success = false;
    if (newQuantity === 0) {
        success = await removeBackendCartItem(menuId);
    } else {
        success = await updateBackendCartItem(menuId, newQuantity);
    }

    if (success) {
        setOrderCounts((prev) => {
            const updated = { ...prev };
            if (newQuantity === 0) delete updated[menuId];
            else updated[menuId] = newQuantity;
            return updated;
        });
    }
  };

  const incrementOrder = (menuId: number) => {
    if (!isUserLoggedIn) {
        alert("Silakan login untuk menambahkan item ke keranjang.");
        router.push(`/login?redirect_to=/menu/allmenu&menuId=${menuId}&action=add`);
        return;
    }
    const currentQuantity = orderCounts[menuId] || 0;
    const newQuantity = currentQuantity + 1;
    handleAddToCartAction(menuId, newQuantity);
  };

  const decrementOrder = (menuId: number) => {
    if (!isUserLoggedIn) {
        alert("Silakan login untuk mengubah item di keranjang.");
        router.push(`/login?redirect_to=/menu/allmenu`);
        return;
    }
    const currentQuantity = orderCounts[menuId] || 0;
    if (currentQuantity <= 0) return;
    const newQuantity = currentQuantity - 1;
    handleAddToCartAction(menuId, newQuantity);
  };

  const openModal = (item: MenuItem) => {
    setSelectedItemForModal(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItemForModal(null);
  };

  const totalItems = Object.values(orderCounts).reduce((sum, count) => sum + count, 0);
  const totalPrice = Object.entries(orderCounts).reduce((sum, [menuIdStr, quantity]) => {
    const menuId = parseInt(menuIdStr);
    const menuItem = allFetchedMenuItems.find((item) => item.menuId === menuId);
    if (menuItem && quantity > 0) {
      return sum + menuItem.price * quantity;
    }
    return sum;
  }, 0);

  const isShortMenu = menuItems.length <= 3;

  const handleOrderButtonClick = () => {
    if (!isUserLoggedIn) {
        alert("Anda harus login untuk melihat keranjang dan melanjutkan pesanan.");
        router.push(`/login?redirect_to=/my-order`); 
        return;
    }
    if (totalItems === 0) {
      alert("Keranjang Anda kosong. Silakan pilih menu terlebih dahulu.");
      return;
    }
    router.push("/my-order");
  };

  const handleCategoryClick = (categoryKey: string) => {
    const categoryObject = categories.find((cat) => cat.key === categoryKey);
    if (categoryObject) {
      setSelectedCategory(categoryObject.endpointValue || "all");
    }
  };

  return (
    <div className="relative min-h-screen pb-20">
      <Navbar />
      <div className="fixed inset-0 -z-10">
        <img src="/images/bg-home.jpg" alt="Background" className="w-full h-full object-cover filter blur-[2px]" />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="relative z-10">
        <div className="container mx-auto p-6">
          <div className="bg-[#C5C5B3]/95 backdrop-blur-md rounded-3xl p-6 shadow-lg">
            <div className="grid grid-cols-4 gap-6">
              <div className="col-span-1">
                <h2 className="text-2xl font-bold mb-4 text-[#2C2C2C]">KATEGORI MENU</h2>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button key={cat.key} onClick={() => handleCategoryClick(cat.key)} className={`block w-full text-left py-2 px-4 rounded-lg transition-colors ${ (selectedCategory === cat.endpointValue || (selectedCategory === "all" && cat.key === "all")) ? "bg-[#6B6B5A] text-white" : "text-[#2C2C2C] hover:bg-[#8B8B7A] hover:text-white" }`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-3">
                {isLoadingCart && (<div className="flex justify-center items-center h-[200px]"><p className="text-lg text-[#2C2C2C]">Memuat data keranjang...</p></div>)}
                {(!isLoadingCart || menuItems.length > 0) && menuItems.length === 0 && !isLoadingCart && (
                    <p className="text-center text-xl text-[#2C2C2C] mt-10">
                      {selectedCategory && selectedCategory !== "all" && selectedCategory !== "" ? `Tidak ada menu untuk kategori "${categories.find( (c) => c.endpointValue === selectedCategory )?.name || selectedCategory}".` : "Tidak ada menu yang tersedia saat ini."}
                    </p>
                )}
                {menuItems.length > 0 && (
                  <div className={`${isShortMenu ? "flex justify-center" : "max-h-[600px] overflow-y-auto pr-2"}`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {menuItems.map((item) => (
                        <div key={item.menuId} className="relative bg-[#8B8B7A] rounded-xl p-3 shadow-md h-[310px] flex flex-col">
                          <img src={`http://localhost:8080${item.imageUrl || "/images/bg-home.jpg"}`} alt={item.name} className="w-full h-44 object-cover rounded-lg mb-2 cursor-pointer" onClick={() => openModal(item)} onError={(e) => { (e.target as HTMLImageElement).src = "/images/bg-home.jpg"; }} />
                          <div className="text-white mt-2 flex-grow flex flex-col justify-between">
                            <div>
                              <h3 className="text-base font-semibold truncate" title={item.name}>{item.name}</h3>
                              <p className="text-sm mb-1">Rp {item.price.toLocaleString("id-ID")}</p>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <button onClick={() => openModal(item)} className="text-xs bg-[#6B6B5A] hover:bg-[#5A5A4A] text-white py-1 px-2 rounded-md transition-colors">Selengkapnya</button>
                              {(orderCounts[item.menuId] || 0) > 0 ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => decrementOrder(item.menuId)} className="bg-[#D4B895] text-[#2C2C2C] rounded-full px-2 py-0.5 hover:bg-[#C4A885]">-</button>
                                  <span className="text-white font-semibold">{orderCounts[item.menuId]}</span>
                                  <button onClick={() => incrementOrder(item.menuId)} className="bg-[#D4B895] text-[#2C2C2C] rounded-full px-2 py-0.5 hover:bg-[#C4A885]">+</button>
                                </div>
                              ) : (
                                <button onClick={() => incrementOrder(item.menuId)} className="bg-[#D4B895] text-[#2C2C2C] rounded-full px-2.5 py-0.5 hover:bg-[#C4A885]">+</button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {totalItems > 0 && isUserLoggedIn && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
            <button onClick={handleOrderButtonClick} className="flex items-center gap-3 bg-[#D4B895] text-[#2C2C2C] px-6 py-3 rounded-full text-lg font-semibold hover:bg-[#C4A885] transition-colors shadow-lg">
              <span>{totalItems} Items</span>
              <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
              <span>&rarr;</span>
            </button>
          </div>
        )}
        <MenuDetailModal isOpen={isModalOpen} onClose={closeModal} item={selectedItemForModal} onAddToCart={() => { if (selectedItemForModal) { incrementOrder(selectedItemForModal.menuId); } }} />
      </div>
    </div>
  );
}