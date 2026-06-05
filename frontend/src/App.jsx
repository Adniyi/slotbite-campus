import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/student/StudentDashboard";
import MenuPage from "./pages/student/MenuPage";
import MyTimeTable from "./pages/MyTimeTable";
import MyOrders from "./pages/student/MyOrders";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import MenuManagement from "./pages/vendor/MenuManagement";
import LandingPage from "./pages/LandingPage";

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen bg-white pb-16 md:pb-0 md:pt-16">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/menu/:vendorId"
            element={
              <ProtectedRoute allowedRole="student">
                <MenuPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/timetable"
            element={
              <ProtectedRoute allowedRole="student">
                <MyTimeTable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/orders"
            element={
              <ProtectedRoute allowedRole="student">
                <MyOrders />
              </ProtectedRoute>
            }
          />

          {/* Vendor Routes */}
          <Route
            path="/vendor"
            element={
              <ProtectedRoute allowedRole="vendor">
                <VendorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/menu"
            element={
              <ProtectedRoute allowedRole="vendor">
                <MenuManagement />
              </ProtectedRoute>
            }
          />

          {/* Fallback redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
