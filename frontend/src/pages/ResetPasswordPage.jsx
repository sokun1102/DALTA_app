import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import LockIcon from '@mui/icons-material/LockOutlined'
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

export default function ResetPasswordPage({ onGoLogin, onGoHome }) {
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setToken(params.get('token') || '')
  }, [])

  const handleSubmit = async () => {
    setError('')

    if (!token) {
      setError('Thiếu token đặt lại mật khẩu từ URL.')
      return
    }

    if (!newPassword || !confirmPassword) {
      setError('Vui lòng nhập và xác nhận mật khẩu mới.')
      return
    }

    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.')
      return
    }

    setLoading(true)
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AccountShell
      eyebrow="Mật khẩu mới"
      title="Thiết lập mật khẩu."
      copy="Chọn mật khẩu mới cho tài khoản AEROTEC. Sau khi đổi thành công, bạn cần đăng nhập lại."
      onGoHome={onGoHome}
      sideTitle="Quay lại an toàn"
      sideCopy="Thông tin hồ sơ, địa chỉ và lịch sử đơn hàng vẫn được giữ nguyên sau khi đổi mật khẩu."
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Đặt lại mật khẩu thành công.</Alert>}

      {!success ? (
        <>
          <Typography sx={{ mb: 0.75, color: 'rgba(248,250,252,0.72)', fontSize: 12, fontWeight: 900 }}>
            MẬT KHẨU MỚI
          </Typography>
          <TextField
            fullWidth
            placeholder="Tối thiểu 8 ký tự"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
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

          <Typography sx={{ mb: 0.75, color: 'rgba(248,250,252,0.72)', fontSize: 12, fontWeight: 900 }}>
            XÁC NHẬN MẬT KHẨU
          </Typography>
          <TextField
            fullWidth
            placeholder="Nhập lại mật khẩu"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSubmit()}
            sx={fieldSx}
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
            {loading ? 'Đang cập nhật mật khẩu...' : 'Đặt lại mật khẩu'}
          </Button>
        </>
      ) : (
        <Button
          fullWidth
          onClick={onGoLogin}
          sx={{
            minHeight: 48,
            color: '#fff',
            borderRadius: 1,
            fontWeight: 950,
            textTransform: 'none',
            background: 'linear-gradient(135deg, #e11d48, #f97316)',
          }}
        >
          Đăng nhập ngay
        </Button>
      )}
    </AccountShell>
  )
}
