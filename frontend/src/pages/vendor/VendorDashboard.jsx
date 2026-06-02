import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { AlertCircle, CheckCircle2, Flame, Loader2 } from "lucide-react";

const INITIAL_VENDOR_ORDERS = [
  {
    id: "OR-9481",
    slot: "12:00 - 12:15",
    items: [{ name: "Classic Avocado Toast", quantity: 2 }],
    total: 13.0,
    status: "Pending",
  },
  {
    id: "OR-1029",
    slot: "12:00 - 12:15",
    items: [{ name: "Cold Brew Coffee XL", quantity: 1 }],
    total: 4.0,
    status: "Preparing",
  },
  {
    id: "OR-4412",
    slot: "12:15 - 12:30",
    items: [{ name: "Spicy Vegan Chipotle Bowl", quantity: 1 }],
    total: 11.0,
    status: "Ready",
  },
];

export default function VendorDashboard() {
  const { orders, setOrders } = useAuth();
  const [isPaused, setIsPaused] = useState(false);

  // Initialize store mock contextual arrays
  React.useEffect(() => {
    if (orders.length === 0) setOrders(INITIAL_VENDOR_ORDERS);
  }, []);

  const updateStatus = (id, currentStatus) => {
    let nextStatus = "Pending";
    if (currentStatus === "Pending") nextStatus = "Preparing";
    else if (currentStatus === "Preparing") nextStatus = "Ready";
    else return;

    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: nextStatus } : o)),
    );
  };

  const metrics = {
    pending: orders.filter((o) => o.status === "Pending").length,
    preparing: orders.filter((o) => o.status === "Preparing").length,
    ready: orders.filter((o) => o.status === "Ready").length,
    revenue: orders.reduce((acc, o) => acc + o.total, 0),
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner Control Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Kitchen Dashboard
          </h1>
          <p className="text-gray-500 text-sm">
            Real-time status management pipeline.
          </p>
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className={`px-6 py-3 font-semibold text-sm tracking-wide border-0 transition-all ${isPaused ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          {isPaused
            ? "Resume Direct Pre-Orders"
            : "Pause Orders (Storefront Rush)"}
        </button>
      </div>

      {/* Grid Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-gray-200 p-4 bg-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Sales Inflow
          </p>
          <p className="text-2xl font-mono font-bold mt-2">
            ${metrics.revenue.toFixed(2)}
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

        <div className="space-y-2">
          {orders.map((order) => (
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
                  ${order.total.toFixed(2)}
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
          ))}
        </div>
      </div>
    </div>
  );
}
