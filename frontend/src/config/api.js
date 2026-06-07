export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3005'
export const PRODUCTS_API_URL = import.meta.env.VITE_PRODUCTS_API_URL || API_BASE_URL
export const CATEGORIES_API_URL = import.meta.env.VITE_CATEGORIES_API_URL || API_BASE_URL
export const ORDERS_API_URL = import.meta.env.VITE_ORDERS_API_URL || API_BASE_URL
export const CART_API_URL = import.meta.env.VITE_CART_API_URL || API_BASE_URL

export function serviceBaseUrl(path) {
  if (path.startsWith('/products') || path.startsWith('/brands')) {
    return PRODUCTS_API_URL
  }

  if (path.startsWith('/categories')) {
    return CATEGORIES_API_URL
  }

  if (path.startsWith('/cart')) {
    return CART_API_URL
  }

  if (path.startsWith('/orders')) {
    return ORDERS_API_URL
  }

  return API_BASE_URL
}
