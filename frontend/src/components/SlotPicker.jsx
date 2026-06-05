// SlotPicker.jsx
import { useState, useEffect } from "react";
import { studentAPI } from "../services/api";

export default function SlotPicker({ cafeteriaId, onSlotSelect }) {
  const [slots, setSlots] = useState([]);
  const [clashResults, setClashResults] = useState({});

  const checkClash = async (slotTime) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/timetable/check-clash?slot_time=${slotTime.toISOString()}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      setClashResults((prev) => ({ ...prev, [slotTime.toISOString()]: data }));
    } catch (e) {}
  };

  return (
    <div>
      <h3 className="font-semibold mb-3">Available Slots</h3>
      <div className="grid grid-cols-3 gap-3">
        {slots.map((slot, i) => {
          const result = clashResults[slot.slot_time];
          const color = result?.status === "red" ? "red" : "green";

          return (
            <button
              key={i}
              onClick={() => onSlotSelect(slot.slot_time)}
              className={`p-4 border-2 rounded-xl text-left transition-all ${
                color === "red"
                  ? "border-red-300 bg-red-50"
                  : "border-emerald-300 bg-emerald-50"
              }`}>
              <p className="font-mono font-bold">
                {new Date(slot.slot_time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p
                className={`text-xs mt-1 ${color === "red" ? "text-red-600" : "text-emerald-600"}`}>
                {result?.message || "Checking..."}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
