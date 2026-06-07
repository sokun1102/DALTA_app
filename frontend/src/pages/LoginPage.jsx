import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import EmailIcon from '@mui/icons-material/EmailOutlined'
import GoogleIcon from '@mui/icons-material/Google'
import LockIcon from '@mui/icons-material/LockOutlined'
import AccountShell from './AccountShell'
import { API_BASE_URL } from '../config/api'
import { apiFetch } from '../services/apiClient'
import { setAuthToken } from '../services/authToken'

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

export default function LoginPage({ onLoginSuccess, onGoRegister, onForgotPassword, onGoHome }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      setError('Vui lòng nhập email và mật khẩu để tiếp tục.')
      return
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.')
      return
    }

    setLoading(true)
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail, password }),
      })

      setAuthToken(data.access_token, remember)
      try {
        const profile = await apiFetch('/users/profile', { auth: true })
        onLoginSuccess?.(profile?.email ? profile : { email: normalizedEmail })
      } catch {
        onLoginSuccess?.({ email: normalizedEmail })
      }
    } catch (err) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AccountShell
      eyebrow="Đăng nhập bảo mật"
      title="Chào mừng quay trở lại."
      copy="Sử dụng tài khoản AEROTEC để quản lý hồ sơ, địa chỉ nhận hàng, giỏ hàng và lịch sử đơn hàng."
      onGoHome={onGoHome}
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography sx={{ mb: 0.75, color: 'rgba(248,250,252,0.72)', fontSize: 12, fontWeight: 900 }}>
        ĐỊA CHỈ EMAIL
      </Typography>
      <TextField
        fullWidth
        placeholder="you@example.com"
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

      <Typography sx={{ mb: 0.75, color: 'rgba(248,250,252,0.72)', fontSize: 12, fontWeight: 900 }}>
        MẬT KHẨU
      </Typography>
      <TextField
        fullWidth
        placeholder="Tối thiểu 8 ký tự"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && handleLogin()}
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

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              sx={{ color: 'rgba(248,250,252,0.52)', '&.Mui-checked': { color: '#f43f5e' } }}
            />
          }
          label={<Typography sx={{ color: 'rgba(248,250,252,0.72)', fontSize: 14 }}>Ghi nhớ đăng nhập</Typography>}
        />
        <Button onClick={onForgotPassword} sx={{ color: '#fb7185', fontWeight: 900, textTransform: 'none' }}>
          Quên mật khẩu?
        </Button>
      </Box>

      <Button
        fullWidth
        onClick={handleLogin}
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
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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
        Chưa có tài khoản?{' '}
        <Box component="button" onClick={onGoRegister} sx={{ p: 0, border: 0, color: '#fb7185', background: 'transparent', font: 'inherit', fontWeight: 900, cursor: 'pointer' }}>
          Tạo tài khoản mới
        </Box>
      </Typography>
    </AccountShell>
  )
}
