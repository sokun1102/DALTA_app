import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

// Components
import Header from '../components/Header'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'

// Utils & Helpers
import { clearGuestCart, normalizeCartItems, readGuestCart, writeGuestCart, cartItemKey } from '../utils/cart'
import { getAuthToken } from '../services/authToken'
import { apiFetch } from '../services/apiClient'
import { ARTICLES_DATA } from '../utils/constants'

export default function ArticlesPage({ user, onNavigate, onOpenLogin, onOpenRegister, onOpenProfile, onLogout, onGoCheckout }) {
  // Shopping Cart States
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [cartNotice, setCartNotice] = useState('')
  const [cartError, setCartError] = useState('')
  const [cartBusy, setCartBusy] = useState(false)
  const [articles, setArticles] = useState(ARTICLES_DATA)
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
    if (getAuthToken() && Number.isInteger(Number(item.id))) {
      setCartBusy(true)
      try {
        await apiFetch(`/cart/${item.id}`, {
          method: 'PUT',
          auth: true,
          body: JSON.stringify({ quantity }),
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
      cartItemKey(cartItem) === cartItemKey(item) ? { ...cartItem, quantity } : cartItem
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
    clearGuestCart()
    setCartItems([])
  }

  useEffect(() => {
    loadCart()
  }, [user])

  useEffect(() => {
    apiFetch('/articles')
      .then((data) => setArticles(Array.isArray(data) && data.length ? data : ARTICLES_DATA))
      .catch(() => setArticles(ARTICLES_DATA))
  }, [])

  return (
    <Box className="car-site">
      <Header
        user={user}
        activeTab="articles"
        onNavigate={onNavigate}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        cartCount={cartCount}
        onCartClick={() => onNavigate('cart')}
      />

      <Box sx={{ pt: 14, pb: 10, minHeight: '80vh' }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Chip label="Ấn Bản Kỹ Thuật" sx={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e', fontWeight: 900, mb: 2 }} />
            <Typography variant="h2" sx={{ fontWeight: 950, color: '#fff', fontSize: { md: '48px', xs: '32px' }, mb: 2, fontFamily: 'Be Vietnam Pro' }}>
              Nghiên Cứu Khí Động Học & Motorsports
            </Typography>
            <Typography sx={{ color: 'rgba(248, 250, 252, 0.5)', maxWidth: '640px', mx: 'auto', fontSize: '15px', fontFamily: 'Plus Jakarta Sans', lineHeight: 1.6 }}>
              Bộ sưu tập các báo cáo kỹ thuật, thông tin thực nghiệm và báo cáo chuyên sâu về cơ học và khí động học của các phụ tùng AEROTEC.
            </Typography>
          </Box>

          {/* ARTICLES GRID */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { md: 'repeat(3, 1fr)', sm: '1fr' }, gap: 4 }}>
            {articles.map((article) => (
              <Box
                key={article.id}
                sx={{
                  background: 'rgba(10, 10, 10, 0.65)',
                  border: '1px solid rgba(248, 250, 252, 0.06)',
                  borderRadius: '16px',
                  padding: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'rgba(244, 63, 94, 0.3)',
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)'
                  }
                }}
                onClick={() => onNavigate('article-detail', { id: article.id })}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: '#fb7185', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {article.category}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'rgba(248, 250, 252, 0.4)' }}>
                      {article.readTime}
                    </span>
                  </Box>
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900, fontFamily: 'Be Vietnam Pro', mb: 2, fontSize: '20px', lineHeight: 1.3 }}>
                    {article.title}
                  </Typography>
                  <Typography sx={{ color: 'rgba(248, 250, 252, 0.58)', fontSize: '13px', fontFamily: 'Plus Jakarta Sans', lineHeight: 1.6, mb: 3 }}>
                    {article.synopsis}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(248,250,252,0.06)', pt: 2 }}>
                  <span style={{ fontSize: '11px', color: 'rgba(248, 250, 252, 0.4)', fontWeight: 'bold' }}>{article.date}</span>
                  <span style={{ fontSize: '12px', color: '#fb7185', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ĐỌC BÁO CÁO &rarr;</span>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

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
        onGoCheckout={() => {
          setCartOpen(false)
          onGoCheckout()
        }}
      />
    </Box>
  )
}
