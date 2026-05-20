import { useState, useEffect } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import CardActions from '@mui/material/CardActions'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import Badge from '@mui/material/Badge'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PersonIcon from '@mui/icons-material/Person'
import CloseIcon from '@mui/icons-material/Close'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'

// ── placeholder images (picsum)
const heroImg = 'https://picsum.photos/seed/dalta-hero/1400/600'
const cat1    = 'https://picsum.photos/seed/living/600/400'
const cat2    = 'https://picsum.photos/seed/officetech/300/200'
const cat3    = 'https://picsum.photos/seed/light/300/200'

const PRODUCTS = [
  { id: 1, name: 'Ceramic Vase',     price: 189000, img: 'https://picsum.photos/seed/vase/300/300',      tag: null },
  { id: 2, name: 'Walnut Organizer', price: 320000, img: 'https://picsum.photos/seed/wood/300/300',      tag: null },
  { id: 3, name: 'Table Lamp',       price: 480000, img: 'https://picsum.photos/seed/lamp/300/300',      tag: 'MỚI' },
  { id: 4, name: 'Glass Set',        price: 95000,  img: 'https://picsum.photos/seed/glass/300/300',     tag: 'HOT' },
  { id: 5, name: 'Linen Cushion',    price: 210000, img: 'https://picsum.photos/seed/cushion/300/300',   tag: null },
  { id: 6, name: 'Oak Shelf',        price: 750000, img: 'https://picsum.photos/seed/shelf/300/300',     tag: null },
  { id: 7, name: 'Pendant Light',    price: 560000, img: 'https://picsum.photos/seed/pendant/300/300',   tag: 'MỚI' },
  { id: 8, name: 'Marble Tray',      price: 145000, img: 'https://picsum.photos/seed/marble/300/300',    tag: null },
]

function fmt(n) {
  return n.toLocaleString('vi-VN') + '₫'
}

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null
}

