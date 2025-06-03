// 'use client';

// import { useParams } from 'next/navigation';
// import React, { useEffect, useState } from 'react';
// // Anda akan membutuhkan import untuk mengambil data dari backend, misalnya axiosInstance
// // import axiosInstance from '@/utils/axiosInstance';

// // Interface untuk data detail pesanan (sesuaikan dengan respons API Anda)
// interface OrderDetailData {
//   orderId: number;
//   customerName: string;
//   tableNumber: number;
//   status: string;
//   queueNumber: number;
//   totalPrice: number;
//   items: Array<{ 
//     name: string;
//     quantity: number;
//     price: number; 
//   }>;
// }

// export default function AdminDetailPesananPage() {
//   const params = useParams();
//   const orderId = params.orderId as string; // ID pesanan dari URL

//   const [orderDetail, setOrderDetail] = useState<OrderDetailData | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     // Fungsi untuk mengambil data detail pesanan dari backend
//     const fetchOrderDetail = async () => {
//       setIsLoading(true);
//       setError(null);
//       try {
//         // Ganti URL_API_DETAIL_PESANAN dengan endpoint API yang sebenarnya
//         // const response = await axiosInstance.get(`/URL_API_DETAIL_PESANAN/${orderId}`);
//         // setOrderDetail(response.data);

//         // Data mock untuk pengembangan sementara
//         const mockData: OrderDetailData = {
//             orderId: parseInt(orderId),
//             customerName: 'Rahmat',
//             tableNumber: 5,
//             status: 'IN_QUEUE',
//             queueNumber: 10,
//             totalPrice: 30000,
//             items: [
//                 { name: 'Ayam Bakar', quantity: 2, price: 15000 },
//                 // Tambahkan item lain jika perlu
//             ]
//         };
//         setOrderDetail(mockData);

//       } catch (err) {
//         console.error("Failed to fetch order detail:", err);
//         setError("Gagal memuat detail pesanan.");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (orderId) {
//       fetchOrderDetail();
//     }
//   }, [orderId]);

//   if (isLoading) {
//     return <div className="flex min-h-screen items-center justify-center">Memuat detail pesanan...</div>;
//   }

//   if (error) {
//     return <div className="flex min-h-screen items-center justify-center text-red-600">Error: {error}</div>;
//   }

//   if (!orderDetail) {
//     return <div className="flex min-h-screen items-center justify-center">Detail pesanan tidak ditemukan.</div>;
//   }

//   // Struktur HTML dari file statis
//   return (
//     <div className="bg-gray-100 font-sans flex min-h-screen">
//       {/* Sidebar - sesuaikan link jika perlu */}
//       <aside className="w-64 bg-white shadow-md">
//         <div className="flex items-center justify-center h-20 border-b">
//           <img src="/saung.png" alt="Logo" className="h-12" />
//         </div>
//         <nav className="px-6 py-4 space-y-3 text-sm">
//           <a href="/admin/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-green-600">
//             <span>🏠</span><span>Dashboard</span>
//           </a>
//           <a href="/admin/daftar_pesanan" className="flex items-center space-x-2 text-gray-700 hover:text-green-600">
//             <span>💳</span><span>Daftar Pesanan</span>
//           </a>
//           <a href="/admin/daftar_menu" className="flex items-center space-x-2 text-gray-700 hover:text-green-600">
//             <span>📁</span><span>Daftar Menu</span>
//           </a>
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <div className="flex-1 relative">
//         {/* Header */}
//         <header className="bg-white shadow-md h-20 flex items-center justify-between px-6">
//           <div className="text-2xl cursor-pointer">☰</div>
//           <div className="text-sm text-gray-700">username ▾</div>
//         </header>

//         {/* Page Content */}
//         <main className="p-6 bg-gray-100">
//           <div className="bg-gray-200 p-4 rounded shadow-inner">
//             {/* Bagian ini mungkin tidak perlu di halaman detail pesanan */}
//             {/* <h1 className="text-xl font-bold text-gray-800">Daftar Pesanan</h1>
//             <p className="text-sm text-gray-600">Home / Daftar Pesanan</p> */}

//             {/* Konten Detail Pesanan */}
//             <div className="bg-[#e8ebe4] w-full md:w-[500px] mx-auto rounded-2xl p-6 text-sm shadow-xl">
//               <h2 className="text-center font-semibold mb-4 text-gray-800">Detail Pesanan #{orderDetail.orderId}</h2>

//               {/* Tabel Item Pesanan */}
//               <table className="w-full mb-4 text-left">
//                 <thead className="border-b border-black">
//                   <tr>
//                     <th className="pb-1">Item</th>
//                     <th className="pb-1">Pcs</th>
//                     <th className="pb-1">Harga</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {orderDetail.items.map((item, index) => (
//                     <tr key={index}>
//                       <td>{item.name}</td>
//                       <td>{item.quantity}</td>
//                       <td>{item.price.toLocaleString('id-ID')}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>

//               {/* Info Tambahan */}
//               <div className="border-t border-black pt-2 space-y-1 text-gray-800">
//                 <p>Nomor Antrian : <strong>{orderDetail.queueNumber}</strong></p>
//                 <p>Status &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <strong>{orderDetail.status}</strong></p>
//                 <p>Total Pembayaran : <strong>{orderDetail.totalPrice.toLocaleString('id-ID')}</strong></p>
//               </div>

//               {/* Tombol Selesai */}
//               <div className="text-center mt-4">
//                 {/* Ganti <a> dengan <Link> Next.js */}
//                 <a href = "/admin/daftar_pesanan" className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">SELESAI</a>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// } 