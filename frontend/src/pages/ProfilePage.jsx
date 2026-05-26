import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import LockIcon from '@mui/icons-material/LockOutlined'
import NotificationsIcon from '@mui/icons-material/NotificationsOutlined'
import CreditCardIcon from '@mui/icons-material/CreditCardOutlined'
import LanguageIcon from '@mui/icons-material/LanguageOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import HomeIcon from '@mui/icons-material/Home'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

const API = 'http://localhost:3000'

export default function ProfilePage({ user, onLogout, onGoHome }) {
  const [profile, setProfile]       = useState(null)
  const [addresses, setAddresses]   = useState([])
  const [editOpen, setEditOpen]     = useState(false)
  const [addrOpen, setAddrOpen]     = useState(false)
  const [editAddr, setEditAddr]     = useState(null)

  // Form states
  const [fullName, setFullName]     = useState('')
  const [phone, setPhone]           = useState('')
  const [birthDate, setBirthDate]   = useState('')
  const [avatar, setAvatar]         = useState('')

  // Address form
  const [addrName, setAddrName]     = useState('')
  const [addrPhone, setAddrPhone]   = useState('')
  const [addrStreet, setAddrStreet] = useState('')
  const [addrCity, setAddrCity]     = useState('')
  const [addrDistrict, setAddrDistrict] = useState('')

  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  useEffect(() => { fetchProfile(); fetchAddresses() }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API}/users/profile`, { headers })
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setFullName(data.fullName || '')
        setPhone(data.phone || '')
        setBirthDate(data.birthDate ? data.birthDate.split('T')[0] : '')
        setAvatar(data.avatar || '')
      }
    } catch {}
  }

  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${API}/users/addresses`, { headers })
      if (res.ok) setAddresses(await res.json())
    } catch {}
  }

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`${API}/users/profile`, {
        method: 'PUT', headers,
        body: JSON.stringify({ fullName, phone, birthDate, avatar }),
      })
      if (res.ok) { await fetchProfile(); setEditOpen(false) }
      else alert('Cập nhật thất bại')
    } catch { alert('Không thể kết nối máy chủ') }
  }

  const openAddAddress = () => {
    setEditAddr(null)
    setAddrName(''); setAddrPhone(''); setAddrStreet(''); setAddrCity(''); setAddrDistrict('')
    setAddrOpen(true)
  }

  const openEditAddress = (addr) => {
    setEditAddr(addr)
    setAddrName(addr.fullName); setAddrPhone(addr.phone)
    setAddrStreet(addr.street); setAddrCity(addr.city); setAddrDistrict(addr.district || '')
    setAddrOpen(true)
  }

  const handleSaveAddress = async () => {
    const body = { fullName: addrName, phone: addrPhone, street: addrStreet, city: addrCity, district: addrDistrict }
    try {
      const url = editAddr ? `${API}/users/addresses/${editAddr.id}` : `${API}/users/addresses`
      const method = editAddr ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) })
      if (res.ok) { await fetchAddresses(); setAddrOpen(false) }
      else alert('Lưu địa chỉ thất bại')
    } catch { alert('Không thể kết nối máy chủ') }
  }

  const handleDeleteAddress = async (id) => {
    if (!confirm('Xóa địa chỉ này?')) return
    try {
      const res = await fetch(`${API}/users/addresses/${id}`, { method: 'DELETE', headers })
      if (res.ok) fetchAddresses()
    } catch {}
  }

  const handleSetDefault = async (id) => {
    try {
      const res = await fetch(`${API}/users/addresses/${id}/default`, { method: 'PUT', headers })
      if (res.ok) fetchAddresses()
    } catch {}
  }

  const displayName = profile?.fullName || user?.email?.split('@')[0] || 'Người dùng'

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fb' }}>

      {/* NAVBAR */}
      <AppBar position="static" elevation={0}
        sx={{ bgcolor: '#fff', borderBottom: '1px solid #e5e7eb', color: 'text.primary' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a3de4', cursor: 'pointer' }}
              onClick={onGoHome}>
              DALTA
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {['Shop', 'Collections', 'New Arrivals', 'About'].map(item => (
                <Typography key={item} variant="body2"
                  sx={{ cursor: 'pointer', color: '#6b7280', '&:hover': { color: '#111' } }}>
                  {item}
                </Typography>
              ))}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>

        {/* HEADER */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box>
            <Typography variant="overline" sx={{ color: '#1a3de4', letterSpacing: 2, fontWeight: 700 }}>
              ACCOUNT OVERVIEW
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#111', mt: 0.5 }}>
              {displayName}
            </Typography>
            <Typography variant="body1" sx={{ color: '#6b7280', mt: 1, maxWidth: 480 }}>
              Chào mừng trở lại. Quản lý thông tin cá nhân, địa chỉ giao hàng và lịch sử đơn hàng của bạn.
            </Typography>
          </Box>
          <Avatar src={profile?.avatar}
            sx={{ width: 100, height: 100, bgcolor: '#e8edf7', border: '3px solid #fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)', fontSize: 40 }}>
            {displayName[0]?.toUpperCase()}
          </Avatar>
        </Box>

        <Grid container spacing={3}>
          {/* LEFT COLUMN */}
          <Grid size={{ xs: 12, md: 8 }}>

            {/* Personal Information */}
            <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Personal Information</Typography>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}
                    sx={{ color: '#1a3de4', fontWeight: 600 }}>
                    Edit details
                  </Button>
                </Box>

                <Grid container spacing={3}>
                  {[
                    { label: 'FULL NAME', value: profile?.fullName || '—' },
                    { label: 'EMAIL ADDRESS', value: profile?.email || user?.email || '—' },
                    { label: 'PHONE NUMBER', value: profile?.phone || '—' },
                    { label: 'DATE OF BIRTH', value: profile?.birthDate ? new Date(profile.birthDate).toLocaleDateString('vi-VN') : '—' },
                  ].map(item => (
                    <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: '#9ca3af' }}>
                        {item.label}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: '#111', mt: 0.3 }}>
                        {item.value}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Shipping Addresses */}
            <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Địa chỉ giao hàng</Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={openAddAddress}
                    sx={{ color: '#1a3de4', fontWeight: 600 }}>
                    Thêm địa chỉ
                  </Button>
                </Box>

                {addresses.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#9ca3af', textAlign: 'center', py: 2 }}>
                    Chưa có địa chỉ nào. Thêm địa chỉ giao hàng đầu tiên của bạn.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {addresses.map(addr => (
                      <Box key={addr.id} sx={{
                        p: 2, border: '1px solid', borderRadius: 2,
                        borderColor: addr.isDefault ? '#1a3de4' : '#e5e7eb',
                        bgcolor: addr.isDefault ? '#f0f4ff' : '#fff',
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {addr.fullName}
                              </Typography>
                              {addr.isDefault && (
                                <Chip label="Mặc định" size="small" color="primary"
                                  sx={{ height: 20, fontSize: 10 }} />
                              )}
                            </Box>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>{addr.phone}</Typography>
                            <Typography variant="body2" sx={{ color: '#374151' }}>
                              {addr.street}, {addr.district && `${addr.district}, `}{addr.city}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {!addr.isDefault && (
                              <Button size="small" onClick={() => handleSetDefault(addr.id)}
                                sx={{ fontSize: 11, color: '#1a3de4' }}>
                                Đặt mặc định
                              </Button>
                            )}
                            <IconButton size="small" onClick={() => openEditAddress(addr)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteAddress(addr.id)}
                              sx={{ color: '#ef4444' }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Order History placeholder */}
            <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Order History</Typography>
                  <Button size="small" sx={{ color: '#1a3de4', fontWeight: 600 }}>View All</Button>
                </Box>
                {[
                  { id: 'AM-99210', date: '14/11/2023', items: 2, status: 'DELIVERED', price: '1.240.000₫', color: '#16a34a' },
                  { id: 'AM-99185', date: '02/11/2023', items: 1, status: 'IN TRANSIT', price: '450.000₫', color: '#d97706' },
                ].map(order => (
                  <Box key={order.id} sx={{ display: 'flex', alignItems: 'center', gap: 2,
                    p: 2, border: '1px solid #f3f4f6', borderRadius: 2, mb: 1.5,
                    '&:hover': { bgcolor: '#f9fafb', cursor: 'pointer' } }}>
                    <Box sx={{ width: 44, height: 44, bgcolor: '#f0f4ff', borderRadius: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {order.status === 'DELIVERED'
                        ? <CheckCircleIcon sx={{ color: '#1a3de4' }} />
                        : <LocalShippingIcon sx={{ color: '#1a3de4' }} />}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Order #{order.id}</Typography>
                      <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                        {order.date} • {order.items} sản phẩm
                      </Typography>
                    </Box>
                    <Chip label={order.status} size="small"
                      sx={{ bgcolor: order.color + '20', color: order.color, fontWeight: 700, fontSize: 10 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, minWidth: 90, textAlign: 'right' }}>
                      {order.price}
                    </Typography>
                    <ArrowForwardIosIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT COLUMN */}
          <Grid size={{ xs: 12, md: 4 }}>

            {/* Account Settings */}
            <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Account Settings</Typography>
                {[
                  { icon: <LockIcon />, label: 'Security & Password' },
                  { icon: <NotificationsIcon />, label: 'Notifications' },
                  { icon: <CreditCardIcon />, label: 'Payment Methods' },
                  { icon: <LanguageIcon />, label: 'Preferences' },
                ].map((item, i) => (
                  <Box key={i}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, cursor: 'pointer',
                      '&:hover': { color: '#1a3de4' } }}>
                      <Box sx={{ color: '#6b7280' }}>{item.icon}</Box>
                      <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>{item.label}</Typography>
                      <ArrowForwardIosIcon sx={{ fontSize: 12, color: '#9ca3af' }} />
                    </Box>
                    {i < 3 && <Divider />}
                  </Box>
                ))}

                <Button fullWidth variant="contained" size="large" startIcon={<LogoutIcon />}
                  onClick={onLogout}
                  sx={{ mt: 3, bgcolor: '#d97706', fontWeight: 700, borderRadius: 2,
                    '&:hover': { bgcolor: '#b45309' } }}>
                  Sign Out
                </Button>
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center',
                  color: '#9ca3af', mt: 1 }}>
                  Đăng nhập từ Việt Nam
                </Typography>
              </CardContent>
            </Card>

            {/* Need Assistance */}
            <Card elevation={0} sx={{ borderRadius: 3, bgcolor: '#1a3de4', color: '#fff', overflow: 'hidden' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Need Assistance?</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                  Đội ngũ hỗ trợ của chúng tôi sẵn sàng 24/7 để giúp bạn.
                </Typography>
                <Button variant="outlined" size="small"
                  sx={{ color: '#fff', borderColor: '#fff', fontWeight: 600,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
                  Start Chat
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* EDIT PROFILE DIALOG */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Cập nhật thông tin cá nhân</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Họ và tên" fullWidth size="small"
              value={fullName} onChange={e => setFullName(e.target.value)} />
            <TextField label="Số điện thoại" fullWidth size="small"
              value={phone} onChange={e => setPhone(e.target.value)} />
            <TextField label="Ngày sinh" fullWidth size="small" type="date"
              value={birthDate} onChange={e => setBirthDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="URL Avatar" fullWidth size="small"
              value={avatar} onChange={e => setAvatar(e.target.value)}
              placeholder="https://..." />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveProfile}
            sx={{ bgcolor: '#1a3de4', '&:hover': { bgcolor: '#1530b8' } }}>
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      {/* ADD/EDIT ADDRESS DIALOG */}
      <Dialog open={addrOpen} onClose={() => setAddrOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editAddr ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Họ tên người nhận" fullWidth size="small"
              value={addrName} onChange={e => setAddrName(e.target.value)} />
            <TextField label="Số điện thoại" fullWidth size="small"
              value={addrPhone} onChange={e => setAddrPhone(e.target.value)} />
            <TextField label="Địa chỉ cụ thể (số nhà, tên đường)" fullWidth size="small"
              value={addrStreet} onChange={e => setAddrStreet(e.target.value)} />
            <TextField label="Quận/Huyện" fullWidth size="small"
              value={addrDistrict} onChange={e => setAddrDistrict(e.target.value)} />
            <TextField label="Tỉnh/Thành phố" fullWidth size="small"
              value={addrCity} onChange={e => setAddrCity(e.target.value)} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddrOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveAddress}
            sx={{ bgcolor: '#1a3de4', '&:hover': { bgcolor: '#1530b8' } }}>
            {editAddr ? 'Cập nhật' : 'Thêm địa chỉ'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  )
}
