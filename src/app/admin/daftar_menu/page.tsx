// src/app/admin/daftar-menu/page.tsx
"use client";

import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/utils/axiosInstance';
import { isLoggedIn, logout as authLogout } from '@/utils/authUtils';
import { 
    ArrowPathIcon, 
    TrashIcon as TrashIconOutline,
    PlusCircleIcon,
    ExclamationTriangleIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';
import MenuFormModal, { AdminMenuItemFormData } from '@/components/admin/MenuFormModal';

interface AdminMenuItemOnPage {
  id: number; 
  imageUrl?: string;
  name: string;
  price: string;
  category: string;
  description?: string; // Tetap opsional di sini
}

interface BackendMenuItem {
  menuId: number;
  name: string;
  price: number;
  category: string;
  description?: string;
  imageUrl?: string;
  status?: 'Available' | 'Out Of Stock';
}

interface MenuItemPayloadToServer {
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string | undefined | null;
}

const CATEGORIES = ["Makanan", "Minuman", "Camilan"];

export default function DaftarMenuPage() {
  const [menuItems, setMenuItems] = useState<AdminMenuItemOnPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('Semua Kategori');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminMenuItemFormData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [adminUsername, setAdminUsername] = useState("Admin");
  const [isDropdownActive, setIsDropdownActive] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const router = useRouter();

  const fetchMenuItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<BackendMenuItem[]>('/menu');
      const formattedItems: AdminMenuItemOnPage[] = response.data.map(item => ({
          id: item.menuId,
          name: item.name,
          price: String(item.price),
          category: item.category,
          description: item.description || '',
          imageUrl: item.imageUrl || undefined,
      }));
      setMenuItems(formattedItems);
    } catch (err) {
      console.error("Error fetching menu items:", err);
      setMenuItems([]);
      setError("Gagal memuat daftar menu dari server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/admin/login');
      return;
    }
    const fetchInitialAdminData = async () => {
        try {
            const userDetailsResponse = await axiosInstance.get<{name: string, role: string}>('/auth/me');
            if (userDetailsResponse.data?.role?.toUpperCase() !== 'ADMIN') {
                authLogout(); localStorage.removeItem('guestCart');
                router.replace('/admin/login?error=not_admin'); return;
            }
            setAdminUsername(userDetailsResponse.data.name || "Admin");
            await fetchMenuItems();
        } catch (authError: any) {
            console.error("Gagal verifikasi admin atau memuat data awal:", authError);
            if (authError.response?.status === 401 || authError.response?.status === 403) {
                authLogout(); localStorage.removeItem('guestCart');
                router.replace('/admin/login?error=session_expired');
            } else {
                setError("Gagal memuat data halaman."); setIsLoading(false);
            }
        }
    };
    fetchInitialAdminData();
  }, [router, fetchMenuItems]);

  const handleOpenAddModal = () => {
    const newItemFormData: AdminMenuItemFormData = {
        name: '', price: '', category: CATEGORIES[0], description: '', imageUrl: null,
    };
    setEditingItem(newItemFormData);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleOpenEditModal = (item: AdminMenuItemOnPage) => {
    // ---- PERBAIKAN DI SINI ----
    const editItemFormData: AdminMenuItemFormData = {
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        description: item.description || '', // Pastikan selalu ada string, meskipun kosong
        imageUrl: item.imageUrl || null,
    };
    setEditingItem(editItemFormData);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleCloseModal = () => { setShowModal(false); setEditingItem(null); };

  const handleDeleteItem = async (menuId: number) => {
    if (!confirm(`Anda yakin ingin menghapus menu dengan ID ${menuId}?`)) return;
    setIsSubmitting(true);
    try {
        await axiosInstance.delete(`/menu/${menuId}`);
        alert("Menu berhasil dihapus.");
        fetchMenuItems();
    } catch (error) {
        console.error("Error deleting menu item:", error);
        alert("Gagal menghapus menu.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleSubmitModal = async (formData: AdminMenuItemFormData, imageFile?: File) => {
    setIsSubmitting(true);
    
    const payload: MenuItemPayloadToServer = {
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        description: formData.description || formData.name,
        imageUrl: typeof formData.imageUrl === 'string' ? formData.imageUrl : undefined,
    };

    try {
        if (isEditMode && formData.id) {
            if (imageFile) {
                const imageUploadFormData = new FormData();
                imageUploadFormData.append('image', imageFile);
                const imgResponse = await axiosInstance.post<{ imageUrl: string }>(`/menu/upload-image/${formData.id}`, imageUploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                payload.imageUrl = imgResponse.data.imageUrl;
            } else if (formData.imageUrl === null) { 
                payload.imageUrl = null; 
            }
            
            await axiosInstance.put(`/menu/${formData.id}`, payload);
            alert("Menu berhasil diperbarui!");
        } else {
            const createResponse = await axiosInstance.post<BackendMenuItem>('/menu', payload);
            const newItemId = createResponse.data.menuId; 
            alert(`Menu "${payload.name}" berhasil ditambahkan!`);

            if (imageFile && newItemId) {
                 const imageUploadFormData = new FormData();
                 imageUploadFormData.append('image', imageFile);
                 try {
                    await axiosInstance.post<{imageUrl: string}>(`/menu/upload-image/${newItemId}`, imageUploadFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                 } catch (uploadError) {
                    console.error(`Gagal upload gambar untuk item baru ID ${newItemId}:`, uploadError);
                    alert(`Item ${payload.name} dibuat, tapi gambar gagal diupload.`);
                 }
            }
        }
        fetchMenuItems();
        handleCloseModal();
    } catch (error: any) {
        console.error("Error submitting menu:", error);
        alert(`Gagal ${isEditMode ? 'memperbarui' : 'menambahkan'} menu: ${error.response?.data?.message || error.response?.data || error.message || 'Kesalahan Server'}`);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const filteredMenuItems = menuItems.filter(item => {
    const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = selectedFilterCategory === 'Semua Kategori' || item.category === selectedFilterCategory;
    return nameMatch && categoryMatch;
  });

  const toggleDropdown = () => setIsDropdownActive(prev => !prev);
  const openLogoutModal = () => { setIsLogoutModalOpen(true); setIsDropdownActive(false); };
  const closeLogoutModal = () => setIsLogoutModalOpen(false);
  const confirmLogout = () => { authLogout(); localStorage.removeItem('guestCart'); router.push('/admin/login'); };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('admin-user-dropdown');
      const button = document.getElementById('admin-user-dropdown-button');
      if (dropdown && button && !dropdown.contains(event.target as Node) && !button.contains(event.target as Node)) {
        setIsDropdownActive(false);
      }
    };
    if (isDropdownActive) { window.addEventListener('click', handleClickOutside); }
    return () => { window.removeEventListener('click', handleClickOutside); };
  }, [isDropdownActive]);


  if (isLoading && menuItems.length === 0 && !error) {
    return (
        <div className="bg-gray-100 flex min-h-screen">
            <aside className="w-64 bg-white shadow-md flex-shrink-0">
                <div className="flex items-center justify-center h-20 border-b"><Image src="/images/saung.png" alt="Logo" width={100} height={48} className="h-12 w-auto" priority /></div>
                <nav className="px-6 py-4 space-y-1 text-sm">
                    <Link href="/admin/dashboard" className="flex items-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600"><span className="mr-3 text-lg">🏠</span> Dashboard</Link>
                    <Link href="/admin/daftar_pesanan" className="flex items-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600"><span className="mr-3 text-lg">💳</span> Daftar Pesanan</Link>
                    <Link href="/admin/daftar_menu" className="flex items-center px-3 py-2.5 rounded-lg text-green-700 font-semibold bg-green-100"><span className="mr-3 text-lg">📁</span> Daftar Menu</Link>
                </nav>
            </aside>
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-md h-20 flex items-center justify-between px-6 flex-shrink-0"><div></div><div className="text-sm text-gray-700">{adminUsername}</div></header>
                <main className="flex-1 p-6 flex justify-center items-center"><ArrowPathIcon className="w-10 h-10 text-gray-500 animate-spin" /> <p className="ml-3">Memuat data menu...</p></main>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-gray-100 flex min-h-screen">
        <aside className="w-64 bg-white shadow-md flex-shrink-0">
            <div className="flex items-center justify-center h-20 border-b"><Image src="/images/saung.png" alt="Logo" width={100} height={48} className="h-12 w-auto" priority/></div>
            <nav className="px-6 py-4 space-y-1 text-sm">
                <Link href="/admin/dashboard" className="flex items-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600"><span className="mr-3 text-lg">🏠</span> Dashboard</Link>
                <Link href="/admin/daftar_pesanan" className="flex items-center px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600"><span className="mr-3 text-lg">💳</span> Daftar Pesanan</Link>
                <Link href="/admin/daftar_menu" className="flex items-center px-3 py-2.5 rounded-lg text-green-700 font-semibold bg-green-100"><span className="mr-3 text-lg">📁</span> Daftar Menu</Link>
            </nav>
        </aside>
        <div className="flex-1 flex flex-col">
            <header className="bg-white shadow-md h-20 flex items-center justify-between px-6 flex-shrink-0">
                <div className="text-2xl cursor-pointer lg:hidden">☰</div>
                <div className="lg:block hidden"></div>
                <div className="relative">
                    <button id="admin-user-dropdown-button" onClick={toggleDropdown} className="flex items-center text-sm text-gray-700 focus:outline-none p-2 rounded-md hover:bg-gray-100">
                    {adminUsername}
                    <svg className={`w-4 h-4 ml-1 transition-transform duration-200 ${isDropdownActive ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    {isDropdownActive && (
                    <div id="admin-user-dropdown" className="absolute right-0 mt-2 w-40 bg-white shadow-xl rounded-md py-1 z-50 border border-gray-200">
                        <button onClick={openLogoutModal} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600">Logout</button>
                    </div>
                    )}
                </div>
            </header>
            <main className="flex-1 p-6">
                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Daftar Menu</h1>
                            <p className="text-sm text-gray-600">Admin / Daftar Menu</p>
                        </div>
                        <button onClick={handleOpenAddModal} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-md text-sm font-semibold transition flex items-center">
                            <PlusCircleIcon className="w-5 h-5 mr-2"/> Tambah Menu Baru
                        </button>
                    </div>

                    {error && (<div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2"><ExclamationTriangleIcon className="h-5 w-5"/> {error}</div>)}

                    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 flex-wrap gap-4">
                        <input type="text" placeholder="Cari Nama Menu..." className="border border-gray-300 px-3 py-2.5 rounded-md text-sm w-full sm:w-60 focus:ring-green-500 focus:border-green-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <select className="border border-gray-300 px-3 py-2.5 rounded-md text-sm w-full sm:w-auto focus:ring-green-500 focus:border-green-500" value={selectedFilterCategory} onChange={(e) => setSelectedFilterCategory(e.target.value)}>
                        <option value="Semua Kategori">Semua Kategori</option>
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gambar</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Menu</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading && filteredMenuItems.length === 0 ? (
                                    <tr><td colSpan={5} className="py-10 text-center text-gray-500"><ArrowPathIcon className="inline w-6 h-6 animate-spin mr-2"/> Memuat...</td></tr>
                                ) : !isLoading && filteredMenuItems.length === 0 ? (
                                    <tr><td colSpan={5} className="py-10 text-center text-gray-500">Tidak ada menu yang ditemukan.</td></tr>
                                ) : (
                                    filteredMenuItems.map((item) => {
                                        const PLACEHOLDER_IMAGE_URL = "/images/placeholder-food.png";
                                        let imageDisplaySrc = PLACEHOLDER_IMAGE_URL; 
                                        if (item.imageUrl && typeof item.imageUrl === 'string') {
                                            if (item.imageUrl.startsWith('http')) {
                                                imageDisplaySrc = item.imageUrl;
                                            } else if (item.imageUrl.startsWith('/')) {
                                                imageDisplaySrc = `http://localhost:8080${item.imageUrl}`;
                                            } else { 
                                                imageDisplaySrc = `http://localhost:8080/${item.imageUrl}`;
                                            }
                                        }
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <Image src={imageDisplaySrc} alt={item.name} width={48} height={48} className="w-12 h-12 rounded object-cover bg-gray-200" onError={(e) => { const target = e.target as HTMLImageElement; if (target.src !== PLACEHOLDER_IMAGE_URL) { target.src = PLACEHOLDER_IMAGE_URL; target.srcset = ""; } }} />
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">Rp {parseFloat(item.price).toLocaleString('id-ID')}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-center text-sm font-medium space-x-2">
                                                    <button onClick={() => handleOpenEditModal(item)} className="text-blue-600 hover:text-blue-800" title="Edit">
                                                        <PencilSquareIcon className="w-5 h-5"/>
                                                    </button>
                                                    <button onClick={() => item.id && handleDeleteItem(item.id)} className="text-red-600 hover:text-red-800" title="Hapus">
                                                        <TrashIconOutline className="w-5 h-5"/>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            {showModal && editingItem && (
              <MenuFormModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSubmit={handleSubmitModal}
                initialData={editingItem}
                isEditMode={isEditMode}
                isSubmitting={isSubmitting}
              />
            )}
             {isLogoutModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] transition-opacity duration-300 ease-in-out">
                <div className="bg-white rounded-xl p-6 w-full max-w-sm text-center shadow-2xl transform transition-all duration-300 ease-in-out scale-100">
                  <h2 className="text-lg font-semibold mb-4 text-gray-800">Konfirmasi Logout</h2>
                  <p className="text-sm text-gray-600 mb-6">Apakah Anda yakin ingin keluar dari sesi ini?</p>
                  <div className="flex justify-center gap-4">
                    <button onClick={confirmLogout} className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium">Ya, Logout</button>
                    <button onClick={closeLogoutModal} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium">Batal</button>
                  </div>
                </div>
              </div>
            )}
        </div>
    </div>
  );
}