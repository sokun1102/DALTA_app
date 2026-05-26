import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

export default function ResetPasswordPage({ onGoLogin }) {
  const [token, setToken]           = useState('')
  const [newPassword, setNew]       = useState('')
  const [confirmPass, setConfirm]   = useState('')
  const [loading, setLoading]       = useState(false)
  const [success, setSuccess]       = useState(false)

  // Lấy token từ URL ?token=xxx
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const t = params.get('token')
    if (t) setToken(t)
  }, [])

  const handleSubmit = async () => {
    if (!newPassword || !confirmPass) { alert('Vui lòng nhập đầy đủ'); return }
    if (newPassword !== confirmPass) { alert('Mật khẩu xác nhận không khớp'); return }
    if (newPassword.length < 6) { alert('Mật khẩu phải ít nhất 6 ký tự'); return }
    setLoading(true)
    try {
      const res  = await fetch('http://localhost:3000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(true)
      } else {
        alert(data.message || 'Token không hợp lệ hoặc đã hết hạn')
      }
    } catch {
      alert('Không thể kết nối máy chủ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f2f8',
      display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Box sx={{ bgcolor: '#fff', borderRadius: 3, p: 5, width: '100%', maxWidth: 440,
        boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}>

        <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mb: 0.5 }}>
          Đặt lại mật khẩu
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
          Nhập mật khẩu mới cho tài khoản của bạn.
        </Typography>

        {success ? (
          <>
            <Alert severity="success" sx={{ mb: 3 }}>
              Mật khẩu đã được đặt lại thành công!
            </Alert>
            <Button fullWidth variant="contained" size="large" onClick={onGoLogin}
              sx={{ bgcolor: '#1a3de4', fontWeight: 700, py: 1.5, borderRadius: 2 }}>
              Đăng nhập ngay
            </Button>
          </>
        ) : (
          <>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, color: '#374151', mb: 0.5 }}>
              MẬT KHẨU MỚI
            </Typography>
            <TextField fullWidth size="small" placeholder="••••••••" type="password"
              value={newPassword} onChange={e => setNew(e.target.value)} sx={{ mb: 2 }} />

            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, color: '#374151', mb: 0.5 }}>
              XÁC NHẬN MẬT KHẨU
            </Typography>
            <TextField fullWidth size="small" placeholder="••••••••" type="password"
              value={confirmPass} onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              sx={{ mb: 3 }} />

            <Button fullWidth variant="contained" size="large" onClick={handleSubmit} disabled={loading}
              sx={{ bgcolor: '#1a3de4', fontWeight: 700, py: 1.5, borderRadius: 2, mb: 2,
                '&:hover': { bgcolor: '#1530b8' } }}>
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </Button>
          </>
        )}
      </Box>
    </Box>
  )
}