export default function App() {
  const [authOpen, setAuthOpen]   = useState(false)
  const [authTab, setAuthTab]     = useState(0)
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [user, setUser]           = useState(null)
  const [cartCount, setCartCount] = useState(0)
  const [search, setSearch]       = useState('')
  const [newsletter, setNewsletter] = useState('')

  // Lấy token Google từ URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token  = params.get('token')
    if (token) {
      localStorage.setItem('token', token)
      setUser({ email: 'Google User' })
      window.history.replaceState({}, '', '/')
    }
  }, [])

  const handleLogin = async () => {
    try {
      const res  = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.access_token)
        setUser({ email })
        setAuthOpen(false)
        setEmail(''); setPassword('')
      } else {
        alert(data.message || 'Đăng nhập thất bại')
      }
    } catch {
      alert('Không thể kết nối máy chủ')
    }
  }

  const handleRegister = async () => {
    try {
      const res  = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.')
        setAuthTab(0)
      } else {
        alert(data.message || 'Đăng ký thất bại')
      }
    } catch {
      alert('Không thể kết nối máy chủ')
    }
  }

  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem('token')
    if (!token) { setAuthOpen(true); return }
    try {
      const res = await fetch('http://localhost:3000/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId, quantity: 1 }),
      })
      if (res.ok) setCartCount(c => c + 1)
      else alert('Thêm vào giỏ thất bại')
    } catch {
      alert('Không thể kết nối máy chủ')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setCartCount(0)
  }

  const filtered = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f0' }}>

      {/* ── NAVBAR ── */}
      <AppBar position="sticky" elevation={0}
        sx={{ bgcolor: '#fff', borderBottom: '1px solid #e0e0e0', color: 'text.primary' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 2, color: '#111', flexShrink: 0 }}>
              DALTA
            </Typography>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, mx: 2 }}>
              {['Trang chủ', 'Sản phẩm', 'Danh mục', 'Về chúng tôi'].map(item => (
                <Typography key={item} variant="body2"
                  sx={{ cursor: 'pointer', fontWeight: 500, '&:hover': { color: 'primary.main' } }}>
                  {item}
                </Typography>
              ))}
            </Box>

            <TextField size="small" placeholder="Tìm kiếm..." value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ flex: 1, maxWidth: 300 }}
              slotProps={{ input: { startAdornment: (
                <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
              )}}}
            />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <IconButton>
                <Badge badgeContent={cartCount} color="primary">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

              {user ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{user.email}</Typography>
                  <Button size="small" onClick={handleLogout} variant="outlined"
                    sx={{ borderColor: '#ddd', color: 'text.secondary' }}>
                    Đăng xuất
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => { setAuthTab(0); setAuthOpen(true) }}
                    sx={{ borderColor: '#ddd', color: 'text.primary' }}>
                    Đăng nhập
                  </Button>
                  <Button size="small" variant="contained" onClick={() => { setAuthTab(1); setAuthOpen(true) }}>
                    Đăng ký
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ── HERO ── */}
      <Box sx={{ position: 'relative', height: { xs: 320, md: 500 }, overflow: 'hidden' }}>
        <Box component="img" src={heroImg} alt="hero"
          sx={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.55)' }} />
        <Box sx={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', px: { xs: 3, md: 10 }, color: '#fff',
        }}>
          <Typography variant="overline" sx={{ letterSpacing: 4, opacity: 0.8, mb: 1 }}>
            BỘ SƯU TẬP MỚI
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.1, mb: 2, maxWidth: 520 }}>
            Structures of<br />
            <Box component="span" sx={{ color: '#aa3bff' }}>Intention.</Box>
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, mb: 3, maxWidth: 400 }}>
            Curating a dialogue between form and material elegance.
            Our collection defines the contemporary lifestyle.
          </Typography>
          <Box>
            <Button variant="contained" size="large"
              sx={{ px: 4, fontWeight: 700, bgcolor: '#aa3bff', '&:hover': { bgcolor: '#8e2de2' } }}>
              Khám phá ngay
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ── CATEGORIES ── */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="overline" sx={{ letterSpacing: 3, color: 'text.secondary' }}>
          DANH MỤC
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Curation by Form
        </Typography>

        <Grid container spacing={2} sx={{ height: { md: 420 } }}>
          {/* Large left */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ position: 'relative', height: '100%', minHeight: 260, borderRadius: 2, overflow: 'hidden', cursor: 'pointer',
              '&:hover img': { transform: 'scale(1.04)' } }}>
              <Box component="img" src={cat1} alt="Living Space"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.4s', filter: 'brightness(0.7)' }} />
              <Box sx={{ position: 'absolute', bottom: 20, left: 20, color: '#fff' }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Living Space</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Sản phẩm thiết yếu cho ngôi nhà</Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right column */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
              {[{ img: cat2, label: 'Office Tech', sub: 'Công nghệ văn phòng' },
                { img: cat3, label: 'Atmospheric Light', sub: 'Ánh sáng không gian' }].map(c => (
                <Box key={c.label} sx={{ position: 'relative', flex: 1, minHeight: 120, borderRadius: 2,
                  overflow: 'hidden', cursor: 'pointer', '&:hover img': { transform: 'scale(1.04)' } }}>
                  <Box component="img" src={c.img} alt={c.label}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.4s', filter: 'brightness(0.65)' }} />
                  <Box sx={{ position: 'absolute', bottom: 14, left: 16, color: '#fff' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{c.label}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>{c.sub}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ── PRODUCTS ── */}
      <Box sx={{ bgcolor: '#fff', py: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>The DALTA Selection</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Objects selected for their geometric purity and material integrity.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {filtered.map(p => (
              <Grid key={p.id} size={{ xs: 6, sm: 4, md: 3 }}>
                <Card elevation={0} sx={{ border: '1px solid #eee', borderRadius: 2,
                  transition: '0.2s', '&:hover': { boxShadow: 4, transform: 'translateY(-4px)' } }}>
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia component="img" image={p.img} alt={p.name}
                      sx={{ height: 220, objectFit: 'cover' }} />
                    {p.tag && (
                      <Chip label={p.tag} size="small" color="primary"
                        sx={{ position: 'absolute', top: 10, right: 10, fontWeight: 700, fontSize: 10 }} />
                    )}
                  </Box>
                  <CardContent sx={{ pb: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{p.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11, mb: 0.5 }}>
                      Sản phẩm chất lượng cao
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#aa3bff' }}>
                      {fmt(p.price)}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                    <Button fullWidth size="small" variant="outlined" startIcon={<AddShoppingCartIcon />}
                      onClick={() => handleAddToCart(p.id)}
                      sx={{ borderColor: '#ddd', color: 'text.primary', fontWeight: 600,
                        '&:hover': { bgcolor: '#aa3bff', color: '#fff', borderColor: '#aa3bff' } }}>
                      Thêm vào giỏ
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button variant="outlined" size="large"
              sx={{ px: 6, borderColor: '#111', color: '#111', fontWeight: 700,
                '&:hover': { bgcolor: '#111', color: '#fff' } }}>
              Xem tất cả sản phẩm
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── NEWSLETTER ── */}
      <Box sx={{ bgcolor: '#1a1a2e', color: '#fff', py: 8 }}>
        <Container maxWidth="md">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="overline" sx={{ letterSpacing: 3, opacity: 0.6 }}>
                THAM GIA CỘNG ĐỒNG
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.2, mt: 1 }}>
                Curated insights<br />delivered to your<br />
                <Box component="span" sx={{ color: '#aa3bff' }}>space.</Box>
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.6, mt: 2 }}>
                Đăng ký để nhận thông tin sản phẩm mới và ưu đãi độc quyền.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField fullWidth placeholder="email@address.com" value={newsletter}
                  onChange={e => setNewsletter(e.target.value)}
                  sx={{ bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 1,
                    input: { color: '#fff' }, '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } }} />
                <Button variant="contained" size="large" fullWidth
                  sx={{ bgcolor: '#aa3bff', fontWeight: 700, py: 1.5,
                    '&:hover': { bgcolor: '#8e2de2' } }}>
                  Tham gia DALTA Collective
                </Button>
                <Typography variant="caption" sx={{ opacity: 0.4, textAlign: 'center' }}>
                  Bằng cách đăng ký, bạn đồng ý với chính sách bảo mật của chúng tôi.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── FOOTER ── */}
      <Box sx={{ bgcolor: '#111', color: '#fff', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 2 }}>DALTA</Typography>
              <Typography variant="caption" sx={{ opacity: 0.4 }}>
                © 2026 DALTA. Mọi quyền được bảo lưu.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: { md: 'flex-end' } }}>
                {['Chính sách bảo mật', 'Điều khoản dịch vụ', 'Chính sách vận chuyển', 'Liên hệ'].map(item => (
                  <Typography key={item} variant="caption"
                    sx={{ opacity: 0.5, cursor: 'pointer', '&:hover': { opacity: 1 } }}>
                    {item}
                  </Typography>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── AUTH DIALOG ── */}
      <Dialog open={authOpen} onClose={() => setAuthOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
          <Tabs value={authTab} onChange={(_, v) => setAuthTab(v)} textColor="primary" indicatorColor="primary">
            <Tab label="Đăng nhập" />
            <Tab label="Đăng ký" />
          </Tabs>
          <IconButton onClick={() => setAuthOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent>
          {/* Login */}
          <TabPanel value={authTab} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Email" type="email" fullWidth size="small"
                value={email} onChange={e => setEmail(e.target.value)} />
              <TextField label="Mật khẩu" type="password" fullWidth size="small"
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              <Button variant="contained" fullWidth size="large" onClick={handleLogin}>
                Đăng nhập
              </Button>
              <Divider>Hoặc</Divider>
              <Button variant="outlined" fullWidth size="large"
                href="http://localhost:3000/auth/google"
                startIcon={<img src="https://www.google.com/favicon.ico" width="18" alt="google" />}
                sx={{ color: 'text.primary', borderColor: '#ddd' }}>
                Tiếp tục với Google
              </Button>
            </Box>
          </TabPanel>

          {/* Register */}
          <TabPanel value={authTab} index={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Email" type="email" fullWidth size="small"
                value={email} onChange={e => setEmail(e.target.value)} />
              <TextField label="Mật khẩu" type="password" fullWidth size="small"
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRegister()} />
              <Button variant="contained" fullWidth size="large" onClick={handleRegister}>
                Đăng ký
              </Button>
            </Box>
          </TabPanel>
        </DialogContent>
      </Dialog>

    </Box>
  )
}
