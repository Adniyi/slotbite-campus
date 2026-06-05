// frontend/src/pages/StudentMenuPage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { studentAPI } from "../services/api";

export default function StudentMenuPage() {
  const { token } = useAuth();
  const [cafeterias, setCafeterias] = useState([]);
  const [selectedCafeteria, setSelectedCafeteria] = useState(null);
  const [menu, setMenu] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [clashResults, setClashResults] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch cafeterias
  useEffect(() => {
    const fetchCafeterias = async () => {
      try {
        const res = await studentAPI.getCafeterias();
        setCafeterias(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCafeterias();
  }, []);

  const handleCafeteriaSelect = async (caf) => {
    setSelectedCafeteria(caf);
    setSelectedItems([]);

    try {
      const menuRes = await studentAPI.getMenu(caf.id);
      setMenu(menuRes.data);

      const slotsRes = await studentAPI.getAvailableSlots(caf.id);
      setAvailableSlots(slotsRes.data);
      setClashResults({}); // Reset clash results
    } catch (err) {
      console.error(err);
    }
  };

  const checkClash = async (slotTimeStr) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/timetable/check-clash?slot_time=${encodeURIComponent(slotTimeStr)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setClashResults((prev) => ({ ...prev, [slotTimeStr]: data }));
    } catch (e) {
      console.error("Clash check failed", e);
    }
  };

  const addToOrder = (item) => {
    setSelectedItems((prev) => [...prev, { ...item, quantity: 1 }]);
  };

  const placeOrder = async () => {
    if (!selectedSlot || selectedItems.length === 0) return;

    const orderData = {
      cafeteria_id: selectedCafeteria.id,
      slot_time: selectedSlot,
      items: selectedItems.map((item) => ({
        menu_item_id: item.id,
        quantity: item.quantity,
      })),
    };

    try {
      await studentAPI.createOrder(orderData);
      alert("Order placed successfully! 🎉");
      // Reset form
      setSelectedItems([]);
      setSelectedSlot(null);
    } catch (err) {
      alert("Failed to place order");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Order Food • Smart Slots</h1>

      {/* Cafeteria Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {cafeterias.map((caf) => (
          <div
            key={caf.id}
            onClick={() => handleCafeteriaSelect(caf)}
            className={`p-6 border-2 rounded-2xl cursor-pointer transition-all ${
              selectedCafeteria?.id === caf.id
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-200 hover:border-gray-300"
            }`}>
            <h3 className="font-semibold text-lg">{caf.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{caf.location}</p>
          </div>
        ))}
      </div>

      {selectedCafeteria && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Menu */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Menu • {selectedCafeteria.name}
            </h2>
            <div className="space-y-3">
              {menu.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-white p-4 rounded-xl border">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">₦{item.price}</p>
                  </div>
                  <button
                    onClick={() => addToOrder(item)}
                    className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-emerald-600">
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Slot Selection + Cart */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Choose Pickup Slot</h2>

            <div className="grid grid-cols-3 gap-3">
              {availableSlots.map((slot, index) => {
                const slotStr = slot.slot_time;
                const clash = clashResults[slotStr];

                return (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedSlot(slotStr);
                      checkClash(slotStr);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedSlot === slotStr
                        ? "border-emerald-500 bg-emerald-50"
                        : clash?.status === "red"
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <p className="font-mono font-bold text-lg">
                      {new Date(slotStr).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p
                      className={`text-xs mt-1 ${clash?.status === "red" ? "text-red-600" : "text-emerald-600"}`}>
                      {clash ? clash.message : "Tap to check"}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Cart */}
            {selectedItems.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h3 className="font-semibold mb-3">Your Order</h3>
                <div className="space-y-2 mb-6">
                  {selectedItems.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>₦{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={placeOrder}
                  disabled={!selectedSlot}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold rounded-2xl transition">
                  Place Order for{" "}
                  {selectedSlot
                    ? new Date(selectedSlot).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
