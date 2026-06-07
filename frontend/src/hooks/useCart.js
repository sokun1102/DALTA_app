import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../services/apiClient'
import { getAuthToken } from '../services/authToken'
import {
  cartItemKey,
  createCartItemFromProduct,
  getCartItemStock,
  mergeCartItem,
  normalizeCartItems,
  readGuestCart,
  writeGuestCart,
} from '../utils/cart'

function buildCartLog(type, message) {
  return { id: `${Date.now()}-${Math.random()}`, type, message }
}

async function resolveAccountProduct(product, resolver) {
  if (resolver) return resolver(product)
  if (product?.id) return product
  if (!product?.sku) return product

  try {
    const params = new URLSearchParams({ search: product.sku, limit: '4' })
    const result = await apiFetch(`/products?${params.toString()}`)
    const products = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : []
    const normalizedSku = String(product.sku).trim().toLowerCase()

    return (
      products.find((item) => String(item.sku || '').trim().toLowerCase() === normalizedSku) ||
      products.find((item) => item.name === product.name) ||
      products[0] ||
      product
    )
  } catch {
    return product
  }
}

export function useCart({ user, resolveProductForAccount } = {}) {
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [cartNotice, setCartNotice] = useState('')
  const [cartError, setCartError] = useState('')
  const [cartBusy, setCartBusy] = useState(false)
  const [cartLogs, setCartLogs] = useState([])

  const cartMode = getAuthToken() ? 'account' : 'guest'
  const normalizedCartItems = useMemo(() => normalizeCartItems(cartItems), [cartItems])
  const cartCount = useMemo(
    () => normalizedCartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [normalizedCartItems],
  )

  const pushCartLog = useCallback((type, message) => {
    const entry = buildCartLog(type, message)
    setCartLogs((current) => [entry, ...current].slice(0, 3))
    window.setTimeout(() => {
      setCartLogs((current) => current.filter((item) => item.id !== entry.id))
    }, 3200)
  }, [])

  const loadCart = useCallback(async () => {
    setCartError('')

    if (!getAuthToken()) {
      const guestItems = readGuestCart()
      setCartItems(guestItems)
      return guestItems
    }

    setCartBusy(true)
    try {
      const result = await apiFetch('/cart', { auth: true })
      const items = normalizeCartItems(result)
      setCartItems(items)
      return items
    } catch (error) {
      setCartError(error.message || 'Khong the tai gio hang tai khoan.')
      return []
    } finally {
      setCartBusy(false)
    }
  }, [])

  useEffect(() => {
    loadCart()
  }, [loadCart, user])

  const addToCart = useCallback(
    async (product, options = {}) => {
      setCartNotice('')
      setCartError('')

      const quantity = Math.max(1, Number(options.quantity || 1))
      const selectedColor = options.color || product?.colorName || product?.selectedColor || null
      const selectedSize = options.size || product?.size || product?.selectedSize || null

      if (getAuthToken()) {
        setCartBusy(true)
        const accountProduct = await resolveAccountProduct(product, resolveProductForAccount)

        if (!accountProduct?.id) {
          const message = 'Thieu ma san pham nen chua the them vao gio hang tai khoan.'
          setCartError(message)
          pushCartLog('error', message)
          setCartOpen(true)
          setCartBusy(false)
          return null
        }

        try {
          const addedItem = await apiFetch('/cart', {
            method: 'POST',
            auth: true,
            body: JSON.stringify({
              productId: Number(accountProduct.id),
              quantity,
              color: selectedColor || undefined,
              size: selectedSize || undefined,
            }),
          })
          const normalizedAdded = normalizeCartItems([addedItem])[0]
          setCartItems((current) => mergeCartItem(current, normalizedAdded))
          const message = `Da them ${normalizedAdded.name || accountProduct.name || product.name} vao gio hang tai khoan.`
          setCartNotice(message)
          pushCartLog('add', message)
          setCartOpen(true)
          return normalizedAdded
        } catch (error) {
          const message = error.message || 'Khong the them san pham vao gio hang tai khoan.'
          setCartError(message)
          pushCartLog('error', message)
          setCartOpen(true)
          return null
        } finally {
          setCartBusy(false)
        }
      }

      const item = createCartItemFromProduct(product, {
        quantity,
        color: selectedColor,
        size: selectedSize,
      })
      const guestItems = readGuestCart()
      const existingItem = guestItems.find((cartItem) => cartItemKey(cartItem) === cartItemKey(item))
      const stock = getCartItemStock(item)
      const requestedQuantity = Number(existingItem?.quantity || 0) + quantity

      if (stock !== null && requestedQuantity > stock) {
        const message = `${item.name} chỉ còn ${Math.max(0, stock)} sản phẩm trong kho.`
        setCartError(message)
        pushCartLog('error', message)
        setCartOpen(true)
        return null
      }

      const nextItems = mergeCartItem(guestItems, item, { incrementQuantity: true })
      writeGuestCart(nextItems)
      setCartItems(nextItems)
      const message = `Da them ${item.name} vao gio hang khach.`
      setCartNotice(message)
      pushCartLog('add', message)
      setCartOpen(true)
      return item
    },
    [pushCartLog, resolveProductForAccount],
  )

  const updateCartQuantity = useCallback(
    async (item, quantity) => {
      setCartNotice('')
      setCartError('')

      const nextQuantity = Math.max(1, Number(quantity || 1))
      const stock = getCartItemStock(item)
      if (stock !== null && nextQuantity > stock) {
        const message = `${item.name} chỉ còn ${Math.max(0, stock)} sản phẩm trong kho.`
        setCartError(message)
        pushCartLog('error', message)
        return
      }

      if (getAuthToken() && Number.isInteger(Number(item.id))) {
        setCartBusy(true)
        try {
          await apiFetch(`/cart/${item.id}`, {
            method: 'PUT',
            auth: true,
            body: JSON.stringify({ quantity: nextQuantity }),
          })
          await loadCart()
          pushCartLog('update', `Da cap nhat ${item.name} thanh ${nextQuantity} san pham.`)
        } catch (error) {
          const message = error.message || 'Khong the cap nhat so luong trong gio hang tai khoan.'
          setCartError(message)
          pushCartLog('error', message)
        } finally {
          setCartBusy(false)
        }
        return
      }

      const nextItems = readGuestCart().map((cartItem) =>
        cartItemKey(cartItem) === cartItemKey(item) ? { ...cartItem, quantity: nextQuantity } : cartItem,
      )
      writeGuestCart(nextItems)
      setCartItems(nextItems)
      pushCartLog('update', `Da cap nhat ${item.name} thanh ${nextQuantity} san pham.`)
    },
    [loadCart, pushCartLog],
  )

  const removeCartItem = useCallback(
    async (item) => {
      setCartNotice('')
      setCartError('')

      if (getAuthToken() && Number.isInteger(Number(item.id))) {
        setCartBusy(true)
        try {
          await apiFetch(`/cart/${item.id}`, { method: 'DELETE', auth: true })
          await loadCart()
          const message = `Da xoa ${item.name}.`
          setCartNotice(message)
          pushCartLog('remove', message)
        } catch (error) {
          const message = error.message || 'Khong the xoa san pham khoi gio hang tai khoan.'
          setCartError(message)
          pushCartLog('error', message)
        } finally {
          setCartBusy(false)
        }
        return
      }

      const nextItems = readGuestCart().filter((cartItem) => cartItemKey(cartItem) !== cartItemKey(item))
      writeGuestCart(nextItems)
      setCartItems(nextItems)
      const message = `Da xoa ${item.name}.`
      setCartNotice(message)
      pushCartLog('remove', message)
    },
    [loadCart, pushCartLog],
  )

  const clearCart = useCallback(async () => {
    setCartNotice('')
    setCartError('')

    if (getAuthToken()) {
      setCartBusy(true)
      try {
        await apiFetch('/cart', { method: 'DELETE', auth: true })
        setCartItems([])
        const message = 'Da xoa gio hang.'
        setCartNotice(message)
        pushCartLog('clear', message)
      } catch (error) {
        const message = error.message || 'Khong the xoa gio hang tai khoan.'
        setCartError(message)
        pushCartLog('error', message)
      } finally {
        setCartBusy(false)
      }
      return
    }

    writeGuestCart([])
    setCartItems([])
    const message = 'Da xoa gio hang.'
    setCartNotice(message)
    pushCartLog('clear', message)
  }, [pushCartLog])

  return {
    cartOpen,
    setCartOpen,
    cartItems: normalizedCartItems,
    cartMode,
    cartCount,
    cartNotice,
    cartError,
    cartBusy,
    cartLogs,
    addToCart,
    updateCartQuantity,
    removeCartItem,
    clearCart,
    loadCart,
  }
}
