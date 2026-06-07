import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import LocalShippingIcon from '@mui/icons-material/LocalShippingOutlined'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongOutlined'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { apiFetch } from '../services/apiClient'
import { getAuthToken } from '../services/authToken'
import { formatMoney } from '../utils/helpers'

const statusMeta = {
  PENDING: { label: 'Chờ xác nhận', color: '#fb7185', tone: 'rgba(251,113,133,0.12)' },
  PROCESSING: { label: 'Đang xử lý', color: '#38bdf8', tone: 'rgba(56,189,248,0.12)' },
  SHIPPING: { label: 'Đang giao', color: '#f97316', tone: 'rgba(249,115,22,0.12)' },
  DELIVERED: { label: 'Đã giao', color: '#22c55e', tone: 'rgba(34,197,94,0.12)' },
  CANCELLED: { label: 'Đã hủy', color: '#94a3b8', tone: 'rgba(148,163,184,0.12)' },
}

const paymentLabels = {
  cod: 'COD',
  card: 'Stripe/card',
  stripe: 'Stripe/card',
  bank_transfer: 'Chuyển khoản ngân hàng',
}

const shippingLabels = {
  standard: 'Giao hàng tiêu chuẩn',
  express: 'Giao hàng hỏa tốc',
}

function getStatusMeta(status) {
  return statusMeta[status] || { label: status || 'Không rõ', color: '#f8fafc', tone: 'rgba(248,250,252,0.08)' }
}

function formatDate(value) {
  if (!value) return 'Không có ngày'
  return new Date(value).toLocaleString('vi-VN')
}

function paymentLabel(method) {
  return paymentLabels[method] || method || 'Chưa rõ'
}

function shippingLabel(method) {
  return shippingLabels[method] || method || 'Chưa rõ'
}

function orderItemKey(item) {
  return `${item.id || item.productId}-${item.selectedColor || 'color'}-${item.selectedSize || 'size'}`
}

function OrderItems({ items = [], compact = false }) {
  if (!items.length) {
    return <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: 14 }}>Đơn hàng chưa có dữ liệu sản phẩm.</Typography>
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
      {items.map((item) => (
        <Box key={orderItemKey(item)} sx={{ display: 'flex', gap: 1.5, alignItems: 'center', minWidth: 0 }}>
          <Box
            component="img"
            src={item.productImage || '/images/cars/default.png'}
            alt={item.productName || 'Sản phẩm'}
            sx={{
              width: compact ? 74 : 68,
              height: compact ? 54 : 46,
              objectFit: 'cover',
              borderRadius: 0.75,
              border: '1px solid rgba(248,250,252,0.1)',
              bgcolor: 'rgba(248,250,252,0.06)',
              flexShrink: 0,
            }}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 850, fontSize: compact ? 14 : 13, color: '#f8fafc', lineHeight: 1.25 }}>
              {item.productName || 'Sản phẩm'}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'rgba(248,250,252,0.48)', mt: 0.4 }}>
              {[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ') || 'Cấu hình tiêu chuẩn'}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'rgba(248,250,252,0.62)', mt: 0.4 }}>
              {Number(item.quantity || 1)} x {formatMoney(item.price)} = {formatMoney(item.lineTotal || Number(item.price || 0) * Number(item.quantity || 1))}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  )
}

