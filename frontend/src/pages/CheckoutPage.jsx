import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { apiFetch } from '../services/apiClient'
import { getAuthToken } from '../services/authToken'
import { formatMoney } from '../utils/helpers'
import { clearGuestCart, getCartItemImage, getCartItemPrice, normalizeCartItems, readGuestCart } from '../utils/cart'

const defaultCheckoutSettings = {
  paymentMethods: { cod: true, card: true, bank_transfer: true },
  shippingFees: { standard: 30000, express: 60000 },
  taxRate: 0.08,
  bankTransfer: {},
}

export default function CheckoutPage({ onGoHome, onGoProfile, onGoOrders }) {
  const checkoutParams = new URLSearchParams(window.location.search)
  const checkoutStatus = checkoutParams.get('checkout')
  const checkoutOrderNumber = checkoutParams.get('order')
  const isAccountCheckout = Boolean(getAuthToken())
  const [cartItems, setCartItems] = useState([])
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState(checkoutStatus === 'cancelled' ? 'Thanh toán Stripe đã bị hủy. Bạn có thể chọn lại phương thức thanh toán và đặt hàng tiếp.' : '')
  const [checkoutSuccess, setCheckoutSuccess] = useState(checkoutStatus === 'success')
  const [createdOrder, setCreatedOrder] = useState(checkoutStatus === 'success' ? {
    orderNumber: checkoutOrderNumber,
    paymentMethod: 'card',
    paymentStatus: 'PAID',
  } : null)

  // Checkout states
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [voucherCodeInput, setVoucherCodeInput] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState(null)
  const [voucherMessage, setVoucherMessage] = useState('')
  const [voucherError, setVoucherError] = useState(false)
  const [checkoutSettings, setCheckoutSettings] = useState(defaultCheckoutSettings)

  // Custom address fields
  const [newAddress, setNewAddress] = useState({
    email: '',
    fullName: '',
    phone: '',
    street: '',
    city: '',
    district: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      if (checkoutStatus === 'success') {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        if (!getAuthToken()) {
          const guestItems = readGuestCart()
          setCartItems(guestItems)
          setAddresses([])
          setSelectedAddressId('new')
          setPaymentMethod('cod')
          return
        }

        const [cartData, addressData, profileData, settingsData] = await Promise.all([
          apiFetch('/cart', { auth: true }),
          apiFetch('/users/addresses', { auth: true }),
          apiFetch('/users/profile', { auth: true }),
          apiFetch('/settings/checkout').catch(() => defaultCheckoutSettings),
        ])
        setCheckoutSettings({ ...defaultCheckoutSettings, ...settingsData })
        setCartItems(normalizeCartItems(cartData))
        const preferredPayment = profileData?.defaultPaymentMethod || 'cod'
        const enabledMethods = { ...defaultCheckoutSettings.paymentMethods, ...(settingsData?.paymentMethods || {}) }
        const nextPayment = enabledMethods[preferredPayment] ? preferredPayment : Object.entries(enabledMethods).find(([, enabled]) => enabled)?.[0] || 'cod'
        setPaymentMethod(['cod', 'card', 'bank_transfer'].includes(nextPayment) ? nextPayment : 'cod')
        const addressList = Array.isArray(addressData) ? addressData : []
        setAddresses(addressList)

        // Select default address if exists, otherwise first address, or 'new'
        const defaultAddr = addressList.find((addr) => addr.isDefault)
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id)
        } else if (addressList.length > 0) {
          setSelectedAddressId(addressList[0].id)
        } else {
          setSelectedAddressId('new')
        }
      } catch {
        setCheckoutError('Không thể tải dữ liệu thanh toán. Vui lòng thử lại.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [checkoutStatus])

  useEffect(() => {
    apiFetch('/settings/checkout')
      .then((settingsData) => setCheckoutSettings({ ...defaultCheckoutSettings, ...settingsData }))
      .catch(() => setCheckoutSettings(defaultCheckoutSettings))
  }, [])

  useEffect(() => {
    if (!isAccountCheckout && paymentMethod === 'card') {
      setPaymentMethod('cod')
    }
  }, [isAccountCheckout, paymentMethod])

  useEffect(() => {
    const enabledMethods = checkoutSettings.paymentMethods || defaultCheckoutSettings.paymentMethods
    if (!enabledMethods[paymentMethod] || (!isAccountCheckout && paymentMethod === 'card')) {
      const fallback = ['cod', 'bank_transfer', 'card'].find((method) => enabledMethods[method] && (isAccountCheckout || method !== 'card'))
      setPaymentMethod(fallback || 'cod')
    }
  }, [checkoutSettings, isAccountCheckout, paymentMethod])

  // Calculate pricing totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = getCartItemPrice(item)
    return sum + price * item.quantity
  }, 0)

  const shippingFee = shippingMethod === 'express'
    ? Number(checkoutSettings.shippingFees?.express ?? 60000)
    : Number(checkoutSettings.shippingFees?.standard ?? 30000)
  const taxRate = Number(checkoutSettings.taxRate ?? 0.08)
  const tax = Math.round(subtotal * taxRate)

  let discount = 0
  if (appliedVoucher) {
    if (appliedVoucher.code === 'AEROTEC10' || appliedVoucher.code === 'DALTA10') {
      discount = Math.round(subtotal * 0.1)
    } else if (appliedVoucher.code === 'FREESHIP') {
      discount = shippingFee
    }
  }

  const total = Math.max(0, subtotal + shippingFee + tax - discount)

  const handleApplyVoucher = () => {
    setVoucherMessage('')
    setVoucherError(false)
    const code = voucherCodeInput.trim().toUpperCase()

    if (!code) {
      setAppliedVoucher(null)
      return
    }

    if (code === 'AEROTEC10' || code === 'DALTA10' || code === 'FREESHIP') {
      setAppliedVoucher({ code, discount: code === 'FREESHIP' ? 'Freeship' : '10%' })
      setVoucherMessage(`Áp dụng mã ${code} thành công!`)
    } else {
      setAppliedVoucher(null)
      setVoucherError(true)
      setVoucherMessage('Mã giảm giá không hợp lệ.')
    }
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setCheckoutError('')

    if (cartItems.length === 0) {
      setCheckoutError('Giỏ hàng trống. Không thể đặt hàng.')
      return
    }

    if (!isAccountCheckout && !newAddress.email.trim()) {
      setCheckoutError('Vui lòng nhập email để nhận thông tin đơn hàng.')
      return
    }

    if (!isAccountCheckout && paymentMethod === 'card') {
      setCheckoutError('Khách vãng lai chưa hỗ trợ Stripe. Vui lòng chọn COD hoặc chuyển khoản ngân hàng.')
      return
    }

    if (!isAccountCheckout) {
      const hasDisconnectedProduct = cartItems.some((item) => {
        const productId = Number(item.productId)
        return !Number.isInteger(productId) || productId <= 0
      })

      if (hasDisconnectedProduct) {
        setCheckoutError('Giỏ hàng có sản phẩm cũ chưa kết nối DB. Vui lòng xóa sản phẩm đó và thêm lại từ tab Phụ Tùng.')
        return
      }
    }

    if (selectedAddressId === 'new') {
      const required = ['fullName', 'phone', 'street', 'city']
      for (const field of required) {
        if (!newAddress[field].trim()) {
          setCheckoutError('Vui lòng điền đầy đủ thông tin địa chỉ giao hàng.')
          return
        }
      }
    }

    setIsSubmitting(true)
    try {
      const payload = {
        shippingMethod,
        paymentMethod,
        voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
      }

      if (selectedAddressId === 'new') {
        const { fullName, phone, street, city, district } = newAddress
        payload.shippingAddress = { fullName, phone, street, city, district }
      } else {
        payload.addressId = Number(selectedAddressId)
      }

      const guestItems = cartItems.map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity || 1),
        selectedColor: item.selectedColor || null,
        selectedSize: item.selectedSize || null,
      }))

      const res = isAccountCheckout
        ? await apiFetch('/orders/checkout', {
            method: 'POST',
            auth: true,
            body: JSON.stringify(payload),
          })
        : await apiFetch('/orders/guest-checkout', {
            method: 'POST',
            body: JSON.stringify({
              ...payload,
              guestEmail: newAddress.email.trim().toLowerCase(),
              items: guestItems,
            }),
          })

      if (paymentMethod === 'card' && res.paymentUrl) {
        // Redirect to Stripe checkout screen
        window.location.href = res.paymentUrl
        return
      }

      // COD checkout success
      setCreatedOrder(res.order || res)
      setCheckoutSuccess(true)
      if (!isAccountCheckout) {
        clearGuestCart()
      }
    } catch (err) {
      setCheckoutError(err.message || 'Đặt hàng thất bại. Vui lòng kiểm tra lại.')
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#050505', color: '#f8fafc' }}>
        <CircularProgress color="error" />
      </Box>
    )
  }

  if (checkoutSuccess) {
    const isBankTransferOrder = createdOrder?.paymentMethod === 'bank_transfer' || createdOrder?.paymentInstruction?.type === 'bank_transfer'
    const statusLabel = isBankTransferOrder
      ? 'ĐANG CHỜ THANH TOÁN'
      : createdOrder?.paymentStatus || 'ĐÃ GHI NHẬN'
    const statusColor = createdOrder?.paymentStatus === 'PAID' ? '#22c55e' : '#fb7185'

    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#050505',
        color: '#f8fafc',
        background: 'radial-gradient(circle at 50% 30%, rgba(225,29,72,0.18), transparent 50%), #050505',
        p: 3
      }}>
        <Box sx={{
          maxWidth: 580,
          width: '100%',
          bgcolor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(248,250,252,0.12)',
          borderRadius: 2,
          p: { xs: 3, md: 5 },
          textAlign: 'center',
          boxShadow: '0 24px 70px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(10px)'
        }}>
          {isBankTransferOrder ? (
            <ErrorOutlineIcon sx={{ fontSize: 80, color: '#fb7185', mb: 2 }} />
          ) : (
            <CheckCircleOutlineIcon sx={{ fontSize: 80, color: '#fb7185', mb: 2 }} />
          )}
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, textTransform: 'uppercase', letterSpacing: 1, color: '#f8fafc' }}>
            {isBankTransferOrder ? 'Đang Chờ Thanh Toán' : 'Đặt Hàng Thành Công!'}
          </Typography>
          <Typography sx={{ color: 'rgba(248,250,252,0.7)', mb: 3 }}>
            {isBankTransferOrder
              ? 'Đơn hàng đã được tạo nhưng chưa hoàn tất thanh toán. Vui lòng chuyển khoản theo thông tin bên dưới để nhân viên đối soát và xử lý đơn.'
              : 'Cảm ơn bạn đã lựa chọn mua sắm tại AEROTEC. Đơn hàng của bạn đã được tiếp nhận.'}
            {!isAccountCheckout ? ` Thông tin đơn hàng sẽ được gửi tới ${newAddress.email}.` : ''}
          </Typography>

          {createdOrder && (
            <Box sx={{ bgcolor: 'rgba(248,250,252,0.04)', borderRadius: 1.5, p: 2.5, mb: 4, textAlign: 'left', border: '1px solid rgba(248,250,252,0.06)', color: '#f8fafc' }}>
              <Typography variant="subtitle2" sx={{ color: '#fb7185', fontWeight: 800, mb: 1.5 }}>CHI TIẾT ĐƠN HÀNG</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ color: 'rgba(248,250,252,0.5)' }}>Mã đơn hàng:</Typography>
                <Typography sx={{ fontWeight: 800, color: '#f8fafc' }}>{createdOrder.orderNumber}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ color: 'rgba(248,250,252,0.5)' }}>Phương thức:</Typography>
                <Typography sx={{ textTransform: 'uppercase', fontWeight: 600, color: '#f8fafc' }}>{createdOrder.paymentMethod}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ color: 'rgba(248,250,252,0.5)' }}>Tổng cộng:</Typography>
                <Typography sx={{ fontWeight: 900, color: '#fb7185' }}>{formatMoney(createdOrder.total)}</Typography>
              </Box>
              {createdOrder.paymentStatus && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: 'rgba(248,250,252,0.5)' }}>Trạng thái thanh toán:</Typography>
                  <Typography sx={{ textTransform: 'uppercase', fontWeight: 700, color: statusColor }}>{statusLabel}</Typography>
                </Box>
              )}
              {createdOrder.paymentInstruction?.type === 'bank_transfer' && (
                <Box sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 1.5,
                  border: '1px solid rgba(225,29,72,0.18)',
                  bgcolor: 'rgba(225,29,72,0.06)'
                }}>
                  <Typography sx={{ color: '#fb7185', fontWeight: 900, mb: 1.5 }}>Thông tin chuyển khoản</Typography>
                  {createdOrder.paymentInstruction.qrUrl && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <Box
                        component="img"
                        src={createdOrder.paymentInstruction.qrUrl}
                        alt="QR chuyển khoản"
                        sx={{ width: 220, maxWidth: '100%', borderRadius: 1, bgcolor: '#fff', p: 1 }}
                      />
                    </Box>
                  )}
                  {[
                    ['Ngân hàng', `${createdOrder.paymentInstruction.bankName} - ${createdOrder.paymentInstruction.bankFullName}`],
                    ['Số tài khoản', createdOrder.paymentInstruction.accountNumber],
                    ['Chủ tài khoản', createdOrder.paymentInstruction.accountName],
                    ['Số tiền', formatMoney(createdOrder.paymentInstruction.amount)],
                    ['Nội dung', createdOrder.paymentInstruction.content],
                  ].map(([label, value]) => (
                    <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                      <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: 13 }}>{label}:</Typography>
                      <Typography sx={{ color: '#f8fafc', fontSize: 13, fontWeight: 800, textAlign: 'right' }}>{value}</Typography>
                    </Box>
                  ))}
                  <Typography sx={{ color: 'rgba(248,250,252,0.56)', fontSize: 12, lineHeight: 1.5, mt: 1.5 }}>
                    Vui lòng chuyển đúng số tiền và nội dung để đơn hàng được đối soát nhanh.
                  </Typography>
                </Box>
              )}
              {createdOrder.shippingAddress && (
                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid rgba(248,250,252,0.08)' }}>
                  <Typography sx={{ color: 'rgba(248,250,252,0.5)', mb: 0.5 }}>Địa chỉ giao hàng:</Typography>
                  <Typography sx={{ fontSize: 13, lineHeight: 1.5, color: '#f8fafc' }}>
                    {createdOrder.shippingAddress.fullName} - {createdOrder.shippingAddress.phone}<br />
                    {createdOrder.shippingAddress.street}, {createdOrder.shippingAddress.city}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              onClick={onGoHome}
              sx={{
                flex: 1,
                minHeight: 48,
                bgcolor: 'transparent',
                color: '#f8fafc',
                border: '1px solid rgba(248,250,252,0.2)',
                fontWeight: 800,
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(248,250,252,0.08)' }
              }}
            >
              Về danh mục
            </Button>
            {isAccountCheckout ? (
              <Button
                onClick={onGoOrders || onGoProfile}
                sx={{
                  flex: 1,
                  minHeight: 48,
                  bgcolor: '#e11d48',
                  color: '#f8fafc',
                  fontWeight: 900,
                  textTransform: 'none',
                  boxShadow: '0 4px 18px rgba(225,29,72,0.3)',
                  '&:hover': { bgcolor: '#f43f5e' }
                }}
              >
                Lịch Sử Đơn Hàng
              </Button>
            ) : (
              <Button
                onClick={onGoHome}
                sx={{
                  flex: 1,
                  minHeight: 48,
                  bgcolor: '#e11d48',
                  color: '#f8fafc',
                  fontWeight: 900,
                  textTransform: 'none',
                  boxShadow: '0 4px 18px rgba(225,29,72,0.3)',
                  '&:hover': { bgcolor: '#f43f5e' }
                }}
              >
                Tiếp Tục Mua Hàng
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#050505',
      color: '#f8fafc',
      background: 'radial-gradient(circle at 80% 20%, rgba(225,29,72,0.08), transparent 35%), #050505',
      pb: 8
    }}>
      {/* Header bar */}
      <Box sx={{ borderBottom: '1px solid rgba(248,250,252,0.08)', bgcolor: 'rgba(5,5,5,0.72)', backdropFilter: 'blur(16px)', sticky: 'top', zIndex: 10 }}>
        <Container maxWidth="xl" sx={{ minHeight: 74, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 950, letterSpacing: 0.5, color: '#f8fafc' }}>AEROTEC</Typography>
            <Typography sx={{ color: '#fb7185', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', mt: 0.5 }}>performance parts</Typography>
          </Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onGoHome}
            sx={{
              color: 'rgba(248,250,252,0.72)',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: 14,
              '&:hover': { color: '#f8fafc' }
            }}
          >
            Quay lại danh mục
          </Button>
        </Container>
      </Box>

      {/* Main container */}
      <Container maxWidth="xl" sx={{ mt: 5 }}>
        <Typography variant="h3" sx={{ fontWeight: 950, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5, color: '#f8fafc' }}>Thanh Toán</Typography>
        <Typography sx={{ color: 'rgba(248,250,252,0.5)', mb: 4 }}>Hoàn tất cấu hình đặt mua phụ tùng hiệu năng cao của bạn.</Typography>

        {checkoutError && (
          <Box sx={{ bgcolor: 'rgba(225,29,72,0.12)', border: '1px solid rgba(225,29,72,0.3)', borderRadius: 1, p: 2, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ErrorOutlineIcon color="error" />
            <Typography color="error" sx={{ fontSize: 14, fontWeight: 700 }}>{checkoutError}</Typography>
          </Box>
        )}

        <form onSubmit={handlePlaceOrder}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' }, gap: 5, alignItems: 'start' }}>
            
            {/* Left Column: Forms */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              
              {/* Delivery address card */}
              <Box className="checkout-card" sx={{
                bgcolor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(248,250,252,0.08)',
                borderRadius: 1.5,
                p: 4
              }}>
                <Chip label="Giao hàng" sx={{ height: 24, bgcolor: 'rgba(225,29,72,0.12)', color: '#fb7185', border: '1px solid rgba(225,29,72,0.3)', fontWeight: 800, mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, color: '#f8fafc' }}>Địa Chỉ Nhận Hàng</Typography>

                {addresses.length > 0 && (
                  <RadioGroup
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    sx={{ gap: 2, mb: 3 }}
                  >
                    {addresses.map((addr) => (
                      <Box
                        key={addr.id}
                        sx={{
                          border: `1px solid ${Number(selectedAddressId) === addr.id ? '#e11d48' : 'rgba(248,250,252,0.08)'}`,
                          bgcolor: Number(selectedAddressId) === addr.id ? 'rgba(225,29,72,0.04)' : 'transparent',
                          borderRadius: 1,
                          p: 2.5,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1.5,
                          transition: '0.2s',
                          '&:hover': { border: `1px solid ${Number(selectedAddressId) === addr.id ? '#e11d48' : 'rgba(248,250,252,0.2)'}` }
                        }}
                        onClick={() => setSelectedAddressId(addr.id)}
                      >
                        <Radio
                          value={addr.id}
                          checked={Number(selectedAddressId) === addr.id}
                          sx={{ p: 0, mt: 0.5, color: 'rgba(248,250,252,0.3)', '&.Mui-checked': { color: '#e11d48' } }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 0.5 }}>
                            <Typography sx={{ fontWeight: 800, color: '#f8fafc' }}>{addr.fullName}</Typography>
                            <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: 13 }}>{addr.phone}</Typography>
                            {addr.isDefault && (
                              <Chip label="Mặc định" size="small" sx={{ height: 18, fontSize: 10, bgcolor: 'rgba(248,250,252,0.1)', color: '#f8fafc', fontWeight: 700 }} />
                            )}
                          </Box>
                          <Typography sx={{ color: 'rgba(248,250,252,0.7)', fontSize: 13, lineHeight: 1.5 }}>
                            {addr.street}, {addr.district ? `${addr.district}, ` : ''}{addr.city}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                    <FormControlLabel
                      value="new"
                      control={<Radio sx={{ color: 'rgba(248,250,252,0.3)', '&.Mui-checked': { color: '#e11d48' } }} />}
                      label="Sử dụng địa chỉ giao hàng khác"
                      sx={{
                        mx: 0,
                        mt: 1,
                        '& .MuiFormControlLabel-label': {
                          color: '#f8fafc',
                          fontWeight: 700,
                          fontSize: 14
                        }
                      }}
                    />
                  </RadioGroup>
                )}

                {(addresses.length === 0 || selectedAddressId === 'new') && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: addresses.length > 0 ? 3 : 0, pt: addresses.length > 0 ? 3 : 0, borderTop: addresses.length > 0 ? '1px solid rgba(248,250,252,0.06)' : 'none' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 14, color: 'rgba(248,250,252,0.6)' }}>
                      {isAccountCheckout ? 'Chi tiết địa chỉ mới:' : 'Thông tin nhận hàng cho khách vãng lai:'}
                    </Typography>
                    {!isAccountCheckout && (
                      <TextField
                        label="Email nhận thông tin đơn hàng"
                        type="email"
                        required
                        value={newAddress.email}
                        onChange={(e) => setNewAddress({ ...newAddress, email: e.target.value })}
                        variant="outlined"
                        fullWidth
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{
                          input: { color: '#f8fafc' },
                          '& .MuiInputLabel-root': { color: 'rgba(248, 250, 252, 0.6)' },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#fb7185' },
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'rgba(248, 250, 252, 0.12)' },
                            '&:hover fieldset': { borderColor: 'rgba(248, 250, 252, 0.3)' },
                            '&.Mui-focused fieldset': { borderColor: '#e11d48' },
                          }
                        }}
                      />
                    )}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                      <TextField
                        label="Họ tên người nhận"
                        required={selectedAddressId === 'new'}
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        variant="outlined"
                        fullWidth
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{
                          input: { color: '#f8fafc' },
                          '& .MuiInputLabel-root': { color: 'rgba(248, 250, 252, 0.6)' },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#fb7185' },
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'rgba(248, 250, 252, 0.12)' },
                            '&:hover fieldset': { borderColor: 'rgba(248, 250, 252, 0.3)' },
                            '&.Mui-focused fieldset': { borderColor: '#e11d48' },
                          }
                        }}
                      />
                      <TextField
                        label="Số điện thoại"
                        required={selectedAddressId === 'new'}
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        variant="outlined"
                        fullWidth
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{
                          input: { color: '#f8fafc' },
                          '& .MuiInputLabel-root': { color: 'rgba(248, 250, 252, 0.6)' },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#fb7185' },
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'rgba(248, 250, 252, 0.12)' },
                            '&:hover fieldset': { borderColor: 'rgba(248, 250, 252, 0.3)' },
                            '&.Mui-focused fieldset': { borderColor: '#e11d48' },
                          }
                        }}
                      />
                    </Box>
                    <TextField
                      label="Địa chỉ (Số nhà, Tên đường)"
                      required={selectedAddressId === 'new'}
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      variant="outlined"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      sx={{
                        input: { color: '#f8fafc' },
                        '& .MuiInputLabel-root': { color: 'rgba(248, 250, 252, 0.6)' },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#fb7185' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'rgba(248, 250, 252, 0.12)' },
                          '&:hover fieldset': { borderColor: 'rgba(248, 250, 252, 0.3)' },
                          '&.Mui-focused fieldset': { borderColor: '#e11d48' },
                        }
                      }}
                    />
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                      <TextField
                        label="Quận/Huyện"
                        value={newAddress.district}
                        onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                        variant="outlined"
                        fullWidth
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{
                          input: { color: '#f8fafc' },
                          '& .MuiInputLabel-root': { color: 'rgba(248, 250, 252, 0.6)' },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#fb7185' },
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'rgba(248, 250, 252, 0.12)' },
                            '&:hover fieldset': { borderColor: 'rgba(248, 250, 252, 0.3)' },
                            '&.Mui-focused fieldset': { borderColor: '#e11d48' },
                          }
                        }}
                      />
                      <TextField
                        label="Thành phố / Tỉnh"
                        required={selectedAddressId === 'new'}
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        variant="outlined"
                        fullWidth
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{
                          input: { color: '#f8fafc' },
                          '& .MuiInputLabel-root': { color: 'rgba(248, 250, 252, 0.6)' },
                          '& .MuiInputLabel-root.Mui-focused': { color: '#fb7185' },
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'rgba(248, 250, 252, 0.12)' },
                            '&:hover fieldset': { borderColor: 'rgba(248, 250, 252, 0.3)' },
                            '&.Mui-focused fieldset': { borderColor: '#e11d48' },
                          }
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Shipping method card */}
              <Box className="checkout-card" sx={{
                bgcolor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(248,250,252,0.08)',
                borderRadius: 1.5,
                p: 4
              }}>
                <Chip label="Vận chuyển" sx={{ height: 24, bgcolor: 'rgba(225,29,72,0.12)', color: '#fb7185', border: '1px solid rgba(225,29,72,0.3)', fontWeight: 800, mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, color: '#f8fafc' }}>Phương Thức Vận Chuyển</Typography>

                <RadioGroup
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  sx={{ gap: 2 }}
                >
                  {[
                    { id: 'standard', title: 'Giao hàng Tiêu chuẩn', price: Number(checkoutSettings.shippingFees?.standard ?? 30000), desc: 'Dự kiến nhận hàng sau 3 - 5 ngày làm việc.' },
                    { id: 'express', title: 'Giao hàng Hỏa tốc', price: Number(checkoutSettings.shippingFees?.express ?? 60000), desc: 'Nhận hàng hỏa tốc trong 1 - 2 ngày làm việc.' }
                  ].map((method) => (
                    <Box
                      key={method.id}
                      sx={{
                        border: `1px solid ${shippingMethod === method.id ? '#e11d48' : 'rgba(248,250,252,0.08)'}`,
                        bgcolor: shippingMethod === method.id ? 'rgba(225,29,72,0.04)' : 'transparent',
                        borderRadius: 1,
                        p: 2.5,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        transition: '0.2s',
                        '&:hover': { border: `1px solid ${shippingMethod === method.id ? '#e11d48' : 'rgba(248,250,252,0.2)'}` }
                      }}
                      onClick={() => setShippingMethod(method.id)}
                    >
                      <Radio
                        value={method.id}
                        checked={shippingMethod === method.id}
                        sx={{ p: 0, mt: 0.5, color: 'rgba(248,250,252,0.3)', '&.Mui-checked': { color: '#e11d48' } }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography sx={{ fontWeight: 800, color: '#f8fafc' }}>{method.title}</Typography>
                          <Typography sx={{ fontWeight: 900, color: '#fb7185' }}>{formatMoney(method.price)}</Typography>
                        </Box>
                        <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: 13 }}>{method.desc}</Typography>
                      </Box>
                    </Box>
                  ))}
                </RadioGroup>
              </Box>

              {/* Payment method card */}
              <Box className="checkout-card" sx={{
                bgcolor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(248,250,252,0.08)',
                borderRadius: 1.5,
                p: 4
              }}>
                <Chip label="Thanh toán" sx={{ height: 24, bgcolor: 'rgba(225,29,72,0.12)', color: '#fb7185', border: '1px solid rgba(225,29,72,0.3)', fontWeight: 800, mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, color: '#f8fafc' }}>Phương Thức Thanh Toán</Typography>

                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  sx={{ gap: 2 }}
                >
                  {[
                    { id: 'card', title: 'Thẻ tín dụng (Stripe)', desc: 'Hỗ trợ thanh toán nhanh chóng bảo mật qua thẻ Visa, Mastercard, AMEX.' },
                    { id: 'cod', title: 'COD (Thanh toán khi nhận hàng)', desc: 'Thanh toán tiền mặt hoặc chuyển khoản trực tiếp khi giao nhận hàng.' },
                    { id: 'bank_transfer', title: 'Chuyển khoản ngân hàng', desc: 'Nhận thông tin tài khoản và mã đơn để chuyển khoản trước khi xử lý.' }
                  ].filter((method) => checkoutSettings.paymentMethods?.[method.id] !== false)
                    .filter((method) => isAccountCheckout || method.id !== 'card').map((method) => (
                    <Box
                      key={method.id}
                      sx={{
                        border: `1px solid ${paymentMethod === method.id ? '#e11d48' : 'rgba(248,250,252,0.08)'}`,
                        bgcolor: paymentMethod === method.id ? 'rgba(225,29,72,0.04)' : 'transparent',
                        borderRadius: 1,
                        p: 2.5,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        transition: '0.2s',
                        '&:hover': { border: `1px solid ${paymentMethod === method.id ? '#e11d48' : 'rgba(248,250,252,0.2)'}` }
                      }}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <Radio
                        value={method.id}
                        checked={paymentMethod === method.id}
                        sx={{ p: 0, mt: 0.5, color: 'rgba(248,250,252,0.3)', '&.Mui-checked': { color: '#e11d48' } }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 800, mb: 0.5, color: '#f8fafc' }}>{method.title}</Typography>
                        <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: 13 }}>{method.desc}</Typography>
                      </Box>
                    </Box>
                  ))}
                </RadioGroup>
                {paymentMethod === 'bank_transfer' && (
                  <Box sx={{
                    mt: 2.5,
                    p: 2.5,
                    borderRadius: 1,
                    bgcolor: 'rgba(225,29,72,0.06)',
                    border: '1px solid rgba(225,29,72,0.18)'
                  }}>
                    <Typography sx={{ fontWeight: 800, color: '#f8fafc', mb: 0.75 }}>Thanh toán chờ xác nhận</Typography>
                    <Typography sx={{ color: 'rgba(248,250,252,0.62)', fontSize: 13, lineHeight: 1.55 }}>
                      Sau khi đặt hàng, dùng mã đơn trong phần xác nhận để chuyển khoản. Nhân viên sẽ đối soát và cập nhật trạng thái thanh toán.
                    </Typography>
                  </Box>
                )}
              </Box>

            </Box>

            {/* Right Column: Order Summary */}
            <Box sx={{
              bgcolor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(248,250,252,0.1)',
              borderRadius: 1.5,
              p: 4,
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              position: 'sticky',
              top: 100
            }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, textTransform: 'uppercase', letterSpacing: 0.5, color: '#fb7185' }}>Tóm Tắt Đơn Hàng</Typography>

              {/* Items list */}
              <Box sx={{ maxHeight: 280, overflowY: 'auto', pr: 1, mb: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {cartItems.map((item) => {
                  const price = getCartItemPrice(item)
                  const image = getCartItemImage(item)
                  return (
                    <Box key={item.id} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Box
                        component="img"
                        src={image || '/images/cars/default.png'}
                        alt={item.name}
                        sx={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 0.5, border: '1px solid rgba(248,250,252,0.08)' }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 800, lineHeight: 1.2, color: '#f8fafc' }}>{item.name}</Typography>
                        <Typography sx={{ fontSize: 11, color: 'rgba(248,250,252,0.5)', mt: 0.5 }}>
                          {[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ') || 'Cấu hình tiêu chuẩn'}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: 'rgba(248,250,252,0.6)', mt: 0.5 }}>
                          {item.quantity} x {formatMoney(price)}
                        </Typography>
                      </Box>
                    </Box>
                  )
                })}
              </Box>

              <Divider sx={{ borderColor: 'rgba(248,250,252,0.08)', mb: 3 }} />

              {/* Voucher input */}
              <Box sx={{ display: 'flex', gap: 1.5, mb: 4 }}>
                <TextField
                  placeholder="Mã giảm giá (AEROTEC10, DALTA10, FREESHIP...)"
                  size="small"
                  value={voucherCodeInput}
                  onChange={(e) => setVoucherCodeInput(e.target.value)}
                  fullWidth
                  sx={{
                    input: { color: '#f8fafc', fontSize: 13, py: 1.2 },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(248, 250, 252, 0.1)' },
                      '&:hover fieldset': { borderColor: 'rgba(248, 250, 252, 0.25)' },
                      '&.Mui-focused fieldset': { borderColor: '#e11d48' }
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleApplyVoucher}
                  sx={{
                    bgcolor: 'rgba(248,250,252,0.08)',
                    color: '#f8fafc',
                    px: 2.5,
                    fontSize: 13,
                    fontWeight: 800,
                    textTransform: 'none',
                    border: '1px solid rgba(248,250,252,0.12)',
                    '&:hover': { bgcolor: 'rgba(248,250,252,0.16)' }
                  }}
                >
                  Áp dụng
                </Button>
              </Box>

              {voucherMessage && (
                <Typography sx={{ fontSize: 12, color: voucherError ? '#f43f5e' : '#fb7185', mt: -3, mb: 3, fontWeight: 700 }}>
                  {voucherMessage}
                </Typography>
              )}

              {/* Invoice details */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: 14 }}>Tạm tính</Typography>
                  <Typography sx={{ fontSize: 14, color: '#f8fafc' }}>{formatMoney(subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: 14 }}>Phí vận chuyển</Typography>
                  <Typography sx={{ fontSize: 14, color: '#f8fafc' }}>{formatMoney(shippingFee)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: 14 }}>Thuế ({Math.round(taxRate * 100)}% VAT)</Typography>
                  <Typography sx={{ fontSize: 14, color: '#f8fafc' }}>{formatMoney(tax)}</Typography>
                </Box>
                {discount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ color: '#fb7185', fontSize: 14, fontWeight: 700 }}>Giảm giá</Typography>
                    <Typography sx={{ color: '#fb7185', fontSize: 14, fontWeight: 800 }}>-{formatMoney(discount)}</Typography>
                  </Box>
                )}
                <Divider sx={{ borderColor: 'rgba(248,250,252,0.06)', my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#f8fafc' }}>Tổng cộng</Typography>
                  <Typography sx={{ fontWeight: 950, fontSize: 24, color: '#fb7185' }}>{formatMoney(total)}</Typography>
                </Box>
              </Box>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isSubmitting || cartItems.length === 0}
                sx={{
                  width: '100%',
                  minHeight: 52,
                  bgcolor: '#e11d48',
                  color: '#f8fafc',
                  fontWeight: 900,
                  fontSize: 15,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  boxShadow: '0 8px 30px rgba(225,29,72,0.35)',
                  '&:hover': { bgcolor: '#f43f5e' },
                  '&.Mui-disabled': { bgcolor: 'rgba(248,250,252,0.08)', color: 'rgba(248,250,252,0.24)', boxShadow: 'none' }
                }}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Đặt mua phụ tùng'}
              </Button>
            </Box>

          </Box>
        </form>
      </Container>
    </Box>
  )
}
