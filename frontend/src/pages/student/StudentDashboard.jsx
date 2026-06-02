import React from "react";
import { useNavigate } from "react-router-dom";
import { Store, ArrowRight } from "lucide-react";

const MOCK_CAFETERIAS = [
  {
    id: "v-101",
    name: "Main Campus Dining Hall",
    status: "Open",
    window: "08:00 - 20:00",
    load: "Normal",
  },
  {
    id: "v-102",
    name: "Engineering Block Cafe",
    status: "Paused",
    window: "09:00 - 17:00",
    load: "High",
  },
  {
    id: "v-103",
    name: "Science Quad Bistro",
    status: "Open",
    window: "08:30 - 19:00",
    load: "Low",
  },
];

export default function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome to SlotBite
        </h1>
        <p className="text-gray-500 text-sm">
          Select an active campus kitchen to view open booking slots.
        </p>
      </div>

      <div className="grid gap-4">
        {MOCK_CAFETERIAS.map((cafe) => (
          <div
            key={cafe.id}
            className={`border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${cafe.status === "Paused" ? "bg-gray-50 opacity-60" : "bg-white"}`}>
            <div className="flex gap-4 items-start">
              <div
                className={`p-3 ${cafe.status === "Open" ? "bg-emerald-50 text-emerald-600" : "bg-gray-200 text-gray-500"}`}>
                <Store size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{cafe.name}</h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${cafe.status === "Open" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                    {cafe.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Operational Windows: {cafe.window} • Load: {cafe.load}
                </p>
              </div>
            </div>

            <button
              disabled={cafe.status === "Paused"}
              onClick={() => navigate(`/student/menu/${cafe.id}`)}
              className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-orange-500 disabled:bg-gray-200 disabled:text-gray-400">
              View Menu <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
