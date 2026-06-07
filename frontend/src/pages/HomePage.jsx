import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Badge from '@mui/material/Badge'
import MenuIcon from '@mui/icons-material/Menu'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PersonIcon from '@mui/icons-material/Person'
import SearchIcon from '@mui/icons-material/Search'

// Components
import CartDrawer from '../components/CartDrawer'
import Header from '../components/Header'
import Footer from '../components/Footer'

// Utils & Helpers
import { featuredCars, inventorySorts } from '../utils/constants'
import { mapProductToCar } from '../utils/helpers'
import {
  createCartItemFromProduct,
  readGuestCart,
  writeGuestCart,
  cartItemKey,
  mergeCartItem,
} from '../utils/cart'

// Services
import { apiFetch } from '../services/apiClient'
import { getAuthToken } from '../services/authToken'

// Assets
import cleanShowroomBg from '../assets/clean_showroom_bg.png'

const translateCategoryName = (name) => {
  const mapping = {
    'All Components': 'Tất cả linh kiện',
    Aerodynamics: 'Khí động học',
    'Engine & Exhaust': 'Động cơ & ống xả',
    'Braking System': 'Hệ thống phanh',
    'Suspension & Chassis': 'Hệ thống treo & chassis',
    'Wheels & Tyres': 'Mâm & lốp',
    'Electronics & Cooling': 'Điện tử & làm mát',
  };
  return mapping[name] || name;
}

const MATERIAL_FILTERS = [
  { label: 'Carbon Fiber', searchKey: 'carbon' },
  { label: 'Titanium', searchKey: 'titan' },
  { label: 'Nhôm CNC / billet', searchKey: 'nhôm' },
  { label: 'Carbon Ceramic', searchKey: 'gốm' }
];

const PRICE_RANGE_FILTERS = [
  { label: 'Tất cả mức giá', key: '' },
  { label: 'Dưới 100M VND', key: 'under-100', maxPrice: 99999999 },
  { label: '100M - 250M VND', key: '100-250', minPrice: 100000000, maxPrice: 250000000 },
  { label: '250M - 400M VND', key: '250-400', minPrice: 250000000, maxPrice: 400000000 },
  { label: 'Trên 400M VND', key: 'above-400', minPrice: 400000001 },
];

export default function HomePage({ user, onNavigate, onOpenLogin, onOpenRegister, onOpenProfile, onLogout, onGoCheckout }) {
  const [inventoryCars, setInventoryCars] = useState([])
  const [inventoryState, setInventoryState] = useState('loading')
  const [inventoryError, setInventoryError] = useState('')
  const [categories, setCategories] = useState([])
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    colors: [],
    sizes: [],
  })
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    categoryId: '',
    color: '',
    size: '',
    sortBy: 'rating',
    sortOrder: 'DESC',
    inStock: false,
  })
  const [selectedMaterials, setSelectedMaterials] = useState([])
  const [selectedPerformance, setSelectedPerformance] = useState([])
  const [selectedPriceRange, setSelectedPriceRange] = useState('')
  const [telemetryLogs, setTelemetryLogs] = useState([
    '[SYS-INIT] CALIBRATING CORE TELEMETRY MATRIX...',
    '[LINK-EST] ATELIER SEOUL MAIN NODE // ACTIVE',
    '[AERO-SYS] DOWNFORCE VECTOR COMPILATION // PASS'
  ])

  const [homepageSettings, setHomepageSettings] = useState({
    heroTitle: "PHỤ TÙNG\nHIỆU NĂNG",
    heroSubtitle: "CẤU HÌNH RACING SPEC ĐÃ HIỆU CHUẨN",
    heroText: "Bộ phụ tùng khí động học carbon ép, hệ thống xả hợp kim titanium và các linh kiện điều khiển lập trình nơ-ron được thiết kế cho đua xe chính xác.",
    heroImage: "",
    partnerBremboDesc: "HỆ THỐNG PHANH ĐUA // HEO DẦU NGUYÊN KHỐI",
    partnerMichelinDesc: "LỐP ĐUA CHUYÊN DỤNG // LỰC BÁM ĐƯỜNG ĐUA 1.88G",
    partnerOhlinsDesc: "GIẢM CHẤN VAN THÍCH ỨNG // DẦU THỦY LỰC CHỦ ĐỘNG",
    partnerRecaroDesc: "KHUNG GHẾ KEVLAR NGUYÊN KHỐI // CĂNG ĐAI SINH HỌC",
    partnerAlcantaraDesc: "BỌC ALCANTARA SIÊU BÁM // BỀ MẶT CHỐNG TĨNH ĐIỆN",
    featuredProductIds: [],
    materialFilters: []
  })
  const [featuredProductsList, setFeaturedProductsList] = useState([])

  useEffect(() => {
    apiFetch('/settings/homepage')
      .then((data) => {
        if (data) {
          setHomepageSettings((current) => ({ ...current, ...data }))
        }
      })
      .catch((err) => console.warn('Failed to load homepage settings:', err))
  }, [])

  useEffect(() => {
    const ids = homepageSettings?.featuredProductIds || []
    if (ids.length > 0) {
      Promise.all(
        ids.map(id =>
          apiFetch(`/products/${id}`).catch(() => null)
        )
      ).then(results => {
        const valid = results.filter(Boolean).map(mapProductToCar)
        setFeaturedProductsList(valid)
      })
    } else {
      setFeaturedProductsList([])
    }
  }, [homepageSettings?.featuredProductIds])

  useEffect(() => {
    const logsPool = [
      '[FL_TYRE] T: 84.6°C // P: 1.92 BAR // STATUS: OPTIMAL',
      '[FR_TYRE] T: 85.1°C // P: 1.94 BAR // STATUS: OPTIMAL',
      '[RL_TYRE] T: 91.2°C // P: 2.05 BAR // STATUS: WARNING_HIGH',
      '[RR_TYRE] T: 91.8°C // P: 2.06 BAR // STATUS: WARNING_HIGH',
      '[STEER] ANG: -14.2° // TRQ: 5.4 Nm // DAMPING: 92.4%',
      '[AERO] VELOCITY: 284 KM/H // CL: -2.84 // CD: 0.34',
      '[AERO] DIFFUSER AIRFLOW VELOCITY: 112 M/S // BOUNDARY: ATTACHED',
      '[ENG] WATER T: 94.2°C // OIL T: 104.8°C // THERMAL CORE: OK',
      '[BRAKE] FL_TEMP: 642°C // FR_TEMP: 638°C // PAD_WEAR: 24.5%',
      '[POW] TURBO BOOST: 2.62 BAR // SPEED: 124,000 RPM',
      '[POW] HYBRID KINETIC CHARGE: +140 kW // DEPLOYMENT: ACTIVE',
      '[SYS] LATERAL LOAD: 2.14G // LONGITUDINAL LOAD: -1.42G',
      '[SYS] STEER-BY-WIRE SYNAPSE REACTION DELAY: 0.82 ms // SYNCED',
      '[LINK] TELEMETRY BUFFER OVER SATELLITE: UP-LINK 98.4%'
    ]
    const interval = setInterval(() => {
      setTelemetryLogs((current) => {
        const nextLog = logsPool[Math.floor(Math.random() * logsPool.length)]
        return [nextLog, ...current].slice(0, 5)
      })
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [cartNotice, setCartNotice] = useState('')
  const [cartError, setCartError] = useState('')
  const [cartBusy, setCartBusy] = useState(false)
  const [cartLogs, setCartLogs] = useState([])
  const cartMode = getAuthToken() ? 'account' : 'guest'
  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)

  const pushCartLog = (type, message) => {
    const entry = { id: Date.now(), type, message }
    console.log(`[cart:${type}] ${message}`)
    setCartLogs((current) => [entry, ...current].slice(0, 3))
    window.setTimeout(() => {
      setCartLogs((current) => current.filter((item) => item.id !== entry.id))
    }, 3200)
  }

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

  const addGuestItem = (car, quantity, color, size) => {
    const guestItems = readGuestCart()
    const item = createCartItemFromProduct(car, { quantity, color, size })
    const nextItems = mergeCartItem(guestItems, item, { incrementQuantity: true })
    writeGuestCart(nextItems)
    setCartItems(nextItems)
  }

  useEffect(() => {
    let isMounted = true
    Promise.allSettled([
      apiFetch('/products/filters/brands'),
      apiFetch('/products/filters/colors'),
      apiFetch('/products/filters/sizes'),
      apiFetch('/categories'),
    ]).then(([brandResult, colorResult, sizeResult, catResult]) => {
      if (!isMounted) return

      if (catResult.status === 'fulfilled' && Array.isArray(catResult.value)) {
        setCategories(catResult.value)
      }

      setFilterOptions({
        brands:
          brandResult.status === 'fulfilled' && Array.isArray(brandResult.value) && brandResult.value.length
            ? brandResult.value
            : [],
        colors: colorResult.status === 'fulfilled' && Array.isArray(colorResult.value) ? colorResult.value : [],
        sizes: sizeResult.status === 'fulfilled' && Array.isArray(sizeResult.value) ? sizeResult.value : [],
      })
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    loadCart()
  }, [user])

  useEffect(() => {
    let isMounted = true
    const params = new URLSearchParams({
      limit: '12',
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    })

    if (filters.search.trim()) params.set('search', filters.search.trim())
    if (filters.brand) params.set('brand', filters.brand)
    if (filters.categoryId) params.set('categoryId', filters.categoryId)
    if (filters.color) params.set('color', filters.color)
    if (filters.size) params.set('size', filters.size)
    if (filters.inStock) params.set('inStock', 'true')
    const selectedBackendPriceRange = PRICE_RANGE_FILTERS.find((range) => range.key === selectedPriceRange)
    if (selectedBackendPriceRange?.minPrice !== undefined) {
      params.set('minPrice', String(selectedBackendPriceRange.minPrice))
    }
    if (selectedBackendPriceRange?.maxPrice !== undefined) {
      params.set('maxPrice', String(selectedBackendPriceRange.maxPrice))
    }

    setInventoryError('')
    setInventoryState('loading')
    apiFetch(`/products?${params.toString()}`)
      .then((result) => {
        if (!isMounted) return
        const products = Array.isArray(result?.data) ? result.data : []
        const mappedCars = products.map(mapProductToCar)
        setInventoryCars(mappedCars)
        setInventoryState(mappedCars.length ? 'ready' : 'empty')
      })
      .catch((error) => {
        if (!isMounted) return
        setInventoryCars([])
        setInventoryError(error.message || 'Không tải được danh mục sản phẩm từ hệ thống.')
        setInventoryState('error')
      })

    return () => {
      isMounted = false
    }
  }, [filters, selectedPriceRange])

  const selectedSortValue = `${filters.sortBy}:${filters.sortOrder}`

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      brand: '',
      categoryId: '',
      color: '',
      size: '',
      sortBy: 'rating',
      sortOrder: 'DESC',
      inStock: false,
    })
    setSelectedMaterials([])
    setSelectedPerformance([])
    setSelectedPriceRange('')
  }

  const openProductDetail = (car) => {
    onNavigate('product-detail', car)
  }

  const resolveProductForCart = async (car) => {
    if (!car?.sku) return car

    try {
      const params = new URLSearchParams({
        search: car.sku,
        limit: '4',
      })
      const result = await apiFetch(`/products?${params.toString()}`)
      const products = Array.isArray(result?.data) ? result.data : []
      const matchedProduct =
        products.find((product) => product.sku === car.sku) ||
        products.find((product) => product.name === car.name)

      return matchedProduct ? mapProductToCar(matchedProduct) : car
    } catch {
      return car
    }
  }

  const addToCart = async (car, options = {}) => {
    setCartNotice('')
    setCartError('')

    const quantity = Math.max(1, Number(options.quantity || 1))
    const isAccountCart = Boolean(getAuthToken())
    const selectedColor = options.color || car.colorName || null
    const selectedSize = options.size || car.size || null

    if (isAccountCart) {
      setCartBusy(true)
      const dbCar = await resolveProductForCart(car)

      if (!dbCar.id) {
        setCartError('Thiếu mã sản phẩm nên chưa thể thêm vào giỏ hàng.')
        setCartOpen(true)
        setCartBusy(false)
        return
      }

      try {
        const addedItem = await apiFetch('/cart', {
          method: 'POST',
          auth: true,
          body: JSON.stringify({
            productId: dbCar.id,
            quantity,
            color: selectedColor || undefined,
            size: selectedSize || undefined,
          }),
        })
        setCartItems((current) => mergeCartItem(current, addedItem))
        const message = `Đã thêm ${dbCar.name} vào giỏ hàng tài khoản.`
        setCartNotice(message)
        pushCartLog('add', message)
        setCartOpen(true)
        return
      } catch (error) {
        const message = error.message || 'Không thể thêm sản phẩm vào giỏ hàng tài khoản.'
        setCartError(message)
        pushCartLog('error', message)
        setCartOpen(true)
        return
      } finally {
        setCartBusy(false)
      }
    }

    addGuestItem(car, quantity, selectedColor, selectedSize)
    const message = `Đã thêm ${car.name} vào giỏ hàng khách.`
    setCartNotice(message)
    pushCartLog('add', message)
    setCartOpen(true)
  }

  const updateCartQuantity = async (item, quantity) => {
    setCartNotice('')
    setCartError('')

    if (getAuthToken() && Number.isInteger(Number(item.id))) {
      setCartBusy(true)
      try {
        await apiFetch(`/cart/${item.id}`, {
          method: 'PUT',
          auth: true,
          body: JSON.stringify({ quantity }),
        })
        await loadCart()
        pushCartLog('update', `Đã cập nhật ${item.name} thành ${quantity} sản phẩm.`)
        return
      } catch {
        const message = 'Không thể cập nhật số lượng trong giỏ hàng tài khoản.'
        setCartError(message)
        pushCartLog('error', message)
        return
      } finally {
        setCartBusy(false)
      }
    }

    const nextItems = readGuestCart().map((cartItem) =>
      cartItemKey(cartItem) === cartItemKey(item) ? { ...cartItem, quantity } : cartItem,
    )
    writeGuestCart(nextItems)
    setCartItems(nextItems)
    pushCartLog('update', `Đã cập nhật ${item.name} thành ${quantity} sản phẩm.`)
  }

  const removeCartItem = async (item) => {
    setCartNotice('')
    setCartError('')

    if (getAuthToken() && Number.isInteger(Number(item.id))) {
      setCartBusy(true)
      try {
        await apiFetch(`/cart/${item.id}`, {
          method: 'DELETE',
          auth: true,
        })
        await loadCart()
        const message = `Đã xóa ${item.name} khỏi giỏ hàng tài khoản.`
        setCartNotice(message)
        pushCartLog('remove', message)
        return
      } catch {
        const message = 'Không thể xóa sản phẩm khỏi giỏ hàng tài khoản.'
        setCartError(message)
        pushCartLog('error', message)
        return
      } finally {
        setCartBusy(false)
      }
    }

    const nextItems = readGuestCart().filter((cartItem) => cartItemKey(cartItem) !== cartItemKey(item))
    writeGuestCart(nextItems)
    setCartItems(nextItems)
    const message = `Đã xóa ${item.name} khỏi giỏ hàng khách.`
    setCartNotice(message)
    pushCartLog('remove', message)
  }

  const clearCart = async () => {
    setCartNotice('')
    setCartError('')

    if (getAuthToken()) {
      setCartBusy(true)
      try {
        await apiFetch('/cart', {
          method: 'DELETE',
          auth: true,
        })
        await loadCart()
        const message = 'Đã xóa toàn bộ giỏ hàng tài khoản.'
        setCartNotice(message)
        pushCartLog('clear', message)
        return
      } catch {
        const message = 'Không thể xóa giỏ hàng tài khoản.'
        setCartError(message)
        pushCartLog('error', message)
        return
      } finally {
        setCartBusy(false)
      }
    }

    writeGuestCart([])
    setCartItems([])
    const message = 'Đã xóa toàn bộ giỏ hàng khách.'
    setCartNotice(message)
    pushCartLog('clear', message)
  }

  const handleGoCheckout = () => {
    setCartOpen(false)
    onGoCheckout()
  }

  const displayedCars = inventoryCars.filter((car) => {
    // 1. Material filter
    if (selectedMaterials.length > 0) {
      const mat = car.material || '';
      if (!selectedMaterials.some(m => mat.toLowerCase().includes(m.toLowerCase()))) {
        return false;
      }
    }
    // 2. Performance gain filter
    if (selectedPerformance.length > 0) {
      const gain = car.gain || '';
      const type = car.type || '';
      const hasMatch = selectedPerformance.some(p => {
        if (p === 'Aero' && (type.toLowerCase().includes('aero') || gain.toLowerCase().includes('downforce'))) return true;
        if (p === 'Power' && (type.toLowerCase().includes('power') || gain.toLowerCase().includes('hp') || gain.toLowerCase().includes('boost'))) return true;
        if (p === 'Braking' && (type.toLowerCase().includes('brake') || gain.toLowerCase().includes('fade') || gain.toLowerCase().includes('rotor'))) return true;
        if (p === 'Weight' && (car.weightReduction && car.weightReduction !== 'N/A')) return true;
        return false;
      });
      if (!hasMatch) return false;
    }
    return true;
  });

  const activeMaterialFilters = (homepageSettings?.materialFilters || MATERIAL_FILTERS).map(m => ({
    label: m.label,
    searchKey: m.key || m.searchKey
  }))

  // Partition items for Mockup layout
  const featuredBigCar = featuredProductsList[0] || inventoryCars[0] || featuredCars[0]
  const rightListCars = featuredProductsList.slice(1, 3).length > 0
    ? featuredProductsList.slice(1, 3)
    : (inventoryCars.slice(1, 3).length === 2 ? inventoryCars.slice(1, 3) : featuredCars.slice(1, 3))
  const aeroUpgradeCars = inventoryCars.slice(3, 6).length === 3 ? inventoryCars.slice(3, 6) : featuredCars
  const showLegacyInventory = false

  return (
    <Box className="car-site">
      <Header
        user={user}
        activeTab="home"
        onNavigate={onNavigate}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        cartCount={cartCount}
        onCartClick={() => onNavigate('cart')}
      />

      {/* HERO SECTION */}
      <section id="showroom" className="hero-section">
        <img className="hero-image" src={homepageSettings.heroImage || cleanShowroomBg} alt="AEROTEC Showroom" />
        <div className="grid-overlay" />
        <div className="hero-glow-spot" />
        <div className="speed-lines" />
        <Container maxWidth="xl" className="hero-content">
          <Box className="hero-copy">
            <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '11px', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', mb: 1 }}>
              {homepageSettings.heroSubtitle}
            </Typography>
            <Typography component="h1" className="hero-title" style={{ fontSize: 'clamp(48px, 6vw, 80px)', lineHeight: 1.1, fontWeight: 950 }}>
              {(() => {
                const parts = (homepageSettings.heroTitle || "").split(/\\n|\n/);
                return (
                  <>
                    {parts[0]}
                    {parts.length > 1 && (
                      <>
                        <br />
                        <span className="gradient-text-rose-orange">{parts.slice(1).join(' ')}</span>
                      </>
                    )}
                  </>
                );
              })()}
            </Typography>
            <Typography className="hero-text" style={{ maxWidth: '600px', color: 'rgba(248,250,252,0.7)', fontSize: '15px', marginTop: '16px', lineHeight: 1.6 }}>
              {homepageSettings.heroText}
            </Typography>
            <Box className="hero-actions" sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button className="gradient-btn-rose-orange" style={{ borderRadius: '99px', padding: '12px 32px', fontWeight: 900 }} onClick={() => onNavigate('parts')}>
                KHÁM PHÁ DANH MỤC
              </Button>
              <Button className="outline-button" style={{ borderRadius: '99px', padding: '12px 32px', fontWeight: 900 }} onClick={() => onNavigate('tech')}>
                Xem thông số kỹ thuật &rarr;
              </Button>
            </Box>
            <Box className="hero-kpi-row">
              <div>
                <strong>{inventoryCars.length || 12}+</strong>
                <span>SKU trong kho</span>
              </div>
              <div>
                <strong>{categories.length || 6}</strong>
                <span>Nhóm phụ tùng</span>
              </div>
              <div>
                <strong>COD</strong>
                <span>Khách vãng lai</span>
              </div>
            </Box>
            <Box className="hero-live-line" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 5 }}>
              <div className="pulse-glow-dot" />
              <Typography sx={{ color: '#f43f5e', fontSize: '12px', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                TELEMETRY TRỰC TIẾP: HOẠT ĐỘNG
              </Typography>
            </Box>
          </Box>

          <Box className="hero-stats-panel">
            <Box className="stats-panel-header">
              <span>AEROTEC //</span>
              <strong style={{ color: '#f43f5e' }}>ECLIPSE</strong>
            </Box>
            <div className="stats-separator" />
            <Box className="stats-row">
              <div className="stats-col">
                <small>SẢN PHẨM</small>
                <strong>{inventoryCars.length}+</strong>
              </div>
              <div className="stats-col">
                <small>DANH MỤC</small>
                <strong>{categories.length || 6}</strong>
              </div>
            </Box>
            <Box className="stats-row">
              <div className="stats-col">
                <small>BẢO HÀNH</small>
                <strong>18-36T</strong>
              </div>
              <div className="stats-col">
                <small>TRACK SPEC</small>
                <strong>SẴN SÀNG</strong>
              </div>
            </Box>
            <Box className="stats-row">
              <div className="stats-col">
                <small>VẬT LIỆU</small>
                <strong style={{ fontSize: '16px' }}>CARBON</strong>
              </div>
              <div className="stats-col">
                <small>KIỂM ĐỊNH</small>
                <strong style={{ fontSize: '16px' }}>QC PASS</strong>
              </div>
            </Box>
            <div className="stats-separator" style={{ marginBlock: '10px' }} />
            <Box sx={{ p: 1.5, background: 'rgba(0,0,0,0.4)', borderRadius: '4px', border: '1px solid rgba(248, 250, 252, 0.05)', textAlign: 'left' }}>
              <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'rgba(248, 250, 252, 0.4)', mb: 1, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                Atelier Telemetry Stream //
              </Typography>
              <Box sx={{ height: '70px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {telemetryLogs.map((log, index) => (
                  <Typography key={index} sx={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: index === 0 ? '#fb7185' : 'rgba(248, 250, 252, 0.4)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {log}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </section>

      {/* TECHNICAL PARTNERS LOGO WALL */}
      <section className="partners-strip">
        <Container maxWidth="xl">
          <Box sx={{ display: 'grid', gridTemplateColumns: { lg: 'repeat(5, 1fr)', md: 'repeat(3, 1fr)', xs: 'repeat(2, 1fr)' }, gap: 4, justifyItems: 'center', alignItems: 'start' }}>
            {/* BREMBO */}
            <Box className="partner-logo" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                <span style={{ fontFamily: 'Be Vietnam Pro', fontWeight: 900, letterSpacing: '1.5px', fontSize: '13px', color: '#fff' }}>BREMBO</span>
              </Box>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8.5px', color: 'rgba(248, 250, 252, 0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.3 }}>
                {homepageSettings.partnerBremboDesc}
              </span>
            </Box>
            {/* MICHELIN */}
            <Box className="partner-logo" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M3 12h18M3 18h18" strokeDasharray="3 3" />
                </svg>
                <span style={{ fontFamily: 'Be Vietnam Pro', fontWeight: 900, letterSpacing: '1.5px', fontSize: '13px', color: '#fff' }}>MICHELIN</span>
              </Box>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8.5px', color: 'rgba(248, 250, 252, 0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.3 }}>
                {homepageSettings.partnerMichelinDesc}
              </span>
            </Box>
            {/* ÖHLINS */}
            <Box className="partner-logo" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M8 7h8M8 17h8" />
                </svg>
                <span style={{ fontFamily: 'Be Vietnam Pro', fontWeight: 900, letterSpacing: '1.5px', fontSize: '13px', color: '#fff' }}>ÖHLINS</span>
              </Box>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8.5px', color: 'rgba(248, 250, 252, 0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.3 }}>
                {homepageSettings.partnerOhlinsDesc}
              </span>
            </Box>
            {/* RECARO */}
            <Box className="partner-logo" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3h12v12H6zM4 21h16" />
                </svg>
                <span style={{ fontFamily: 'Be Vietnam Pro', fontWeight: 900, letterSpacing: '1.5px', fontSize: '13px', color: '#fff' }}>RECARO</span>
              </Box>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8.5px', color: 'rgba(248, 250, 252, 0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.3 }}>
                {homepageSettings.partnerRecaroDesc}
              </span>
            </Box>
            {/* ALCANTARA */}
            <Box className="partner-logo" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 12l10 10 10-10L12 2z" />
                </svg>
                <span style={{ fontFamily: 'Be Vietnam Pro', fontWeight: 900, letterSpacing: '1.5px', fontSize: '13px', color: '#fff' }}>ALCANTARA</span>
              </Box>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8.5px', color: 'rgba(248, 250, 252, 0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.3 }}>
                {homepageSettings.partnerAlcantaraDesc}
              </span>
            </Box>
          </Box>
        </Container>
      </section>

      {/* TRENDING PERFORMANCE SECTION */}
      <section style={{ padding: '80px 0', background: '#080808' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5 }}>
            <Box>
            <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', fontSize: '32px' }}>
              Phụ Tùng Thịnh Hành
            </Typography>
            </Box>
            <button type="button" onClick={() => onNavigate('parts')} style={{ color: 'rgba(248,250,252,0.5)', fontSize: '12px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase', border: 0, borderBottom: '1px solid rgba(248,250,252,0.2)', paddingBottom: '4px', background: 'transparent', cursor: 'pointer' }}>
              XEM TẤT CẢ LINH KIỆN
            </button>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1.2fr 0.8fr', xs: '1fr' }, gap: 4 }}>
            {/* BIG CARD */}
            <Box
              className="glow-card-premium"
              sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '420px',
                backgroundImage: featuredBigCar.image ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.85)), url(${featuredBigCar.image})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => openProductDetail(featuredBigCar)}
            >
              <Box>
                <Chip label={featuredBigCar.type || 'NỔI BẬT'} sx={{ background: 'rgba(244,63,94,0.15)', color: '#f43f5e', fontWeight: 900, border: '1px solid rgba(244,63,94,0.3)', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 950, color: '#fff', fontSize: '28px', mb: 2 }}>
                  {featuredBigCar.name}
                </Typography>
                <Typography sx={{ color: 'rgba(248,250,252,0.6)', maxWidth: '480px', fontSize: '14px', lineHeight: 1.6 }}>
                  Khả năng chịu nhiệt cực cao, hiệu suất phanh ổn định tối đa được kiểm nghiệm trong các điều kiện đua khắc nghiệt. Được chế tạo từ hợp chất carbon chịu lực.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
                <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '20px' }}>
                  {featuredBigCar.price}
                </Typography>
                <IconButton sx={{ background: 'linear-gradient(135deg, #f43f5e, #f97316)', color: '#fff', width: 44, height: 44, '&:hover': { opacity: 0.9 } }}>
                  +
                </IconButton>
              </Box>
            </Box>

            {/* LIST ON THE RIGHT */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {rightListCars.map((car) => (
                <Box
                  key={car.id || car.name}
                  className="glow-card-premium"
                  sx={{
                    p: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer'
                  }}
                  onClick={() => openProductDetail(car)}
                >
                  <Box>
                    <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>
                      {car.type || 'PHỤ TÙNG HIỆU NĂNG'}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#fff', mt: 0.5 }}>
                      {car.name}
                    </Typography>
                    <Typography sx={{ color: '#fb7185', fontWeight: 900, fontSize: '16px', mt: 1 }}>
                      {car.price}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <span style={{ width: 3, height: 12, backgroundColor: '#f43f5e', display: 'inline-block' }}></span>
                      <span style={{ width: 3, height: 16, backgroundColor: '#f43f5e', display: 'inline-block' }}></span>
                      <span style={{ width: 3, height: 10, backgroundColor: '#f43f5e', display: 'inline-block' }}></span>
                      <span style={{ width: 3, height: 14, backgroundColor: '#f97316', display: 'inline-block' }}></span>
                    </Box>
                    <Button
                      size="small"
                      sx={{
                        borderRadius: '99px',
                        border: '1px solid rgba(248,250,252,0.2)',
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: '11px',
                        px: 2,
                        textTransform: 'uppercase',
                        '&:hover': { borderColor: '#f43f5e', background: 'rgba(244,63,94,0.1)' }
                      }}
                      onClick={(e) => { e.stopPropagation(); openProductDetail(car); }}
                    >
                      CẤU HÌNH
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </section>

      {/* AERODYNAMIC UPGRADES SECTION */}
      <section style={{ padding: '80px 0', background: '#050505', borderTop: '1px solid rgba(248,250,252,0.04)' }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', fontSize: '32px' }}>
              NÂNG CẤP KHÍ ĐỘNG HỌC
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { md: 'repeat(3, 1fr)', sm: 'repeat(2, 1fr)', xs: '1fr' }, gap: 4 }}>
            {aeroUpgradeCars.map((car, index) => {
              // Marketing copy for the homepage highlight cards.
              const titles = ['Cánh Gió Cơ Học Biến Thiên', 'Bộ Khuếch Tán Gầm Vortex', 'Mâm Đúc Khí Động Học Forged']
              const descs = [
                'Kiểm soát lực nâng thích ứng theo thời gian thực sử dụng các bề mặt carbon chủ động.',
                'Tối ưu hóa luồng khí dưới gầm xe được thiết kế chính xác để tăng độ ổn định.',
                'Thiết kế mâm siêu nhẹ giúp tối đa hóa khả năng làm mát phanh và luồng khí.'
              ]
              const title = titles[index] || car.name
              const desc = descs[index] || `Nâng cấp hiệu năng với ${car.power}, vật liệu motorsport và tuning theo điều kiện track.`
              return (
                <Box
                  key={car.id || index}
                  className="glow-card-premium"
                  sx={{
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '340px',
                    cursor: 'pointer'
                  }}
                  onClick={() => openProductDetail(car)}
                >
                  <Box>
                    <Typography sx={{ color: '#f97316', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', mb: 1 }}>
                      PHÂN LOẠI // {car.type || 'NÂNG CẤP'}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 950, color: '#fff', mb: 2 }}>
                      {title}
                    </Typography>
                    <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px', lineHeight: 1.6 }}>
                      {desc}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
                    <Typography sx={{ color: '#fff', fontWeight: 900 }}>
                      {car.price}
                    </Typography>
                    <Button
                      className="gradient-btn-rose-orange"
                      sx={{ borderRadius: '99px', px: 3, py: 1, fontSize: '11px', fontWeight: 900 }}
                      onClick={(e) => { e.stopPropagation(); openProductDetail(car); }}
                    >
                      CẤU HÌNH
                    </Button>
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Container>
      </section>

      {/* EDITION SPEC GALLERY */}
      <section className="edition-gallery">
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Chip label="THAM CHIẾU KHUNG GẦM" sx={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e', fontWeight: 900, mb: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', fontSize: '32px', mb: 2, fontFamily: 'Be Vietnam Pro' }}>
              Khung Gầm Tham Chiếu Tương Thích
            </Typography>
            <Typography sx={{ color: 'rgba(248, 250, 252, 0.5)', maxWidth: '600px', mx: 'auto', fontSize: '14px', fontFamily: 'Plus Jakarta Sans' }}>
              Khám phá các cấu trúc khung gầm đua cốt lõi mà các phụ tùng hiệu năng cao của chúng tôi được thiết kế tương thích.
            </Typography>
          </Box>

          <Box className="edition-grid">
            {/* CARD 1: APEX */}
            <Box className="edition-card" style={{ '--glow-color': 'rgba(244, 63, 94, 0.2)' }}>
              <div className="edition-card-glow" />
              <Box>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#fb7185', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  CẤU HÌNH ĐƯỜNG ĐUA // GIAI ĐOẠN 03
                </span>
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, mt: 1, mb: 1, fontFamily: 'Be Vietnam Pro', fontSize: '24px' }}>
                  Gói cánh gió Apex
                </Typography>
                <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '12px', fontFamily: 'Plus Jakarta Sans' }}>
                  Cánh gió carbon prepreg hấp lò autoclave, tối ưu downforce và độ ổn định khi chạy track.
                </Typography>
              </Box>

              <Box className="edition-card-img-shell">
                <img className="edition-card-img" src="/images/cars/apex-r7.png" alt="Gói cánh gió Apex" />
              </Box>

              <Box>
                 <table className="part-specs-table">
                  <tbody>
                    <tr>
                      <td>VẬT LIỆU</td>
                      <td>CARBON PREPREG</td>
                    </tr>
                    <tr>
                      <td>HIỆU NĂNG</td>
                      <td>+180 KG DOWNFORCE</td>
                    </tr>
                    <tr>
                      <td>GIẢM TRỌNG LƯỢNG</td>
                      <td>-42% KHUNG COMPOSITE</td>
                    </tr>
                    <tr>
                      <td>FITMENT</td>
                      <td>GT / TRACK CAR</td>
                    </tr>
                  </tbody>
                </table>

                <Button
                  className="outline-button"
                  sx={{ width: '100%', mt: 2, borderRadius: '99px', fontWeight: 900, fontSize: '11px' }}
                  onClick={() => onNavigate('showroom')}
                >
                  XEM GÓI CÁNH GIÓ APEX &rarr;
                </Button>
              </Box>
            </Box>

            {/* CARD 2: VECTOR */}
            <Box className="edition-card" style={{ '--glow-color': 'rgba(249, 115, 22, 0.2)' }}>
              <div className="edition-card-glow" />
              <Box>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#f97316', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  ỐNG XẢ TITANIUM // ACTIVE VALVE
                </span>
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, mt: 1, mb: 1, fontFamily: 'Be Vietnam Pro', fontSize: '24px' }}>
                  Gói ống xả Vector
                </Typography>
                <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '12px', fontFamily: 'Plus Jakarta Sans' }}>
                  Hệ thống ống xả Titanium Grade 5 có van chủ động, giảm trọng lượng và tăng phản hồi động cơ.
                </Typography>
              </Box>

              <Box className="edition-card-img-shell">
                <img className="edition-card-img" src="/images/cars/vector-gt.png" alt="Gói ống xả Vector" />
              </Box>

              <Box>
                <table className="part-specs-table">
                  <tbody>
                    <tr>
                      <td>VẬT LIỆU</td>
                      <td>TITANIUM GRADE 5</td>
                    </tr>
                    <tr>
                      <td>HIỆU NĂNG</td>
                      <td>+18 HP</td>
                    </tr>
                    <tr>
                      <td>GIẢM TRỌNG LƯỢNG</td>
                      <td>-35% KHUNG CARBON MONOCOQUE</td>
                    </tr>
                    <tr>
                      <td>ĐIỀU KHIỂN</td>
                      <td>ACTIVE VALVE / ECU</td>
                    </tr>
                  </tbody>
                </table>

                <Button
                  className="outline-button"
                  sx={{ width: '100%', mt: 2, borderRadius: '99px', fontWeight: 900, fontSize: '11px' }}
                  onClick={() => onNavigate('showroom')}
                >
                  XEM GÓI ỐNG XẢ VECTOR &rarr;
                </Button>
              </Box>
            </Box>

            {/* CARD 3: NOVA */}
            <Box className="edition-card" style={{ '--glow-color': 'rgba(56, 189, 248, 0.2)' }}>
              <div className="edition-card-glow" />
              <Box>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  PHANH CARBON CERAMIC // TRACK SPEC
                </span>
                <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, mt: 1, mb: 1, fontFamily: 'Be Vietnam Pro', fontSize: '24px' }}>
                  Gói phanh Nova
                </Typography>
                <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '12px', fontFamily: 'Plus Jakarta Sans' }}>
                  Bộ đĩa phanh carbon ceramic chịu nhiệt cao, giữ lực phanh ổn định khi chạy track.
                </Typography>
              </Box>

              <Box className="edition-card-img-shell">
                <img className="edition-card-img" src="/images/cars/nova-x.png" alt="Gói phanh Nova" />
              </Box>

              <Box>
                <table className="part-specs-table">
                  <tbody>
                    <tr>
                      <td>VẬT LIỆU</td>
                      <td>CARBON CERAMIC</td>
                    </tr>
                    <tr>
                      <td>HIỆU NĂNG</td>
                      <td>ZERO FADE</td>
                    </tr>
                    <tr>
                      <td>GIẢM TRỌNG LƯỢNG</td>
                      <td>-45% PREPREG CARBON</td>
                    </tr>
                    <tr>
                      <td>NHIỆT ĐỘ</td>
                      <td>1000°C TRACK DUTY</td>
                    </tr>
                  </tbody>
                </table>

                <Button
                  className="outline-button"
                  sx={{ width: '100%', mt: 2, borderRadius: '99px', fontWeight: 900, fontSize: '11px' }}
                  onClick={() => onNavigate('showroom')}
                >
                  XEM GÓI PHANH NOVA &rarr;
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </section>

      {/* NEURAL ENGINE TUNING SECTION */}
      <section style={{ padding: '100px 0', background: '#0a0a0a', borderTop: '1px solid rgba(248,250,252,0.04)' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' }, gap: 6, alignItems: 'center' }}>
            <Box>
              <Typography variant="h2" sx={{ fontWeight: 950, color: '#fff', fontSize: '42px', mb: 3, lineHeight: 1.1 }}>
                CÔNG NGHỆ MỚI NHẤT:<br />HIỆU CHUẨN ĐỘNG CƠ NEURAL
              </Typography>
              <Typography sx={{ color: 'rgba(248,250,252,0.6)', fontSize: '15px', lineHeight: 1.7, mb: 4 }}>
                Tương lai của việc tối ưu hiệu năng không chỉ là cơ khí thuần túy. Module Neural của chúng tôi đồng bộ hóa trực tiếp với ECU của xe để thực hiện các điều chỉnh dự đoán thời gian thực dựa trên điều kiện mặt đường, nhiệt độ lốp và dữ liệu Telemetry sinh học tài xế.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box className="glow-card-premium" sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(244,63,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '15px' }}>Telemetry Sinh Học (Biometric)</Typography>
                    <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px', mt: 0.5 }}>Bản đồ phun tối ưu hóa điều chỉnh theo phản xạ và mức độ mệt mỏi của tài xế.</Typography>
                  </Box>
                </Box>
                <Box className="glow-card-premium" sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </Box>
                  <Box>
                    <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '15px' }}>Bản Đồ Cấu Hình Không Dây (OTA)</Typography>
                    <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px', mt: 0.5 }}>Tải trực tiếp các bản map động cơ chuyên biệt cho từng trường đua trên thế giới.</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* NEURAL DIAGRAM DIAL */}
            <Box sx={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <Box sx={{ position: 'relative', width: '360px', height: '360px', borderRadius: '50%', border: '1px solid rgba(248,250,252,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Rotating ring */}
                <Box
                  className="rotate-slow-infinite"
                  sx={{
                    position: 'absolute',
                    inset: 15,
                    borderRadius: '50%',
                    border: '2px dashed rgba(244,63,94,0.3)',
                    borderTopColor: '#f43f5e',
                    borderBottomColor: '#f97316'
                  }}
                />
                <Box
                  className="rotate-slow-infinite"
                  style={{ animationDirection: 'reverse', animationDuration: '35s' }}
                  sx={{
                    position: 'absolute',
                    inset: 45,
                    borderRadius: '50%',
                    border: '1px dotted rgba(248,250,252,0.15)',
                    borderLeftColor: '#f97316'
                  }}
                />
                {/* Dial content */}
                <Box sx={{ textAlign: 'center', zIndex: 2 }}>
                  <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    MÔ-ĐUN NEURAL
                  </Typography>
                  <Typography variant="h1" sx={{ fontWeight: 950, color: '#fff', fontSize: '64px', my: 1 }}>
                    v4.0
                  </Typography>
                  <Typography sx={{ color: '#f43f5e', fontSize: '12px', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                    PHIÊN BẢN MÔ HÌNH
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </section>

      <section className="catalog-jump-section">
        <Container maxWidth="xl" className="catalog-jump-inner">
          <Box>
            <Chip className="scarlet-chip" label="Kho hàng hiệu năng" />
            <Typography component="h2">Chọn đúng phụ tùng cho cấu hình xe của bạn</Typography>
            <Typography>
              Duyệt cánh gió carbon, ống xả titanium, phanh carbon ceramic và các gói nâng cấp theo brand, SKU, fitment và mức giá.
            </Typography>
          </Box>
          <Button className="gradient-btn-rose-orange" onClick={() => onNavigate('parts')}>
            Xem phụ tùng
          </Button>
        </Container>
      </section>

      {showLegacyInventory && (
      <section id="inventory" className="inventory-section" style={{ padding: '80px 0', borderTop: '1px solid rgba(248,250,252,0.04)' }}>
        <Container maxWidth="xl">
          <Box className="section-heading" sx={{ mb: 4 }}>
            <Box>
              <Chip className="scarlet-chip" label="Kho hàng trực tiếp" sx={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e', mb: 1 }} />
              <Typography component="h2" className="section-title" sx={{ fontSize: '32px !important', fontWeight: 950 }}>
                Khám Phá Danh Mục Phụ Tùng
              </Typography>
            </Box>
          </Box>

          {/* SEARCH BAR (TOP LEVEL) */}
          <Box className="inventory-toolbar" sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2, background: 'rgba(10,10,10,0.5)', p: 2, borderRadius: '12px', border: '1px solid rgba(248,250,252,0.08)' }}>
            <label className="inventory-search" style={{ flex: '1 1 250px' }}>
              <SearchIcon />
              <input
                value={filters.search}
                onChange={(event) => updateFilter('search', event.target.value)}
                placeholder="Tìm kiếm linh kiện theo tên hoặc mã SKU..."
              />
            </label>
            <select
              value={selectedSortValue}
              onChange={(event) => {
                const [sortBy, sortOrder] = event.target.value.split(':')
                setFilters((current) => ({ ...current, sortBy, sortOrder }))
              }}
              style={{ padding: '10px', background: '#000', color: '#fff', border: '1px solid rgba(248,250,252,0.15)', borderRadius: '6px' }}
            >
              {inventorySorts.map((sort) => (
                <option value={`${sort.sortBy}:${sort.sortOrder}`} key={sort.label}>{sort.label}</option>
              ))}
            </select>
            <button
              className={filters.inStock ? 'stock-toggle active' : 'stock-toggle'}
              type="button"
              onClick={() => updateFilter('inStock', !filters.inStock)}
              style={{ padding: '10px 20px', borderRadius: '6px' }}
            >
              Còn hàng
            </button>
            <button className="reset-filters" type="button" onClick={resetFilters} style={{ padding: '10px 20px', borderRadius: '6px' }}>
              Đặt lại bộ lọc
            </button>
          </Box>

          {inventoryState === 'error' && (
            <Typography className="inventory-note" sx={{ mb: 3 }}>{inventoryError}</Typography>
          )}
          {inventoryState === 'loading' && (
            <Typography className="inventory-note" sx={{ mb: 3 }}>Đang tải danh mục sản phẩm...</Typography>
          )}

          <Box className="catalog-layout">
            {/* SIDEBAR FILTERS */}
            <aside className="filter-sidebar">
              {/* Category Group */}
              <div className="filter-group">
                <span className="filter-title">Danh mục</span>
                <div className="filter-options-list">
                  <label className="filter-checkbox-label" onClick={() => updateFilter('categoryId', '')}>
                    <input
                      type="radio"
                      className="filter-checkbox-input"
                      checked={!filters.categoryId}
                      readOnly
                    />
                    <span>Tất cả linh kiện</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="filter-checkbox-label" onClick={() => updateFilter('categoryId', String(category.id))}>
                      <input
                        type="radio"
                        className="filter-checkbox-input"
                        checked={String(filters.categoryId) === String(category.id)}
                        readOnly
                      />
                      <span>{translateCategoryName(category.name)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {filterOptions.brands.length > 0 && (
                <div className="filter-group">
                  <span className="filter-title">Brand</span>
                  <div className="filter-options-list">
                    <label className="filter-checkbox-label" onClick={() => updateFilter('brand', '')}>
                      <input
                        type="radio"
                        className="filter-checkbox-input"
                        checked={!filters.brand}
                        readOnly
                      />
                      <span>Tất cả brand</span>
                    </label>
                    {filterOptions.brands.map((brand) => (
                      <label key={brand} className="filter-checkbox-label" onClick={() => updateFilter('brand', brand)}>
                        <input
                          type="radio"
                          className="filter-checkbox-input"
                          checked={filters.brand === brand}
                          readOnly
                        />
                        <span>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {filterOptions.colors.length > 0 && (
                <div className="filter-group">
                  <span className="filter-title">Màu / Finish</span>
                  <div className="filter-options-list">
                    <label className="filter-checkbox-label" onClick={() => updateFilter('color', '')}>
                      <input
                        type="radio"
                        className="filter-checkbox-input"
                        checked={!filters.color}
                        readOnly
                      />
                      <span>Tất cả màu</span>
                    </label>
                    {filterOptions.colors.map((color) => (
                      <label key={color} className="filter-checkbox-label" onClick={() => updateFilter('color', color)}>
                        <input
                          type="radio"
                          className="filter-checkbox-input"
                          checked={filters.color === color}
                          readOnly
                        />
                        <span>{color}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {filterOptions.sizes.length > 0 && (
                <div className="filter-group">
                  <span className="filter-title">Size / Fitment</span>
                  <div className="filter-options-list">
                    <label className="filter-checkbox-label" onClick={() => updateFilter('size', '')}>
                      <input
                        type="radio"
                        className="filter-checkbox-input"
                        checked={!filters.size}
                        readOnly
                      />
                      <span>Tất cả size</span>
                    </label>
                    {filterOptions.sizes.map((size) => (
                      <label key={size} className="filter-checkbox-label" onClick={() => updateFilter('size', size)}>
                        <input
                          type="radio"
                          className="filter-checkbox-input"
                          checked={filters.size === size}
                          readOnly
                        />
                        <span>{size}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Material Group */}
              <div className="filter-group">
                <span className="filter-title">Vật liệu</span>
                <div className="filter-options-list">
                  {activeMaterialFilters.map((material) => {
                    const isChecked = selectedMaterials.includes(material.searchKey);
                    return (
                      <label key={material.searchKey} className="filter-checkbox-label" onClick={() => {
                        setSelectedMaterials(prev => isChecked ? prev.filter(m => m !== material.searchKey) : [...prev, material.searchKey]);
                      }}>
                        <input
                          type="checkbox"
                          className="filter-checkbox-input"
                          checked={isChecked}
                          readOnly
                        />
                        <span>{material.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Performance Gain Group */}
              <div className="filter-group">
                <span className="filter-title">Chỉ số hiệu năng</span>
                <div className="filter-options-list">
                  {[
                    { label: 'Lực ép Downforce', key: 'Aero' },
                    { label: 'Tăng công suất mã lực', key: 'Power' },
                    { label: 'Thông số phanh chịu nhiệt', key: 'Braking' },
                    { label: 'Giảm trọng lượng không treo', key: 'Weight' }
                  ].map((perf) => {
                    const isChecked = selectedPerformance.includes(perf.key);
                    return (
                      <label key={perf.key} className="filter-checkbox-label" onClick={() => {
                        setSelectedPerformance(prev => isChecked ? prev.filter(p => p !== perf.key) : [...prev, perf.key]);
                      }}>
                        <input
                          type="checkbox"
                          className="filter-checkbox-input"
                          checked={isChecked}
                          readOnly
                        />
                        <span>{perf.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Price Range Group */}
              <div className="filter-group">
                <span className="filter-title">Mức giá</span>
                <div className="filter-options-list">
                  {PRICE_RANGE_FILTERS.map((range) => {
                    const isChecked = selectedPriceRange === range.key;
                    return (
                      <label key={range.key} className="filter-checkbox-label" onClick={() => setSelectedPriceRange(range.key)}>
                        <input
                          type="radio"
                          className="filter-checkbox-input"
                          checked={isChecked}
                          readOnly
                        />
                        <span>{range.label}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </aside>

            {/* PRODUCT CATALOG GRID */}
            <Box style={{ flex: 1 }}>
              {displayedCars.length === 0 ? (
                <Typography sx={{ color: 'rgba(248,250,252,0.4)', textAlign: 'center', py: 10, fontFamily: 'Plus Jakarta Sans' }}>
                  Không tìm thấy phụ tùng nào phù hợp với bộ lọc bạn chọn.
                </Typography>
              ) : (
                <Box className="car-grid">
                  {displayedCars.map((car) => (
                    <article className="car-card" key={car.id || car.name} onClick={() => openProductDetail(car)} style={{ cursor: 'pointer' }}>
                      <div className="card-glow" style={{ '--card-color': car.color || '#f43f5e' }} />
                      <div className="car-image-shell">
                        {car.image ? (
                          <img className="car-image" src={car.image} alt={car.name} />
                        ) : (
                          <div className="mini-car">
                            <span className="mini-body" />
                            <span className="mini-wheel left" />
                            <span className="mini-wheel right" />
                          </div>
                        )}
                      </div>
                      <Typography className="car-type">{car.type}</Typography>
                      <Typography component="h3" className="car-name" sx={{ fontWeight: 900, minHeight: '48px', display: 'flex', alignItems: 'center', mb: 1 }}>
                        {car.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.8, mb: 2, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '8.5px', fontFamily: 'JetBrains Mono', background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '2px 6px', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>
                          TELEMETRY: ĐẠT
                        </span>
                        <span style={{ fontSize: '8.5px', fontFamily: 'JetBrains Mono', background: 'rgba(244,63,94,0.1)', color: '#f43f5e', padding: '2px 6px', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>
                          ĐÃ KIỂM TRA HẦM GIÓ
                        </span>
                      </Box>
                      
                      {/* Technical Specs Table */}
                      <table className="part-specs-table">
                        <tbody>
                          <tr>
                            <td>SKU</td>
                            <td>{car.sku}</td>
                          </tr>
                          <tr>
                            <td>Vật liệu</td>
                            <td>{car.material || 'Hợp kim'}</td>
                          </tr>
                          <tr>
                            <td>Giảm trọng lượng</td>
                            <td>{car.weightReduction || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td>Cải thiện hiệu năng</td>
                            <td>{car.gain || 'Hiệu năng cao'}</td>
                          </tr>
                          <tr>
                            <td>Giá bán</td>
                            <td>{car.price}</td>
                          </tr>
                        </tbody>
                      </table>

                      <Box className="card-actions">
                        <Button className="outline-button card-button" style={{ borderRadius: '99px' }} onClick={(e) => { e.stopPropagation(); openProductDetail(car); }}>
                          Cấu hình
                        </Button>
                        <Button className="gradient-btn-rose-orange card-button" style={{ borderRadius: '99px' }} onClick={(e) => { e.stopPropagation(); addToCart(car); }}>
                          Thêm vào giỏ hàng
                        </Button>
                      </Box>
                    </article>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Container>
      </section>
      )}

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
