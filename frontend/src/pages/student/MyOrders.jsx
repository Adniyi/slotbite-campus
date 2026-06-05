import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

const formatSlotTime = (slotTime) => {
  if (!slotTime) return "";

  if (slotTime.endsWith("Z") || /[\+\-]\d{2}:\d{2}$/.test(slotTime)) {
    return new Date(slotTime).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const [datePart, timePart] = slotTime.split("T");
  if (!datePart || !timePart) return slotTime;

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const localDate = new Date(year, month - 1, day, hour, minute);

  return localDate.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeQr, setActiveQr] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");
  const token = localStorage.getItem("slotbite_token");
  const user = JSON.parse(localStorage.getItem("slotbite_user"));

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE_URL}/orders/my`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Unable to load orders");
        }

        const data = await response.json();
        // console.log(data);
        setOrders(data);
      } catch (err) {
        setError(err.message || "Unable to load orders");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    } else {
      setLoading(false);
      setError("You must be logged in to view orders");
    }
  }, [token]);

  const handleShowQr = async (orderId) => {
    setQrLoading(true);
    setQrError("");

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/qr`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Unable to load QR data");
      }

      const data = await response.json();
      const qrcodeValueString = JSON.stringify(data.qr_data);
      setActiveQr(qrcodeValueString);
    } catch (err) {
      setQrError(err.message || "Unable to load QR data");
    } finally {
      setQrLoading(false);
    }
  };

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

      {loading ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-sm">Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 border-2 border-red-200 bg-red-50 rounded">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      ) : orders.length === 0 ? (
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
                      order.status === "ready"
                        ? "bg-emerald-100 text-emerald-800"
                        : order.status === "preparing"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                    }`}>
                    {order.status.toUpperCase()}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-gray-20">
                    {order.cafeteria_name}
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Slot: {order.display_time || formatSlotTime(order.slot_time)}
                </p>
                <p className="text-xs text-gray-400">
                  {order.items
                    .map((i) => `${i.quantity}x ${i.menu_item_name || "Item"}`)
                    .join(", ")}
                </p>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto gap-4 border-t sm:border-none pt-3 sm:pt-0">
                <span className="font-mono font-bold text-base">
                  ₦{order.total_amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleShowQr(order.id)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-900 text-xs font-medium hover:bg-gray-900 hover:text-white">
                  <QRCodeSVG
                    size={14}
                    value={activeQr}
                    level="M"
                    marginSize={false}
                  />{" "}
                  View Pass
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
              {qrLoading ? (
                <p className="text-sm text-gray-500">Loading QR data...</p>
              ) : qrError ? (
                <p className="text-sm text-red-600">{qrError}</p>
              ) : (
                <p className="text-xs text-gray-500 font-mono break-words">
                  {/* {activeQr} */}
                </p>
              )}

              <div className="w-48 h-48 mx-auto bg-gray-100 border-4 border-gray-900 flex items-center justify-center p-2">
                <div className="w-full h-full border-2 border-dashed border-gray-400 flex flex-wrap p-1 gap-1">
                  <QRCodeSVG
                    size={160}
                    value={activeQr}
                    level="M"
                    marginSize={false}
                  />
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
