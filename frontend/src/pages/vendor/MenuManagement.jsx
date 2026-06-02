import React, { useState } from "react";

const INITIAL_CATALOG = [
  {
    id: "m1",
    name: "Classic Avocado Toast",
    category: "Breakfast",
    available: true,
  },
  {
    id: "m2",
    name: "Crispy Chicken Tender Combo",
    category: "Lunch",
    available: true,
  },
  {
    id: "m3",
    name: "Spicy Vegan Chipotle Bowl",
    category: "Lunch",
    available: false,
  },
  {
    id: "m4",
    name: "Cold Brew Coffee XL",
    category: "Drinks",
    available: true,
  },
];

export default function MenuManagement() {
  const [catalog, setCatalog] = useState(INITIAL_CATALOG);

  const toggleAvailability = (id) => {
    setCatalog((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item,
      ),
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Inventory & Menu Toggle
        </h1>
        <p className="text-gray-500 text-sm">
          Instantly toggle items on or off the student app interface.
        </p>
      </div>

      <div className="border border-gray-200 divide-y divide-gray-100 bg-white">
        {catalog.map((item) => (
          <div key={item.id} className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-gray-400">
                {item.category}
              </span>
              <h4 className="font-semibold text-base text-gray-900">
                {item.name}
              </h4>
            </div>

            <button
              onClick={() => toggleAvailability(item.id)}
              className={`px-4 py-1.5 text-xs font-bold tracking-wider uppercase border ${
                item.available
                  ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                  : "bg-red-50 border-red-500 text-red-700"
              }`}>
              {item.available ? "Active (Instock)" : "Hidden (Sold Out)"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
