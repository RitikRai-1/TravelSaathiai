const RAW_API_BASE = import.meta.env.VITE_API_URL || '/api';
const API_BASE = RAW_API_BASE.endsWith('/') ? RAW_API_BASE.slice(0, -1) : RAW_API_BASE;

export function getToken(): string | null {
  return localStorage.getItem('travelsaathi_token');
}

export function setToken(token: string): void {
  localStorage.setItem('travelsaathi_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('travelsaathi_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: any) => request<{ success: boolean; token: string; user: any; message?: string }>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  signup: (userData: any) => request<{ success: boolean; token: string; user: any; message?: string }>('/auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request<{ success: boolean; user: any }>('/auth/me'),
  updateProfile: (profile: any) => request<{ success: boolean; message: string }>('/auth/profile', { method: 'PUT', body: JSON.stringify(profile) }),

  // CMS
  getHomepageCms: () => request<{ success: boolean; data: any }>('/cms/homepage'),
  getSettings: () => request<{ success: boolean; data: Record<string, string> }>('/cms/settings'),
  getFeatures: () => request<{ success: boolean; data: Record<string, boolean> }>('/cms/features'),

  // Tourism
  getStates: () => request<{ success: boolean; data: any[] }>('/states'),
  getCities: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<{ success: boolean; data: any[] }>(`/cities?${query}`);
  },
  getCityById: (id: string | number) => request<{ success: boolean; data: any }>(`/cities/${id}`),
  getPlaces: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<{ success: boolean; data: any[] }>(`/places?${query}`);
  },
  getPlaceById: (id: string | number) => request<{ success: boolean; data: any }>(`/places/${id}`),
  getHiddenGems: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<{ success: boolean; data: any[] }>(`/hidden-gems?${query}`);
  },
  search: (q: string) => request<{ success: boolean; data: any }>(`/search?q=${encodeURIComponent(q)}`),

  // Hotels
  getHotels: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<{ success: boolean; data: any[] }>(`/hotels?${query}`);
  },
  getHotelById: (id: string | number) => request<{ success: boolean; data: any }>(`/hotels/${id}`),

  // Restaurants
  getRestaurants: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<{ success: boolean; data: any[] }>(`/restaurants?${query}`);
  },
  getRestaurantById: (id: string | number) => request<{ success: boolean; data: any }>(`/restaurants/${id}`),

  // Taxis
  getTaxis: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<{ success: boolean; data: any[] }>(`/taxis?${query}`);
  },
  getTaxiNearMe: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<{ success: boolean; data: any[]; currentLocation: any; isEstimatedData: boolean }>(`/taxis/near-me?${query}`);
  },
  getTaxiById: (id: string | number) => request<{ success: boolean; data: any }>(`/taxis/${id}`),
  createBooking: (bookingData: any) => request<{ success: boolean; message: string; booking: any }>('/bookings/taxi', { method: 'POST', body: JSON.stringify(bookingData) }),
  getMyBookings: () => request<{ success: boolean; data: any[] }>('/bookings/my-bookings'),
  updateBookingStatus: (id: number, status: string) => request<{ success: boolean; message: string }>(`/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Trips
  generateTrip: (payload: any) => request<{ success: boolean; trip: any }>('/trips/generate', { method: 'POST', body: JSON.stringify(payload) }),
  optimizeTrip: (payload: any) => request<{ success: boolean; trip: any }>('/trips/optimize', { method: 'POST', body: JSON.stringify(payload) }),
  saveTrip: (trip: any) => request<{ success: boolean; message: string; tripId: number }>('/trips/save', { method: 'POST', body: JSON.stringify({ trip }) }),
  getUserTrips: () => request<{ success: boolean; data: any[] }>('/trips/my-trips'),
  getTripById: (id: string | number) => request<{ success: boolean; trip: any }>(`/trips/${id}`),
  deleteTrip: (id: number) => request<{ success: boolean; message: string }>(`/trips/${id}`, { method: 'DELETE' }),

  // Reviews & Favorites
  createReview: (review: any) => request<{ success: boolean; message: string; avgRating: number; reviewCount: number }>('/reviews', { method: 'POST', body: JSON.stringify(review) }),
  getReviews: (entityType: string, entityId: number) => request<{ success: boolean; data: any[] }>(`/reviews?entity_type=${entityType}&entity_id=${entityId}`),
  toggleFavorite: (entityType: string, entityId: number) => request<{ success: boolean; isFavorited: boolean; message: string }>('/favorites/toggle', { method: 'POST', body: JSON.stringify({ entity_type: entityType, entity_id: entityId }) }),
  getFavorites: () => request<{ success: boolean; data: any }>('/favorites'),

  // Notifications
  getNotifications: () => request<{ success: boolean; data: any[] }>('/notifications'),
  markNotificationRead: (id: number) => request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' }),

  // Business Owner
  registerBusiness: (data: any) => request<{ success: boolean; message: string; businessId: number }>('/business/register', { method: 'POST', body: JSON.stringify(data) }),
  getBusinessDashboard: () => request<{ success: boolean; data: any }>('/business/dashboard'),

  // Admin
  getAdminStats: () => request<{ success: boolean; stats: any; popularCities: any[]; recentActivity: any[] }>('/admin/stats'),
  getAdminCities: () => request<{ success: boolean; data: any[] }>('/admin/cities'),
  createAdminCity: (data: any) => request<{ success: boolean; message: string; id: number }>('/admin/cities', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminCity: (id: number, data: any) => request<{ success: boolean; message: string }>(`/admin/cities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminCity: (id: number) => request<{ success: boolean; message: string }>(`/admin/cities/${id}`, { method: 'DELETE' }),

  getAdminPlaces: () => request<{ success: boolean; data: any[] }>('/admin/places'),
  createAdminPlace: (data: any) => request<{ success: boolean; message: string; id: number }>('/admin/places', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminPlace: (id: number, data: any) => request<{ success: boolean; message: string }>(`/admin/places/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminPlace: (id: number) => request<{ success: boolean; message: string }>(`/admin/places/${id}`, { method: 'DELETE' }),

  getAdminHiddenGems: () => request<{ success: boolean; data: any[] }>('/admin/hidden-gems'),
  createAdminHiddenGem: (data: any) => request<{ success: boolean; message: string; id: number }>('/admin/hidden-gems', { method: 'POST', body: JSON.stringify(data) }),
  deleteAdminHiddenGem: (id: number) => request<{ success: boolean; message: string }>(`/admin/hidden-gems/${id}`, { method: 'DELETE' }),

  getAdminApprovals: () => request<{ success: boolean; data: any[] }>('/admin/business-approvals'),
  updateAdminBusinessStatus: (type: string, id: number, status: string) => request<{ success: boolean; message: string }>(`/admin/business-approvals/${type}/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),

  getAdminUsers: () => request<{ success: boolean; data: any[] }>('/admin/users'),
  updateAdminUser: (id: number, data: any) => request<{ success: boolean; message: string }>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  getAdminBookings: () => request<{ success: boolean; data: any[] }>('/admin/bookings'),
  getAdminReviews: () => request<{ success: boolean; data: any[] }>('/admin/reviews'),
  toggleAdminReviewModeration: (id: number, isModerated: boolean) => request<{ success: boolean; message: string }>(`/admin/reviews/${id}/moderation`, { method: 'PUT', body: JSON.stringify({ is_moderated: isModerated }) }),

  getAdminSettings: () => request<{ success: boolean; data: Record<string, string>; list: any[] }>('/admin/settings'),
  updateAdminSetting: (key: string, value: string) => request<{ success: boolean; message: string }>('/admin/settings', { method: 'POST', body: JSON.stringify({ key, value }) }),

  getAdminFeatures: () => request<{ success: boolean; data: any[] }>('/admin/features'),
  toggleAdminFeature: (key: string, isEnabled: boolean) => request<{ success: boolean; message: string }>(`/admin/features/${key}`, { method: 'PUT', body: JSON.stringify({ is_enabled: isEnabled }) }),

  getAdminLogs: () => request<{ success: boolean; data: any[] }>('/admin/activity-logs'),
  adminGlobalSearch: (q: string) => request<{ success: boolean; results: any }>(`/admin/search?q=${encodeURIComponent(q)}`),

  // Search & AI Assistant
  aiChat: (message: string, conversationHistory?: any[]) =>
    request<{ success: boolean; reply: string; suggestions?: string[] }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationHistory }),
    }),

  // Business Profile Updates
  updateBusinessProfile: (type: string, id: number | string, data: any) => request<{ success: boolean; message: string }>(`/business/${type}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};
