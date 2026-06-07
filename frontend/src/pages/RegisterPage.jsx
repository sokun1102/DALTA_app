import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import EmailIcon from '@mui/icons-material/EmailOutlined'
import GoogleIcon from '@mui/icons-material/Google'
import LockIcon from '@mui/icons-material/LockOutlined'
import PersonIcon from '@mui/icons-material/PersonOutline'
import AccountShell from './AccountShell'
import { API_BASE_URL } from '../config/api'
import { apiFetch } from '../services/apiClient'

const fieldSx = {
  mb: 2,
  '& .MuiOutlinedInput-root': {
    color: '#f8fafc',
    borderRadius: 1,
    background: 'rgba(5,5,5,0.52)',
    '& fieldset': { borderColor: 'rgba(248,250,252,0.16)' },
    '&:hover fieldset': { borderColor: 'rgba(244,63,94,0.46)' },
    '&.Mui-focused fieldset': { borderColor: '#f43f5e' },
  },
  '& .MuiInputBase-input::placeholder': { color: 'rgba(248,250,252,0.38)', opacity: 1 },
}

const fullNamePattern = /^[\p{L}\s'.-]+$/u

export default function RegisterPage({ onRegisterSuccess, onGoLogin, onGoHome }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleRegister = async () => {
    setError('')
    setSuccess('')

    const cleanName = fullName.trim().replace(/\s+/g, ' ')
    const normalizedEmail = email.trim().toLowerCase()

    if (!cleanName || !normalizedEmail || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ họ tên, email và mật khẩu.')
      return
    }

    if (!fullNamePattern.test(cleanName)) {
      setError('Họ tên chỉ nên chứa chữ cái và khoảng trắng, ví dụ: dang nhut truong.')
      return
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.')
      return
    }

    if (password !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.')
      return
    }

    if (!agreed) {
      setError('Vui lòng đồng ý điều khoản sử dụng tài khoản AEROTEC trước khi tiếp tục.')
      return
    }

    setLoading(true)
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName: cleanName, email: normalizedEmail, password }),
      })

      setSuccess('Tạo tài khoản thành công. Đang chuyển sang trang đăng nhập...')
      window.setTimeout(() => onRegisterSuccess?.(), 600)
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AccountShell
      eyebrow="Tạo tài khoản"
      title="Bắt đầu mua phụ tùng."
      copy="Tạo hồ sơ khách hàng để lưu thông tin cá nhân, địa chỉ giao hàng và lịch sử đặt hàng."
      onGoHome={onGoHome}
      sideTitle="Tài khoản AEROTEC"
      sideCopy="Một tài khoản giúp bạn quản lý hồ sơ, địa chỉ nhận hàng, giỏ hàng và đơn hàng phụ tùng xe."
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Typography sx={{ mb: 0.75, color: 'rgba(248,250,252,0.72)', fontSize: 12, fontWeight: 900 }}>
        HỌ VÀ TÊN
      </Typography>
      <TextField
        fullWidth
        placeholder="dang nhut truong"
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        sx={fieldSx}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon sx={{ color: '#fb7185' }} />
              </InputAdornment>
            ),
          },
        }}
      />

      <Typography sx={{ mb: 0.75, color: 'rgba(248,250,252,0.72)', fontSize: 12, fontWeight: 900 }}>
        ĐỊA CHỈ EMAIL
      </Typography>
      <TextField
        fullWidth
        placeholder="sokun1102@gmail.com"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        sx={fieldSx}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ color: '#fb7185' }} />
              </InputAdornment>
            ),
          },
        }}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography sx={{ mb: 0.75, color: 'rgba(248,250,252,0.72)', fontSize: 12, fontWeight: 900 }}>
            MẬT KHẨU
          </Typography>
          <TextField
            fullWidth
            placeholder="Tối thiểu 8 ký tự"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            sx={fieldSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#fb7185' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography sx={{ mb: 0.75, color: 'rgba(248,250,252,0.72)', fontSize: 12, fontWeight: 900 }}>
            XÁC NHẬN
          </Typography>
          <TextField
            fullWidth
            placeholder="Nhập lại mật khẩu"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleRegister()}
            sx={fieldSx}
          />
        </Grid>
      </Grid>

      <FormControlLabel
        sx={{ mb: 2, alignItems: 'flex-start' }}
        control={
          <Checkbox
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            sx={{ color: 'rgba(248,250,252,0.52)', '&.Mui-checked': { color: '#f43f5e' } }}
          />
        }
        label={
          <Typography sx={{ color: 'rgba(248,250,252,0.68)', fontSize: 14 }}>
            Tôi đồng ý sử dụng tài khoản này cho mua sắm, nhận hàng và cập nhật đơn hàng từ AEROTEC.
          </Typography>
        }
      />

      <Button
        fullWidth
        onClick={handleRegister}
        disabled={loading}
        sx={{
          minHeight: 48,
          color: '#fff',
          borderRadius: 1,
          fontWeight: 950,
          textTransform: 'none',
          background: 'linear-gradient(135deg, #e11d48, #f97316)',
        }}
      >
        {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
      </Button>

      <Divider sx={{ my: 3, borderColor: 'rgba(248,250,252,0.12)' }}>
        <Typography sx={{ color: 'rgba(248,250,252,0.42)', fontSize: 12, fontWeight: 900 }}>HOẶC</Typography>
      </Divider>

      <Button
        fullWidth
        href={`${API_BASE_URL}/auth/google`}
        startIcon={<GoogleIcon />}
        sx={{
          minHeight: 46,
          color: '#f8fafc',
          border: '1px solid rgba(248,250,252,0.16)',
          borderRadius: 1,
          fontWeight: 900,
          textTransform: 'none',
        }}
      >
        Tiếp tục với Google
      </Button>

      <Typography sx={{ mt: 3, textAlign: 'center', color: 'rgba(248,250,252,0.62)' }}>
        Đã có tài khoản?{' '}
        <Box component="button" onClick={onGoLogin} sx={{ p: 0, border: 0, color: '#fb7185', background: 'transparent', font: 'inherit', fontWeight: 900, cursor: 'pointer' }}>
          Đăng nhập
        </Box>
      </Typography>
    </AccountShell>
  )
}
