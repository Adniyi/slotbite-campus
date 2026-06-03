import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Pizza } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setError("");
      await login(email, role, password);
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md border-2 border-gray-100 p-8 bg-white">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-3 text-2xl font-bold tracking-tight">
            <div className="w-8 h-8 bg-orange-500 flex items-center justify-center text-white font-bold rounded">
              <Pizza size={18} />
            </div>
            <h1>SlotBite Campus</h1>
          </div>
          <p className="text-gray-400 text-sm mt-1">Skip lines. Order fresh.</p>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex border border-gray-200 p-1 bg-gray-50">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium ${role === "student" ? "bg-white border border-gray-200 text-gray-900" : "text-gray-400"}`}
              onClick={() => setRole("student")}>
              Student Portal
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium ${role === "vendor" ? "bg-white border border-gray-200 text-gray-900" : "text-gray-400"}`}
              onClick={() => setRole("vendor")}>
              Vendor Desk
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-none focus:outline-none focus:border-orange-500 text-sm"
              placeholder="you@elizadeuniversity.edu.ng"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              {role === "student" ? "Matric number" : "Password"}
            </label>
            <input
              type={role === "student" ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-none focus:outline-none focus:border-orange-500 text-sm"
              placeholder={
                role === "student" ? "e.g. EU2xxxxx-xxxx" : "••••••••"
              }
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-orange-500 text-white font-medium text-sm tracking-wide hover:bg-orange-600">
            Access Account
          </button>
          <p className="text-center text-sm text-gray-500 mt-4">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-orange-500 font-medium hover:text-orange-600">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
