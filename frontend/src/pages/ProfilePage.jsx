import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import HomeIcon from '@mui/icons-material/HomeOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/PersonOutline'
import { getAuthToken } from '../services/authToken'
import { apiFetch } from '../services/apiClient'

const panelSx = {
  border: '1px solid rgba(248,250,252,0.12)',
  borderRadius: 1,
  background: 'linear-gradient(180deg, rgba(248,250,252,0.08), rgba(248,250,252,0.035)), #080808',
}

const inputSx = {
  '& .MuiOutlinedInput-root': {
    color: '#f8fafc',
    borderRadius: 1,
    background: 'rgba(5,5,5,0.52)',
    '& fieldset': { borderColor: 'rgba(248,250,252,0.16)' },
    '&:hover fieldset': { borderColor: 'rgba(244,63,94,0.46)' },
    '&.Mui-focused fieldset': { borderColor: '#f43f5e' },
  },
  '& .MuiInputLabel-root': { color: 'rgba(248,250,252,0.58)' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#fb7185' },
}

const phonePattern = /^[0-9+\-\s()]{8,20}$/

const paymentMethods = [
  { id: 'cod', label: 'COD', description: 'Thanh toán khi nhận hàng.' },
  { id: 'card', label: 'Stripe/card', description: 'Thanh toán thẻ qua Stripe.' },
  { id: 'bank_transfer', label: 'bank_transfer', description: 'Chuyển khoản ngân hàng.' },
]

const paymentLabel = {
  cod: 'COD',
  card: 'Stripe/card',
  bank_transfer: 'bank_transfer',
}

function field(label, value) {
  return (
    <Box>
      <Typography sx={{ color: 'rgba(248,250,252,0.45)', fontSize: 11, fontWeight: 900 }}>
        {label}
      </Typography>
      <Typography sx={{ mt: 0.5, color: '#fff', fontWeight: 800, overflowWrap: 'anywhere' }}>
        {value === '' || value === null || value === undefined ? 'Chưa thiết lập' : value}
      </Typography>
    </Box>
  )
}

export default function ProfilePage({ user, onLogout, onGoHome }) {
  const [profile, setProfile] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [addressOpen, setAddressOpen] = useState(false)
  const [editAddress, setEditAddress] = useState(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState('cod')

  const [addressName, setAddressName] = useState('')
  const [addressPhone, setAddressPhone] = useState('')
  const [addressStreet, setAddressStreet] = useState('')
  const [addressDistrict, setAddressDistrict] = useState('')
  const [addressCity, setAddressCity] = useState('')

  const token = getAuthToken()
  const displayName = profile?.fullName || user?.email?.split('@')[0] || 'Thành viên AEROTEC'

  const applyProfile = (data) => {
    setProfile(data)
    setFullName(data?.fullName || '')
    setPhone(data?.phone || '')
    setBirthDate(data?.birthDate ? String(data.birthDate).split('T')[0] : '')
    setDefaultPaymentMethod(data?.defaultPaymentMethod || 'cod')
  }

  const loadAccount = async () => {
    if (!token) {
      setError('Vui lòng đăng nhập để xem hồ sơ tài khoản.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')
    const [profileResult, addressResult] = await Promise.allSettled([
      apiFetch('/users/profile', { auth: true }),
      apiFetch('/users/addresses', { auth: true }),
    ])

    if (profileResult.status === 'fulfilled') applyProfile(profileResult.value)
    else setError(profileResult.reason?.message || 'Không thể tải hồ sơ tài khoản.')

    if (addressResult.status === 'fulfilled') setAddresses(Array.isArray(addressResult.value) ? addressResult.value : [])
    else setError(addressResult.reason?.message || 'Không thể tải địa chỉ nhận hàng.')

    setLoading(false)
  }

  useEffect(() => {
    loadAccount()
  }, [])

  const uploadAvatar = async (file) => {
    if (!file) return
    setError('')
    setNotice('')
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh để làm avatar.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Ảnh đại diện không được vượt quá 2MB.')
      return
    }

    const formData = new FormData()
    formData.append('avatar', file)
    setAvatarUploading(true)
    try {
      const updated = await apiFetch('/users/profile/avatar', {
        method: 'POST',
        auth: true,
        body: formData,
        timeoutMs: 30000,
      })
      applyProfile(updated)
      setNotice('Đã cập nhật ảnh đại diện.')
    } catch (err) {
      setError(err.message || 'Không thể tải ảnh đại diện.')
    } finally {
      setAvatarUploading(false)
    }
  }

  const saveProfile = async () => {
    setError('')
    setNotice('')
    const cleanName = fullName.trim().replace(/\s+/g, ' ')
    const cleanPhone = phone.trim()

    if (cleanName && cleanName.length < 2) {
      setError('Họ tên phải có ít nhất 2 ký tự.')
      return
    }
    if (cleanPhone && !phonePattern.test(cleanPhone)) {
      setError('Số điện thoại không hợp lệ.')
      return
    }

    try {
      const updated = await apiFetch('/users/profile', {
        method: 'PUT',
        auth: true,
        body: JSON.stringify({
          fullName: cleanName || undefined,
          phone: cleanPhone || undefined,
          birthDate: birthDate || undefined,
          defaultPaymentMethod,
        }),
      })
      applyProfile(updated)
      setEditOpen(false)
      setNotice('Đã cập nhật thông tin hồ sơ.')
    } catch (err) {
      setError(err.message || 'Không thể cập nhật hồ sơ.')
    }
  }

  const openCreateAddress = () => {
    setEditAddress(null)
    setAddressName(profile?.fullName || '')
    setAddressPhone(profile?.phone || '')
    setAddressStreet('')
    setAddressDistrict('')
    setAddressCity('')
    setAddressOpen(true)
  }

  const openUpdateAddress = (address) => {
    setEditAddress(address)
    setAddressName(address.fullName || '')
    setAddressPhone(address.phone || '')
    setAddressStreet(address.street || '')
    setAddressDistrict(address.district || '')
    setAddressCity(address.city || '')
    setAddressOpen(true)
  }

  const saveAddress = async () => {
    setError('')
    setNotice('')
    const body = {
      fullName: addressName.trim().replace(/\s+/g, ' '),
      phone: addressPhone.trim(),
      street: addressStreet.trim(),
      district: addressDistrict.trim() || undefined,
      city: addressCity.trim(),
    }

    if (!body.fullName || !body.phone || !body.street || !body.city) {
      setError('Vui lòng nhập tên người nhận, số điện thoại, địa chỉ và thành phố/tỉnh.')
      return
    }
    if (!phonePattern.test(body.phone)) {
      setError('Số điện thoại nhận hàng không hợp lệ.')
      return
    }

    try {
      const url = editAddress ? `/users/addresses/${editAddress.id}` : '/users/addresses'
      await apiFetch(url, {
        method: editAddress ? 'PUT' : 'POST',
        auth: true,
        body: JSON.stringify(body),
      })
      await loadAccount()
      setAddressOpen(false)
      setNotice(editAddress ? 'Đã cập nhật địa chỉ giao hàng.' : 'Đã thêm địa chỉ giao hàng.')
    } catch (err) {
      setError(err.message || 'Không thể lưu địa chỉ giao hàng.')
    }
  }

  const deleteAddress = async (id) => {
    if (!confirm('Bạn muốn xóa địa chỉ giao hàng này?')) return
    try {
      await apiFetch(`/users/addresses/${id}`, { method: 'DELETE', auth: true })
      await loadAccount()
      setNotice('Đã xóa địa chỉ giao hàng.')
    } catch (err) {
      setError(err.message || 'Không thể xóa địa chỉ giao hàng.')
    }
  }

  const setDefaultAddress = async (id) => {
    try {
      await apiFetch(`/users/addresses/${id}/default`, { method: 'PUT', auth: true })
      await loadAccount()
      setNotice('Đã cập nhật địa chỉ mặc định.')
    } catch (err) {
      setError(err.message || 'Không thể cập nhật địa chỉ mặc định.')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', color: '#f8fafc', background: 'radial-gradient(circle at 78% 18%, rgba(225,29,72,0.22), transparent 28%), radial-gradient(circle at 10% 72%, rgba(245,158,11,0.12), transparent 32%), #050505' }}>
      <Box sx={{ borderBottom: '1px solid rgba(248,250,252,0.1)', background: 'rgba(5,5,5,0.72)', backdropFilter: 'blur(18px)' }}>
        <Container maxWidth="xl" sx={{ minHeight: 74, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'grid', lineHeight: 1 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 950 }}>AEROTEC</Typography>
            <Typography sx={{ color: '#fb7185', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>tài khoản phụ tùng</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Quay lại danh mục">
              <IconButton onClick={onGoHome} sx={{ color: '#fff', border: '1px solid rgba(248,250,252,0.14)' }}>
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Button startIcon={<LogoutIcon />} onClick={onLogout} sx={{ color: '#fff', border: '1px solid rgba(248,250,252,0.16)', borderRadius: 1, fontWeight: 900, textTransform: 'none' }}>
              Đăng xuất
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '0.72fr 1.28fr' }, gap: 3 }}>
          <Box sx={{ ...panelSx, p: { xs: 3, md: 4 }, alignSelf: 'start' }}>
            <Chip label="Tổng quan tài khoản" sx={{ color: '#fecdd3', border: '1px solid rgba(244,63,94,0.4)', background: 'rgba(225,29,72,0.14)', fontWeight: 900 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mt: 3 }}>
              <Avatar src={profile?.avatar || ''} sx={{ width: 86, height: 86, bgcolor: '#e11d48', fontSize: 34, fontWeight: 950 }}>
                {displayName[0]?.toUpperCase() || <PersonIcon />}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: { xs: 32, md: 44 }, lineHeight: 1, fontWeight: 950, overflowWrap: 'anywhere' }}>{displayName}</Typography>
                <Typography sx={{ mt: 1, color: 'rgba(248,250,252,0.58)', overflowWrap: 'anywhere' }}>{profile?.email || user?.email || 'Khách hàng đã đăng nhập'}</Typography>
              </Box>
            </Box>
            <Button fullWidth component="label" startIcon={<CloudUploadIcon />} disabled={avatarUploading} sx={{ mt: 2.5, minHeight: 42, color: '#f8fafc', border: '1px solid rgba(248,250,252,0.16)', borderRadius: 1, fontWeight: 900, textTransform: 'none' }}>
              {avatarUploading ? 'Đang tải ảnh...' : 'Tải ảnh avatar'}
              <input hidden type="file" accept="image/*" onChange={(event) => uploadAvatar(event.target.files?.[0])} />
            </Button>
            <Divider sx={{ my: 3, borderColor: 'rgba(248,250,252,0.1)' }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>{field('HỒ SƠ', profile?.fullName ? 'Đầy đủ' : 'Cần cập nhật')}</Grid>
              <Grid size={{ xs: 6 }}>{field('ĐỊA CHỈ', addresses.length)}</Grid>
              <Grid size={{ xs: 6 }}>{field('THANH TOÁN', paymentLabel[profile?.defaultPaymentMethod || 'cod'])}</Grid>
              <Grid size={{ xs: 6 }}>{field('PHIÊN LÀM VIỆC', token ? 'Hoạt động' : 'Hết hạn')}</Grid>
            </Grid>
            <Button fullWidth startIcon={<EditIcon />} onClick={() => setEditOpen(true)} sx={{ mt: 3, minHeight: 46, color: '#fff', borderRadius: 1, fontWeight: 950, textTransform: 'none', background: 'linear-gradient(135deg, #e11d48, #f97316)' }}>
              Chỉnh sửa hồ sơ
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gap: 3 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {notice && <Alert severity="success">{notice}</Alert>}
            {loading && <Alert severity="info">Đang tải dữ liệu tài khoản...</Alert>}

            <Box sx={{ ...panelSx, p: { xs: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box>
                  <Typography sx={{ fontSize: 24, fontWeight: 950 }}>Thông tin cá nhân</Typography>
                  <Typography sx={{ color: 'rgba(248,250,252,0.56)' }}>Thông tin định danh khách hàng đã lưu.</Typography>
                </Box>
                <Button startIcon={<EditIcon />} onClick={() => setEditOpen(true)} sx={{ color: '#fb7185', fontWeight: 900, textTransform: 'none' }}>Chỉnh sửa</Button>
              </Box>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>{field('HỌ VÀ TÊN', profile?.fullName)}</Grid>
                <Grid size={{ xs: 12, sm: 6 }}>{field('EMAIL', profile?.email || user?.email)}</Grid>
                <Grid size={{ xs: 12, sm: 6 }}>{field('SỐ ĐIỆN THOẠI', profile?.phone)}</Grid>
                <Grid size={{ xs: 12, sm: 6 }}>{field('NGÀY SINH', profile?.birthDate ? new Date(profile.birthDate).toLocaleDateString('vi-VN') : '')}</Grid>
              </Grid>
            </Box>

            <Box sx={{ ...panelSx, p: { xs: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2.5 }}>
                <Box>
                  <Typography sx={{ fontSize: 24, fontWeight: 950 }}>Thanh toán</Typography>
                  <Typography sx={{ color: 'rgba(248,250,252,0.56)' }}>Phương thức mặc định sẽ được chọn sẵn khi checkout.</Typography>
                </Box>
                <Button startIcon={<EditIcon />} onClick={() => setEditOpen(true)} sx={{ color: '#fb7185', fontWeight: 900, textTransform: 'none' }}>Cập nhật</Button>
              </Box>
              <Grid container spacing={1.5}>
                {paymentMethods.map((method) => {
                  const active = (profile?.defaultPaymentMethod || 'cod') === method.id
                  return (
                    <Grid key={method.id} size={{ xs: 12, md: 4 }}>
                      <Box sx={{ height: '100%', p: 2, border: '1px solid', borderColor: active ? 'rgba(244,63,94,0.7)' : 'rgba(248,250,252,0.12)', borderRadius: 1, background: active ? 'rgba(225,29,72,0.12)' : 'rgba(5,5,5,0.42)' }}>
                        <Typography sx={{ color: '#fff', fontWeight: 950 }}>{method.label}</Typography>
                        <Typography sx={{ mt: 0.75, color: 'rgba(248,250,252,0.58)', fontSize: 13 }}>{method.description}</Typography>
                      </Box>
                    </Grid>
                  )
                })}
              </Grid>
            </Box>

            <Box sx={{ ...panelSx, p: { xs: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box>
                  <Typography sx={{ fontSize: 24, fontWeight: 950 }}>Địa chỉ nhận hàng</Typography>
                  <Typography sx={{ color: 'rgba(248,250,252,0.56)' }}>Các địa chỉ đã lưu để thanh toán.</Typography>
                </Box>
                <Button startIcon={<AddIcon />} onClick={openCreateAddress} sx={{ color: '#fb7185', fontWeight: 900, textTransform: 'none' }}>Thêm địa chỉ</Button>
              </Box>
              {addresses.length === 0 ? (
                <Box sx={{ p: 3, border: '1px dashed rgba(248,250,252,0.18)', borderRadius: 1, textAlign: 'center' }}>
                  <HomeIcon sx={{ color: '#fb7185', fontSize: 34 }} />
                  <Typography sx={{ mt: 1, color: 'rgba(248,250,252,0.62)' }}>Chưa có địa chỉ nhận hàng nào được lưu.</Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {addresses.map((address) => (
                    <Grid key={address.id} size={{ xs: 12, md: 6 }}>
                      <Box sx={{ minHeight: 184, p: 2, border: '1px solid', borderColor: address.isDefault ? 'rgba(244,63,94,0.62)' : 'rgba(248,250,252,0.12)', borderRadius: 1, background: address.isDefault ? 'rgba(225,29,72,0.12)' : 'rgba(5,5,5,0.42)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 1 }}>
                          <Box>
                            <Typography sx={{ fontWeight: 950 }}>{address.fullName}</Typography>
                            <Typography sx={{ color: 'rgba(248,250,252,0.58)' }}>{address.phone}</Typography>
                          </Box>
                          {address.isDefault && <Chip label="Mặc định" size="small" sx={{ color: '#fecdd3', background: 'rgba(225,29,72,0.24)', fontWeight: 900 }} />}
                        </Box>
                        <Typography sx={{ mt: 2, color: 'rgba(248,250,252,0.74)' }}>
                          {address.street}{address.district ? `, ${address.district}` : ''}{address.city ? `, ${address.city}` : ''}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                          {!address.isDefault && <Button size="small" onClick={() => setDefaultAddress(address.id)} sx={{ color: '#fb7185', fontWeight: 900, textTransform: 'none' }}>Đặt làm mặc định</Button>}
                          <IconButton size="small" onClick={() => openUpdateAddress(address)} sx={{ color: '#f8fafc' }}><EditIcon fontSize="small" /></IconButton>
                          <IconButton size="small" onClick={() => deleteAddress(address.id)} sx={{ color: '#fb7185' }}><DeleteIcon fontSize="small" /></IconButton>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Box>
        </Box>
      </Container>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { ...panelSx, color: '#f8fafc' } }}>
        <DialogTitle sx={{ fontWeight: 950 }}>Chỉnh sửa hồ sơ</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: '10px !important' }}>
          <TextField label="Họ và tên" value={fullName} onChange={(event) => setFullName(event.target.value)} sx={inputSx} />
          <TextField label="Số điện thoại" value={phone} onChange={(event) => setPhone(event.target.value)} sx={inputSx} />
          <TextField label="Ngày sinh" type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} sx={inputSx} slotProps={{ inputLabel: { shrink: true } }} />
          <Box sx={{ p: 2, border: '1px solid rgba(248,250,252,0.12)', borderRadius: 1 }}>
            <Typography sx={{ color: '#fff', fontWeight: 950, mb: 1 }}>Ảnh đại diện</Typography>
            <Button component="label" startIcon={<CloudUploadIcon />} disabled={avatarUploading} sx={{ color: '#fb7185', fontWeight: 900, textTransform: 'none' }}>
              {avatarUploading ? 'Đang tải ảnh...' : 'Chọn ảnh từ máy'}
              <input hidden type="file" accept="image/*" onChange={(event) => uploadAvatar(event.target.files?.[0])} />
            </Button>
          </Box>
          <Box sx={{ p: 2, border: '1px solid rgba(248,250,252,0.12)', borderRadius: 1 }}>
            <Typography sx={{ color: '#fff', fontWeight: 950, mb: 1 }}>Phương thức thanh toán mặc định</Typography>
            <RadioGroup value={defaultPaymentMethod} onChange={(event) => setDefaultPaymentMethod(event.target.value)}>
              {paymentMethods.map((method) => (
                <FormControlLabel
                  key={method.id}
                  value={method.id}
                  control={<Radio sx={{ color: 'rgba(248,250,252,0.35)', '&.Mui-checked': { color: '#f43f5e' } }} />}
                  label={
                    <Box>
                      <Typography sx={{ color: '#fff', fontWeight: 900 }}>{method.label}</Typography>
                      <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: 12 }}>{method.description}</Typography>
                    </Box>
                  }
                />
              ))}
            </RadioGroup>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ color: 'rgba(248,250,252,0.7)', fontWeight: 900 }}>Hủy</Button>
          <Button onClick={saveProfile} sx={{ color: '#fff', background: 'linear-gradient(135deg, #e11d48, #f97316)', fontWeight: 950 }}>Lưu hồ sơ</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addressOpen} onClose={() => setAddressOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { ...panelSx, color: '#f8fafc' } }}>
        <DialogTitle sx={{ fontWeight: 950 }}>{editAddress ? 'Sửa địa chỉ nhận hàng' : 'Thêm địa chỉ nhận hàng'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: '10px !important' }}>
          <TextField label="Tên người nhận" value={addressName} onChange={(event) => setAddressName(event.target.value)} sx={inputSx} />
          <TextField label="Số điện thoại" value={addressPhone} onChange={(event) => setAddressPhone(event.target.value)} sx={inputSx} />
          <TextField label="Địa chỉ" value={addressStreet} onChange={(event) => setAddressStreet(event.target.value)} sx={inputSx} />
          <TextField label="Quận/Huyện" value={addressDistrict} onChange={(event) => setAddressDistrict(event.target.value)} sx={inputSx} />
          <TextField label="Thành phố / Tỉnh" value={addressCity} onChange={(event) => setAddressCity(event.target.value)} sx={inputSx} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddressOpen(false)} sx={{ color: 'rgba(248,250,252,0.7)', fontWeight: 900 }}>Hủy</Button>
          <Button onClick={saveAddress} sx={{ color: '#fff', background: 'linear-gradient(135deg, #e11d48, #f97316)', fontWeight: 950 }}>
            {editAddress ? 'Lưu địa chỉ' : 'Thêm địa chỉ'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
