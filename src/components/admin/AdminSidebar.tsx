"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation'; 


export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/admin/daftar-pesanan", label: "Daftar Pesanan", icon: "💳" },
    { href: "/admin/daftar-menu", label: "Daftar Menu", icon: "📁" },
  ];

  return (
    <aside className="w-64 bg-white shadow-md flex-shrink-0">
      <div className="flex items-center justify-center h-20 border-b">
        <Image src="/images/saung.png" alt="Logo" width={100} height={48} className="h-12 w-auto" />
      </div>
      <nav className="px-6 py-4 space-y-1 text-sm">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center px-3 py-2.5 rounded-lg transition-colors
              ${pathname === item.href
                ? "bg-green-100 text-green-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100 hover:text-green-600"
              }`}
          >
            <span className="mr-3 text-lg">{item.icon}</span> 
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}