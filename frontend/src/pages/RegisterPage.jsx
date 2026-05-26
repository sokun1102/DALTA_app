import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'

const leftImg = 'https://picsum.photos/seed/register-dalta/600/900'

export default function RegisterPage({ onRegisterSuccess, onGoLogin }) {
  const [fullName, setFullName]         = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [confirmPassword, setConfirm]   = useState('')
  const [agreed, setAgreed]             = useState(false)
  const [loading, setLoading]           = useState(false)

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      alert('Vui lòng điền đầy đủ thông tin'); return
    }
    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp'); return
    }
    if (!agreed) {
      alert('Vui lòng đồng ý với điều khoản sử dụng'); return
    }
    setLoading(true)
    try {
      const res  = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.')
        onRegisterSuccess?.()
      } else {
        alert(data.message || 'Đăng ký thất bại')
      }
    } catch {
      alert('Không thể kết nối máy chủ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f2f8', display: 'flex', flexDirection: 'column' }}>

      {/* ── NAVBAR ── */}
      <AppBar position="static" elevation={0}
        sx={{ bgcolor: '#fff', borderBottom: '1px solid #e5e7eb', color: 'text.primary' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#111', letterSpacing: 1 }}>
              DALTA
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ cursor: 'pointer', color: '#6b7280',
                '&:hover': { color: '#111' } }}>
                About
              </Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', color: '#1a3de4', fontWeight: 700,
                '&:hover': { textDecoration: 'underline' } }}
                onClick={onGoLogin}>
                Sign In
              </Typography>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ── MAIN CARD ── */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Box sx={{
          display: 'flex', width: '100%', maxWidth: 900,
          borderRadius: 3, overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        }}>

          {/* ── LEFT IMAGE PANEL ── */}
          <Box sx={{
            width: { xs: 0, md: '38%' },
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'flex-end',
            position: 'relative',
            minHeight: 580,
          }}>
            <Box component="img" src={leftImg} alt="register"
              sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', filter: 'brightness(0.55)' }} />

            {/* Overlay text */}
            <Box sx={{ position: 'relative', p: 4, color: '#fff' }}>
              <Typography variant="overline" sx={{ letterSpacing: 3, opacity: 0.7, fontSize: 10 }}>
                DALTA SHOP
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2, mt: 1, mb: 2 }}>
                Define your digital<br />curation experience.
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.75, lineHeight: 1.7 }}>
                Join a community of curators who value clarity,
                precision, and the art of professional presentation.
              </Typography>

              {/* Slide dots */}
              <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                {[true, false, false].map((active, i) => (
                  <Box key={i} sx={{
                    height: 3, width: active ? 28 : 14, borderRadius: 2,
                    bgcolor: active ? '#fff' : 'rgba(255,255,255,0.4)',
                  }} />
                ))}
              </Box>
            </Box>
          </Box>

          {/* ── RIGHT FORM PANEL ── */}
          <Box sx={{
            flex: 1, bgcolor: '#fff',
            p: { xs: 3, md: 5 },
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mb: 0.5 }}>
              Create Account
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
              Start your journey into the world of DALTA.
            </Typography>

            {/* Full Name */}
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, color: '#374151', mb: 0.5 }}>
              Full Name
            </Typography>
            <TextField fullWidth size="small" placeholder="Nguyễn Văn A"
              value={fullName} onChange={e => setFullName(e.target.value)} sx={{ mb: 2 }} />

            {/* Email */}
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, color: '#374151', mb: 0.5 }}>
              Email Address
            </Typography>
            <TextField fullWidth size="small" placeholder="your@email.com" type="email"
              value={email} onChange={e => setEmail(e.target.value)} sx={{ mb: 2 }} />

            {/* Password row */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, color: '#374151', mb: 0.5, display: 'block' }}>
                  Password
                </Typography>
                <TextField fullWidth size="small" placeholder="••••••••" type="password"
                  value={password} onChange={e => setPassword(e.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5, color: '#374151', mb: 0.5, display: 'block' }}>
                  Confirm Password
                </Typography>
                <TextField fullWidth size="small" placeholder="••••••••" type="password"
                  value={confirmPassword} onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()} />
              </Grid>
            </Grid>

            {/* Terms */}
            <FormControlLabel sx={{ mb: 2, alignItems: 'flex-start' }}
              control={<Checkbox size="small" checked={agreed} onChange={e => setAgreed(e.target.checked)} sx={{ pt: 0.3 }} />}
              label={
                <Typography variant="body2" sx={{ color: '#374151' }}>
                  I agree to the{' '}
                  <Box component="span" sx={{ color: '#1a3de4', fontWeight: 600, cursor: 'pointer' }}>
                    Terms and Conditions
                  </Box>
                  {' '}and the{' '}
                  <Box component="span" sx={{ color: '#1a3de4', fontWeight: 600, cursor: 'pointer' }}>
                    Privacy Policy
                  </Box>.
                </Typography>
              }
            />

            {/* Create Account button */}
            <Button fullWidth variant="contained" size="large" onClick={handleRegister} disabled={loading}
              endIcon={<span>→</span>}
              sx={{
                bgcolor: '#1a3de4', fontWeight: 700, py: 1.5, borderRadius: 2, mb: 3,
                '&:hover': { bgcolor: '#1530b8' },
              }}>
              {loading ? 'Đang đăng ký...' : 'Create Account'}
            </Button>

            {/* Divider */}
            <Divider sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ color: '#9ca3af', letterSpacing: 1 }}>
                OR REGISTER WITH
              </Typography>
            </Divider>

            {/* Social buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button fullWidth variant="outlined" size="large"
                href="http://localhost:3000/auth/google"
                startIcon={
                  <Typography sx={{ fontWeight: 800, fontSize: 13, color: '#4285F4', letterSpacing: -1 }}>
                    GOOGLE
                  </Typography>
                }
                sx={{ borderColor: '#e5e7eb', color: '#111827', fontWeight: 600, borderRadius: 2,
                  '&:hover': { bgcolor: '#f9fafb' } }}>
                Google
              </Button>
              <Button fullWidth variant="outlined" size="large"
                startIcon={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontSize: 11, color: '#6b7280' }}>iOS</Typography>
                  </Box>
                }
                sx={{ borderColor: '#e5e7eb', color: '#111827', fontWeight: 600, borderRadius: 2,
                  '&:hover': { bgcolor: '#f9fafb' } }}>
                Apple
              </Button>
            </Box>

            {/* Go to login */}
            <Typography variant="body2" sx={{ textAlign: 'center', color: '#6b7280' }}>
              Already have an account?{' '}
              <Box component="span" onClick={onGoLogin}
                sx={{ color: '#1a3de4', fontWeight: 700, cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' } }}>
                Sign In
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── FOOTER ── */}
      <Box sx={{ bgcolor: '#fff', borderTop: '1px solid #e5e7eb', py: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#111' }}>DALTA</Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              {['Privacy Policy', 'Terms of Service', 'Shipping & Returns', 'Contact'].map(item => (
                <Typography key={item} variant="caption"
                  sx={{ color: '#6b7280', cursor: 'pointer', '&:hover': { color: '#111' } }}>
                  {item}
                </Typography>
              ))}
            </Box>
            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
              © 2026 DALTA. Defined by Quality.
            </Typography>
          </Box>
        </Container>
      </Box>

    </Box>
  )
}
