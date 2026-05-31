const API_BASE_URL = import.meta.env.DEV
  ? (
      import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_SOCKET_URL ||
      "http://localhost:4000"
    ).replace(/\/$/, "")
  : ""; // relative path in production so Vercel rewrites proxy it

// =====================================================
// CORE FETCH HELPER
// =====================================================

async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  const config = {
    credentials: "include",
    ...options,
  };

  // Don't set Content-Type for FormData — browser sets it with boundary
  if (!(options.body instanceof FormData)) {
    config.headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
  } else {
    config.headers = options.headers || {};
  }

  const res = await fetch(url, config);

  // Parse JSON response
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const err = new Error(data?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return { data, status: res.status };
}

// =====================================================
// HTTP METHOD SHORTCUTS
// =====================================================

const api = {
  get: (path, options = {}) =>
    apiFetch(path, { method: "GET", ...options }),

  post: (path, body, options = {}) =>
    apiFetch(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),

  put: (path, body, options = {}) =>
    apiFetch(path, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),

  delete: (path, options = {}) =>
    apiFetch(path, { method: "DELETE", ...options }),
};

export default api;

// ==========================================
// USER & AUTHENTICATION
// ==========================================
export const registerUser  = (data) => api.post("/user-api/register", data);
export const loginUser     = (data) => api.post("/user-api/login", data);
export const getAllUsers    = ()     => api.get("/user-api/user");
export const getSidebarUsers = ()   => api.get("/message-api/sidebar-users");

// ==========================================
// DIRECT MESSAGES
// ==========================================
export const getMessages = (id) => api.get(`/message-api/messages/${id}`);

export const sendMessage = (formData) =>
  api.post("/message-api/send", formData); // FormData — no JSON.stringify

// ==========================================
// CHANNELS
// ==========================================
export const getMyChannels      = ()   => api.get("/channel-api/my-channels");
export const createChannel      = (data) => api.post("/channel-api/create", data);
export const getChannelMessages = (id)  => api.get(`/message-api/channel-messages/${id}`);

// ==========================================
// MESSAGE FEATURES
// ==========================================
export const markMessagesAsSeenApi = (senderId) =>
  api.post("/message-feature-api/mark-seen", { senderId });

export const getThreadReplies = (parentMessageId) =>
  api.get(`/message-feature-api/thread-replies/${parentMessageId}`);

export const sendThreadReply = (parentMessageId, data) =>
  api.post(`/message-feature-api/thread-reply/${parentMessageId}`, data);

// ==========================================
// ANALYTICS
// ==========================================
export const getAnalyticsSummary = (userId) =>
  api.get(`/analytics/summary/${userId}`);

export const getAnalyticsStats = () =>
  api.get("/analytics/stats");
