import { guestCartKey } from './constants'

export function toCartNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (value === null || value === undefined) return 0

  const raw = String(value).trim()
  const direct = Number(raw)
  if (Number.isFinite(direct)) return direct

  const compact = raw.replace(/\s/g, '')
  const multiplier = /b(?:vnd)?$/i.test(compact) ? 1000000000 : /m(?:vnd)?$/i.test(compact) ? 1000000 : 1
  const normalized = compact
    .replace(/,/g, '')
    .replace(/[^0-9.]/g, '')
  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed * multiplier : 0
}

export function getCartItemPrice(item) {
  return toCartNumber(item.price ?? item.productPrice ?? item.numericPrice ?? item.product?.price ?? 0)
}

export function getCartItemImage(item) {
  return (
    item.image ||
    item.productImage ||
    item.images?.find((image) => image.isPrimary)?.url ||
    item.images?.[0]?.url ||
    item.product?.images?.find((image) => image.isPrimary)?.url ||
    item.product?.images?.[0]?.url ||
    ''
  )
}

export function getCartItemStock(item = {}) {
  const stock = item.stock ?? item.productStock ?? item.product?.stock
  const parsedStock = Number(stock)

  return Number.isFinite(parsedStock) ? parsedStock : null
}

export function normalizeCartItem(item = {}) {
  const product = item.product || {}
  const productId = item.productId || item.id || product.id || item.sku || item.name
  const fallbackName = item.sku || item.productId ? `Phu tung #${item.sku || item.productId}` : 'Phu tung AEROTEC'

  return {
    id: item.id || `${productId}-${item.selectedColor || item.color || 'color'}-${item.selectedSize || item.size || 'size'}`,
    productId,
    name: item.name || item.productName || product.name || fallbackName,
    sku: item.sku || item.productSku || product.sku || product.productSku || '',
    brand: item.brand || item.brandEntity?.name || product.brand || product.brandEntity?.name || 'AEROTEC',
    price: getCartItemPrice(item),
    image: getCartItemImage(item),
    quantity: Math.max(1, Number(item.quantity || 1)),
    stock: getCartItemStock(item),
    selectedColor: item.selectedColor || item.color || null,
    selectedSize: item.selectedSize || item.size || null,
  }
}

export function normalizeCartItems(items) {
  return Array.isArray(items) ? items.map(normalizeCartItem) : []
}

export function createCartItemFromProduct(product = {}, options = {}) {
  return normalizeCartItem({
    productId: product.productId || product.id || null,
    name: product.name || product.productName,
    sku: product.sku || product.productSku || '',
    brand: product.brand || product.brandEntity?.name || 'AEROTEC',
    price: product.numericPrice ?? product.price ?? product.productPrice ?? 0,
    image:
      product.image ||
      product.productImage ||
      product.images?.find((image) => image.isPrimary)?.url ||
      product.images?.[0]?.url ||
      '',
    quantity: Math.max(1, Number(options.quantity || product.quantity || 1)),
    stock: getCartItemStock(product),
    color: options.color || product.colorName || product.selectedColor || product.color || null,
    size: options.size || product.size || product.selectedSize || null,
  })
}

export function readGuestCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(guestCartKey) || '[]')
    return normalizeCartItems(parsed)
  } catch {
    return []
  }
}

export function writeGuestCart(items) {
  localStorage.setItem(guestCartKey, JSON.stringify(normalizeCartItems(items)))
}

export function clearGuestCart() {
  localStorage.removeItem(guestCartKey)
}

export function cartItemKey(item) {
  return `${item.productId}-${item.selectedColor || ''}-${item.selectedSize || ''}`
}

export function mergeCartItem(items, nextItem, options = {}) {
  const normalizedItems = normalizeCartItems(items)
  const normalizedNext = normalizeCartItem(nextItem)
  const existingIndex = normalizedItems.findIndex(
    (item) => item.id === normalizedNext.id || cartItemKey(item) === cartItemKey(normalizedNext),
  )

  if (existingIndex < 0) {
    return [...normalizedItems, normalizedNext]
  }

  return normalizedItems.map((item, index) => {
    if (index !== existingIndex) return item

    const stock = normalizedNext.stock ?? item.stock
    const requestedQuantity = options.incrementQuantity
      ? Number(item.quantity || 0) + Number(normalizedNext.quantity || 1)
      : normalizedNext.quantity
    const quantity = stock !== null && Number.isFinite(Number(stock))
      ? Math.min(requestedQuantity, Math.max(1, Number(stock)))
      : requestedQuantity

    return {
      ...item,
      ...normalizedNext,
      id: item.id || normalizedNext.id,
      stock,
      quantity,
    }
  })
}
