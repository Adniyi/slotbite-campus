import React from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, Pizza } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50 items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-orange-500 flex items-center justify-center text-white font-bold rounded">
          <Pizza size={18} />
        </div>
        <span className="font-bold tracking-tight text-lg">
          SlotBite{" "}
          <span className="text-emerald-500 font-medium text-sm px-1.5 py-0.5 bg-emerald-50 rounded">
            Campus
          </span>
        </span>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-sm text-gray-500">
          {user.email} ({user.role})
        </span>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 border border-gray-200 px-3 py-1.5 rounded-none font-medium">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </nav>
  );
}
