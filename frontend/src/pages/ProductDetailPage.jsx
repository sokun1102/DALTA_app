import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Rating from '@mui/material/Rating'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import MenuIcon from '@mui/icons-material/Menu'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PersonIcon from '@mui/icons-material/Person'

// Components
import CartDrawer from '../components/CartDrawer'
import Header from '../components/Header'
import Footer from '../components/Footer'

// Utils & Helpers
import { formatMoney, mapProductToCar } from '../utils/helpers'
import {
  createCartItemFromProduct,
  getCartItemStock,
  readGuestCart,
  writeGuestCart,
  cartItemKey,
  mergeCartItem,
} from '../utils/cart'

// Services
import { apiFetch } from '../services/apiClient'
import { getAuthToken } from '../services/authToken'

// CAD Blueprint Renderer based on product type
function renderCADBlueprint(type) {
  const normalizedType = String(type).toLowerCase();
  if (normalizedType.includes('braking') || normalizedType.includes('brake')) {
    return (
      <svg width="180" height="180" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="42" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 2" />
        <circle cx="50" cy="50" r="38" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="24" stroke="#38bdf8" strokeWidth="0.8" />
        <circle cx="50" cy="50" r="14" stroke="#38bdf8" strokeWidth="1.2" />
        <circle cx="50" cy="50" r="6" stroke="#f43f5e" strokeWidth="1.5" />
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
          <line key={deg} x1="50" y1="50" x2={50 + 38 * Math.cos(deg * Math.PI / 180)} y2={50 + 38 * Math.sin(deg * Math.PI / 180)} stroke="rgba(56,189,248,0.3)" strokeWidth="0.8" transform={`rotate(${deg} 50 50)`} />
        ))}
        {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map(deg => (
          <g key={deg} transform={`rotate(${deg} 50 50)`}>
            <circle cx="80" cy="50" r="1" fill="#38bdf8" />
            <circle cx="72" cy="50" r="1" fill="#38bdf8" />
            <circle cx="64" cy="50" r="1" fill="#38bdf8" />
          </g>
        ))}
        <path d="M 78,20 A 42,42 0 0,1 92,50 L 80,48 A 30,30 0 0,0 70,24 Z" fill="rgba(244,63,94,0.15)" stroke="#f43f5e" strokeWidth="1.2" />
        <line x1="8" y1="50" x2="92" y2="50" stroke="#f97316" strokeWidth="0.5" strokeDasharray="5 5" />
        <line x1="50" y1="8" x2="50" y2="92" stroke="#f97316" strokeWidth="0.5" strokeDasharray="5 5" />
      </svg>
    );
  }
  if (normalizedType.includes('aerodynamics') || normalizedType.includes('aero')) {
    return (
      <svg width="180" height="180" viewBox="0 0 100 100" fill="none">
        <path d="M 10,48 C 24,28 72,24 90,44 C 84,46 44,52 10,48 Z" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" strokeWidth="1.8" />
        <path d="M 10,48 C 30,36 70,36 90,44" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 2" />
        <rect x="5" y="24" width="10" height="48" rx="2" stroke="#a855f7" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="10" cy="36" r="2" stroke="#a855f7" strokeWidth="1" />
        <circle cx="10" cy="60" r="2" stroke="#a855f7" strokeWidth="1" />
        {[15, 30, 45, 60, 75].map(y => (
          <path key={y} d={`M 2,${y} C 25,${y - 12} 65,${y + 8} 98,${y + 4}`} stroke="rgba(34,197,94,0.4)" strokeWidth="0.8" />
        ))}
        <line x1="60" y1="34" x2="60" y2="12" stroke="#f97316" strokeWidth="1" />
        <polygon points="60,10 57,15 63,15" fill="#f97316" />
        <text x="64" y="16" fill="#f97316" style={{ fontFamily: 'JetBrains Mono', fontSize: '6px' }}>LIFT (DF)</text>
      </svg>
    );
  }
  if (normalizedType.includes('powertrain') || normalizedType.includes('engine') || normalizedType.includes('exhaust')) {
    return (
      <svg width="180" height="180" viewBox="0 0 100 100" fill="none">
        <path d="M 10,20 C 35,20 40,40 60,40 C 72,40 80,30 90,30" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
        <path d="M 10,40 C 35,40 40,50 60,50 C 72,50 80,40 90,40" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
        <path d="M 10,60 C 35,60 40,60 60,60 C 72,60 80,50 90,50" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
        <rect x="6" y="12" width="4" height="56" rx="1" fill="#f43f5e" stroke="#f43f5e" strokeWidth="0.8" />
        <rect x="86" y="24" width="4" height="32" rx="1" fill="#f43f5e" stroke="#f43f5e" strokeWidth="0.8" />
        <line x1="30" y1="18" x2="30" y2="62" stroke="#f97316" strokeWidth="0.5" strokeDasharray="3 3" />
        <line x1="60" y1="36" x2="60" y2="64" stroke="#f97316" strokeWidth="0.5" strokeDasharray="3 3" />
      </svg>
    );
  }
  if (normalizedType.includes('suspension') || normalizedType.includes('damper') || normalizedType.includes('coil')) {
    return (
      <svg width="180" height="180" viewBox="0 0 100 100" fill="none">
        <rect x="42" y="24" width="16" height="52" rx="1" stroke="#38bdf8" strokeWidth="1.5" />
        <rect x="47" y="6" width="6" height="18" stroke="#38bdf8" strokeWidth="1.2" />
        <path d="M 38,20 L 62,24 L 38,30 L 62,34 L 38,40 L 62,44 L 38,50 L 62,54 L 38,60 L 62,64 L 38,70 L 62,74" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="38" y="18" width="24" height="4" rx="0.5" fill="#f97316" stroke="#f97316" strokeWidth="0.5" />
        <rect x="38" y="74" width="24" height="4" rx="0.5" fill="#f97316" stroke="#f97316" strokeWidth="0.5" />
        <circle cx="50" cy="4" r="3.5" stroke="#38bdf8" strokeWidth="1.5" />
        <circle cx="50" cy="80" r="4.5" stroke="#38bdf8" strokeWidth="1.5" />
      </svg>
    );
  }
  // Default/General
  return (
    <svg width="180" height="180" viewBox="0 0 100 100" fill="none">
      <rect x="15" y="15" width="70" height="70" rx="4" stroke="#38bdf8" strokeWidth="1.2" />
      <circle cx="50" cy="50" r="28" stroke="#f43f5e" strokeWidth="1.2" strokeDasharray="4 2" />
      <line x1="50" y1="5" x2="50" y2="95" stroke="#f97316" strokeWidth="0.5" strokeDasharray="3 3" />
      <line x1="5" y1="50" x2="95" y2="50" stroke="#f97316" strokeWidth="0.5" strokeDasharray="3 3" />
      <path d="M 30,30 L 70,70 M 30,70 L 70,30" stroke="rgba(56,189,248,0.4)" strokeWidth="0.8" />
    </svg>
  );
}

