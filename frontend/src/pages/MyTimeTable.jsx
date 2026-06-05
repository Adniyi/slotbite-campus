import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { studentAPI } from "../services/api";
import { Plus, Clock, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MyTimetable() {
  const { token } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newClass, setNewClass] = useState({
    course_code: "",
    course_name: "",
    start_time: "",
    end_time: "",
    day: "Monday",
  });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const res = await studentAPI.getMyTimetable();
      setSchedules(Array.isArray(res) ? res : (res?.data ?? []));
    } catch (err) {
      console.error("Failed to fetch timetable", err);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async () => {
    setRecLoading(true);
    try {
      const res = await studentAPI.recommendSlots();
      setRecommendations(Array.isArray(res) ? res : (res?.data ?? []));
    } catch (err) {
      console.error("Failed to fetch recommendations", err);
      setRecommendations([]);
      alert("Unable to fetch recommendations");
    } finally {
      setRecLoading(false);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();

    try {
      await studentAPI.addClassSchedule(newClass);
      setShowForm(false);
      setNewClass({
        course_code: "",
        course_name: "",
        start_time: "",
        end_time: "",
        day: "Monday",
      });
      fetchTimetable(); // Refresh list
      alert("Class added to timetable successfully!");
    } catch (err) {
      alert("Failed to add class");
    }
  };

  const deleteClass = async (id) => {
    // if (!confirm("Delete this class?")) return;
    try {
      await studentAPI.deleteClassSchedule(id);
      // Refresh the list after successful deletion
      fetchTimetable();
      //   alert("Class removed from timetable");
    } catch (err) {
      console.error("Failed to delete class", err);
      alert("Failed to delete class");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Timetable</h1>
          <p className="text-gray-500">
            Smart slot suggestions are based on this schedule
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => getRecommendations()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl hover:bg-emerald-700 transition">
            {recLoading ? "Searching..." : "Get Recommendations"}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border px-4 py-2 rounded-xl hover:bg-gray-50 transition">
            <Plus size={18} />
            Add Class
          </button>
        </div>
      </div>

      {/* Add New Class Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 p-6 rounded-2xl mb-8">
          <h3 className="font-semibold mb-4">Add New Class</h3>
          <form
            onSubmit={handleAddClass}
            className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Course Code (e.g. CSC 101)"
              value={newClass.course_code}
              onChange={(e) =>
                setNewClass({ ...newClass, course_code: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-4 py-3"
              required
            />
            <input
              type="text"
              placeholder="Course Name"
              value={newClass.course_name}
              onChange={(e) =>
                setNewClass({ ...newClass, course_name: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-4 py-3"
              required
            />

            <select
              value={newClass.day}
              onChange={(e) =>
                setNewClass({ ...newClass, day: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-4 py-3">
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={newClass.start_time}
                  onChange={(e) =>
                    setNewClass({ ...newClass, start_time: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg px-4 py-3 w-full"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={newClass.end_time}
                  onChange={(e) =>
                    setNewClass({ ...newClass, end_time: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg px-4 py-3 w-full"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="md:col-span-2 bg-emerald-600 text-white py-3.5 rounded-xl font-medium hover:bg-emerald-700 transition">
              Add to Timetable
            </button>
          </form>
        </div>
      )}

      {/* Timetable List */}
      {loading ? (
        <p>Loading timetable...</p>
      ) : schedules.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300 rounded-2xl">
          <Clock className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">No classes added yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Add your classes to get smart slot suggestions
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((cls) => (
            <div
              key={cls.id}
              className="bg-white border border-gray-200 p-5 rounded-2xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-mono font-bold text-sm">
                  {cls.day.slice(0, 3)}
                </div>
                <div>
                  <p className="font-semibold text-lg">{cls.course_code}</p>
                  <p className="text-gray-600">{cls.course_name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {cls.start_time} — {cls.end_time}
                  </p>
                </div>
              </div>

              <button
                onClick={() => deleteClass(cls.id)}
                className="w-full sm:w-auto text-red-400 hover:text-red-600 transition text-left sm:text-right">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations Panel */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recommended Slots</h2>
        {recLoading ? (
          <p>Looking for best slots...</p>
        ) : recommendations.length === 0 ? (
          <p className="text-sm text-gray-500">No recommendations yet</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {recommendations.map((r, idx) => (
              <div
                key={idx}
                className="p-4 border rounded-2xl bg-white flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm text-gray-500">
                    {r.cafeteria_name}
                  </div>
                  <div className="font-semibold">
                    {r.display_time} • {r.status.toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {r.message} • {r.available} slots left
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() =>
                      navigate(`/student/menu/${r.cafeteria_id}`, {
                        state: { slot: r.slot_time },
                      })
                    }
                    className="w-full sm:w-auto px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm">
                    Open Menu
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
