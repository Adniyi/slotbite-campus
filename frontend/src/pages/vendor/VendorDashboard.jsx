import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { CheckCircle2, Flame, Loader2 } from "lucide-react";

export default function VendorDashboard() {
  const { orders, setOrders, token } = useAuth();
  const [isPaused, setIsPaused] = useState(() => {
    const stored = localStorage.getItem("slotbite_vendor_paused");
    return stored === "true";
  });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

    const fetchDashboard = async () => {
      if (!token) {
        setError("You must be logged in as a vendor to view this dashboard.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const [summaryRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/vendor/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/vendor/orders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!summaryRes.ok) {
          const d = await summaryRes.json();
          throw new Error(d.detail || "Unable to load vendor summary");
        }

        if (!ordersRes.ok) {
          const d = await ordersRes.json();
          throw new Error(d.detail || "Unable to load vendor orders");
        }

        const summaryData = await summaryRes.json();
        const ordersData = await ordersRes.json();

        setSummary(summaryData);
        const pausedValue = summaryData.is_paused ?? false;
        setIsPaused(pausedValue);
        localStorage.setItem("slotbite_vendor_paused", String(pausedValue));
        console.log(summaryData);
        console.log(ordersData);

        const mapped = ordersData.map((o) => ({
          id: o.id,
          slot: new Date(o.slot_time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          items: o.items.map((it) => ({
            name: it.menu_item?.name || it.menu_item_name || "Item",
            quantity: it.quantity || 0,
          })),
          total: o.total_amount,
          status:
            typeof o.status === "string"
              ? o.status.charAt(0).toUpperCase() + o.status.slice(1)
              : String(o.status),
        }));

        setOrders(mapped);
      } catch (err) {
        setError(err.message || "Unable to load vendor dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [setOrders, token]);

  const updateStatus = async (id, currentStatus) => {
    let nextStatus = "pending";
    if (currentStatus === "Pending") nextStatus = "preparing";
    else if (currentStatus === "Preparing") nextStatus = "ready";
    else return;

    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

    try {
      const res = await fetch(`${API_BASE_URL}/vendor/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Unable to update status");

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                status:
                  nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1),
              }
            : o,
        ),
      );
    } catch (err) {
      console.error("Failed to update order status", err);
    }
  };

  const togglePause = async () => {
    const API_BASE_URL =
      import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";
    const endpoint = isPaused ? "/vendor/resume" : "/vendor/pause";

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.detail || data.message || "Unable to update order state",
        );

      const nextPaused = !isPaused;
      setIsPaused(nextPaused);
      localStorage.setItem("slotbite_vendor_paused", String(nextPaused));
      setSummary((prev) => (prev ? { ...prev, is_paused: nextPaused } : prev));
    } catch (err) {
      console.error("Failed to toggle pause state", err);
      alert(err.message || "Unable to change pause state");
    }
  };

  const metrics = {
    pending:
      summary?.pending_orders ??
      orders.filter((o) => o.status === "Pending").length,
    preparing: orders.filter((o) => o.status === "Preparing").length,
    ready:
      summary?.ready_orders ??
      orders.filter((o) => o.status === "Ready").length,
    revenue:
      summary?.revenue_today ?? orders.reduce((acc, o) => acc + o.total, 0),
  };

  const displayOrders = orders || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner Control Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kitchen Dashboard
          </h1>
          <p className="text-gray-500 text-sm">Real-time status management.</p>
          <p className="mt-2 text-sm font-semibold text-gray-600">
            Current order intake: {isPaused ? "Paused" : "Open"}
          </p>
        </div>
        <button
          onClick={togglePause}
          className={`px-6 py-3 font-semibold text-sm tracking-wide border-0 transition-all ${isPaused ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {isPaused ? "Resume Orders" : "Pause Orders"}
        </button>
      </div>

      {/* Grid Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-gray-200 p-4 bg-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Sales Inflow
          </p>
          <p className="text-2xl font-mono font-bold mt-2">
            ₦{(metrics.revenue ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="border border-gray-200 p-4 bg-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Awaiting Entry
          </p>
          <p className="text-2xl font-mono font-bold text-gray-500 mt-2">
            {metrics.pending}
          </p>
        </div>
        <div className="border border-gray-200 p-4 bg-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            On Grills
          </p>
          <p className="text-2xl font-mono font-bold text-orange-500 mt-2">
            {metrics.preparing}
          </p>
        </div>
        <div className="border border-gray-200 p-4 bg-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            At Pickup Bay
          </p>
          <p className="text-2xl font-mono font-bold text-emerald-500 mt-2">
            {metrics.ready}
          </p>
        </div>
      </div>

      {/* Main Order Pipeline Matrix */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg">Incoming Assembly Line</h3>

        {loading ? (
          <div className="p-6 border border-dashed border-gray-200 text-center text-gray-500">
            Loading vendor data...
          </div>
        ) : error ? (
          <div className="p-6 border border-red-200 bg-red-50 text-center text-red-700">
            {error}
          </div>
        ) : (
          <div className="space-y-2">
            {displayOrders.length === 0 ? (
              <div className="p-6 border border-dashed border-gray-200 text-center text-gray-500">
                No orders found for today.
              </div>
            ) : (
              displayOrders.map((order) => (
                <div
                  key={order.id}
                  className="border border-gray-200 p-4 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-sm">
                        {order.id}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 font-medium text-gray-600">
                        {order.slot}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">
                      {order.items
                        .map((i) => `${i.quantity}x ${i.name}`)
                        .join(", ")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto gap-6">
                    <span className="font-mono text-sm text-gray-500">
                      ₦{order.total.toFixed(2)}
                    </span>

                    {order.status !== "Ready" ? (
                      <button
                        onClick={() => updateStatus(order.id, order.status)}
                        className={`px-4 py-2 text-xs font-bold tracking-wide flex items-center gap-2 border border-gray-900 ${
                          order.status === "Pending"
                            ? "bg-white text-gray-900 hover:bg-orange-500 hover:text-white"
                            : "bg-orange-500 text-white hover:bg-emerald-500"
                        }`}>
                        {order.status === "Pending" && (
                          <>
                            <Loader2 size={12} className="animate-spin" /> Start
                            Preparing
                          </>
                        )}
                        {order.status === "Preparing" && (
                          <>
                            <Flame size={12} /> Mark as Ready
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-emerald-600 font-semibold text-xs flex items-center gap-1.5 px-3 py-2 bg-emerald-50">
                        <CheckCircle2 size={14} /> Ready for Handout
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