export default function OrdersPage({ user, onNavigate, onOpenLogin, onOpenRegister, onOpenProfile, onLogout }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelReason, setCancelReason] = useState('')

  const stats = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc.total += 1
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      },
      { total: 0 },
    )
  }, [orders])

  const loadOrders = async () => {
    if (!getAuthToken()) {
      setLoading(false)
      setOrders([])
      setError('Vui lòng đăng nhập để xem lịch sử đơn hàng.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await apiFetch('/orders', { auth: true })
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Không thể tải lịch sử đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const openCancelDialog = (order) => {
    setSelectedOrder(null)
    setCancelTarget(order)
    setCancelReason('')
    setError('')
    setNotice('')
  }

  const closeCancelDialog = () => {
    if (busyId) return
    setCancelTarget(null)
    setCancelReason('')
  }

  const submitCancel = async () => {
    const reason = cancelReason.trim()
    if (reason.length < 5) {
      setError('Vui lòng nhập lý do hủy đơn ít nhất 5 ký tự.')
      return
    }

    setBusyId(cancelTarget.id)
    setNotice('')
    setError('')
    try {
      await apiFetch(`/orders/${cancelTarget.id}/cancel`, {
        method: 'POST',
        auth: true,
        body: JSON.stringify({ reason }),
      })
      setNotice(`Đã hủy đơn hàng #${cancelTarget.orderNumber || cancelTarget.id}.`)
      setCancelTarget(null)
      setCancelReason('')
      await loadOrders()
    } catch (err) {
      setError(err.message || 'Không thể hủy đơn hàng.')
    } finally {
      setBusyId(null)
    }
  }

  const deleteHistory = async (order) => {
    const ok = window.confirm(`Xóa đơn hàng #${order.orderNumber || order.id} khỏi lịch sử của bạn?`)
    if (!ok) return

    setBusyId(order.id)
    setNotice('')
    setError('')
    try {
      await apiFetch(`/orders/${order.id}/history`, { method: 'DELETE', auth: true })
      setNotice(`Đã xóa đơn hàng #${order.orderNumber || order.id} khỏi lịch sử.`)
      if (selectedOrder?.id === order.id) setSelectedOrder(null)
      await loadOrders()
    } catch (err) {
      setError(err.message || 'Chỉ có thể xóa lịch sử với đơn đã giao hoặc đã hủy.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#050505', color: '#f8fafc' }}>
      <Header
        user={user}
        activeTab="orders"
        onNavigate={onNavigate}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onCartClick={() => onNavigate('cart')}
      />

      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 7 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '0.78fr 1.22fr' }, gap: { xs: 3, lg: 4 }, alignItems: 'start' }}>
          <Box sx={{ position: { lg: 'sticky' }, top: { lg: 96 } }}>
            <Chip label="Đơn hàng" sx={{ bgcolor: 'rgba(225,29,72,0.12)', color: '#fb7185', border: '1px solid rgba(225,29,72,0.3)', fontWeight: 900, mb: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 950, letterSpacing: 0, color: '#fff', mb: 1 }}>
              Lịch Sử Mua Hàng
            </Typography>
            <Typography sx={{ color: 'rgba(248,250,252,0.58)', lineHeight: 1.7, maxWidth: 560 }}>
              Xem lại sản phẩm đã đặt, theo dõi trạng thái đơn hàng, hủy đơn khi còn chờ xác nhận và dọn bớt lịch sử sau khi đơn đã hoàn tất.
            </Typography>

            <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5 }}>
              {[
                { label: 'Tất cả', value: stats.total },
                { label: 'Chờ xác nhận', value: stats.PENDING || 0 },
                { label: 'Đang giao', value: stats.SHIPPING || 0 },
                { label: 'Đã giao', value: stats.DELIVERED || 0 },
              ].map((item) => (
                <Box key={item.label} sx={{ border: '1px solid rgba(248,250,252,0.1)', bgcolor: 'rgba(248,250,252,0.03)', borderRadius: 1, p: 2 }}>
                  <Typography sx={{ color: 'rgba(248,250,252,0.48)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 800 }}>
                    {item.label}
                  </Typography>
                  <Typography sx={{ fontSize: 28, fontWeight: 950, color: '#f8fafc', lineHeight: 1.1, mt: 0.75 }}>{item.value}</Typography>
                </Box>
              ))}
            </Box>

            <Button
              startIcon={<RestartAltIcon />}
              onClick={loadOrders}
              sx={{ mt: 2, color: '#f8fafc', border: '1px solid rgba(248,250,252,0.14)', px: 2.5, textTransform: 'none', fontWeight: 850 }}
            >
              Tải lại đơn hàng
            </Button>
          </Box>

          <Box>
            {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}
            {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
              <Box sx={{ p: 5, border: '1px solid rgba(248,250,252,0.1)', borderRadius: 1, color: 'rgba(248,250,252,0.6)' }}>
                Đang tải lịch sử đơn hàng...
              </Box>
            ) : orders.length === 0 ? (
              <Box sx={{ p: { xs: 4, md: 6 }, border: '1px dashed rgba(248,250,252,0.18)', borderRadius: 1, textAlign: 'center' }}>
                <ReceiptLongIcon sx={{ fontSize: 58, color: '#fb7185', mb: 2 }} />
                <Typography sx={{ fontWeight: 950, mb: 1, fontSize: 20 }}>Chưa có đơn hàng</Typography>
                <Typography sx={{ color: 'rgba(248,250,252,0.55)', mb: 3 }}>Khi bạn đặt phụ tùng, lịch sử và chi tiết sản phẩm sẽ hiển thị tại đây.</Typography>
                <Button onClick={() => onNavigate('parts')} className="pulse-button small">Mua phụ tùng</Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {orders.map((order) => {
                  const meta = getStatusMeta(order.status)
                  const canCancel = order.status === 'PENDING'
                  const canDelete = ['CANCELLED', 'DELIVERED'].includes(order.status)
                  return (
                    <Box key={order.id} sx={{ border: '1px solid rgba(248,250,252,0.1)', borderRadius: 1, bgcolor: 'rgba(248,250,252,0.03)', overflow: 'hidden' }}>
                      <Box sx={{ p: { xs: 2, md: 2.5 }, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 2, alignItems: 'start' }}>
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', minWidth: 0 }}>
                          <Box sx={{ width: 42, height: 42, borderRadius: 1, display: 'grid', placeItems: 'center', bgcolor: meta.tone, color: meta.color, flexShrink: 0 }}>
                            {order.status === 'DELIVERED' ? <CheckCircleIcon /> : <LocalShippingIcon />}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 950, fontSize: 18, color: '#fff' }}>Đơn hàng #{order.orderNumber || order.id}</Typography>
                            <Typography sx={{ color: 'rgba(248,250,252,0.48)', fontSize: 13, mt: 0.3 }}>{formatDate(order.createdAt)}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.3 }}>
                              <Chip label={meta.label} sx={{ height: 26, color: meta.color, bgcolor: meta.tone, fontWeight: 900 }} />
                              <Chip label={paymentLabel(order.paymentMethod)} sx={{ height: 26, color: '#f8fafc', bgcolor: 'rgba(248,250,252,0.06)', fontWeight: 800 }} />
                              <Chip label={shippingLabel(order.shippingMethod)} sx={{ height: 26, color: 'rgba(248,250,252,0.78)', bgcolor: 'rgba(248,250,252,0.06)', fontWeight: 800 }} />
                            </Box>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, justifyContent: { xs: 'space-between', md: 'flex-start' }, alignItems: { xs: 'center', md: 'flex-end' }, gap: 1 }}>
                          <Typography sx={{ fontWeight: 950, color: '#fb7185', fontSize: 22 }}>{formatMoney(order.total)}</Typography>
                          <Typography sx={{ color: 'rgba(248,250,252,0.48)', fontSize: 12 }}>
                            {order.items?.length || 0} sản phẩm
                          </Typography>
                        </Box>
                      </Box>

                      {order.cancelReason && (
                        <Box sx={{ mx: { xs: 2, md: 2.5 }, mb: 2, p: 1.5, border: '1px solid rgba(148,163,184,0.18)', bgcolor: 'rgba(148,163,184,0.08)', borderRadius: 1 }}>
                          <Typography sx={{ color: 'rgba(248,250,252,0.58)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>Lý do hủy</Typography>
                          <Typography sx={{ color: 'rgba(248,250,252,0.82)', fontSize: 13, mt: 0.4 }}>{order.cancelReason}</Typography>
                        </Box>
                      )}

                      <Divider sx={{ borderColor: 'rgba(248,250,252,0.08)' }} />
                      <Box sx={{ p: { xs: 2, md: 2.5 }, display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr auto' }, gap: 2, alignItems: 'center' }}>
                        <OrderItems items={(order.items || []).slice(0, 2)} />
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', xl: 'flex-end' } }}>
                          <Button
                            startIcon={<VisibilityOutlinedIcon />}
                            onClick={() => setSelectedOrder(order)}
                            sx={{ color: '#f8fafc', border: '1px solid rgba(248,250,252,0.12)', textTransform: 'none', fontWeight: 850 }}
                          >
                            Xem chi tiết
                          </Button>
                          {canCancel && (
                            <Button
                              startIcon={<CancelOutlinedIcon />}
                              disabled={busyId === order.id}
                              onClick={() => openCancelDialog(order)}
                              sx={{ color: '#fb7185', border: '1px solid rgba(251,113,133,0.35)', textTransform: 'none', fontWeight: 900 }}
                            >
                              Hủy đơn
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              startIcon={<DeleteOutlineIcon />}
                              disabled={busyId === order.id}
                              onClick={() => deleteHistory(order)}
                              sx={{ color: 'rgba(248,250,252,0.68)', border: '1px solid rgba(248,250,252,0.1)', textTransform: 'none', fontWeight: 850 }}
                            >
                              Xóa lịch sử
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            )}
          </Box>
        </Box>
      </Container>

      <Dialog open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#080808', color: '#f8fafc', border: '1px solid rgba(248,250,252,0.12)', borderRadius: 1 } }}>
        {selectedOrder && (
          <>
            <DialogTitle sx={{ fontWeight: 950, pb: 1 }}>Chi tiết đơn hàng #{selectedOrder.orderNumber || selectedOrder.id}</DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5, mb: 3 }}>
                {[
                  { label: 'Trạng thái', value: getStatusMeta(selectedOrder.status).label },
                  { label: 'Thanh toán', value: `${paymentLabel(selectedOrder.paymentMethod)} - ${selectedOrder.paymentStatus || 'PENDING'}` },
                  { label: 'Vận chuyển', value: shippingLabel(selectedOrder.shippingMethod) },
                ].map((item) => (
                  <Box key={item.label} sx={{ border: '1px solid rgba(248,250,252,0.1)', borderRadius: 1, p: 1.5, bgcolor: 'rgba(248,250,252,0.03)' }}>
                    <Typography sx={{ color: 'rgba(248,250,252,0.45)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</Typography>
                    <Typography sx={{ color: '#f8fafc', fontWeight: 850, mt: 0.5 }}>{item.value}</Typography>
                  </Box>
                ))}
              </Box>

              <Typography sx={{ fontWeight: 950, mb: 1.5 }}>Sản phẩm đã đặt</Typography>
              <OrderItems items={selectedOrder.items || []} compact />

              <Divider sx={{ my: 3, borderColor: 'rgba(248,250,252,0.08)' }} />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 0.9fr' }, gap: 3 }}>
                <Box>
                  <Typography sx={{ fontWeight: 950, mb: 1 }}>Địa chỉ giao hàng</Typography>
                  <Typography sx={{ color: 'rgba(248,250,252,0.66)', lineHeight: 1.7 }}>
                    {selectedOrder.shippingAddress?.fullName || 'Khách hàng'} - {selectedOrder.shippingAddress?.phone || 'Chưa có SĐT'}<br />
                    {[selectedOrder.shippingAddress?.street, selectedOrder.shippingAddress?.district, selectedOrder.shippingAddress?.city].filter(Boolean).join(', ') || 'Chưa có địa chỉ'}
                  </Typography>
                  {selectedOrder.cancelReason && (
                    <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.16)', borderRadius: 1 }}>
                      <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: 12, fontWeight: 800 }}>Lý do hủy</Typography>
                      <Typography sx={{ color: '#f8fafc', mt: 0.5 }}>{selectedOrder.cancelReason}</Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ border: '1px solid rgba(248,250,252,0.1)', borderRadius: 1, p: 2, bgcolor: 'rgba(248,250,252,0.03)' }}>
                  {[
                    ['Tạm tính', selectedOrder.subtotal],
                    ['Phí vận chuyển', selectedOrder.shippingFee],
                    ['Thuế', selectedOrder.tax],
                    ['Giảm giá', selectedOrder.discount ? -Number(selectedOrder.discount) : 0],
                  ].map(([label, value]) => (
                    <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                      <Typography sx={{ color: 'rgba(248,250,252,0.52)', fontSize: 14 }}>{label}</Typography>
                      <Typography sx={{ color: Number(value) < 0 ? '#fb7185' : '#f8fafc', fontSize: 14 }}>{formatMoney(value)}</Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 1.5, borderColor: 'rgba(248,250,252,0.08)' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'baseline' }}>
                    <Typography sx={{ fontWeight: 950 }}>Tổng cộng</Typography>
                    <Typography sx={{ fontWeight: 950, color: '#fb7185', fontSize: 22 }}>{formatMoney(selectedOrder.total)}</Typography>
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              {selectedOrder.status === 'PENDING' && (
                <Button onClick={() => openCancelDialog(selectedOrder)} sx={{ color: '#fb7185', textTransform: 'none', fontWeight: 900 }}>
                  Hủy đơn
                </Button>
              )}
              {['CANCELLED', 'DELIVERED'].includes(selectedOrder.status) && (
                <Button onClick={() => deleteHistory(selectedOrder)} sx={{ color: 'rgba(248,250,252,0.7)', textTransform: 'none', fontWeight: 850 }}>
                  Xóa lịch sử
                </Button>
              )}
              <Button onClick={() => setSelectedOrder(null)} sx={{ color: '#f8fafc', textTransform: 'none', fontWeight: 900 }}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={Boolean(cancelTarget)} onClose={closeCancelDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#080808', color: '#f8fafc', border: '1px solid rgba(251,113,133,0.25)', borderRadius: 1 } }}>
        <DialogTitle sx={{ fontWeight: 950 }}>Lý do hủy đơn #{cancelTarget?.orderNumber || cancelTarget?.id}</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(248,250,252,0.6)', mb: 2 }}>
            Đơn chỉ có thể hủy khi đang ở trạng thái chờ xác nhận. Lý do này sẽ được lưu lại trong lịch sử đơn hàng.
          </Typography>
          <TextField
            label="Tại sao bạn muốn hủy đơn?"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            multiline
            minRows={4}
            fullWidth
            autoFocus
            sx={{
              '& .MuiInputBase-root': { color: '#f8fafc' },
              '& .MuiInputLabel-root': { color: 'rgba(248,250,252,0.55)' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(248,250,252,0.14)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(248,250,252,0.28)' },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeCancelDialog} disabled={Boolean(busyId)} sx={{ color: 'rgba(248,250,252,0.68)', textTransform: 'none', fontWeight: 850 }}>
            Giữ đơn
          </Button>
          <Button onClick={submitCancel} disabled={Boolean(busyId)} sx={{ bgcolor: '#e11d48', color: '#fff', textTransform: 'none', fontWeight: 950, px: 2.5, '&:hover': { bgcolor: '#f43f5e' } }}>
            Xác nhận hủy
          </Button>
        </DialogActions>
      </Dialog>

      <Footer onNavigate={onNavigate} />
    </Box>
  )
}
