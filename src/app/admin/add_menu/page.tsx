'use client';

import Link from 'next/link';
// Jika Anda menggunakan Image dari next/image, pastikan untuk mengimpornya
// import Image from 'next/image';

export default function AddMenuPage() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="flex items-center justify-center h-20 border-b">
          {/* Ganti dengan Image component Next.js jika ada */}
          <img src="/saung.png" alt="Logo" className="h-12" /> {/* Sesuaikan path jika perlu */}
        </div>
        <nav className="px-6 py-4 space-y-3 text-sm">
          <Link href="/admin/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-green-600">
            <span>🏠</span><span>Dashboard</span>
          </Link>
          <Link href="/admin/daftar_pesanan" className="flex items-center space-x-2 text-gray-700 hover:text-green-600">
            <span>💳</span><span>Daftar Pesanan</span>
          </Link>
          <Link href="/admin/daftar_menu" className="flex items-center space-x-2 text-gray-700 hover:text-green-600">
            <span>📁</span><span>Daftar Menu</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Topbar */}
        <header className="bg-white shadow-md h-20 flex items-center justify-between px-6">
          <div className="text-2xl cursor-pointer">☰</div>
          <div className="text-sm text-gray-700">username ▾</div>
        </header>

        {/* Page Content */}
        <main className="p-6 bg-gray-100">
          <div className="bg-gray-200 p-4 rounded shadow-inner">
            <h1 className="text-xl font-bold text-gray-800">Tambah Menu Baru</h1> {/* Ubah judul */}
            <p className="text-sm text-gray-600">Home / Daftar Menu / Tambah Menu</p> {/* Ubah breadcrumb */}

            {/* Form Tambah Menu */}
            <div className="bg-white mt-4 p-4 rounded shadow">
              {/* Baris input pertama */}
              <div className="flex items-center flex-wrap gap-4 mb-4">
                {/* Anda mungkin perlu komponen upload foto yang sebenarnya */}
                <button className="border px-4 py-2 rounded text-sm bg-gray-100 hover:bg-gray-200">Upload Foto</button>
                <input type="text" placeholder="Nama Menu" className="border px-3 py-2 rounded text-sm flex-grow" /> {/* Tambahkan flex-grow */}
                <input type="text" placeholder="Harga" className="border px-3 py-2 rounded text-sm w-24" /> {/* Sesuaikan lebar */}
                <select className="border px-3 py-2 rounded text-sm">
                  <option>Pilih Status</option> {/* Ubah label */}
                  <option value="available">Available</option>
                  <option value="out_of_stock">Out Of Stock</option>
                </select>
                {/* Ikon status bisa ditambahkan berdasarkan nilai select */}
                {/* <span className="status-icon green">✔</span> */}
              </div>

               {/* Input Deskripsi (opsional) */}
               <div className="mb-4">
                  <textarea
                    placeholder="Deskripsi Menu (Opsional)"
                    className="w-full border px-3 py-2 rounded text-sm"
                    rows={3}
                  ></textarea>
               </div>

               {/* Pilih Kategori */}
               <div className="mb-4">
                  <select className="border px-3 py-2 rounded text-sm w-full">
                      <option>Pilih Kategori</option>
                      <option value="makanan">Makanan</option>
                      <option value="minuman">Minuman</option>
                      <option value="cemilan">Cemilan</option>
                  </select>
               </div>

              {/* Tombol Submit */}
              {/* Ganti dengan button type="submit" di dalam form jika menggunakan tag <form> */}
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded text-sm mt-4">
                SUBMIT
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}