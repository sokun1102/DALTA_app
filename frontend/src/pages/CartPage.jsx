import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteIcon from '@mui/icons-material/Delete'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import ShieldIcon from '@mui/icons-material/Shield'

// Components
import Header from '../components/Header'
import Footer from '../components/Footer'

// Utils & Helpers
import { formatMoney } from '../utils/helpers'
import { cartItemKey, getCartItemImage, getCartItemPrice, getCartItemStock, normalizeCartItems, readGuestCart, writeGuestCart } from '../utils/cart'
import { getAuthToken } from '../services/authToken'
import { apiFetch } from '../services/apiClient'

const RECOMMENDED_PARTS = [
  { id: 1, name: 'Cánh Gió Đuôi Carbon Ép Apex', sku: 'AT-APEX-WING-01', price: '120,000,000 VND', image: '/images/cars/apex-r7.png' },
  { id: 2, name: 'Hệ Thống Ống Xả Titanium Cổ Van Cao Cấp', sku: 'AT-TITAN-EXH-02', price: '280,000,000 VND', image: '/images/cars/vector-gt.png' },
  { id: 3, name: 'Bộ Đĩa Phanh Gốm Carbon Ceramic-Matrix', sku: 'AT-CERAM-BRK-03', price: '350,000,000 VND', image: '/images/cars/nova-x.png' }
]

