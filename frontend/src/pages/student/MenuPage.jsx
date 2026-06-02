import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Clock, ShoppingBag, Plus, Minus, Check } from "lucide-react";

const MOCK_MENU = [
  {
    id: "m1",
    name: "Classic Avocado Toast",
    price: 6.5,
    category: "Breakfast",
  },
  {
    id: "m2",
    name: "Crispy Chicken Tender Combo",
    price: 9.25,
    category: "Lunch",
  },
  {
    id: "m3",
    name: "Spicy Vegan Chipotle Bowl",
    price: 11.0,
    category: "Lunch",
  },
  { id: "m4", name: "Cold Brew Coffee XL", price: 4.0, category: "Drinks" },
];

const TIME_SLOTS = [
  "12:00 - 12:15",
  "12:15 - 12:30",
  "12:30 - 12:45",
  "12:45 - 13:00",
  "13:00 - 13:15",
];

export default function MenuPage() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { setOrders } = useAuth();

  const [cart, setCart] = useState({});
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);

  const updateCart = (id, change) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = current + change;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = MOCK_MENU.find((m) => m.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const handleCheckout = () => {
    if (!selectedSlot || Object.keys(cart).length === 0) return;
    setLoading(true);

    setTimeout(() => {
      const newOrder = {
        id: `OR-${Math.floor(1000 + Math.random() * 9000)}`,
        vendorId,
        slot: selectedSlot,
        items: Object.entries(cart).map(([id, qty]) => {
          const item = MOCK_MENU.find((m) => m.id === id);
          return { ...item, quantity: qty };
        }),
        total: cartTotal,
        status: "Pending",
        timestamp: "Just now",
      };

      setOrders((prev) => [newOrder, ...prev]);
      setLoading(false);
      navigate("/student/orders");
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {/* Menu Area */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Main Campus Dining Hall
          </h1>
          <p className="text-gray-500 text-sm">
            Select items below to populate your quick reservation basket.
          </p>
        </div>

        <div className="space-y-3">
          {MOCK_MENU.map((item) => (
            <div
              key={item.id}
              className="border border-gray-100 p-4 flex justify-between items-center bg-white">
              <div>
                <span className="text-xs text-orange-600 font-semibold uppercase tracking-wider">
                  {item.category}
                </span>
                <h4 className="font-semibold text-base text-gray-900 mt-0.5">
                  {item.name}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  ${item.price.toFixed(2)}
                </p>
              </div>

              {cart[item.id] ? (
                <div className="flex items-center border border-gray-900">
                  <button
                    onClick={() => updateCart(item.id, -1)}
                    className="p-2 hover:bg-gray-50">
                    <Minus size={14} />
                  </button>
                  <span className="px-3 text-sm font-semibold">
                    {cart[item.id]}
                  </span>
                  <button
                    onClick={() => updateCart(item.id, 1)}
                    className="p-2 hover:bg-gray-50">
                    <Plus size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => updateCart(item.id, 1)}
                  className="border border-gray-900 px-4 py-1.5 text-xs font-semibold hover:bg-gray-900 hover:text-white">
                  Add to Order
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cart, Time Picking & Booking Area */}
      <div className="bg-gray-50 border border-gray-200 p-6 h-fit space-y-6">
        <div>
          <h3 className="font-bold text-lg tracking-tight">
            Order Configuration
          </h3>
          <p className="text-xs text-gray-500">
            Pick an exact delivery/collection window.
          </p>
        </div>

        {/* Slot Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600">
            Available Windows Today
          </label>
          <div className="grid grid-cols-1 gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`w-full p-2.5 text-left text-sm flex items-center justify-between border ${selectedSlot === slot ? "bg-orange-500 border-orange-500 text-white font-medium" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"}`}>
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>{slot}</span>
                </div>
                {selectedSlot === slot && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal items</span>
            <span className="font-mono">${cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900">
            <span>Total Estimated</span>
            <span className="font-mono">${cartTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading || !selectedSlot || Object.keys(cart).length === 0}
          className="w-full py-3 bg-emerald-500 text-white font-medium text-sm tracking-wide hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center gap-2">
          {loading ? "Processing Order..." : "Confirm & Reserve Slot"}
        </button>
      </div>
    </div>
  );
}
