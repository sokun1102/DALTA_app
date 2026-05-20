import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

export default function ForgotPasswordPage({ onGoLogin }) {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  const handleSubmit = async () => {
    if (!email) { alert('Vui lòng nhập email'); return }
    setLoading(true)
    try {
      await fetch('http://localhost:3000/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
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
          Quên mật khẩu?
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
          Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.
        </Typography>

        {sent ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Email đã được gửi! Kiểm tra hộp thư của bạn (kể cả thư mục spam).
          </Alert>
        ) : (
          <>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, color: '#374151', mb: 0.5 }}>
              EMAIL ADDRESS
            </Typography>
            <TextField fullWidth size="small" placeholder="your@email.com" type="email"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              sx={{ mb: 3 }} />
            <Button fullWidth variant="contained" size="large" onClick={handleSubmit} disabled={loading}
              sx={{ bgcolor: '#1a3de4', fontWeight: 700, py: 1.5, borderRadius: 2, mb: 2,
                '&:hover': { bgcolor: '#1530b8' } }}>
              {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
            </Button>
          </>
        )}

        <Typography variant="body2" sx={{ textAlign: 'center', color: '#6b7280' }}>
          Nhớ mật khẩu rồi?{' '}
          <Box component="span" onClick={onGoLogin}
            sx={{ color: '#1a3de4', fontWeight: 700, cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' } }}>
            Đăng nhập
          </Box>
        </Typography>
      </Box>
    </Box>
  )
}
