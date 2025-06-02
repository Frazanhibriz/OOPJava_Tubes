"use client";

export default function AdminHeader({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  return (
    <header className="bg-white shadow-md h-20 flex items-center justify-between px-6 flex-shrink-0">
      {onToggleSidebar && (
        <button onClick={onToggleSidebar} className="text-gray-600 focus:outline-none lg:hidden">
           <span className="text-2xl">☰</span>
        </button>
      )}
       <div className="text-2xl cursor-pointer lg:hidden"></div> 
       <div className="hidden lg:block"></div> 


      <div className="relative">
        <button className="flex items-center text-sm text-gray-700 focus:outline-none">
          username@example.com 
          <span className="ml-1">▾</span>
        </button>
      </div>
    </header>
  );
}