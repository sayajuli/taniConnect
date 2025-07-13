// apps/web-frontend/app/services/api.ts

// Ambil Base URL dari environment variable, dengan fallback ke localhost.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Fungsi helper terpusat untuk menangani semua respons dari API.
 * Ia akan otomatis mem-parse JSON dan melempar error jika request gagal.
 */
const handleResponse = async (response: Response) => {
  // Handle kasus khusus untuk DELETE yang sering mengembalikan status 204 No Content
  if (response.status === 204) {
    return { success: true };
  }

  const data = await response.json();

  if (!response.ok) {
    // Gunakan pesan error dari backend jika ada, jika tidak, gunakan pesan default.
    throw new Error(data.message || 'Terjadi kesalahan pada server.');
  }

  return data;
};

// --- User & Auth ---
export const loginUser = async (credentials: any) => {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
};

export const registerUser = async (userData: any) => {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

export const getMyProfile = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
};

// --- Product ---
export const createProduct = async (productData: any, token: string) => {
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(productData),
  });
  return handleResponse(response);
};

export const getAllProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);
  return handleResponse(response);
};

export const getProductById = async (productId: string) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`);
  return handleResponse(response);
};

export const getMyFarmerProducts = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/products/my-products`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
};

export const updateProduct = async (productId: string, productData: any, token: string) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(productData),
  });
  return handleResponse(response);
};

export const deleteProduct = async (productId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
};

// --- Upload ---
export const uploadImage = async (file: File, token: string) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  return handleResponse(response);
};

// --- Cart ---
export const getCart = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
};

export const addItemToCart = async (productId: string, quantity: number, token: string) => {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ productId, quantity }),
  });
  return handleResponse(response);
};

export const updateItemQuantity = async (productId: string, quantity: number, token: string) => {
  const response = await fetch(`${API_BASE_URL}/cart/item/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ quantity }),
  });
  return handleResponse(response);
};

export const removeItemFromCart = async (productId: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/cart/item/${productId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return handleResponse(response);
};

// --- Shipping ---
export const getShippingRates = async (payload: any, token: string) => {
  const response = await fetch(`${API_BASE_URL}/shipping/rates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

// --- Order ---
export const createOrder = async (payload: any, token: string) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};