export default function CartPage({ user, onNavigate, onOpenLogin, onOpenRegister, onOpenProfile, onLogout, onGoCheckout }) {
  const [cartItems, setCartItems] = useState([])
  const [cartNotice, setCartNotice] = useState('')
  const [cartError, setCartError] = useState('')
  const [cartBusy, setCartBusy] = useState(false)
  const cartMode = getAuthToken() ? 'account' : 'guest'
  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)

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
      const items = normalizeCartItems(result)
      setCartItems(items)
      return items
    } catch (error) {
      setCartError(error.message || 'Không thể tải giỏ hàng tài khoản.')
      return []
    } finally {
      setCartBusy(false)
    }
  }

  const updateCartQuantity = async (item, quantity) => {
    setCartNotice('')
    setCartError('')
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
        return
      } catch {
        setCartError('Không thể cập nhật số lượng trong giỏ hàng tài khoản.')
        return
      } finally {
        setCartBusy(false)
      }
    }
    const nextItems = readGuestCart().map((cartItem) =>
      cartItemKey(cartItem) === cartItemKey(item) ? { ...cartItem, quantity: nextQuantity } : cartItem
    )
    writeGuestCart(nextItems)
    setCartItems(nextItems)
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
        return
      } catch {
        setCartError('Không thể xóa sản phẩm khỏi giỏ hàng tài khoản.')
        return
      } finally {
        setCartBusy(false)
      }
    }
    const nextItems = readGuestCart().filter((cartItem) => cartItemKey(cartItem) !== cartItemKey(item))
    writeGuestCart(nextItems)
    setCartItems(nextItems)
  }

  const clearCart = async () => {
    setCartNotice('')
    setCartError('')
    if (getAuthToken()) {
      setCartBusy(true)
      try {
        await apiFetch('/cart', { method: 'DELETE', auth: true })
        setCartItems([])
        return
      } catch {
        setCartError('Không thể xóa giỏ hàng tài khoản.')
        return
      } finally {
        setCartBusy(false)
      }
    }
    localStorage.removeItem('dalta_guest_cart')
    setCartItems([])
  }

  useEffect(() => {
    loadCart()
  }, [user])

  const normalizedCartItems = normalizeCartItems(cartItems)
  const subtotal = normalizedCartItems.reduce((sum, item) => sum + getCartItemPrice(item) * Number(item.quantity || 0), 0)
  const shipping = subtotal > 0 ? 0 : 0 // Free shipping
  const tax = subtotal * 0.1 // 10% VAT
  const total = subtotal + shipping + tax

  return (
    <Box className="car-site">
      <Header
        user={user}
        activeTab=""
        onNavigate={onNavigate}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        cartCount={cartCount}
        onCartClick={() => onNavigate('cart')}
      />

      <Container maxWidth="xl" sx={{ pt: 14, pb: 10, minHeight: '80vh' }}>
        <Box sx={{ mb: 6 }}>
          <Chip label={cartMode === 'account' ? 'ĐÃ ĐỒNG BỘ TÀI KHOẢN' : 'PHIÊN KHÁCH TRÊN TRÌNH DUYỆT'} sx={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e', fontWeight: 900, mb: 2 }} />
          <Typography variant="h2" sx={{ fontWeight: 950, color: '#fff', fontSize: { md: '48px', xs: '32px' }, mb: 2, fontFamily: 'Be Vietnam Pro' }}>
            Chi Tiết Giỏ Hàng
          </Typography>
          <Typography sx={{ color: 'rgba(248, 250, 252, 0.5)', maxWidth: '640px', fontSize: '15px', fontFamily: 'Plus Jakarta Sans', lineHeight: 1.6 }}>
            Kiểm tra các phụ tùng xe đua, điều chỉnh số lượng và xác minh kết nối bảo mật trước khi thanh toán.
          </Typography>
        </Box>

        {cartNotice && <Typography className="cart-message success" sx={{ mb: 3 }}>{cartNotice}</Typography>}
        {cartError && <Typography className="cart-message error" sx={{ mb: 3 }}>{cartError}</Typography>}
        {cartBusy && <Typography className="cart-message info" sx={{ mb: 3 }}>Đang đồng bộ kho lưu trữ phụ tùng...</Typography>}

        {normalizedCartItems.length === 0 ? (
          <Box className="glow-card-premium" sx={{ p: 8, textAlign: 'center', background: 'rgba(5,5,5,0.7)', border: '1px solid rgba(244,63,94,0.15) !important' }}>
            <ShoppingCartIcon sx={{ fontSize: '64px', color: 'rgba(248,250,252,0.15)', mb: 3 }} />
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, mb: 1, fontFamily: 'Be Vietnam Pro' }}>
              Giỏ hàng của bạn đang trống
            </Typography>
            <Typography sx={{ color: 'rgba(248,250,252,0.4)', mb: 4, fontFamily: 'Plus Jakarta Sans' }}>
              Chọn các phụ tùng khí động học carbon hoặc động cơ titanium từ danh mục của chúng tôi.
            </Typography>
            <Button className="gradient-btn-rose-orange" style={{ borderRadius: '99px', padding: '12px 36px', fontWeight: 900 }} onClick={() => onNavigate('parts')}>
              QUAY LẠI DANH MỤC PHỤ TÙNG
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { lg: '1.2fr 0.8fr', xs: '1fr' }, gap: 6 }}>
            {/* LEFT COLUMN: LIST OF ITEMS */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {normalizedCartItems.map((item) => (
                <Box
                  key={item.id}
                  className="glow-card-premium"
                  sx={{
                    p: 3,
                    background: 'rgba(5,5,5,0.65)',
                    border: '1px solid rgba(248,250,252,0.06)',
                    display: 'flex',
                    flexDirection: { sm: 'row', xs: 'column' },
                    alignItems: 'center',
                    gap: 3
                  }}
                >
                  <Box
                    sx={{
                      width: '90px',
                      height: '90px',
                      background: 'rgba(0,0,0,0.4)',
                      borderRadius: '8px',
                      border: '1px solid rgba(248,250,252,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                  >
                    {getCartItemImage(item) ? (
                      <img src={getCartItemImage(item)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <ShoppingCartIcon sx={{ color: 'rgba(248,250,252,0.2)' }} />
                    )}
                  </Box>

                  <Box sx={{ flexGrow: 1, textAlign: { sm: 'left', xs: 'center' } }}>
                    <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '16px', fontFamily: 'Be Vietnam Pro' }}>
                      {item.name}
                    </Typography>
                    <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'rgba(248, 250, 252, 0.45)', my: 0.5 }}>
                      SKU: {item.sku || `AT-PART-${item.productId || item.id}`}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: 'rgba(248, 250, 252, 0.55)', fontFamily: 'Plus Jakarta Sans' }}>
                      {[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ') || 'Cấu hình đường đua tiêu chuẩn'}
                    </Typography>
                    <Typography sx={{ color: '#fb7185', fontWeight: 950, fontSize: '14px', fontFamily: 'JetBrains Mono', mt: 1 }}>
                      {formatMoney(getCartItemPrice(item))}
                    </Typography>
                    {item.stock !== null && (
                      <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: 'rgba(248, 250, 252, 0.45)', mt: 0.5 }}>
                        Còn {item.stock} sản phẩm
                      </Typography>
                    )}
                  </Box>

                  {/* Quantity Stepper */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(248,250,252,0.08)', borderRadius: '99px', p: '2px 8px' }}>
                    <IconButton
                      size="small"
                      disabled={cartBusy}
                      onClick={() => updateCartQuantity(item, Math.max(1, item.quantity - 1))}
                      sx={{ color: '#fff', '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' } }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px', fontFamily: 'JetBrains Mono' }}>{item.quantity}</span>
                    <IconButton
                      size="small"
                      disabled={cartBusy || (item.stock !== null && Number(item.quantity || 0) >= Number(item.stock))}
                      onClick={() => updateCartQuantity(item, item.quantity + 1)}
                      sx={{ color: '#fff', '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' } }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Remove Button */}
                  <IconButton
                    disabled={cartBusy}
                    onClick={() => removeCartItem(item)}
                    sx={{ color: 'rgba(248,250,252,0.4)', '&:hover': { color: '#f43f5e' } }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>

            {/* RIGHT COLUMN: BREAKDOWN & SUMMARY */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Box className="glow-card-premium" sx={{ p: 4, background: 'rgba(5,5,5,0.7)', border: '1px solid rgba(244,63,94,0.15) !important' }}>
                <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#fb7185', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid rgba(248,250,252,0.08)', pb: 1, mb: 3 }}>
                  THÔNG SỐ GIÁ TRỊ ĐƠN HÀNG
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(248,250,252,0.06)', pb: 1 }}>
                    <Typography sx={{ color: 'rgba(248,250,252,0.6)', fontSize: '14px', fontFamily: 'Plus Jakarta Sans' }}>Tổng tiền hàng</Typography>
                    <Typography sx={{ color: '#fff', fontWeight: 800, fontFamily: 'JetBrains Mono', fontSize: '14px' }}>{formatMoney(subtotal)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(248,250,252,0.06)', pb: 1 }}>
                    <Typography sx={{ color: 'rgba(248,250,252,0.6)', fontSize: '14px', fontFamily: 'Plus Jakarta Sans' }}>Vận chuyển Hỏa tốc</Typography>
                    <Typography sx={{ color: '#22c55e', fontWeight: 800, fontFamily: 'JetBrains Mono', fontSize: '14px' }}>MIỄN PHÍ</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(248,250,252,0.06)', pb: 1 }}>
                    <Typography sx={{ color: 'rgba(248,250,252,0.6)', fontSize: '14px', fontFamily: 'Plus Jakarta Sans' }}>Thuế VAT ước tính (10%)</Typography>
                    <Typography sx={{ color: '#fff', fontWeight: 800, fontFamily: 'JetBrains Mono', fontSize: '14px' }}>{formatMoney(tax)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                    <Typography sx={{ color: '#fff', fontWeight: 950, fontSize: '16px', fontFamily: 'Be Vietnam Pro' }}>Tổng thanh toán</Typography>
                    <Typography sx={{ color: '#fb7185', fontWeight: 950, fontFamily: 'JetBrains Mono', fontSize: '18px' }}>{formatMoney(total)}</Typography>
                  </Box>
                </Box>

                <Button
                  className="gradient-btn-rose-orange"
                  disabled={cartBusy}
                  sx={{ width: '100%', py: 1.8, borderRadius: '99px', fontWeight: 950, fontSize: '15px', letterSpacing: '1.5px', textTransform: 'uppercase', mb: 2 }}
                  onClick={onGoCheckout}
                >
                  TIẾN HÀNH THANH TOÁN BẢO MẬT
                </Button>

                <Button
                  className="outline-button"
                  disabled={cartBusy}
                  sx={{ width: '100%', py: 1.2, borderRadius: '99px', fontWeight: 900, fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(248,250,252,0.5)', borderColor: 'rgba(248,250,252,0.1)' }}
                  onClick={clearCart}
                >
                  XÓA SẠCH GIỎ HÀNG
                </Button>
              </Box>

              {/* SSL SECURE TERMINAL STREAM */}
              <Box className="glow-card-premium" sx={{ p: 3, background: 'rgba(5,5,5,0.7)', border: '1px solid rgba(248,250,252,0.06)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <ShieldIcon sx={{ fontSize: '16px', color: '#22c55e' }} />
                  <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#22c55e', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                    SECURE SSL DEPLOYMENT: ONLINE
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '8.5px', color: 'rgba(248,250,252,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    [SSL-OK] ESTABLISHED 256-BIT CRYPTO TUNNEL
                  </Typography>
                  <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '8.5px', color: 'rgba(248,250,252,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    [GATEWAY] SYNCING PAYMENT INTERACTION KEYS
                  </Typography>
                  <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '8.5px', color: 'rgba(248,250,252,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    [COMPLY] PCI-DSS LAYER VERIFIED // NO LOCAL LOGS
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* RECOMMENDED COMPATIBLE UPGRADES */}
        <Box sx={{ mt: 10, borderTop: '1px solid rgba(248,250,252,0.06)', pt: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', fontSize: '28px', mb: 1, fontFamily: 'Be Vietnam Pro' }}>
            Phụ Kiện Khuyên Dùng
          </Typography>
          <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '12px', fontFamily: 'JetBrains Mono', mb: 5, letterSpacing: '1px', textTransform: 'uppercase' }}>
            GỢI Ý PHÙ HỢP TỪ XƯỞNG CHẾ TẠO // THIẾT KẾ ĐỒNG BỘ
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { md: 'repeat(3, 1fr)', sm: '1fr' }, gap: 4 }}>
            {RECOMMENDED_PARTS.map((part) => (
              <Box
                key={part.id}
                className="glow-card-premium"
                sx={{
                  p: 3,
                  background: 'rgba(10, 10, 10, 0.5)',
                  border: '1px solid rgba(248, 250, 252, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 3,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'rgba(244, 63, 94, 0.3)',
                    transform: 'translateY(-4px)'
                  }
                }}
                onClick={() => onNavigate('parts')}
              >
                <Box>
                  <Box
                    sx={{
                      height: '140px',
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      mb: 2
                    }}
                  >
                    <img src={part.image} alt={part.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                  </Box>
                  <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '15px', fontFamily: 'Be Vietnam Pro' }}>
                    {part.name}
                  </Typography>
                  <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '9.5px', color: 'rgba(248, 250, 252, 0.4)', mt: 0.5 }}>
                    SKU: {part.sku}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.5, borderTop: '1px solid rgba(248,250,252,0.06)' }}>
                  <Typography sx={{ color: '#fb7185', fontWeight: 950, fontSize: '13px', fontFamily: 'JetBrains Mono' }}>
                    {part.price}
                  </Typography>
                  <span style={{ fontSize: '11px', color: '#fb7185', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    XEM CHI TIẾT &rarr;
                  </span>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>

      <Footer onNavigate={onNavigate} />
    </Box>
  )
}
