// src/components/admin/MenuFormModal.tsx
"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import { XMarkIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';

export interface AdminMenuItemFormData {
  id?: number;
  name: string;
  price: string;
  category: string;
  description: string;
  imageUrl?: string | File | null;
}

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: AdminMenuItemFormData, imageFile?: File) => Promise<void>; 
  initialData?: AdminMenuItemFormData | null; 
  isEditMode: boolean;
  isSubmitting: boolean;
}

const CATEGORIES = ["Makanan", "Minuman", "Camilan"];

const MenuFormModal: React.FC<MenuFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditMode,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<AdminMenuItemFormData>({
    name: '',
    price: '',
    category: CATEGORIES[0],
    description: '',
    imageUrl: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageFile, setCurrentImageFile] = useState<File | undefined>(undefined);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || '',
        price: String(initialData.price || ''),
        category: initialData.category || CATEGORIES[0],
        description: initialData.description || '',
        imageUrl: initialData.imageUrl || null,
      });
      if (typeof initialData.imageUrl === 'string' && initialData.imageUrl) {
        setImagePreview(initialData.imageUrl.startsWith('/') ? `http://localhost:8080${initialData.imageUrl}` : initialData.imageUrl);
      } else {
        setImagePreview(null);
      }
      setCurrentImageFile(undefined);
    } else if (isOpen && !initialData) {
      setFormData({
        name: '', price: '', category: CATEGORIES[0], description: '', imageUrl: null,
      });
      setImagePreview(null);
      setCurrentImageFile(undefined);
    }
  }, [initialData, isOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCurrentImageFile(file);
      setFormData(prev => ({ ...prev, imageUrl: file })); 
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
        alert("Nama, harga, dan kategori menu wajib diisi.");
        return;
    }
    await onSubmit(formData, currentImageFile);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditMode ? "Edit Item Menu" : "Tambah Item Menu Baru"}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Menu</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2.5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Harga</label>
              <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required placeholder="Contoh: 25000" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2.5" />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select name="category" id="category" value={formData.category} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2.5">
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm p-2.5" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Menu</label>
            <div className="mt-1 flex items-center gap-4">
              <span className="inline-block h-20 w-20 rounded-md overflow-hidden bg-gray-100 border">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" width={80} height={80} className="object-cover h-full w-full" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                    <PhotoIcon className="h-10 w-10" />
                  </div>
                )}
              </span>
              <label htmlFor="file-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center">
                <ArrowUpTrayIcon className="w-4 h-4 mr-2"/>
                <span>Upload Gambar</span>
              </label>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
              {imagePreview && (
                <button type="button" onClick={() => { setImagePreview(null); setCurrentImageFile(undefined); setFormData(prev => ({...prev, imageUrl: null}));}} className="text-xs text-red-500 hover:text-red-700">Hapus Gambar</button>
              )}
            </div>
          </div>
          
          <div className="pt-5 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium transition">
              Batal
            </button>
            <button type="submit" disabled={isSubmitting} className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isSubmitting ? (isEditMode ? 'Menyimpan...' : 'Menambahkan...') : (isEditMode ? 'Simpan Perubahan' : 'Tambah Menu')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuFormModal;