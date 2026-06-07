import { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import SearchIcon from '@mui/icons-material/Search'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import TuneIcon from '@mui/icons-material/Tune'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'
import { inventorySorts } from '../utils/constants'
import { mapProductToCar } from '../utils/helpers'
import { apiFetch } from '../services/apiClient'
import { getAuthToken } from '../services/authToken'
import {
  cartItemKey,
  createCartItemFromProduct,
  mergeCartItem,
  readGuestCart,
  writeGuestCart,
} from '../utils/cart'

const CATEGORY_LABELS = {
  Aerodynamics: 'Khí động học',
  'Engine & Exhaust': 'Động cơ & ống xả',
  'Braking System': 'Hệ thống phanh',
  'Suspension & Chassis': 'Hệ thống treo & chassis',
  'Wheels & Tyres': 'Mâm & lốp',
  'Electronics & Cooling': 'Điện tử & làm mát',
}

const PRICE_RANGES = [
  { label: 'Tất cả', key: '' },
  { label: 'Dưới 100M', key: 'under-100', maxPrice: 99999999 },
  { label: '100M - 250M', key: '100-250', minPrice: 100000000, maxPrice: 250000000 },
  { label: '250M - 400M', key: '250-400', minPrice: 250000000, maxPrice: 400000000 },
  { label: 'Trên 400M', key: 'above-400', minPrice: 400000001 },
]

const MATERIAL_FILTERS = [
  { label: 'Carbon Fiber', key: 'carbon' },
  { label: 'Titanium', key: 'titan' },
  { label: 'Nhôm CNC', key: 'nhôm' },
  { label: 'Carbon Ceramic', key: 'gốm' },
]

const PERFORMANCE_FILTERS = [
  { label: 'Downforce', key: 'Aero' },
  { label: 'Power', key: 'Power' },
  { label: 'Braking', key: 'Braking' },
  { label: 'Weight', key: 'Weight' },
]

function translateCategory(name) {
  return CATEGORY_LABELS[name] || name
}

function buildCartLog(type, message) {
  return { id: `${Date.now()}-${Math.random()}`, type, message }
}

export default function PartsPage({
  user,
  onNavigate,
  onOpenLogin,
  onOpenRegister,
  onOpenProfile,
  onLogout,
  onGoCheckout,
}) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [filterOptions, setFilterOptions] = useState({ brands: [], colors: [], sizes: [] })
  const [catalogState, setCatalogState] = useState('loading')
  const [homepageSettings, setHomepageSettings] = useState(null)
  const [catalogError, setCatalogError] = useState('')
  const [selectedMaterials, setSelectedMaterials] = useState([])
  const [selectedPerformance, setSelectedPerformance] = useState([])
  const [selectedPriceRange, setSelectedPriceRange] = useState('')
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

  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [cartNotice, setCartNotice] = useState('')
  const [cartError, setCartError] = useState('')
  const [cartBusy, setCartBusy] = useState(false)
  const [cartLogs, setCartLogs] = useState([])

  const cartMode = getAuthToken() ? 'account' : 'guest'
  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  const selectedSortValue = `${filters.sortBy}:${filters.sortOrder}`
  const activeFilterCount = [
    filters.search,
    filters.brand,
    filters.categoryId,
    filters.color,
    filters.size,
    filters.inStock,
    selectedPriceRange,
    selectedMaterials.length,
    selectedPerformance.length,
  ].filter(Boolean).length

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedMaterials.length > 0) {
        const material = String(product.material || '').toLowerCase()
        if (!selectedMaterials.some((item) => material.includes(item.toLowerCase()))) return false
      }

      if (selectedPerformance.length > 0) {
        const gain = String(product.gain || '').toLowerCase()
        const type = String(product.type || '').toLowerCase()
        const hasPerformanceMatch = selectedPerformance.some((item) => {
          if (item === 'Aero') return type.includes('aero') || type.includes('khí') || gain.includes('downforce')
          if (item === 'Power') return type.includes('engine') || gain.includes('hp') || gain.includes('boost')
          if (item === 'Braking') return type.includes('brake') || gain.includes('fade') || gain.includes('rotor')
          if (item === 'Weight') return product.weightReduction && product.weightReduction !== 'N/A'
          return false
        })
        if (!hasPerformanceMatch) return false
      }

      return true
    })
  }, [products, selectedMaterials, selectedPerformance])

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
    setSelectedPriceRange('')
    setSelectedMaterials([])
    setSelectedPerformance([])
  }

  const pushCartLog = (type, message) => {
    const entry = buildCartLog(type, message)
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

  const addGuestItem = (product) => {
    const guestItems = readGuestCart()
    const item = createCartItemFromProduct(product)
    const nextItems = mergeCartItem(guestItems, item, { incrementQuantity: true })
    writeGuestCart(nextItems)
    setCartItems(nextItems)
  }

  const addToCart = async (product) => {
    setCartNotice('')
    setCartError('')

    if (getAuthToken()) {
      if (!product.id) {
        setCartError('Thiếu mã sản phẩm nên chưa thể thêm vào giỏ hàng.')
        setCartOpen(true)
        return
      }

      setCartBusy(true)
      try {
        const addedItem = await apiFetch('/cart', {
          method: 'POST',
          auth: true,
          body: JSON.stringify({
            productId: product.id,
            quantity: 1,
            color: product.colorName || undefined,
            size: product.size || undefined,
          }),
        })
        setCartItems((current) => mergeCartItem(current, addedItem))
        const message = `Đã thêm ${product.name} vào giỏ hàng.`
        setCartNotice(message)
        pushCartLog('add', message)
        setCartOpen(true)
      } catch (error) {
        const message = error.message || 'Không thể thêm sản phẩm vào giỏ hàng.'
        setCartError(message)
        pushCartLog('error', message)
        setCartOpen(true)
      } finally {
        setCartBusy(false)
      }
      return
    }

    addGuestItem(product)
    const message = `Đã thêm ${product.name} vào giỏ hàng khách.`
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
        pushCartLog('update', `Đã cập nhật ${item.name}.`)
      } catch {
        const message = 'Không thể cập nhật số lượng.'
        setCartError(message)
        pushCartLog('error', message)
      } finally {
        setCartBusy(false)
      }
      return
    }

    const nextItems = readGuestCart().map((cartItem) =>
      cartItemKey(cartItem) === cartItemKey(item) ? { ...cartItem, quantity } : cartItem,
    )
    writeGuestCart(nextItems)
    setCartItems(nextItems)
    pushCartLog('update', `Đã cập nhật ${item.name}.`)
  }

  const removeCartItem = async (item) => {
    setCartNotice('')
    setCartError('')

    if (getAuthToken() && Number.isInteger(Number(item.id))) {
      setCartBusy(true)
      try {
        await apiFetch(`/cart/${item.id}`, { method: 'DELETE', auth: true })
        await loadCart()
        const message = `Đã xóa ${item.name}.`
        setCartNotice(message)
        pushCartLog('remove', message)
      } catch {
        const message = 'Không thể xóa sản phẩm.'
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
    const message = `Đã xóa ${item.name}.`
    setCartNotice(message)
    pushCartLog('remove', message)
  }

  const clearCart = async () => {
    setCartNotice('')
    setCartError('')

    if (getAuthToken()) {
      setCartBusy(true)
      try {
        await apiFetch('/cart', { method: 'DELETE', auth: true })
        await loadCart()
        const message = 'Đã xóa giỏ hàng.'
        setCartNotice(message)
        pushCartLog('clear', message)
      } catch {
        const message = 'Không thể xóa giỏ hàng.'
        setCartError(message)
        pushCartLog('error', message)
      } finally {
        setCartBusy(false)
      }
      return
    }

    writeGuestCart([])
    setCartItems([])
    const message = 'Đã xóa giỏ hàng.'
    setCartNotice(message)
    pushCartLog('clear', message)
  }

  useEffect(() => {
    loadCart()
  }, [user])

  useEffect(() => {
    let isMounted = true
    Promise.allSettled([
      apiFetch('/products/filters/brands'),
      apiFetch('/products/filters/colors'),
      apiFetch('/products/filters/sizes'),
      apiFetch('/categories'),
      apiFetch('/settings/homepage'),
    ]).then(([brandResult, colorResult, sizeResult, categoryResult, settingsResult]) => {
      if (!isMounted) return
      setFilterOptions({
        brands: brandResult.status === 'fulfilled' && Array.isArray(brandResult.value) ? brandResult.value : [],
        colors: colorResult.status === 'fulfilled' && Array.isArray(colorResult.value) ? colorResult.value : [],
        sizes: sizeResult.status === 'fulfilled' && Array.isArray(sizeResult.value) ? sizeResult.value : [],
      })
      if (categoryResult.status === 'fulfilled' && Array.isArray(categoryResult.value)) {
        setCategories(categoryResult.value)
      }
      if (settingsResult.status === 'fulfilled' && settingsResult.value) {
        setHomepageSettings(settingsResult.value)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const params = new URLSearchParams({
      limit: '24',
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    })

    if (filters.search.trim()) params.set('search', filters.search.trim())
    if (filters.brand) params.set('brand', filters.brand)
    if (filters.categoryId) params.set('categoryId', filters.categoryId)
    if (filters.color) params.set('color', filters.color)
    if (filters.size) params.set('size', filters.size)
    if (filters.inStock) params.set('inStock', 'true')

    const priceRange = PRICE_RANGES.find((range) => range.key === selectedPriceRange)
    if (priceRange?.minPrice !== undefined) params.set('minPrice', String(priceRange.minPrice))
    if (priceRange?.maxPrice !== undefined) params.set('maxPrice', String(priceRange.maxPrice))

    setCatalogState('loading')
    setCatalogError('')
    apiFetch(`/products?${params.toString()}`)
      .then((result) => {
        if (!isMounted) return
        const mappedProducts = Array.isArray(result?.data) ? result.data.map(mapProductToCar) : []
        setProducts(mappedProducts)
        setCatalogState(mappedProducts.length ? 'ready' : 'empty')
      })
      .catch((error) => {
        if (!isMounted) return
        setProducts([])
        setCatalogError(error.message || 'Không tải được danh mục sản phẩm.')
        setCatalogState('error')
      })

    return () => {
      isMounted = false
    }
  }, [filters, selectedPriceRange])

  const handleGoCheckout = () => {
    setCartOpen(false)
    onGoCheckout()
  }

  return (
    <Box className="car-site parts-page">
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

      <main className="parts-shell">
        <Container maxWidth="xl">
          <section className="parts-hero">
            <Box className="parts-hero-copy">
              <Chip className="scarlet-chip" label="Catalog phụ tùng xe" />
              <Typography component="h1">Kho phụ tùng hiệu năng AEROTEC</Typography>
              <Typography>
                Tìm nhanh theo SKU, brand, fitment và mức giá. Mỗi sản phẩm lấy trực tiếp từ catalog hiện hành để bạn có thể thêm vào giỏ hàng ngay.
              </Typography>
            </Box>
            <Box className="parts-hero-metrics">
              <div>
                <span>Sản phẩm</span>
                <strong>{products.length}</strong>
              </div>
              <div>
                <span>Danh mục</span>
                <strong>{categories.length}</strong>
              </div>
              <div>
                <span>Bộ lọc</span>
                <strong>{activeFilterCount}</strong>
              </div>
            </Box>
          </section>

          <section className="parts-console">
            <label className="parts-search">
              <SearchIcon />
              <input
                value={filters.search}
                onChange={(event) => updateFilter('search', event.target.value)}
                placeholder="Tìm theo tên sản phẩm, brand hoặc SKU..."
              />
            </label>

            <select
              value={selectedSortValue}
              onChange={(event) => {
                const [sortBy, sortOrder] = event.target.value.split(':')
                setFilters((current) => ({ ...current, sortBy, sortOrder }))
              }}
            >
              {inventorySorts.map((sort) => (
                <option value={`${sort.sortBy}:${sort.sortOrder}`} key={sort.label}>{sort.label}</option>
              ))}
            </select>

            <button className={filters.inStock ? 'parts-toggle active' : 'parts-toggle'} type="button" onClick={() => updateFilter('inStock', !filters.inStock)}>
              Còn hàng
            </button>

            <button className="parts-reset" type="button" onClick={resetFilters}>
              <RestartAltIcon />
              Đặt lại
            </button>
          </section>

          <Box className="parts-layout">
            <aside className="parts-filter-panel">
              <Box className="parts-filter-heading">
                <TuneIcon />
                <div>
                  <span>Bộ lọc catalog</span>
                  <strong>{activeFilterCount} đang chọn</strong>
                </div>
              </Box>

              <div className="parts-filter-group">
                <span>Danh mục</span>
                <button className={!filters.categoryId ? 'active' : ''} type="button" onClick={() => updateFilter('categoryId', '')}>Tất cả linh kiện</button>
                {categories.map((category) => (
                  <button
                    className={String(filters.categoryId) === String(category.id) ? 'active' : ''}
                    key={category.id}
                    type="button"
                    onClick={() => updateFilter('categoryId', String(category.id))}
                  >
                    {translateCategory(category.name)}
                  </button>
                ))}
              </div>

              {filterOptions.brands.length > 0 && (
                <div className="parts-filter-group compact">
                  <span>Brand</span>
                  <button className={!filters.brand ? 'active' : ''} type="button" onClick={() => updateFilter('brand', '')}>Tất cả</button>
                  {filterOptions.brands.map((brand) => (
                    <button className={filters.brand === brand ? 'active' : ''} key={brand} type="button" onClick={() => updateFilter('brand', brand)}>{brand}</button>
                  ))}
                </div>
              )}

              <div className="parts-filter-group compact">
                <span>Mức giá</span>
                {PRICE_RANGES.map((range) => (
                  <button className={selectedPriceRange === range.key ? 'active' : ''} key={range.key} type="button" onClick={() => setSelectedPriceRange(range.key)}>
                    {range.label}
                  </button>
                ))}
              </div>

              {filterOptions.colors.length > 0 && (
                <div className="parts-filter-group compact">
                  <span>Màu / Finish</span>
                  <button className={!filters.color ? 'active' : ''} type="button" onClick={() => updateFilter('color', '')}>Tất cả</button>
                  {filterOptions.colors.map((color) => (
                    <button className={filters.color === color ? 'active' : ''} key={color} type="button" onClick={() => updateFilter('color', color)}>{color}</button>
                  ))}
                </div>
              )}

              {filterOptions.sizes.length > 0 && (
                <div className="parts-filter-group compact">
                  <span>Size / Fitment</span>
                  <button className={!filters.size ? 'active' : ''} type="button" onClick={() => updateFilter('size', '')}>Tất cả</button>
                  {filterOptions.sizes.map((size) => (
                    <button className={filters.size === size ? 'active' : ''} key={size} type="button" onClick={() => updateFilter('size', size)}>{size}</button>
                  ))}
                </div>
              )}

              <div className="parts-filter-group compact">
                <span>Vật liệu</span>
                {(homepageSettings?.materialFilters || MATERIAL_FILTERS).map((material) => {
                  const activeKey = material.key || material.searchKey
                  const active = selectedMaterials.includes(activeKey)
                  return (
                    <button
                      className={active ? 'active' : ''}
                      key={activeKey}
                      type="button"
                      onClick={() => setSelectedMaterials((current) => active ? current.filter((item) => item !== activeKey) : [...current, activeKey])}
                    >
                      {material.label}
                    </button>
                  )
                })}
              </div>

              <div className="parts-filter-group compact">
                <span>Hiệu năng</span>
                {PERFORMANCE_FILTERS.map((item) => {
                  const active = selectedPerformance.includes(item.key)
                  return (
                    <button
                      className={active ? 'active' : ''}
                      key={item.key}
                      type="button"
                      onClick={() => setSelectedPerformance((current) => active ? current.filter((value) => value !== item.key) : [...current, item.key])}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </aside>

            <section className="parts-results">
              <Box className="parts-results-head">
                <div>
                  <span>{catalogState === 'loading' ? 'Đang tải' : `${filteredProducts.length} kết quả`}</span>
                  <strong>Danh mục phụ tùng</strong>
                </div>
                <Typography>{catalogError || 'Giá, tồn kho và SKU đang lấy từ catalog hiện hành.'}</Typography>
              </Box>

              {catalogState === 'loading' && (
                <Box className="parts-empty-state">Đang tải danh mục sản phẩm...</Box>
              )}

              {catalogState !== 'loading' && filteredProducts.length === 0 && (
                <Box className="parts-empty-state">
                  Không tìm thấy phụ tùng phù hợp với bộ lọc hiện tại.
                </Box>
              )}

              {filteredProducts.length > 0 && (
                <Box className="parts-grid">
                  {filteredProducts.map((product) => (
                    <article className="parts-card" key={product.id || product.sku || product.name}>
                      <button className="parts-card-media" type="button" onClick={() => onNavigate('product-detail', product)}>
                        {product.image ? <img src={product.image} alt={product.name} /> : <ShoppingCartIcon />}
                        <span>{product.stock > 0 ? `${product.stock} còn hàng` : 'Tạm hết hàng'}</span>
                      </button>
                      <Box className="parts-card-copy">
                        <span>{product.brand} // {product.sku}</span>
                        <Typography component="h2">{product.name}</Typography>
                        <Typography>{product.description || product.gain}</Typography>
                      </Box>
                      <dl className="parts-spec-list">
                        <div>
                          <dt>Fitment</dt>
                          <dd>{product.zero || product.size || 'Theo cấu hình xe'}</dd>
                        </div>
                        <div>
                          <dt>Vật liệu</dt>
                          <dd>{product.material}</dd>
                        </div>
                        <div>
                          <dt>Gain</dt>
                          <dd>{product.gain}</dd>
                        </div>
                      </dl>
                      <Box className="parts-card-actions">
                        <strong>{product.price}</strong>
                        <Button className="parts-detail-btn" onClick={() => onNavigate('product-detail', product)}>Chi tiết</Button>
                        <Button className="parts-cart-btn" onClick={() => addToCart(product)}>Thêm vào giỏ</Button>
                      </Box>
                    </article>
                  ))}
                </Box>
              )}
            </section>
          </Box>
        </Container>
      </main>

      <Footer onNavigate={onNavigate} />

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
