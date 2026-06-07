import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import EmailIcon from '@mui/icons-material/Email'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PhoneIcon from '@mui/icons-material/Phone'
import SendIcon from '@mui/icons-material/Send'

// Components
import Header from '../components/Header'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'

// Utils & Helpers
import { clearGuestCart, normalizeCartItems, readGuestCart, writeGuestCart, cartItemKey } from '../utils/cart'
import { getAuthToken } from '../services/authToken'
import { apiFetch } from '../services/apiClient'

export default function ContactPage({ user, onNavigate, onOpenLogin, onOpenRegister, onOpenProfile, onLogout, onGoCheckout }) {
  // Support Request States
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [ticketId, setTicketId] = useState('')

  // Shopping Cart States
  const [cartOpen, setCartOpen] = useState(false)
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
    if (user?.email) {
      setEmail(user.email)
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitSuccess(false)

    if (!fullName.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setSubmitError('Vui lòng nhập đầy đủ các trường thông tin.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await apiFetch('/settings/support-request', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          email,
          subject,
          message,
        }),
      })

      if (response && response.id) {
        setTicketId(response.id)
        setSubmitSuccess(true)
        setFullName('')
        setSubject('')
        setMessage('')
      } else {
        throw new Error('Gửi yêu cầu không thành công')
      }
    } catch (err) {
      setSubmitError(err.message || 'Có lỗi xảy ra trong quá trình gửi yêu cầu hỗ trợ.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box className="car-site">
      <Header
        user={user}
        activeTab="contact"
        onNavigate={onNavigate}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        cartCount={cartCount}
        onCartClick={() => onNavigate('cart')}
      />

      <Box sx={{ pt: 14, pb: 10 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1.1fr 0.9fr', xs: '1fr' }, gap: 6 }}>
            {/* Left: Contact Form */}
            <Box
              sx={{
                background: 'rgba(10, 10, 10, 0.6)',
                border: '1px solid rgba(251, 113, 133, 0.15)', // Aerotec glowing rose border
                borderRadius: '16px',
                padding: { md: 5, xs: 3 },
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              }}
            >
              <Chip label="BỘ PHẬN CHĂM SÓC KHÁCH HÀNG" sx={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e', fontWeight: 900, mb: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', fontSize: { md: '38px', xs: '28px' }, mb: 1, fontFamily: 'Be Vietnam Pro' }}>
                Liên Hệ & Hỗ Trợ Kỹ Thuật
              </Typography>
              <Typography sx={{ color: 'rgba(248, 250, 252, 0.5)', fontSize: '14px', fontFamily: 'Plus Jakarta Sans', mb: 4 }}>
                Điền thông tin vào biểu mẫu dưới đây, đội ngũ hỗ trợ kỹ thuật của chúng tôi sẽ phản hồi và xử lý yêu cầu của bạn sớm nhất có thể.
              </Typography>

              {submitSuccess && (
                <Alert severity="success" sx={{ mb: 4, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', fontFamily: 'Plus Jakarta Sans' }}>
                  Yêu cầu hỗ trợ của bạn đã được gửi đi thành công! Mã ticket của bạn là <strong>#{ticketId}</strong>. Một email xác nhận đã được gửi về tài khoản <strong>{email}</strong>.
                </Alert>
              )}

              {submitError && (
                <Alert severity="error" sx={{ mb: 4, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', fontFamily: 'Plus Jakarta Sans' }}>
                  {submitError}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr', xs: '1fr' }, gap: 3, mb: 3 }}>
                  <TextField
                    label="Họ tên của bạn"
                    variant="outlined"
                    fullWidth
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isSubmitting}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#fff',
                        fontFamily: 'Plus Jakarta Sans',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                        '&:hover fieldset': { borderColor: '#fb7185' },
                        '&.Mui-focused fieldset': { borderColor: '#f43f5e' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)', fontFamily: 'Plus Jakarta Sans' },
                    }}
                  />
                  <TextField
                    label="Địa chỉ Email"
                    type="email"
                    variant="outlined"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#fff',
                        fontFamily: 'Plus Jakarta Sans',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                        '&:hover fieldset': { borderColor: '#fb7185' },
                        '&.Mui-focused fieldset': { borderColor: '#f43f5e' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)', fontFamily: 'Plus Jakarta Sans' },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <TextField
                    label="Tiêu đề yêu cầu hỗ trợ"
                    variant="outlined"
                    fullWidth
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isSubmitting}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#fff',
                        fontFamily: 'Plus Jakarta Sans',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                        '&:hover fieldset': { borderColor: '#fb7185' },
                        '&.Mui-focused fieldset': { borderColor: '#f43f5e' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)', fontFamily: 'Plus Jakarta Sans' },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 4 }}>
                  <TextField
                    label="Chi tiết nội dung tin nhắn / câu hỏi kỹ thuật"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSubmitting}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#fff',
                        fontFamily: 'Plus Jakarta Sans',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                        '&:hover fieldset': { borderColor: '#fb7185' },
                        '&.Mui-focused fieldset': { borderColor: '#f43f5e' },
                      },
                      '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.4)', fontFamily: 'Plus Jakarta Sans' },
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isSubmitting}
                  endIcon={isSubmitting ? null : <SendIcon />}
                  sx={{
                    background: 'linear-gradient(90deg, #f43f5e, #f97316)',
                    color: '#white',
                    fontWeight: 900,
                    padding: '12px 0',
                    fontFamily: 'JetBrains Mono',
                    letterSpacing: '1px',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 14px rgba(244, 63, 94, 0.4)',
                    '&:hover': {
                      boxShadow: '0 6px 20px rgba(244, 63, 94, 0.6)',
                      transform: 'translateY(-1px)',
                    },
                    '&.Mui-disabled': {
                      background: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.3)',
                    }
                  }}
                >
                  {isSubmitting ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'GỬI YÊU CẦU HỖ TRỢ'}
                </Button>
              </form>
            </Box>

            {/* Right: Contact Information & Details */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Lab info */}
              <Box
                sx={{
                  background: 'rgba(15, 15, 15, 0.4)',
                  border: '1px solid rgba(248, 250, 252, 0.05)',
                  borderRadius: '16px',
                  padding: 4,
                }}
              >
                <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#fb7185', mb: 2, fontWeight: 'bold' }}>
                  XƯỞNG CHẾ TẠO AEROTEC //
                </Typography>
                <Typography sx={{ color: '#fff', fontWeight: 800, fontFamily: 'Be Vietnam Pro', mb: 3, fontSize: '18px' }}>
                  Thông Tin Liên Hệ Trực Tiếp
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <LocationOnIcon sx={{ color: '#f43f5e', mt: 0.3 }} />
                    <Box>
                      <Typography sx={{ color: '#fff', fontSize: '14px', fontWeight: 700, fontFamily: 'Plus Jakarta Sans' }}>Địa chỉ xưởng</Typography>
                      <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px', fontFamily: 'Plus Jakarta Sans', mt: 0.5 }}>
                        Đại lộ Gangnam, Seoul, Hàn Quốc
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <EmailIcon sx={{ color: '#f43f5e', mt: 0.3 }} />
                    <Box>
                      <Typography sx={{ color: '#fff', fontSize: '14px', fontWeight: 700, fontFamily: 'Plus Jakarta Sans' }}>Địa chỉ Email</Typography>
                      <Typography sx={{ color: '#fb7185', fontSize: '13px', fontFamily: 'JetBrains Mono', mt: 0.5 }}>
                        contact@aerotec.io
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <PhoneIcon sx={{ color: '#f43f5e', mt: 0.3 }} />
                    <Box>
                      <Typography sx={{ color: '#fff', fontSize: '14px', fontWeight: 700, fontFamily: 'Plus Jakarta Sans' }}>Điện thoại đường dây nóng</Typography>
                      <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px', fontFamily: 'JetBrains Mono', mt: 0.5 }}>
                        +82 2 1234 5678
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Service SLA info */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.08), rgba(249, 115, 22, 0.03))',
                  border: '1px solid rgba(248, 250, 252, 0.05)',
                  borderRadius: '16px',
                  padding: 4,
                }}
              >
                <Typography sx={{ color: '#fff', fontWeight: 800, fontFamily: 'Be Vietnam Pro', mb: 2, fontSize: '16px' }}>
                  Cam Kết Thời Gian Phản Hồi (SLA)
                </Typography>
                <Typography sx={{ color: 'rgba(248,250,252,0.6)', fontSize: '13px', fontFamily: 'Plus Jakarta Sans', lineHeight: 1.7 }}>
                  Mọi ticket gửi đến bộ phận CSKH sẽ được phân loại tự động và chuyển trực tiếp đến kỹ sư chuyên trách. Chúng tôi cam kết phản hồi trong vòng **24 giờ làm việc** đối với các thắc mắc chung và tối đa **12 giờ** đối với các vấn đề kỹ thuật liên quan đến lắp đặt cơ khí hầm gió và telemetry phụ tùng đua xe.
                </Typography>
              </Box>
            </Box>
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
