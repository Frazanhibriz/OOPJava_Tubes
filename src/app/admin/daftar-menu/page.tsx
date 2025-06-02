// src/app/admin/daftar-menu/page.tsx
"use client";

import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import Image from 'next/image';
import axiosInstance from '@/utils/axiosInstance';

interface AdminMenuItem {
  id?: number;
  imageUrl?: string | File;
  name: string;
  price: string; // Disimpan sebagai string untuk input form
  status: 'Available' | 'Out Of Stock';
  category: string;
  description?: string;
}

// Tipe data yang diharapkan dari backend untuk satu item menu
interface BackendMenuItem {
  id: number; // id pasti ada dari backend
  name: string;
  price: number; // Backend mengirim price sebagai number
  status: 'Available' | 'Out Of Stock'; // Asumsi backend mengirim ini
  category: string;
  description?: string;
  imageUrl?: string;
}

interface MenuItemPayload {
  name: string;
  price: number;
  status: 'Available' | 'Out Of Stock';
  category: string;
  description: string;
  imageUrl: string | undefined;
}


export default function DaftarMenuPage() {
  const [menuItems, setMenuItems] = useState<AdminMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('Kategori Menu');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allFetchedMenuItems, setAllFetchedMenuItems] = useState<AdminMenuItem[]>([]);


  const fetchMenuItems = useCallback(async () => {
    setIsLoading(true);
    try {
      // Pastikan backend mengirim semua field yang dibutuhkan oleh AdminMenuItem
      const response = await axiosInstance.get<BackendMenuItem[]>('/menu'); 
      const formattedItems: AdminMenuItem[] = response.data.map(item => ({
          id: item.id,
          name: item.name,
          price: String(item.price), // Konversi price number dari backend ke string untuk form
          status: item.status,
          category: item.category,
          description: item.description || item.name, // Default deskripsi ke nama jika tidak ada
          imageUrl: item.imageUrl || undefined 
      }));
      setMenuItems(formattedItems);
      setAllFetchedMenuItems(formattedItems); 
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setMenuItems([]);
      setAllFetchedMenuItems([]);
      alert("Gagal memuat daftar menu dari server.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const handleInputChange = (
    index: number,
    field: keyof Omit<AdminMenuItem, 'status' | 'imageUrl' | 'id'>, 
    value: string
  ) => {
    setMenuItems(prevItems =>
      prevItems.map((item, i) => {
        if (i === index) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };
  
  const handleStatusChange = (index: number, newStatus: 'Available' | 'Out Of Stock') => {
    setMenuItems(prevItems =>
      prevItems.map((item, i) => {
        if (i === index) {
            return { ...item, status: newStatus };
        }
        return item;
    }));
  };

  const handleCategoryChange = (index: number, newCategory: string) => {
    setMenuItems(prevItems =>
      prevItems.map((item, i) => {
        if (i === index) {
            return { ...item, category: newCategory };
        }
        return item;
    }));
  };

  const handleImageFileChange = async (index: number, file: File | null) => {
    if (!file) return;
    const currentItem = menuItems[index];
    
    if (currentItem.id) {
        const formData = new FormData();
        formData.append('image', file);
        try {
            setIsSubmitting(true); 
            const response = await axiosInstance.post<{imageUrl: string}>(`/menu/upload-image/${currentItem.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const newImageUrl = response.data.imageUrl;
            setMenuItems(prevItems =>
                prevItems.map((item, i) => 
                    i === index ? { ...item, imageUrl: newImageUrl } : item
                )
            );
            setAllFetchedMenuItems(prevItems =>
                prevItems.map((item) => 
                    item.id === currentItem.id ? { ...item, imageUrl: newImageUrl } : item
                )
            );
            alert("Gambar berhasil diupload. Perubahan gambar akan tersimpan permanen.");
        } catch (error) {
            console.error("Error uploading image for existing item:", error);
            alert("Gagal mengupload gambar.");
        } finally {
            setIsSubmitting(false);
        }
    } else {
        setMenuItems(prevItems =>
            prevItems.map((item, i) => (i === index ? { ...item, imageUrl: file } : item))
        );
    }
  };

  const handleAddRow = () => {
    setMenuItems(prevItems => [
      ...prevItems,
      { name: '', price: '', status: 'Available', category: 'Makanan', description: '', imageUrl: undefined, id: undefined }
    ]);
  };

  const handleDeleteRow = async (idToDelete?: number, indexToDelete?: number) => {
    if (idToDelete) { 
        if (!confirm("Anda yakin ingin menghapus menu ini dari server?")) return;
        try {
            setIsSubmitting(true);
            await axiosInstance.delete(`/menu/${idToDelete}`);
            alert("Menu berhasil dihapus dari server.");
            fetchMenuItems(); 
        } catch (error) {
            console.error("Error deleting menu item:", error);
            alert("Gagal menghapus menu dari server.");
        } finally {
            setIsSubmitting(false);
        }
    } else if (indexToDelete !== undefined) { 
        setMenuItems(prevItems => prevItems.filter((_, i) => i !== indexToDelete));
    }
  };

  const handleSubmitMenu = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const itemsToProcess = [...menuItems]; 

    const promises = itemsToProcess.map(async (item, index) => {
      let finalImageUrl: string | undefined = undefined;
      if (typeof item.imageUrl === 'string') {
        finalImageUrl = item.imageUrl;
      } else if (item.imageUrl instanceof File && item.id) {
        // Jika File dan item sudah ada ID, upload dulu (seharusnya sudah ditangani handleImageFileChange)
        // Jika ini terjadi, berarti user memilih file baru tapi belum diupload terpisah
        // Atau, lebih baik, pastikan handleImageFileChange selalu update imageUrl menjadi string
        console.warn(`Item "${item.name}" (ID: ${item.id}) memiliki File object. Idealnya sudah diupload.`);
        const originalItem = allFetchedMenuItems.find(fi => fi.id === item.id);
        finalImageUrl = (originalItem && typeof originalItem.imageUrl === 'string') ? originalItem.imageUrl : undefined;
      } else if (item.imageUrl instanceof File && !item.id) {
        console.warn(`Item baru "${item.name}" akan dibuat tanpa gambar. Upload setelah item tersimpan.`);
        finalImageUrl = undefined; 
      } else {
        finalImageUrl = undefined;
      }

      let payloadForBackend: MenuItemPayload = {
        name: item.name,
        price: parseFloat(item.price) || 0,
        status: item.status,
        category: item.category,
        description: item.description || item.name,
        imageUrl: finalImageUrl,
      };

      if (!item.name || !item.price || !item.category) {
        alert(`Data tidak lengkap untuk menu '${item.name || `baris ke-${index + 1}`}'. Nama, harga, dan kategori wajib diisi.`);
        throw new Error(`Data tidak lengkap untuk menu: ${item.name || `baris ke-${index+1}`}`);
      }

      if (item.id) {
        return axiosInstance.put(`/menu/${item.id}`, payloadForBackend);
      } else {
        // Untuk item baru, setelah POST berhasil, idealnya kita dapat ID dan bisa upload gambar jika ada File object
        const createResponse = await axiosInstance.post<BackendMenuItem>('/menu', payloadForBackend);
        const newItemId = createResponse.data.id;
        // Jika ada file yang disimpan di state untuk item baru ini, upload sekarang
        if (item.imageUrl instanceof File && newItemId) {
            console.log(`Uploading image for new item ID: ${newItemId}`);
            const formData = new FormData();
            formData.append('image', item.imageUrl);
            try {
                await axiosInstance.post(`/menu/upload-image/${newItemId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } catch (uploadError) {
                console.error(`Gagal upload gambar untuk item baru ID ${newItemId}:`, uploadError);
                // Item tetap dibuat, tapi gambar gagal upload
                alert(`Item ${payloadForBackend.name} berhasil dibuat, tapi gambar gagal diupload.`);
            }
        }
        return createResponse; // Kembalikan respons dari create
      }
    });

    try {
      await Promise.all(promises);
      alert("Semua perubahan berhasil disimpan!");
      fetchMenuItems(); 
    } catch (error) {
      console.error("Error submitting menu changes:", error);
      if (!(error instanceof Error && error.message.startsWith("Data tidak lengkap"))) {
        alert("Terjadi kesalahan saat menyimpan perubahan. Beberapa item mungkin gagal disimpan.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearchTerm = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedFilterCategory === 'Kategori Menu' || selectedFilterCategory === 'All Menu' || item.category === selectedFilterCategory;
    return matchesSearchTerm && matchesCategory;
  });

  if (isLoading && menuItems.length === 0) {
    return <div className="flex justify-center items-center h-screen"><p>Memuat data menu...</p></div>;
  }

  return (
    <div className="bg-gray-200/60 p-4 sm:p-6 rounded-lg shadow-inner min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Menu</h1>
        <p className="text-sm text-gray-600">Admin / Daftar Menu</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 flex-wrap gap-4">
        <input type="text" placeholder="Cari Nama Menu..." className="border border-gray-300 px-3 py-2.5 rounded-md text-sm w-full sm:w-60 focus:ring-green-500 focus:border-green-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select className="border border-gray-300 px-3 py-2.5 rounded-md text-sm w-full sm:w-auto focus:ring-green-500 focus:border-green-500" value={selectedFilterCategory} onChange={(e) => setSelectedFilterCategory(e.target.value)}>
          <option>Kategori Menu</option>
          <option value="All Menu">All Menu</option>
          <option value="Makanan">Makanan</option>
          <option value="Minuman">Minuman</option>
          <option value="Cemilan">Cemilan</option>
        </select>
      </div>

      <form onSubmit={handleSubmitMenu} className="bg-white mt-4 p-4 sm:p-6 rounded-lg shadow-md">
        {filteredMenuItems.map((item, index) => {
          let imagePreviewSrc: string | undefined = undefined;
          if (item.imageUrl) {
            if (typeof item.imageUrl === 'string') {
              imagePreviewSrc = item.imageUrl.startsWith('http') || item.imageUrl.startsWith('/') 
                                ? item.imageUrl.startsWith('/') ? `http://localhost:8080${item.imageUrl}` : item.imageUrl
                                : `http://localhost:8080/${item.imageUrl}`;
            } else if (item.imageUrl instanceof File) {
              imagePreviewSrc = URL.createObjectURL(item.imageUrl);
            }
          }

          return (
            <div key={item.id || `new-item-${index}`} className="flex flex-col sm:flex-row items-center flex-wrap gap-3 sm:gap-4 mb-4 pb-4 border-b last:border-b-0 last:mb-0 last:pb-0">
              <div className="flex-shrink-0">
                  <input type="file" id={`foto-${index}-${item.id || 'new'}`} className="hidden" accept="image/*" onChange={(e) => e.target.files && e.target.files.length > 0 && handleImageFileChange(index, e.target.files[0])} />
                  <label htmlFor={`foto-${index}-${item.id || 'new'}`} className="cursor-pointer w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500 transition bg-gray-50">
                      {imagePreviewSrc ? (<Image src={imagePreviewSrc} alt={item.name || "Preview"} width={96} height={96} className="object-cover w-full h-full rounded-md" /> ) : (<span className="text-xs text-center">Upload Foto</span> )}
                  </label>
              </div>
              <input type="text" placeholder="Nama Menu" className="border px-3 py-2.5 rounded-md text-sm sm:flex-grow focus:ring-green-500 focus:border-green-500 w-full sm:w-auto" value={item.name} onChange={(e) => handleInputChange(index, 'name', e.target.value)} />
              <input type="text" placeholder="Harga (cth: 25000)" className="border px-3 py-2.5 rounded-md text-sm focus:ring-green-500 focus:border-green-500 w-full sm:w-32" value={item.price} onChange={(e) => handleInputChange(index, 'price', e.target.value)} />
              <input type="text" placeholder="Deskripsi" className="border px-3 py-2.5 rounded-md text-sm sm:flex-grow focus:ring-green-500 focus:border-green-500 w-full sm:w-auto" value={item.description || ''} onChange={(e) => handleInputChange(index, 'description', e.target.value)} />
               <select className="border px-3 py-2.5 rounded-md text-sm focus:ring-green-500 focus:border-green-500 w-full sm:w-auto" value={item.category} onChange={(e) => handleCategoryChange(index, e.target.value)}>
                  <option value="">Pilih Kategori</option>
                  <option value="Makanan">Makanan</option>
                  <option value="Minuman">Minuman</option>
                  <option value="Cemilan">Cemilan</option>
                </select>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select className="border px-3 py-2.5 rounded-md text-sm focus:ring-green-500 focus:border-green-500 flex-grow" value={item.status} onChange={(e) => handleStatusChange(index, e.target.value as 'Available' | 'Out Of Stock')}>
                  <option value="Available">Available</option>
                  <option value="Out Of Stock">Out Of Stock</option>
                </select>
                <span className={`p-1.5 px-2.5 rounded-full text-white text-xs font-bold ${item.status === 'Available' ? 'bg-green-500' : 'bg-red-500'}`}>
                  {item.status === 'Available' ? '✔' : '✖'}
                </span>
              </div>
              <button type="button" onClick={() => handleDeleteRow(item.id, index)} className="ml-auto p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
              </button>
            </div>
          );
        })}
        
        <div className="flex justify-between items-center mt-6">
            <button type="button" onClick={handleAddRow} className="border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded-md text-sm font-medium transition">
                + Tambah Baris Menu
            </button>
            <button type="submit" disabled={isSubmitting} className={`bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-md text-sm font-semibold transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isSubmitting ? 'Menyimpan...' : 'SIMPAN PERUBAHAN'}
            </button>
        </div>
      </form>
    </div>
  );
}