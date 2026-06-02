import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { QrCode, X } from "lucide-react";

export default function MyOrders() {
  const { orders } = useAuth();
  const [activeQr, setActiveQr] = useState(null);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Active & Past Orders
        </h1>
        <p className="text-gray-500 text-sm">
          Present the system-generated QR tokens at pickup bays.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-sm">
            No recent transactions or reservations found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 p-5 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-gray-900">
                    {order.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-none ${
                      order.status === "Ready"
                        ? "bg-emerald-100 text-emerald-800"
                        : order.status === "Preparing"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                    }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Slot: {order.slot}
                </p>
                <p className="text-xs text-gray-400">
                  {order.items
                    .map((i) => `${i.quantity}x ${i.name}`)
                    .join(", ")}
                </p>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-4 border-t sm:border-none pt-3 sm:pt-0">
                <span className="font-mono font-bold text-base">
                  ${order.total.toFixed(2)}
                </span>
                <button
                  onClick={() => setActiveQr(order.id)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-900 text-xs font-medium hover:bg-gray-900 hover:text-white">
                  <QrCode size={14} /> View Pass
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Micro QR Modal View Wrapper */}
      {activeQr && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-sm w-full p-6 relative border-2 border-gray-900">
            <button
              onClick={() => setActiveQr(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
              <X size={20} />
            </button>
            <div className="text-center space-y-4 mt-2">
              <h3 className="font-bold text-lg">Verification Pickup Token</h3>
              <p className="text-xs text-gray-500 font-mono">{activeQr}</p>

              {/* Fallback to simulated clean responsive CSS layout box representing a standard structural matrix barcode */}
              <div className="w-48 h-48 mx-auto bg-gray-100 border-4 border-gray-900 flex items-center justify-center p-2">
                <div className="w-full h-full border-2 border-dashed border-gray-400 flex flex-wrap p-1 gap-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 ${i % 3 === 0 || i % 7 === 0 ? "bg-black" : "bg-transparent"}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Present to clerk terminal to mark item execution loop.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
