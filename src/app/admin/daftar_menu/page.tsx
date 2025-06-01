'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function DaftarMenu() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="flex items-center justify-center h-20 border-b">
          <Image src="/logo.png" alt="Logo" width={48} height={48} />
        </div>
        <nav className="px-6 py-4 space-y-3 text-sm">
          <Link href="/admin/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-green-600">
            <span>🏠</span><span>Dashboard</span>
          </Link>
          <Link href="/admin/daftar_pesanan" className="flex items-center space-x-2 text-gray-700 hover:text-green-600">
            <span>💳</span><span>Daftar Pesanan</span>
          </Link>
          <Link href="/admin/daftar_menu" className="flex items-center space-x-2 text-green-700 font-semibold">
            <span>📁</span><span>Daftar Menu</span>
          </Link>
        </nav>
      </aside>

      {/* Konten Utama */}
      <div className="flex-1">
        {/* Topbar */}
        <header className="bg-white shadow-md h-20 flex items-center justify-between px-6">
          <div className="text-2xl cursor-pointer">☰</div>
          <div className="text-sm text-gray-700">username ▾</div>
        </header>

        {/* Konten */}
        <main className="p-6 bg-gray-100">
          <div className="bg-gray-200 p-4 rounded shadow-inner">
            <h1 className="text-xl font-bold text-gray-800">Daftar Menu</h1>
            <p className="text-sm text-gray-600">Home / Daftar Menu</p>

            {/* Tombol dan pencarian */}
            <div className="flex items-center justify-between mt-4">
              <Link href="/admin/add_menu" className="bg-green-200 text-green-900 px-4 py-1 rounded text-sm hover:bg-green-300">
                + Add Menu Item
              </Link>
              <input type="text" placeholder="Cari Menu" className="border border-gray-300 px-3 py-1 rounded text-sm" />
              <select className="border border-gray-300 px-3 py-1 rounded text-sm">
                <option selected>Kategori Menu</option>
                <option>Makanan</option>
                <option>Minuman</option>
                <option>Cemilan</option>
              </select>
            </div>

            {/* Tabel */}
            <div className="bg-white mt-4 p-4 rounded shadow overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b">
                    <th className="py-2">No</th>
                    <th className="py-2">Gambar</th>
                    <th className="py-2">Nama</th>
                    <th className="py-2">Price</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">1</td>
                    <td className="py-2">
                      <Image src="/ayam-bakar.jpg" alt="Ayam Bakar" width={48} height={48} className="rounded" />
                    </td>
                    <td className="py-2">Ayam Bakar</td>
                    <td className="py-2">15.000</td>
                    <td className="py-2 space-x-2">
                      <button className="text-blue-500 hover:text-blue-700">✏</button>
                      <button className="text-red-500 hover:text-red-700">🗑</button>
                    </td>
                  </tr>
                  {/* Tambahkan baris menu lainnya di sini */}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}