function getReviewErrorMessage(message = '') {
  const normalizedMessage = String(message || '').toLowerCase()

  if (normalizedMessage.includes('orders service')) {
    return 'Không kiểm tra được lịch sử mua hàng. Vui lòng đảm bảo Orders service đang chạy rồi thử lại.'
  }

  if (normalizedMessage.includes('delivered') || normalizedMessage.includes('đã giao')) {
    return 'Chỉ có thể đánh giá sản phẩm trong đơn hàng đã giao thành công.'
  }

  return message || 'Không thể gửi đánh giá.'
}

export default function ProductDetailPage({ user, selectedProduct, onNavigate, onOpenLogin, onOpenRegister, onOpenProfile, onLogout, onGoCheckout }) {
  const [product, setProduct] = useState(selectedProduct || {})
  const [loading, setLoading] = useState(false)
  const [activeThumb, setActiveThumb] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [frequentlyBought, setFrequentlyBought] = useState([])
  const [relatedLoading, setRelatedLoading] = useState(false)

  // Cart States
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [cartNotice, setCartNotice] = useState('')
  const [cartError, setCartError] = useState('')
  const [cartBusy, setCartBusy] = useState(false)
  const [cartLogs, setCartLogs] = useState([])
  const cartMode = getAuthToken() ? 'account' : 'guest'
  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewNotice, setReviewNotice] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [wishlistIds, setWishlistIds] = useState([])
  const [wishlistBusy, setWishlistBusy] = useState(false)

  // Fetch full details if product only has an ID or to keep fresh
  useEffect(() => {
    if (!product?.id) return
    let isMounted = true

    setLoading(true)
    const loadProductDetails = async () => {
      try {
        const data = await apiFetch(`/products/${product.id}`)
        if (data && isMounted) {
          setProduct(mapProductToCar(data))
        }
      } catch (error) {
        if (!product?.sku) {
          console.error('Error loading product details:', error)
          return
        }

        try {
          const params = new URLSearchParams({ search: product.sku, limit: '4' })
          const result = await apiFetch(`/products?${params.toString()}`)
          const products = Array.isArray(result?.data) ? result.data : []
          const matchedProduct = products.find((item) => item.sku === product.sku) || products[0]
          if (matchedProduct && isMounted) {
            setProduct(mapProductToCar(matchedProduct))
          }
        } catch (fallbackError) {
          console.error('Error resolving product by SKU:', fallbackError)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadProductDetails()

    return () => {
      isMounted = false
    }
  }, [product?.id])

  useEffect(() => {
    if (!product?.id) return
    let isMounted = true

    setRelatedLoading(true)
    Promise.allSettled([
      apiFetch(`/products/${product.id}/related?limit=4`),
      apiFetch(`/products/${product.id}/frequently-bought-together?limit=4`),
    ])
      .then(([relatedResult, boughtTogetherResult]) => {
        if (!isMounted) return
        setRelatedProducts(
          relatedResult.status === 'fulfilled' && Array.isArray(relatedResult.value)
            ? relatedResult.value.map(mapProductToCar)
            : [],
        )
        setFrequentlyBought(
          boughtTogetherResult.status === 'fulfilled' && Array.isArray(boughtTogetherResult.value)
            ? boughtTogetherResult.value.map(mapProductToCar)
            : [],
        )
      })
      .finally(() => {
        if (isMounted) setRelatedLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [product?.id])

  useEffect(() => {
    if (!product?.id) return
    let isMounted = true

    setReviewsLoading(true)
    apiFetch(`/products/${product.id}/reviews`)
      .then((data) => {
        if (isMounted) setReviews(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (isMounted) setReviews([])
      })
      .finally(() => {
        if (isMounted) setReviewsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [product?.id])

  useEffect(() => {
    if (!getAuthToken()) {
      setWishlistIds([])
      return
    }

    apiFetch('/wishlist', { auth: true })
      .then((data) => {
        setWishlistIds(Array.isArray(data) ? data.map((item) => Number(item.id)) : [])
      })
      .catch(() => setWishlistIds([]))
  }, [user, product?.id])

  // Cart operations (identical to HomePage for full drawer operations)
  const loadCart = async () => {
    setCartError('')
    if (!getAuthToken()) {
      const guestItems = readGuestCart()
      setCartItems(guestItems)
      return guestItems
    }
    setCartBusy(true)
    try {
      const result = await apiFetch('/cart', { auth: true })
      const items = Array.isArray(result) ? result : []
      setCartItems(items)
      return items
    } catch (error) {
      setCartError(error.message || 'Không thể tải giỏ hàng tài khoản.')
      return []
    } finally {
      setCartBusy(false)
    }
  }

  useEffect(() => {
    loadCart()
  }, [user])

  const pushCartLog = (type, message) => {
    const entry = { id: Date.now(), type, message }
    setCartLogs((current) => [entry, ...current].slice(0, 3))
    window.setTimeout(() => {
      setCartLogs((current) => current.filter((item) => item.id !== entry.id))
    }, 3200)
  }

  const toggleWishlist = async () => {
    if (!product?.id) return
    if (!getAuthToken()) {
      onOpenLogin()
      return
    }

    const productId = Number(product.id)
    const isWishlisted = wishlistIds.includes(productId)
    setWishlistBusy(true)
    try {
      if (isWishlisted) {
        await apiFetch(`/wishlist/${productId}`, { method: 'DELETE', auth: true })
        setWishlistIds((current) => current.filter((id) => id !== productId))
        pushCartLog('info', 'Đã xóa khỏi danh sách yêu thích.')
      } else {
        await apiFetch(`/wishlist/${productId}`, { method: 'POST', auth: true })
        setWishlistIds((current) => [...new Set([...current, productId])])
        pushCartLog('success', 'Đã thêm vào danh sách yêu thích.')
      }
    } catch (error) {
      pushCartLog('error', error.message || 'Không thể cập nhật danh sách yêu thích.')
    } finally {
      setWishlistBusy(false)
    }
  }

  const submitReview = async () => {
    if (!product?.id) return
    if (!getAuthToken()) {
      onOpenLogin()
      return
    }

    setReviewNotice('')
    setReviewError('')
    try {
      const review = await apiFetch(`/products/${product.id}/reviews`, {
        method: 'POST',
        auth: true,
        body: JSON.stringify({
          rating: Number(reviewRating || 5),
          comment: reviewComment.trim() || undefined,
        }),
      })
      setReviews((current) => [review, ...current])
      setReviewComment('')
      setReviewRating(5)
      setReviewNotice('Cảm ơn bạn đã gửi đánh giá.')
    } catch (error) {
      setReviewError(getReviewErrorMessage(error.message))
    }
  }

  const addToCart = async (targetProduct = product) => {
    const productForCart = targetProduct?.currentTarget ? product : targetProduct
    setCartNotice('')
    setCartError('')
    const isAccountCart = Boolean(getAuthToken())
    const availableStock = getCartItemStock(productForCart)

    if (availableStock !== null && availableStock <= 0) {
      setCartError('Sản phẩm hiện đã hết hàng.')
      setCartOpen(true)
      return
    }

    if (isAccountCart) {
      if (!productForCart.id) {
        setCartError('Thiếu mã sản phẩm nên chưa thể thêm vào giỏ hàng tài khoản.')
        setCartOpen(true)
        return
      }

      setCartBusy(true)
      try {
        const addedItem = await apiFetch('/cart', {
          method: 'POST',
          auth: true,
          body: JSON.stringify({
            productId: Number(productForCart.id),
            quantity: 1,
            color: productForCart.colorName || undefined,
            size: productForCart.size || undefined,
          }),
        })
        setCartItems((current) => mergeCartItem(current, addedItem))
        const message = `Đã thêm ${productForCart.name} vào giỏ hàng tài khoản.`
        setCartNotice(message)
        pushCartLog('add', message)
        setCartOpen(true)
      } catch (error) {
        setCartError(error.message || 'Không thể thêm sản phẩm vào giỏ hàng.')
        setCartOpen(true)
      } finally {
        setCartBusy(false)
      }
    } else {
      const guestItems = readGuestCart()
      const item = createCartItemFromProduct(productForCart)
      const existingItem = guestItems.find((cartItem) => cartItemKey(cartItem) === cartItemKey(item))
      const requestedQuantity = Number(existingItem?.quantity || 0) + Number(item.quantity || 1)
      const stock = getCartItemStock(item)

      if (stock !== null && requestedQuantity > stock) {
        setCartError(`${item.name} chỉ còn ${Math.max(0, stock)} sản phẩm trong kho.`)
        setCartOpen(true)
        return
      }

      const nextItems = mergeCartItem(guestItems, item, { incrementQuantity: true })
      writeGuestCart(nextItems)
      setCartItems(nextItems)
      const message = `Đã thêm ${productForCart.name} vào giỏ hàng khách.`
      setCartNotice(message)
      pushCartLog('add', message)
      setCartOpen(true)
    }
  }

  const updateCartQuantity = async (item, quantity) => {
    const nextQuantity = Math.max(1, Number(quantity || 1))
    const stock = getCartItemStock(item)

    if (stock !== null && nextQuantity > stock) {
      setCartError(`${item.name} chỉ còn ${Math.max(0, stock)} sản phẩm trong kho.`)
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
        pushCartLog('update', `Đã cập nhật số lượng ${item.name}.`)
      } catch {
        setCartError('Không thể cập nhật số lượng.')
      } finally {
        setCartBusy(false)
      }
    } else {
      const nextItems = readGuestCart().map((cartItem) =>
        cartItemKey(cartItem) === cartItemKey(item) ? { ...cartItem, quantity: nextQuantity } : cartItem,
      )
      writeGuestCart(nextItems)
      setCartItems(nextItems)
      pushCartLog('update', `Đã cập nhật số lượng ${item.name}.`)
    }
  }

  const removeCartItem = async (item) => {
    if (getAuthToken() && Number.isInteger(Number(item.id))) {
      setCartBusy(true)
      try {
        await apiFetch(`/cart/${item.id}`, { method: 'DELETE', auth: true })
        await loadCart()
        pushCartLog('remove', `Đã xóa ${item.name}.`)
      } catch {
        setCartError('Không thể xóa sản phẩm.')
      } finally {
        setCartBusy(false)
      }
    } else {
      const nextItems = readGuestCart().filter((cartItem) => cartItemKey(cartItem) !== cartItemKey(item))
      writeGuestCart(nextItems)
      setCartItems(nextItems)
      pushCartLog('remove', `Đã xóa ${item.name}.`)
    }
  }

  const clearCart = async () => {
    if (getAuthToken()) {
      setCartBusy(true)
      try {
        await apiFetch('/cart', { method: 'DELETE', auth: true })
        await loadCart()
        pushCartLog('clear', 'Đã xóa giỏ hàng.')
      } catch {
        setCartError('Không thể xóa giỏ hàng.')
      } finally {
        setCartBusy(false)
      }
    } else {
      writeGuestCart([])
      setCartItems([])
      pushCartLog('clear', 'Đã xóa giỏ hàng.')
    }
  }

  const handleGoCheckout = () => {
    setCartOpen(false)
    onGoCheckout()
  }

  const openRelatedProduct = (car) => {
    setProduct(car)
    setActiveThumb(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Fallbacks for direct detail page access before product data is selected.
  const productName = product.name || 'Phụ tùng hiệu năng AEROTEC'
  const productPrice = product.price ? (typeof product.price === 'number' ? formatMoney(product.price) : product.price) : 'Liên hệ'
  const productSku = product.sku || 'AT-PART'
  const productImage = product.image || '/images/cars/nova-x.png'
  const productStock = getCartItemStock(product)
  const hasStock = productStock === null || productStock > 0
  const stockLabel = productStock === null
    ? 'Đang cập nhật tồn kho'
    : hasStock
      ? `Còn ${productStock} sản phẩm`
      : 'Tạm hết hàng'
  const stockColor = productStock === null ? '#38bdf8' : hasStock ? (productStock <= 3 ? '#f97316' : '#22c55e') : '#fb7185'

  const powerStat = product.power || product.gain || 'Nâng cấp hiệu năng'
  const fitmentStat = product.zero || product.drivetrain || 'Fitment theo dòng xe'
  const materialStat = product.material || 'Vật liệu motorsport'

  const thumbnails = [
    productImage,
    '/images/cars/AT-VORT-DIFF-07.png',
    '/images/cars/AT-MAG-SUSP-04.png'
  ]

  return (
    <Box className="car-site">
      <Header
        user={user}
        activeTab="parts"
        onNavigate={onNavigate}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        cartCount={cartCount}
        onCartClick={() => onNavigate('cart')}
      />

      {/* MAIN DETAIL CONTAINER */}
      <Container maxWidth="xl" className="product-detail-container">
        <Box sx={{ mb: 4, mt: 2 }}>
          <Button 
            onClick={() => onNavigate('parts')} 
            sx={{ 
              color: 'rgba(248, 250, 252, 0.6)', 
              fontFamily: 'JetBrains Mono', 
              fontSize: '11px', 
              fontWeight: 'bold', 
              letterSpacing: '1px',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              padding: '6px 16px',
              border: '1px solid rgba(248, 250, 252, 0.08)',
              borderRadius: '6px',
              '&:hover': {
                color: '#fb7185',
                borderColor: 'rgba(244, 63, 94, 0.3)',
                background: 'rgba(244, 63, 94, 0.02)'
              }
            }}
          >
            &larr; QUAY LẠI DANH MỤC PHỤ TÙNG
          </Button>
        </Box>
        {loading ? (
          <Typography sx={{ color: '#fff', textAlign: 'center', my: 10 }}>Đang tải thông số kỹ thuật phụ tùng...</Typography>
        ) : (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1.1fr 0.9fr', xs: '1fr' }, gap: 6 }}>
              {/* LEFT: IMAGE & GALLERY */}
              <Box>
                <Box className="glow-card-premium" sx={{ p: 4, display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(244,63,94,0.15) !important' }}>
                  <img
                    src={thumbnails[activeThumb]}
                    alt={productName}
                    style={{ width: '100%', maxHeight: '380px', objectFit: 'contain', filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.6))' }}
                  />
                </Box>
                {/* Thumbnails */}
                <div className="thumb-strip">
                  {thumbnails.map((thumb, idx) => (
                    <img
                      key={idx}
                      className={`thumb-img ${idx === activeThumb ? 'active' : ''}`}
                      src={thumb}
                      alt={`Ảnh phụ tùng ${idx + 1}`}
                      onClick={() => setActiveThumb(idx)}
                    />
                  ))}
                  <Box
                    className="thumb-img"
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,250,252,0.05)', color: '#fff', border: '1px solid rgba(248,250,252,0.1)' }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </Box>
                </div>
              </Box>

              {/* RIGHT: SPECS & BUY PANEL */}
              <Box>
                <Chip label={`${product.type || 'Phụ tùng hiệu năng'} // Hàng chính hãng`} sx={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e', fontWeight: 900, border: '1px solid rgba(244,63,94,0.3)', mb: 2 }} />
                <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', fontSize: { md: '42px', xs: '32px' }, mb: 0.5 }}>
                  {productName}
                </Typography>
                <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '13px', fontWeight: 900, letterSpacing: '1px', mb: 3 }}>
                  SKU: {productSku}
                </Typography>

                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                  <Typography sx={{ color: '#fff', fontSize: '32px', fontWeight: 950 }}>
                    {productPrice}
                  </Typography>
                  <Chip label={stockLabel} sx={{ background: `${stockColor}24`, color: stockColor, fontWeight: 900, border: `1px solid ${stockColor}66` }} />
                </Box>

                {/* Specs Table */}
                <table className="spec-table-premium">
                  <tbody>
                    <tr>
                      <td className="label">HIỆU NĂNG / GAIN</td>
                      <td className="value">{powerStat}</td>
                    </tr>
                    <tr>
                      <td className="label">FITMENT</td>
                      <td className="value">{fitmentStat}</td>
                    </tr>
                    <tr>
                      <td className="label">VẬT LIỆU</td>
                      <td className="value">{materialStat}</td>
                    </tr>
                    <tr>
                      <td className="label">BẢO HÀNH</td>
                      <td className="value">{product.fuel || 'Có bảo hành'}</td>
                    </tr>
                  </tbody>
                </table>

                {/* ADD TO CART ACTION */}
                <Button
                  className="gradient-btn-rose-orange"
                  sx={{ width: '100%', py: 2, borderRadius: '99px', fontWeight: 950, fontSize: '16px', letterSpacing: '1.5px', textTransform: 'uppercase', mt: 4 }}
                  onClick={() => addToCart(product)}
                  disabled={!hasStock || cartBusy}
                  startIcon={<ShoppingCartIcon />}
                >
                  {hasStock ? 'THÊM VÀO GIỎ HÀNG' : 'TẠM HẾT HÀNG'}
                </Button>
                <Button
                  sx={{ width: '100%', py: 1.4, borderRadius: '99px', fontWeight: 900, mt: 1.5, color: '#f8fafc', border: '1px solid rgba(248,250,252,0.16)', textTransform: 'none' }}
                  onClick={toggleWishlist}
                  disabled={wishlistBusy}
                  startIcon={wishlistIds.includes(Number(product.id)) ? <FavoriteIcon sx={{ color: '#fb7185' }} /> : <FavoriteBorderIcon />}
                >
                  {wishlistIds.includes(Number(product.id)) ? 'Đã lưu vào yêu thích' : 'Thêm vào yêu thích'}
                </Button>
                <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px', textAlign: 'center', mt: 2, fontWeight: 800, letterSpacing: '0.5px' }}>
                  HỖ TRỢ GIAO HÀNG HỎA TỐC CHO ĐƠN PHỤ TÙNG
                </Typography>
              </Box>
            </Box>

            {/* ENGINEERING HIGHLIGHTS */}
            <section style={{ padding: '80px 0 40px', borderTop: '1px solid rgba(248,250,252,0.06)', marginTop: '80px' }}>
              <Typography variant="h4" sx={{ fontWeight: 950, color: '#fff', mb: 4 }}>
                ĐIỂM NHẤN KỸ THUẬT
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1.2fr 0.8fr', xs: '1fr' }, gap: 4, alignItems: 'center' }}>
                <Typography sx={{ color: 'rgba(248,250,252,0.6)', fontSize: '15px', lineHeight: 1.7 }}>
                  {product.description || 'Mỗi phụ tùng được kiểm tra vật liệu, fitment và hiệu năng trước khi giao. Các thuật ngữ như carbon, titanium, ECU, downforce hoặc Track Spec được giữ nguyên để đúng ngôn ngữ kỹ thuật.'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box className="glow-card-premium" sx={{ p: 3, flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ mb: 1 }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </Box>
                    <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '14px' }}>Kiểm tra nhiệt</Typography>
                  </Box>
                  <Box className="glow-card-premium" sx={{ p: 3, flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ mb: 1 }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    </Box>
                    <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '14px' }}>Track ready</Typography>
                  </Box>
                </Box>
              </Box>
            </section>

            {/* VEHICLE COMPATIBILITY */}
            <section style={{ padding: '60px 0', borderTop: '1px solid rgba(248,250,252,0.06)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 950, color: '#fff' }}>
                    TƯƠNG THÍCH DÒNG XE
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton sx={{ border: '1px solid rgba(248,250,252,0.1)', color: '#fff' }}>&larr;</IconButton>
                  <IconButton sx={{ border: '1px solid rgba(248,250,252,0.1)', color: '#fff' }}>&rarr;</IconButton>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { md: 'repeat(3, 1fr)', sm: 'repeat(2, 1fr)', xs: '1fr' }, gap: 3 }}>
                <Box className="compat-card">
                  <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '16px' }}>AEROTEC MANTIS GT</Typography>
                  <Typography sx={{ color: '#f43f5e', fontSize: '11px', fontWeight: 900, mt: 1 }}>TƯƠNG THÍCH TRỰC TIẾP - KIẾN TRÚC GEN 2</Typography>
                </Box>
                <Box className="compat-card">
                  <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '16px' }}>LUNA-RAY R-SPEC</Typography>
                  <Typography sx={{ color: '#f97316', fontSize: '11px', fontWeight: 900, mt: 1 }}>YÊU CẦU BỘ CHUYỂN ĐỔI - PHIÊN BẢN 4.0</Typography>
                </Box>
                <Box className="compat-card">
                  <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '16px' }}>VOLT-STREAK XP</Typography>
                  <Typography sx={{ color: '#38bdf8', fontSize: '11px', fontWeight: 900, mt: 1 }}>HỖ TRỢ GỐC - PHIÊN BẢN 2026</Typography>
                </Box>
              </Box>
            </section>

            {/* TECHNICAL SCHEMATICS & MATERIAL STRESS DECK */}
            <section style={{ padding: '60px 0 20px', borderTop: '1px solid rgba(248,250,252,0.06)' }}>
              <Typography variant="h4" sx={{ fontWeight: 950, color: '#fff', mb: 1, fontFamily: 'Be Vietnam Pro' }}>
                SƠ ĐỒ KỸ THUẬT & BIỂU ĐỒ BIẾN DẠNG VẬT LIỆU
              </Typography>
              <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px', fontFamily: 'JetBrains Mono', letterSpacing: '1px', textTransform: 'uppercase', mb: 4 }}>
                XÁC MINH MÔ PHỎNG XƯỞNG CHẾ TẠO // REF: {productSku}-METRICS
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' }, gap: 6 }}>
                {/* LEFT: SVG CAD LAYOUT WIREFRAME */}
                <Box className="glow-card-premium" sx={{ p: 4, background: 'rgba(5,5,5,0.7)', border: '1px solid rgba(244,63,94,0.15) !important', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#fb7185', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid rgba(248,250,252,0.08)', pb: 1 }}>
                    BẢN VẼ CƠ KHÍ 2D CAD // MẶT CẮT B-B
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.5)', border: '1px dashed rgba(248,250,252,0.15)', borderRadius: '8px', height: '320px', position: 'relative', overflow: 'hidden' }}>
                    {/* CAD Grid Backdrop */}
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(248,250,252,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(248,250,252,0.03) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(244,63,94,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(244,63,94,0.05) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
                    
                    {/* CAD Blueprint Drawing Render */}
                    <Box sx={{ zIndex: 2 }}>
                      {renderCADBlueprint(product.type || '')}
                    </Box>
                    
                    {/* Technical Crosshairs and Annotations */}
                    <div style={{ position: 'absolute', top: '10px', left: '10px', fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'rgba(248, 250, 252, 0.3)', lineHeight: 1.4 }}>
                      TỶ LỆ: 1:1.5<br />
                      GÓC CHIẾU: THỨ BA<br />
                      ĐƠN VỊ: MM
                    </div>
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'rgba(248, 250, 252, 0.3)', textAlign: 'right', lineHeight: 1.4 }}>
                      REF: {productSku}<br />
                      CÔNG NGHỆ SỐ ATELIER
                    </div>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button className="outline-button" sx={{ px: 3, borderRadius: '6px', fontSize: '12px', fontWeight: 900 }}>
                      TẢI FILE CAD (STEP) ↓
                    </Button>
                    <Button className="ghost-button" sx={{ border: '1px dashed rgba(248,250,252,0.2)', px: 3, borderRadius: '6px', fontSize: '12px', fontWeight: 900, color: '#fff' }}>
                      XEM 3D TƯƠNG TÁC ↗
                    </Button>
                  </Box>
                </Box>

                {/* RIGHT: ENGINEERING STRESS BARS */}
                <Box className="glow-card-premium" sx={{ p: 4, background: 'rgba(5,5,5,0.7)', border: '1px solid rgba(244,63,94,0.15) !important', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#fb7185', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid rgba(248,250,252,0.08)', pb: 1 }}>
                    CHỈ SỐ KHÁNG LỰC CỦA VẬT LIỆU
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                    {/* Thermal resistance */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ color: '#fff', fontSize: '13px', fontWeight: 900, fontFamily: 'Plus Jakarta Sans' }}>
                          NGƯỠNG CHỊU NHIỆT ĐỘ CỰC HẠN
                        </Typography>
                        <Typography sx={{ color: '#fb7185', fontSize: '13px', fontWeight: 900, fontFamily: 'JetBrains Mono' }}>
                          {product.type === 'Braking' ? '950°C' : product.type === 'Powertrain' ? '1100°C' : '650°C'} / ĐẠT
                        </Typography>
                      </Box>
                      <Box sx={{ height: '8px', background: 'rgba(248,250,252,0.06)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(248,250,252,0.1)' }}>
                        <div style={{ height: '100%', width: product.type === 'Braking' ? '90%' : product.type === 'Powertrain' ? '95%' : '65%', background: 'linear-gradient(90deg, #f43f5e, #f97316)', borderRadius: '4px' }} />
                      </Box>
                      <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '10px', mt: 0.8, fontFamily: 'JetBrains Mono' }}>
                        Nhiệt độ hoạt động cực đại trước khi giảm đặc tính cơ học. Được cân chuẩn bằng phòng thử nhiệt laser.
                      </Typography>
                    </Box>

                    {/* Fatigue Lifespan */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ color: '#fff', fontSize: '13px', fontWeight: 900, fontFamily: 'Plus Jakarta Sans' }}>
                          CHU KỲ TUỔI THỌ MỎI VẬT LIỆU
                        </Typography>
                        <Typography sx={{ color: '#fb7185', fontSize: '13px', fontWeight: 900, fontFamily: 'JetBrains Mono' }}>
                          {product.type === 'Aerodynamics' ? '2.5M CHU KỲ' : '1.2M CHU KỲ'} / TỐI ƯU
                        </Typography>
                      </Box>
                      <Box sx={{ height: '8px', background: 'rgba(248,250,252,0.06)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(248,250,252,0.1)' }}>
                        <div style={{ height: '100%', width: product.type === 'Aerodynamics' ? '88%' : '78%', background: 'linear-gradient(90deg, #fb7185, #38bdf8)', borderRadius: '4px' }} />
                      </Box>
                      <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '10px', mt: 0.8, fontFamily: 'JetBrains Mono' }}>
                        Số chu kỳ chịu tải dao động trước khi xuất hiện rạn nứt cấu trúc. Giới hạn cấu trúc: ISO-R48.
                      </Typography>
                    </Box>

                    {/* Elastic Modulus */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography sx={{ color: '#fff', fontSize: '13px', fontWeight: 900, fontFamily: 'Plus Jakarta Sans' }}>
                          MÔ-ĐUN ĐÀN HỒI YOUNG (ĐỘ CỨNG KÉO)
                        </Typography>
                        <Typography sx={{ color: '#fb7185', fontSize: '13px', fontWeight: 900, fontFamily: 'JetBrains Mono' }}>
                          {product.type === 'Aerodynamics' ? '720 GPa' : '410 GPa'} / TỚI HẠN
                        </Typography>
                      </Box>
                      <Box sx={{ height: '8px', background: 'rgba(248,250,252,0.06)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(248,250,252,0.1)' }}>
                        <div style={{ height: '100%', width: product.type === 'Aerodynamics' ? '92%' : '70%', background: 'linear-gradient(90deg, #38bdf8, #a855f7)', borderRadius: '4px' }} />
                      </Box>
                      <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '10px', mt: 0.8, fontFamily: 'JetBrains Mono' }}>
                        Tỷ lệ giữa ứng suất và biến dạng thể hiện độ cứng. Titan tiêu chuẩn: 115 GPa, Carbon: 240+ GPa.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </section>

            <section style={{ padding: '64px 0 48px', borderTop: '1px solid rgba(248,250,252,0.06)' }}>
              <Box className="related-heading">
                <Typography component="h3">Đánh giá sản phẩm</Typography>
                <Typography>{reviewsLoading ? 'Đang tải...' : `${reviews.length} nhận xét`}</Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.1fr' }, gap: 3 }}>
                <Box className="glow-card-premium" sx={{ p: 3, background: 'rgba(5,5,5,0.7)', border: '1px solid rgba(248,250,252,0.08) !important' }}>
                  <Typography sx={{ fontWeight: 900, color: '#fff', mb: 1 }}>Viết đánh giá</Typography>
                  <Rating value={reviewRating} onChange={(_, value) => setReviewRating(value || 5)} sx={{ mb: 2, color: '#fb7185' }} />
                  <TextField
                    multiline
                    minRows={4}
                    fullWidth
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    placeholder="Chia sẻ trải nghiệm lắp đặt, hiệu năng hoặc độ hoàn thiện..."
                    sx={{
                      textarea: { color: '#f8fafc' },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        background: 'rgba(0,0,0,0.32)',
                        '& fieldset': { borderColor: 'rgba(248,250,252,0.12)' },
                        '&:hover fieldset': { borderColor: 'rgba(248,250,252,0.28)' },
                        '&.Mui-focused fieldset': { borderColor: '#fb7185' },
                      },
                    }}
                  />
                  {reviewNotice && <Typography sx={{ color: '#22c55e', fontSize: 13, mt: 1.5, fontWeight: 800 }}>{reviewNotice}</Typography>}
                  {reviewError && <Typography sx={{ color: '#fb7185', fontSize: 13, mt: 1.5, fontWeight: 800 }}>{reviewError}</Typography>}
                  <Button className="pulse-button small" sx={{ mt: 2 }} onClick={submitReview}>
                    Gửi đánh giá
                  </Button>
                </Box>
                <Box sx={{ display: 'grid', gap: 1.5 }}>
                  {reviews.length === 0 ? (
                    <Typography className="inventory-note">Chưa có nhận xét cho sản phẩm này.</Typography>
                  ) : (
                    reviews.map((review) => (
                      <Box key={review.id} sx={{ p: 2, border: '1px solid rgba(248,250,252,0.08)', borderRadius: 1, background: 'rgba(248,250,252,0.03)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                          <Typography sx={{ color: '#fff', fontWeight: 900 }}>{review.userEmail || 'Khách hàng AEROTEC'}</Typography>
                          <Rating readOnly size="small" value={Number(review.rating || 0)} sx={{ color: '#fb7185' }} />
                        </Box>
                        <Typography sx={{ color: 'rgba(248,250,252,0.62)', fontSize: 14, lineHeight: 1.6 }}>
                          {review.comment || 'Khách hàng đã đánh giá sản phẩm này.'}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
            </section>

            <section style={{ padding: '64px 0 20px', borderTop: '1px solid rgba(248,250,252,0.06)' }}>
              <Box className="related-heading">
                <Typography component="h3">Sản phẩm liên quan</Typography>
                <Typography>{relatedLoading ? 'Đang tải gợi ý...' : `${relatedProducts.length} sản phẩm`}</Typography>
              </Box>
              {relatedProducts.length > 0 ? (
                <Box className="related-grid">
                  {relatedProducts.map((car) => (
                    <button className="related-card" type="button" key={car.id || car.sku || car.name} onClick={() => openRelatedProduct(car)}>
                      {car.image ? <img src={car.image} alt={car.name} /> : <span>{car.type}</span>}
                      <span>{car.brand || car.type}</span>
                      <strong>{car.name}</strong>
                      <em>{car.price}</em>
                    </button>
                  ))}
                </Box>
              ) : (
                <Typography className="inventory-note">Chưa có sản phẩm liên quan.</Typography>
              )}
            </section>

            <section style={{ padding: '48px 0 80px' }}>
              <Box className="related-heading">
                <Typography component="h3">Thường mua cùng</Typography>
                <Typography>{relatedLoading ? 'Đang tải...' : `${frequentlyBought.length} gợi ý`}</Typography>
              </Box>
              {frequentlyBought.length > 0 ? (
                <Box className="related-grid">
                  {frequentlyBought.map((car) => (
                    <button className="related-card" type="button" key={car.id || car.sku || car.name} onClick={() => openRelatedProduct(car)}>
                      {car.image ? <img src={car.image} alt={car.name} /> : <span>{car.type}</span>}
                      <span>{car.type}</span>
                      <strong>{car.name}</strong>
                      <em>{car.price}</em>
                    </button>
                  ))}
                </Box>
              ) : (
                <Typography className="inventory-note">Chưa có combo thường mua cùng cho sản phẩm này.</Typography>
              )}
            </section>
          </>
        )}
      </Container>

      <Footer onNavigate={onNavigate} />

      {/* CART DRAWER */}
      <CartDrawer
        open={cartOpen}
        items={cartItems}
        mode={cartMode}
        notice={cartNotice}
        error={cartError}
        busy={cartBusy}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeCartItem}
        onClearCart={clearCart}
        onGoCheckout={handleGoCheckout}
      />

      {/* CART LOG STACK */}
      {cartLogs.length > 0 && (
        <Box className="cart-log-stack" aria-live="polite">
          {cartLogs.map((log) => (
            <Box className={`cart-log ${log.type}`} key={log.id}>
              <span>{log.type}</span>
              <strong>{log.message}</strong>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
