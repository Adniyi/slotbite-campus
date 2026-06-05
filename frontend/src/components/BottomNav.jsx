import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Utensils,
  LogOut,
} from "lucide-react";

export default function BottomNav() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const baseStyles =
    "flex flex-col items-center justify-center flex-1 py-2 text-xs font-medium border-t-2";
  const activeStyles = "border-orange-500 text-orange-600 bg-orange-50/20";
  const unactiveStyles = "border-transparent text-gray-400 hover:text-gray-600";

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex h-16 z-50 items-center justify-around">
      {user.role === "student" ? (
        <>
          <NavLink
            to="/student"
            end
            className={({ isActive }) =>
              `${baseStyles} ${isActive ? activeStyles : unactiveStyles}`
            }>
            <LayoutDashboard size={20} className="mb-0.5" /> Dashboard
          </NavLink>
          <NavLink
            to="/student/timetable"
            className={({ isActive }) =>
              `${baseStyles} ${isActive ? activeStyles : unactiveStyles}`
            }>
            <ClipboardList size={20} className="mb-0.5" /> Timetable
          </NavLink>
          <NavLink
            to="/student/orders"
            className={({ isActive }) =>
              `${baseStyles} ${isActive ? activeStyles : unactiveStyles}`
            }>
            <ShoppingBag size={20} className="mb-0.5" /> My Orders
          </NavLink>
        </>
      ) : (
        <>
          <NavLink
            to="/vendor"
            end
            className={({ isActive }) =>
              `${baseStyles} ${isActive ? activeStyles : unactiveStyles}`
            }>
            <ClipboardList size={20} className="mb-0.5" /> Orders
          </NavLink>
          <NavLink
            to="/vendor/menu"
            className={({ isActive }) =>
              `${baseStyles} ${isActive ? activeStyles : unactiveStyles}`
            }>
            <Utensils size={20} className="mb-0.5" /> Setup Menu
          </NavLink>
        </>
      )}
      <button
        onClick={logout}
        className={`${baseStyles} border-transparent text-gray-400`}>
        <LogOut size={20} className="mb-0.5 text-red-400" /> Out
      </button>
    </div>
  );
}
