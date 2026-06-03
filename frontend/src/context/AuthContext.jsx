import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("slotbite_user")) || null,
  );
  const [token, setToken] = useState(
    localStorage.getItem("slotbite_token") || null,
  );
  const [orders, setOrders] = useState([]); // Shared local operational order state Mock
  const navigate = useNavigate();
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

  const signUp = async ({
    email,
    fullName,
    password,
    role,
    matricNumber,
    phone,
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        full_name: fullName,
        password,
        role,
        matrix_number: matricNumber || undefined,
        phone: phone || undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorDetail = data.detail || data.message || "Unable to register";
      throw new Error(errorDetail);
    }

    localStorage.setItem("slotbite_token", data.access_token);
    const authUser = { email, role, token: data.access_token };
    localStorage.setItem("slotbite_user", JSON.stringify(authUser));
    setUser(authUser);
    setToken(data.access_token);
    navigate(role === "vendor" ? "/vendor" : "/student");
  };

  const login = async (email, role, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorDetail = data.detail || data.message || "Unable to login";
      throw new Error(errorDetail);
    }

    localStorage.setItem("slotbite_token", data.access_token);
    const authUser = { email, role, token: data.access_token };
    localStorage.setItem("slotbite_user", JSON.stringify(authUser));
    setUser(authUser);
    setToken(data.access_token);
    navigate(role === "vendor" ? "/vendor" : "/student");
  };

  const fetchOrders = async () => {
    const response = await fetch(`${API_BASE_URL}/orders/orders/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorDetail =
        data.detail || data.message || "Unable to fetch your orders";
      throw new Error(errorDetail);
    }
    setOrders(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("slotbite_user");
    localStorage.removeItem("slotbite_token");
    setUser(null);
    setToken(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, signUp, logout, orders, setOrders }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
