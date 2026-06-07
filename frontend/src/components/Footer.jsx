import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

export default function Footer({ onNavigate }) {
  return (
    <footer style={{ padding: '80px 0 40px', background: '#070707', borderTop: '1px solid rgba(248,250,252,0.06)' }}>
      <Container maxWidth="xl">
        {/* UPPER GRID */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { md: '1.5fr 1fr 1fr 1.2fr', sm: '1fr 1fr', xs: '1fr' },
            gap: 5,
            pb: 6,
            borderBottom: '1px solid rgba(248,250,252,0.06)',
          }}
        >
          {/* BRAND COL */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 26, fontWeight: 950, letterSpacing: '2px', color: '#fff', fontFamily: 'Be Vietnam Pro', fallbackFamily: 'Plus Jakarta Sans' }}>
              AEROTEC
            </span>
            <Typography
              sx={{
                color: 'rgba(248, 250, 252, 0.45)',
                fontSize: '12px',
                fontWeight: 900,
                letterSpacing: '1px',
                fontFamily: 'JetBrains Mono',
                lineHeight: 1.6,
                maxWidth: '240px',
              }}
            >
              XƯỞNG CHẾ TẠO PHỤ TÙNG XE ĐUA HIỆU NĂNG CAO. CƠ KHÍ KHUNG GẦM & KHÍ ĐỘNG HỌC CHÍNH XÁC.
            </Typography>

            {/* STATUS DOT */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2 }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#f43f5e',
                  boxShadow: '0 0 10px #f43f5e',
                  animation: 'pulse-glow 2s infinite',
                }}
              />
              <span
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: '11px',
                  fontWeight: 900,
                  color: '#f43f5e',
                  letterSpacing: '1px',
                }}
              >
                TRẠNG THÁI HỆ THỐNG: HOẠT ĐỘNG
              </span>
            </Box>
          </Box>

          {/* SERIES COL */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ color: '#fff', fontSize: '12px', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'Be Vietnam Pro', fallbackFamily: 'Plus Jakarta Sans' }}>
              Dòng Sản Phẩm
            </span>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, fontSize: '13px', fontFamily: 'Plus Jakarta Sans' }} className="footer-links-col">
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('parts') }}>Cánh gió carbon</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('parts') }}>Ống xả titanium</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('parts') }}>Phanh carbon ceramic</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('parts') }}>Danh mục phụ tùng xe</a>
            </Box>
          </Box>

          {/* RESOURCES COL */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ color: '#fff', fontSize: '12px', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'Be Vietnam Pro', fallbackFamily: 'Plus Jakarta Sans' }}>
              Tài Nguyên Kỹ Thuật
            </span>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, fontSize: '13px', fontFamily: 'Plus Jakarta Sans' }} className="footer-links-col">
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('tech') }}>Bản Vẽ CAD & Telemetry</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('tech') }}>Chẩn Đoán Hầm Gió</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('tech') }}>Giai Đoạn Tháo Lắp 3D</a>
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('tech') }}>Bản Đồ Mạng Nơ-ron</a>
            </Box>
          </Box>

          {/* ATELIER CONTACT COL */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ color: '#fff', fontSize: '12px', fontWeight: 900, letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'Be Vietnam Pro', fallbackFamily: 'Plus Jakarta Sans' }}>
              Thông Tin Xưởng
            </span>
            <Typography
              sx={{
                color: 'rgba(248, 250, 252, 0.5)',
                fontSize: '13px',
                fontFamily: 'Plus Jakarta Sans',
                lineHeight: 1.8,
              }}
            >
              <strong>AEROTEC Lab</strong><br />
              Đại lộ Gangnam, Seoul, Hàn Quốc<br />
              Email: <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('contact') }} style={{ color: '#fb7185', textDecoration: 'underline', transition: 'color 0.2s' }}>contact@aerotec.io</a><br />
              Điện thoại: +82 2 1234 5678
            </Typography>
          </Box>
        </Box>

        {/* BOTTOM METADATA BAR */}
        <Box sx={{ display: 'flex', flexDirection: { sm: 'row', xs: 'column' }, justifyContent: 'space-between', alignItems: 'center', mt: 4, gap: 2 }}>
          <span style={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px', fontWeight: 800, fontFamily: 'JetBrains Mono', letterSpacing: '0.5px' }}>
            © 2026 AEROTEC PERFORMANCE. BẢO LƯU MỌI QUYỀN. XƯỞNG SẢN XUẤT ĐÃ ĐĂNG KÝ.
          </span>
          <Box sx={{ display: 'flex', gap: 3, color: 'rgba(248,250,252,0.4)' }} className="footer-bottom-meta">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home') }}>Chính Sách Bảo Mật</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home') }}>Điều Khoản Dịch Vụ</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home') }}>Vận Chuyển & Giao Nhận</a>
          </Box>
        </Box>
      </Container>
    </footer>
  )
}
