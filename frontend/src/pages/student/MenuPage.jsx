import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Clock, ShoppingBag, Plus, Minus, Check } from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

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

export default function MenuPage() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setOrders } = useAuth();

  const [menuItems, setMenuItems] = useState([]);
  const [slots, setSlots] = useState([]);
  const [cart, setCart] = useState({});
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState("");
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const token = localStorage.getItem("slotbite_token");

  useEffect(() => {
    // Only pre-select if no slot is currently selected to avoid overwriting manual changes
    if (!selectedSlot) {
      const preselectedFromState = location?.state?.slot;
      if (preselectedFromState) {
        setSelectedSlot(preselectedFromState);
      } else {
        const params = new URLSearchParams(location.search);
        const slotParam = params.get("slot");
        if (slotParam) setSelectedSlot(slotParam);
      }
    }

    const fetchMenu = async () => {
      setMenuLoading(true);
      setMenuError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/cafeterias/${vendorId}/menu`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Unable to load menu");
        }

        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        setMenuError(error.message || "Unable to load menu");
      } finally {
        setMenuLoading(false);
      }
    };

    if (vendorId) {
      fetchMenu();
    }
  }, [vendorId, token, location.state?.slot, location.search]); // Only react to the specific slot in state

  useEffect(() => {
    const fetchSlots = async () => {
      setSlotsLoading(true);
      setSlotsError("");

      // Determine target date: check selectedSlot (from state) first, then default to today
      const targetDate = selectedSlot
        ? selectedSlot.split("T")[0]
        : new Date().toISOString().split("T")[0];

      const dateQuery = targetDate ? `&date=${targetDate}` : "";

      try {
        const response = await fetch(
          `${API_BASE_URL}/cafeterias/slots/available?cafeteria_id=${vendorId}${dateQuery}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Unable to load time slots");
        }

        const data = await response.json();
        // console.log(data);

        setSlots(data);
      } catch (error) {
        setSlotsError(error.message || "Unable to load time slots");
      } finally {
        setSlotsLoading(false);
      }
    };

    if (vendorId) {
      fetchSlots();
    }
    // }, [vendorId, token]);
  }, [vendorId, token, selectedSlot?.split("T")[0]]);

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

  const isSlotSelected = (slotTime) => {
    if (!selectedSlot || !slotTime) return false;
    return new Date(selectedSlot).getTime() == new Date(slotTime).getTime();
  };

  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuItems.find((m) => String(m.id) === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const handleCheckout = () => {
    if (!selectedSlot || Object.keys(cart).length === 0) return;
    setPaymentError("");
    setShowPaymentDialog(true);
  };

  const processPayment = async () => {
    if (!selectedSlot || Object.keys(cart).length === 0) return;
    if (!confirmPassword) {
      setPaymentError("Please enter your password to confirm.");
      return;
    }

    setPaymentLoading(true);
    setPaymentError("");

    try {
      const orderPayload = {
        cafeteria_id: parseInt(vendorId),
        slot_time: selectedSlot,
        password: confirmPassword,
        items: Object.entries(cart).map(([id, qty]) => ({
          menu_item_id: parseInt(id),
          quantity: qty,
        })),
      };

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to place order");
      }

      const createdOrder = await response.json();
      setOrders((prev) => [createdOrder, ...prev]);
      setShowPaymentDialog(false);
      setConfirmPassword("");
      navigate("/student/orders");
    } catch (error) {
      setPaymentError(error.message || "Payment failed");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {/* Menu Area */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cafeteria Menu</h1>
          <p className="text-gray-500 text-sm">
            Select items below to populate your quick reservation basket.
          </p>
        </div>

        <div className="space-y-3">
          {menuLoading ? (
            <div className="border border-gray-100 p-6 bg-white text-gray-600">
              Loading menu...
            </div>
          ) : menuError ? (
            <div className="border border-red-200 p-6 bg-red-50 text-red-700">
              {menuError}
            </div>
          ) : menuItems.length === 0 ? (
            <div className="border border-gray-100 p-6 bg-white text-gray-600">
              No menu items available for this cafeteria.
            </div>
          ) : (
            menuItems.map((item) => (
              <div
                key={item.id}
                className="border border-gray-100 p-4 flex justify-between items-center bg-white">
                <div>
                  <span className="text-xs text-orange-600 font-semibold uppercase tracking-wider">
                    {item.description || "Menu item"}
                  </span>
                  <h4 className="font-semibold text-base text-gray-900 mt-0.5">
                    {item.name}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    ₦{item.price.toFixed(2)}
                  </p>
                </div>

                {cart[String(item.id)] ? (
                  <div className="flex items-center border border-gray-900">
                    <button
                      onClick={() => updateCart(item.id, -1)}
                      className="p-2 hover:bg-gray-50">
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-sm font-semibold">
                      {cart[String(item.id)]}
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
            ))
          )}
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
          {slots.some((slot) => slot.paused) && (
            <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              This cafeteria is temporarily paused and not accepting new orders.
            </div>
          )}
          <div className="grid grid-cols-1 gap-2">
            {slotsLoading ? (
              <div className="border border-gray-100 p-4 bg-white text-gray-600">
                Loading available slots...
              </div>
            ) : slotsError ? (
              <div className="border border-red-200 p-4 bg-red-50 text-red-700">
                {slotsError}
              </div>
            ) : slots.length === 0 ? (
              <div className="border border-gray-100 p-4 bg-white text-gray-600">
                No available slots for this cafeteria today.
              </div>
            ) : (
              slots.map((slot) => {
                const slotLabel =
                  slot.display_time ||
                  new Date(slot.slot_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                const available = slot.available ?? 0;
                const totalCapacity = slot.total_capacity ?? 0;
                const isDisabled = available <= 0;
                const active = isSlotSelected(slot.slot_time);

                return (
                  <button
                    key={slot.slot_time}
                    type="button"
                    onClick={() =>
                      !isDisabled && setSelectedSlot(slot.slot_time)
                    }
                    className={`w-full p-2.5 text-left text-sm flex items-center justify-between border ${active ? "bg-orange-500 border-orange-500 text-white font-medium" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"} ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}>
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>{slotLabel}</span>
                      </div>
                      <span className="text-[11px] text-gray-500">
                        {isDisabled
                          ? `0 of ${totalCapacity} slots available`
                          : `${available} of ${totalCapacity} slots available`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold">
                        {isDisabled ? "Full" : `${available} slots left`}
                      </span>
                      {active && !isDisabled && <Check size={14} />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal items</span>
            <span className="font-mono">₦{cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-gray-900">
            <span>Total Estimated</span>
            <span className="font-mono">₦{cartTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading || !selectedSlot || Object.keys(cart).length === 0}
          className="w-full py-3 bg-emerald-500 text-white font-medium text-sm tracking-wide hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center gap-2">
          {loading ? "Processing Order..." : "Confirm & Reserve Slot"}
        </button>
      </div>

      {showPaymentDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Payment Confirmation</h2>
                <p className="text-sm text-gray-500">
                  Simulate payment to complete your order.
                </p>
              </div>
              <button
                onClick={() => setShowPaymentDialog(false)}
                className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Selected slot</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {new Date(selectedSlot).toLocaleString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Order total</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  ₦{cartTotal.toFixed(2)}
                </p>
                <ul className="mt-2 space-y-1 border-t border-gray-200 pt-2 text-xs text-gray-600">
                  {Object.entries(cart).map(([id, qty]) => {
                    const item = menuItems.find((m) => String(m.id) === id);
                    return (
                      <li key={id} className="flex justify-between">
                        <span>
                          {item?.name || "Item"} x{qty}
                        </span>
                        <span>
                          ₦{((item?.price || 0) * qty || 0).toFixed(2)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Confirm Account Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter password to authorize"
                  className="w-full p-3 border border-gray-200 focus:outline-none focus:border-orange-500 text-sm"
                />
              </div>
              {paymentError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {paymentError}
                </div>
              )}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowPaymentDialog(false)}
                  className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  disabled={paymentLoading}
                  className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:bg-orange-300">
                  {paymentLoading ? "Processing..." : "Pay Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
