import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import EmailIcon from '@mui/icons-material/EmailOutlined'
import LockIcon from '@mui/icons-material/LockOutlined'

export default function LoginPage({ onLoginSuccess, onGoRegister, onForgotPassword }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading]   = useState(false)

  const handleLogin = async () => {
    if (!email || !password) { alert('Vui lòng nhập đầy đủ thông tin'); return }
    setLoading(true)
    try {
      const res  = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.access_token)
        onLoginSuccess?.({ email })
      } else {
        alert(data.message || 'Email hoặc mật khẩu không đúng')
      }
    } catch {
      alert('Không thể kết nối máy chủ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#dde3ee',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
    }}>
      <Box sx={{
        display: 'flex',
        width: '100%',
        maxWidth: 860,
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
      }}>

        {/* ── LEFT PANEL ── */}
        <Box sx={{
          width: { xs: 0, md: '42%' },
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          bgcolor: '#e8edf7',
          p: 4,
        }}>
          {/* Logo */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1a3de4', letterSpacing: 0.5 }}>
              DALTA
            </Typography>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              Quality Products. Smart Shopping.
            </Typography>
          </Box>

          {/* Middle text */}
          <Box>
            <Box sx={{ width: 32, height: 3, bgcolor: '#1a3de4', mb: 2, borderRadius: 1 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', lineHeight: 1.2, mb: 2 }}>
              Refined<br />Access for<br />Curators.
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.7 }}>
              Step back into your workspace where every
              detail is managed with structural precision.
            </Typography>
          </Box>

          {/* Footer */}
          <Typography variant="caption" sx={{ color: '#9ca3af' }}>
            © 2026 DALTA.
          </Typography>
        </Box>

        {/* ── RIGHT PANEL ── */}
        <Box sx={{
          flex: 1,
          bgcolor: '#fff',
          p: { xs: 3, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mb: 0.5 }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mb: 4 }}>
            Please enter your details to sign in.
          </Typography>

          {/* Email */}
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: '#374151', mb: 0.5 }}>
            EMAIL ADDRESS
          </Typography>
          <TextField
            fullWidth size="small" placeholder="your@email.com"
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            slotProps={{ input: { startAdornment: (
              <InputAdornment position="start">
                <EmailIcon fontSize="small" sx={{ color: '#9ca3af' }} />
              </InputAdornment>
            )}}}
          />

          {/* Password */}
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: '#374151', mb: 0.5 }}>
            PASSWORD
          </Typography>
          <TextField
            fullWidth size="small" placeholder="••••••••"
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            sx={{ mb: 1.5 }}
            slotProps={{ input: { startAdornment: (
              <InputAdornment position="start">
                <LockIcon fontSize="small" sx={{ color: '#9ca3af' }} />
              </InputAdornment>
            )}}}
          />

          {/* Remember + Forgot */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <FormControlLabel
              control={<Checkbox size="small" checked={remember} onChange={e => setRemember(e.target.checked)} />}
              label={<Typography variant="body2" sx={{ color: '#374151' }}>Remember Me</Typography>}
              sx={{ m: 0 }}
            />
            <Typography variant="body2"
              sx={{ color: '#1a3de4', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={onForgotPassword}>
              Forgot Password?
            </Typography>
          </Box>

          {/* Sign In button */}
          <Button fullWidth variant="contained" size="large" onClick={handleLogin} disabled={loading}
            sx={{
              bgcolor: '#1a3de4', fontWeight: 700, py: 1.5, borderRadius: 2, mb: 3,
              '&:hover': { bgcolor: '#1530b8' },
            }}>
            {loading ? 'Đang đăng nhập...' : 'Sign In'}
          </Button>

          {/* Divider */}
          <Divider sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ color: '#9ca3af', letterSpacing: 1 }}>
              OR CONTINUE WITH
            </Typography>
          </Divider>

          {/* Social buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button fullWidth variant="outlined" size="large"
              href="http://localhost:3000/auth/google"
              startIcon={<img src="https://www.google.com/favicon.ico" width="18" alt="g" />}
              sx={{ borderColor: '#e5e7eb', color: '#111827', fontWeight: 600, borderRadius: 2,
                '&:hover': { bgcolor: '#f9fafb', borderColor: '#d1d5db' } }}>
              Google
            </Button>
            <Button fullWidth variant="outlined" size="large"
              startIcon={
                <Box sx={{ width: 18, height: 18, bgcolor: '#1877f2', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: '#fff', fontSize: 12, fontWeight: 800, lineHeight: 1 }}>f</Typography>
                </Box>
              }
              sx={{ borderColor: '#e5e7eb', color: '#111827', fontWeight: 600, borderRadius: 2,
                '&:hover': { bgcolor: '#f9fafb', borderColor: '#d1d5db' } }}>
              Facebook
            </Button>
          </Box>

          {/* Go to register */}
          <Typography variant="body2" sx={{ textAlign: 'center', color: '#6b7280' }}>
            Don't have an account?{' '}
            <Box component="span"
              onClick={onGoRegister}
              sx={{ color: '#1a3de4', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
              Create Account
            </Box>
          </Typography>
        </Box>

      </Box>
    </Box>
  )
}
