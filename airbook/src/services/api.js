import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const parseResponse = (response) => {
  if (response.data && response.data.data) {
    return response.data.data;
  }
  throw new Error('Unexpected response format');
};

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'An error occurred';
  throw new Error(message);
};

export const register = async (data) => {
  try {
    const response = await api.post('/auth/register', data);
    return parseResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export const login = async (data) => {
  try {
    const response = await api.post('/auth/login', data);
    return parseResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export const getFlights = async (params) => {
  try {
    const response = await api.get('/flights', { params });
    return parseResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export const getFlightById = async (id) => {
  try {
    const response = await api.get(`/flights/${id}`);
    return parseResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export const getSeatsByFlightId = async (id) => {
  try {
    const response = await api.get(`/flights/${id}/seats`);
    return parseResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export const bookFlight = async (data) => {
  try {
    const response = await api.post('/bookings', data);
    return parseResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export const createOrder = async (bookingId) => {
  try {
    const response = await api.post(`/bookings/${bookingId}/create-order`, {});
    return parseResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export const verifyPayment = async (bookingId, paymentData) => {
  try {
    const response = await api.post(`/bookings/${bookingId}/verify-payment`, paymentData);
    return parseResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export const deleteBooking = async (bookingId) => {
  try {
    const response = await api.delete(`/bookings/${bookingId}`);
    return parseResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export const getBookings = async () => {
  try {
    const response = await api.get('/bookings');
    return parseResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export const getBookingDetails = async (id) => {
  try {
    const response = await api.get(`/bookings/${id}`);
    return parseResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    const response = await api.post(`/bookings/${bookingId}/cancel`);
    return parseResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return parseResponse(response);
  } catch (error) {
    handleError(error);
  }
};

//admin services

export const getAllFlights = async () => {
  try {
    const response = await api.get('/admin/flights');
    return parseResponse(response);
  } catch (error) {
    handleError(error);
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return parseResponse(response);
  } catch (error) {
    handleError(error);
  }
};
export const getAllRoutes = async () => {
  try {
    const response = await api.get('/admin/routes'); 
    return parseResponse(response);
  }
  catch (error) {
    handleError(error);
  }
};
export const getAllBookings = async () => {
  try {
    const response = await api.get('/admin/bookings');
    return parseResponse(response);
  } catch (error) {
    handleError(error);
  }
};
export const addFlight = async (data) => {
  try {
    const response = await api.post('/admin/flights', data);
    return parseResponse(response);
  } catch (error) {
    handleError(error);
  } 
};
