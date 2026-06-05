const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

function getAuthHeaders(token = null) {
  const headers = { "Content-Type": "application/json" };
  const authToken = token || localStorage.getItem("slotbite_token");
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
}

async function getJson(path, params = null, token = null) {
  let url = `${API_BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        qs.append(key, value);
      }
    });
    const queryString = qs.toString();
    if (queryString) url += `?${queryString}`;
  }
  const res = await fetch(url, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw res;
  return res.json();
}

async function postJson(path, body = null, params = null, token = null) {
  let url = `${API_BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        qs.append(key, value);
      }
    });
    const queryString = qs.toString();
    if (queryString) url += `?${queryString}`;
  }
  const res = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw res;
  return res.json();
}

async function deleteJson(path, token = null) {
  let url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) throw res;
  // If response is empty (204), don't try to parse JSON
  return res.status !== 204 ? res.json() : { success: true };
}

export const studentAPI = {
  getCafeterias: (token = null) => getJson("/cafeterias", null, token),
  getMenu: (cafeteriaId, token = null) =>
    getJson(`/cafeterias/${cafeteriaId}/menu`, null, token),
  getAvailableSlots: (cafeteriaId, date = null, token = null) =>
    getJson(
      "/cafeterias/slots/available",
      { cafeteria_id: cafeteriaId, date },
      token,
    ),
  createOrder: (orderData, token = null) =>
    postJson("/orders", orderData, null, token),

  // === New Timetable APIs ===
  getMyTimetable: (token = null) => getJson("/timetable/my", null, token),
  addClassSchedule: (scheduleData, token = null) =>
    postJson("/timetable/add-class", scheduleData, null, token),

  checkSlotClash: (slotTime, token = null) =>
    postJson("/timetable/check-clash", null, { slot_time: slotTime }, token),
  recommendSlots: (cafeteriaId = null, date = null, token = null) =>
    getJson("/timetable/recommend", { cafeteria_id: cafeteriaId, date }, token),
  deleteClassSchedule: (classId, token = null) =>
    deleteJson(`/timetable/${classId}`, token),
};
