import { useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import EmailIcon from '@mui/icons-material/EmailOutlined'
import AccountShell from './AccountShell'
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

export default function ForgotPasswordPage({ onGoLogin, onGoHome }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    setMessage('')

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setError('Vui lòng nhập email liên kết với tài khoản của bạn.')
      return
    }

    setLoading(true)
    try {
      const data = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail }),
      })
      setMessage(data.message || 'Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi.')
    } catch (err) {
      setError(err.message || 'Không thể gửi liên kết đặt lại mật khẩu lúc này.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AccountShell
      eyebrow="Khôi phục mật khẩu"
      title="Đặt lại quyền truy cập."
      copy="Nhập email tài khoản. AEROTEC sẽ gửi liên kết đặt lại mật khẩu có hiệu lực trong thời gian ngắn."
      onGoHome={onGoHome}
      sideTitle="Bảo mật tài khoản"
      sideCopy="Liên kết đặt lại mật khẩu chỉ dùng một lần và hết hạn nhanh để bảo vệ tài khoản của bạn."
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      <Typography sx={{ mb: 0.75, color: 'rgba(248,250,252,0.72)', fontSize: 12, fontWeight: 900 }}>
        ĐỊA CHỈ EMAIL
      </Typography>
      <TextField
        fullWidth
        placeholder="you@example.com"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && handleSubmit()}
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

      <Button
        fullWidth
        onClick={handleSubmit}
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
        {loading ? 'Đang gửi liên kết...' : 'Gửi liên kết đặt lại'}
      </Button>

      <Typography sx={{ mt: 3, textAlign: 'center', color: 'rgba(248,250,252,0.62)' }}>
        Đã nhớ mật khẩu?{' '}
        <Box component="button" onClick={onGoLogin} sx={{ p: 0, border: 0, color: '#fb7185', background: 'transparent', font: 'inherit', fontWeight: 900, cursor: 'pointer' }}>
          Đăng nhập
        </Box>
      </Typography>
    </AccountShell>
  )
}
