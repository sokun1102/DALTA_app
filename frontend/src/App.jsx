import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import CardActionArea from '@mui/material/CardActionArea'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Chip from '@mui/material/Chip'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import SearchIcon from '@mui/icons-material/Search'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PersonIcon from '@mui/icons-material/Person'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import ToysIcon from '@mui/icons-material/Toys'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import CloseIcon from '@mui/icons-material/Close'

const categories = [
  { id: 1, name: 'Thực phẩm', icon: <RestaurantIcon sx={{ fontSize: 48 }} />, color: '#FF6B6B', count: 1240 },
  { id: 2, name: 'Khuyến mãi', icon: <LocalOfferIcon sx={{ fontSize: 48 }} />, color: '#FFD93D', count: 856 },
  { id: 3, name: 'Thời trang', icon: <CheckroomIcon sx={{ fontSize: 48 }} />, color: '#6BCB77', count: 2103 },
  { id: 4, name: 'Game & Tech', icon: <SportsEsportsIcon sx={{ fontSize: 48 }} />, color: '#4D96FF', count: 678 },
  { id: 5, name: 'Đồ chơi', icon: <ToysIcon sx={{ fontSize: 48 }} />, color: '#C77DFF', count: 432 },
  { id: 6, name: 'Ô tô & Xe', icon: <DirectionsCarIcon sx={{ fontSize: 48 }} />, color: '#FF8C42', count: 315 },
]

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ py: 2 }}>{children}</Box> : null
}

export default function App() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState(0)
  const [search, setSearch] = useState('')

  const handleOpenLogin = () => {
    setAuthTab(0)
    setAuthOpen(true)
  }

  const handleOpenRegister = () => {
    setAuthTab(1)
    setAuthOpen(true)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: '#fff',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2, flexWrap: 'wrap' }}>
            {/* Logo */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                letterSpacing: '-0.5px',
                whiteSpace: 'nowrap',
              }}
            >
              DALTA
            </Typography>

            {/* Search Bar */}
            <TextField
              size="small"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1, minWidth: 200 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleOpenLogin}
                sx={{ whiteSpace: 'nowrap', borderColor: 'divider', color: 'text.primary' }}
              >
                Đăng nhập
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleOpenRegister}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Đăng kí
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Banner */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #aa3bff 0%, #6c63ff 100%)',
          color: '#fff',
          py: { xs: 4, md: 6 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Chào mừng đến DALTA
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 300, opacity: 0.9, mb: 3 }}>
            Mua sắm thông minh — Giá tốt mỗi ngày
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleOpenRegister}
              sx={{
                bgcolor: '#fff',
                color: 'primary.main',
                fontWeight: 600,
                px: 4,
                '&:hover': { bgcolor: '#f0f0f0' },
              }}
            >
              Bắt đầu ngay
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                bgcolor: 'transparent',
                color: '#fff',
                borderColor: '#fff',
                px: 4,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: '#fff' },
              }}
            >
              Khám phá
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Categories */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Danh mục sản phẩm
          </Typography>
          <Chip label="Tất cả" size="small" sx={{ cursor: 'pointer' }} />
        </Box>

        <Grid container spacing={2}>
          {categories.map((cat) => (
            <Grid key={cat.id} size={{ xs: 6, sm: 4, md: 2 }}>
              <Card
                sx={{
                  textAlign: 'center',
                  transition: '0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
                }}
              >
                <CardActionArea sx={{ py: 3, px: 1 }}>
                  <Box sx={{ color: cat.color, mb: 1 }}>{cat.icon}</Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {cat.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {cat.count.toLocaleString()} sản phẩm
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: '#1a1a2e',
          color: '#fff',
          py: 4,
          mt: 4,
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" sx={{ opacity: 0.6 }}>
          &copy; 2026 DALTA. Mọi quyền được bảo lưu.
        </Typography>
      </Box>

      {/* Auth Dialog */}
      <Dialog open={authOpen} onClose={() => setAuthOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0 }}>
          <Tabs
            value={authTab}
            onChange={(_, v) => setAuthTab(v)}
            sx={{ flex: 1 }}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Đăng nhập" />
            <Tab label="Đăng kí" />
          </Tabs>
          <IconButton onClick={() => setAuthOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {authTab === 0 && (
            <TabPanel value={authTab} index={0}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Email" type="email" fullWidth size="small" />
                <TextField label="Mật khẩu" type="password" fullWidth size="small" />
                <FormControlLabel control={<Checkbox size="small" />} label="Ghi nhớ đăng nhập" />
                <Button variant="contained" fullWidth size="large">
                  Đăng nhập
                </Button>
                <Typography
                  variant="body2"
                  sx={{ textAlign: 'center', color: 'primary.main', cursor: 'pointer' }}
                >
                  Quên mật khẩu?
                </Typography>
              </Box>
            </TabPanel>
          )}

          {authTab === 1 && (
            <TabPanel value={authTab} index={1}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Họ và tên" fullWidth size="small" />
                <TextField label="Email" type="email" fullWidth size="small" />
                <TextField label="Số điện thoại" type="tel" fullWidth size="small" />
                <TextField label="Mật khẩu" type="password" fullWidth size="small" />
                <TextField label="Xác nhận mật khẩu" type="password" fullWidth size="small" />
                <FormControlLabel
                  control={<Checkbox size="small" defaultChecked />}
                  label={
                    <Typography variant="body2">
                      Tôi đồng ý với{' '}
                      <Box component="span" sx={{ color: 'primary.main', cursor: 'pointer' }}>
                        Điều khoản sử dụng
                      </Box>
                    </Typography>
                  }
                />
                <Button variant="contained" fullWidth size="large">
                  Đăng kí
                </Button>
              </Box>
            </TabPanel>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
