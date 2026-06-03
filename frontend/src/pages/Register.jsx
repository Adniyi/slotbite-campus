import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Pizza } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [matricNumber, setMatricNumber] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please complete all required fields.");
      return;
    }

    if (role === "student" && !matricNumber) {
      setError("Matric number is required for student registration.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      await signUp({
        email,
        fullName,
        matricNumber: role === "student" ? matricNumber : undefined,
        password,
        role,
        phone: phone || undefined,
      });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg border-2 border-gray-100 p-8 bg-white">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-3 text-2xl font-bold tracking-tight">
            <div className="w-8 h-8 bg-orange-500 flex items-center justify-center text-white font-bold rounded">
              <Pizza size={18} />
            </div>
            <h1>Register</h1>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Create your student or vendor account.
          </p>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex border border-gray-200 p-1 bg-gray-50">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium ${role === "student" ? "bg-white border border-gray-200 text-gray-900" : "text-gray-400"}`}
              onClick={() => setRole("student")}>
              Student
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium ${role === "vendor" ? "bg-white border border-gray-200 text-gray-900" : "text-gray-400"}`}
              onClick={() => setRole("vendor")}>
              Vendor
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
              Full name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-none focus:outline-none focus:border-orange-500 text-sm"
              placeholder="Jane Doe"
            />
          </div>

          {role === "student" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Matric number
              </label>
              <input
                type="text"
                required
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-none focus:outline-none focus:border-orange-500 text-sm"
                placeholder="EU2xxxxx-xxxx"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Phone number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-none focus:outline-none focus:border-orange-500 text-sm"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-none focus:outline-none focus:border-orange-500 text-sm"
              placeholder="Create a password"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Confirm password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-none focus:outline-none focus:border-orange-500 text-sm"
              placeholder="Repeat password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-orange-500 text-white font-medium text-sm tracking-wide hover:bg-orange-600 disabled:opacity-60">
            {submitting ? "Creating account..." : "Create account"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-orange-500 font-medium hover:text-orange-600">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
