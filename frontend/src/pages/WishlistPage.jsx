import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import FavoriteIcon from '@mui/icons-material/Favorite'
import DeleteIcon from '@mui/icons-material/DeleteOutline'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { apiFetch } from '../services/apiClient'
import { getAuthToken } from '../services/authToken'
import { formatMoney, getPrimaryImage, mapProductToCar } from '../utils/helpers'

export default function WishlistPage({ user, onNavigate, onOpenLogin, onOpenRegister, onOpenProfile, onLogout }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadWishlist = async () => {
    if (!getAuthToken()) {
      setLoading(false)
      setError('Vui lòng đăng nhập để xem danh sách yêu thích.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const data = await apiFetch('/wishlist', { auth: true })
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách yêu thích.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWishlist()
  }, [])

  const removeItem = async (productId) => {
    try {
      await apiFetch(`/wishlist/${productId}`, { method: 'DELETE', auth: true })
      setItems((current) => current.filter((item) => item.id !== productId))
    } catch (err) {
      setError(err.message || 'Không thể xóa sản phẩm khỏi danh sách yêu thích.')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#050505', color: '#f8fafc' }}>
      <Header
        user={user}
        activeTab="wishlist"
        onNavigate={onNavigate}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        onCartClick={() => onNavigate('cart')}
      />

      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 8 } }}>
        <Chip label="Wishlist" sx={{ bgcolor: 'rgba(225,29,72,0.12)', color: '#fb7185', border: '1px solid rgba(225,29,72,0.3)', fontWeight: 900, mb: 2 }} />
        <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', mb: 1 }}>Danh Sách Yêu Thích</Typography>
        <Typography sx={{ color: 'rgba(248,250,252,0.55)', mb: 4 }}>Lưu lại các phụ tùng bạn muốn quay lại mua sau.</Typography>

        {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ p: 5, border: '1px solid rgba(248,250,252,0.1)', borderRadius: 1, color: 'rgba(248,250,252,0.6)' }}>Đang tải wishlist...</Box>
        ) : items.length === 0 ? (
          <Box sx={{ p: 5, border: '1px dashed rgba(248,250,252,0.18)', borderRadius: 1, textAlign: 'center' }}>
            <FavoriteIcon sx={{ fontSize: 56, color: '#fb7185', mb: 2 }} />
            <Typography sx={{ fontWeight: 900, mb: 2 }}>Chưa có sản phẩm yêu thích</Typography>
            <Button onClick={() => onNavigate('parts')} className="pulse-button small">Khám phá phụ tùng</Button>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2.5 }}>
            {items.map((item) => {
              const car = mapProductToCar(item)
              return (
                <Box key={item.id} sx={{ border: '1px solid rgba(248,250,252,0.1)', borderRadius: 1, bgcolor: 'rgba(248,250,252,0.03)', overflow: 'hidden' }}>
                  <Box component="img" src={getPrimaryImage(item) || '/images/cars/default.png'} alt={item.name} sx={{ width: '100%', height: 180, objectFit: 'cover', bgcolor: 'rgba(248,250,252,0.08)' }} />
                  <Box sx={{ p: 2.5 }}>
                    <Typography sx={{ color: '#fb7185', fontSize: 12, fontWeight: 900, textTransform: 'uppercase' }}>{item.brand || item.brandEntity?.name || 'AEROTEC'}</Typography>
                    <Typography sx={{ fontWeight: 950, mt: 0.5, minHeight: 48 }}>{item.name}</Typography>
                    <Typography sx={{ color: 'rgba(248,250,252,0.52)', fontSize: 13, mt: 1 }}>{item.category?.name || 'Phụ tùng hiệu năng'}</Typography>
                    <Typography sx={{ color: '#fb7185', fontWeight: 950, mt: 2 }}>{formatMoney(item.price)}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button className="pulse-button small" onClick={() => onNavigate('product-detail', car)}>Chi tiết</Button>
                      <Button startIcon={<DeleteIcon />} onClick={() => removeItem(item.id)} sx={{ color: 'rgba(248,250,252,0.72)', textTransform: 'none', fontWeight: 800 }}>
                        Xóa
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )
            })}
          </Box>
        )}
      </Container>

      <Footer onNavigate={onNavigate} />
    </Box>
  )
}
