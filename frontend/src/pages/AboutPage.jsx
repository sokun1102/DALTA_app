import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

// Components
import Header from '../components/Header'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'

// Utils & Helpers
import { clearGuestCart, normalizeCartItems, readGuestCart, writeGuestCart, cartItemKey } from '../utils/cart'
import { getAuthToken } from '../services/authToken'
import { apiFetch } from '../services/apiClient'

const LAB_FACILITIES = [
  {
    id: '01',
    name: 'Phòng Thử Nghiệm Hầm Gió',
    function: 'Tối ưu hóa khí động học',
    specs: 'Hầm gió khép kín 120m, tốc độ thử nghiệm Mach 0.3, cảm biến laser Doppler.',
    desc: 'Phân tích hiện tượng tách lớp khí biên, sự hình thành các dòng xoáy khí động học để tối đa lực ép gầm và giảm tối đa lực cản không khí.'
  },
  {
    id: '02',
    name: 'Phòng Luyện Kim Lò Hấp Áp Suất',
    function: 'Kỹ thuật vật liệu siêu nhẹ',
    specs: 'Lò hấp nén khí 6 bar, máy gia công CNC 5 trục, tổ hợp hàn Titanium chuyên dụng.',
    desc: 'Hấp nhiệt định hình sợi carbon prepreg theo các chu kỳ nhiệt độ ngặt nghèo và cắt gọt hợp kim nhôm hàng không với sai số dưới micron.'
  },
  {
    id: '03',
    name: 'Tổ Hợp Mô Phỏng Điện Tử Sinh Học',
    function: 'Hệ thống điều khiển điện tử',
    specs: 'Trình mô phỏng telemetry thời gian thực, chip phân tích sinh học tài xế 1000Hz.',
    desc: 'Cân chỉnh hệ thống ECU mạng nơ-ron để điều chỉnh phản hồi chân ga, lực kéo dựa trên dữ liệu telemetry thực tế từ lốp xe và nhịp tim tài xế.'
  }
]

export default function AboutPage({ user, onNavigate, onOpenLogin, onOpenRegister, onOpenProfile, onLogout, onGoCheckout }) {
  // Shopping Cart States
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [cartNotice, setCartNotice] = useState('')
  const [cartError, setCartError] = useState('')
  const [cartBusy, setCartBusy] = useState(false)
  const cartMode = getAuthToken() ? 'account' : 'guest'
  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)

  const loadCart = async () => {
    setCartError('')
    if (!getAuthToken()) {
      const guestItems = readGuestCart()
      setCartItems(guestItems)
      return guestItems
    }
    setCartBusy(true)
    try {
      const result = await apiFetch('/cart', { auth: true })
      const items = normalizeCartItems(result)
      setCartItems(items)
      return items
    } catch (error) {
      setCartError(error.message || 'Không thể tải giỏ hàng tài khoản.')
      return []
    } finally {
      setCartBusy(false)
    }
  }

  const updateCartQuantity = async (item, quantity) => {
    setCartNotice('')
    setCartError('')
    if (getAuthToken() && Number.isInteger(Number(item.id))) {
      setCartBusy(true)
      try {
        await apiFetch(`/cart/${item.id}`, {
          method: 'PUT',
          auth: true,
          body: JSON.stringify({ quantity }),
        })
        await loadCart()
        return
      } catch {
        setCartError('Không thể cập nhật số lượng trong giỏ hàng tài khoản.')
        return
      } finally {
        setCartBusy(false)
      }
    }
    const nextItems = readGuestCart().map((cartItem) =>
      cartItemKey(cartItem) === cartItemKey(item) ? { ...cartItem, quantity } : cartItem
    )
    writeGuestCart(nextItems)
    setCartItems(nextItems)
  }

  const removeCartItem = async (item) => {
    setCartNotice('')
    setCartError('')
    if (getAuthToken() && Number.isInteger(Number(item.id))) {
      setCartBusy(true)
      try {
        await apiFetch(`/cart/${item.id}`, {
          method: 'DELETE',
          auth: true,
        })
        await loadCart()
        return
      } catch {
        setCartError('Không thể xóa sản phẩm khỏi giỏ hàng tài khoản.')
        return
      } finally {
        setCartBusy(false)
      }
    }
    const nextItems = readGuestCart().filter((cartItem) => cartItemKey(cartItem) !== cartItemKey(item))
    writeGuestCart(nextItems)
    setCartItems(nextItems)
  }

  const clearCart = async () => {
    setCartNotice('')
    setCartError('')
    if (getAuthToken()) {
      setCartBusy(true)
      try {
        await apiFetch('/cart', { method: 'DELETE', auth: true })
        setCartItems([])
        return
      } catch {
        setCartError('Không thể xóa giỏ hàng tài khoản.')
        return
      } finally {
        setCartBusy(false)
      }
    }
    clearGuestCart()
    setCartItems([])
  }

  useEffect(() => {
    loadCart()
  }, [user])

  return (
    <Box className="car-site">
      <Header
        user={user}
        activeTab="about"
        onNavigate={onNavigate}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        cartCount={cartCount}
        onCartClick={() => onNavigate('cart')}
      />

      {/* HERO BANNER */}
      <Box sx={{ pt: 14, pb: 6 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1.2fr 0.8fr', xs: '1fr' }, gap: 5, alignItems: 'center' }}>
            <Box>
              <Chip label="Phòng Thử Nghiệm Motorsports" sx={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e', fontWeight: 900, mb: 2 }} />
              <Typography variant="h2" sx={{ fontWeight: 950, color: '#fff', fontSize: { md: '56px', xs: '36px' }, mb: 3, fontFamily: 'Be Vietnam Pro', lineHeight: 1.1 }}>
                Atelier AEROTEC:<br />
                <span className="gradient-text-rose-orange">Vượt Lên Trên Luyện Kim</span>
              </Typography>
              <Typography sx={{ color: 'rgba(248,250,252,0.7)', fontSize: '15px', fontFamily: 'Plus Jakarta Sans', lineHeight: 1.8, mb: 4 }}>
                Được thành lập tại Seoul bởi một nhóm các nhà khoa học composite hàng không vũ trụ và các kỹ sư đua xe vô địch giải đấu, AEROTEC chuyên sản xuất các phụ tùng xe đua hiệu năng cao. Chúng tôi hoạt động tại điểm giao thoa giữa luyện kim, khí động học và điện tử học tính toán. Sứ mệnh của chúng tôi là định hình lại giới hạn cơ học bằng vật liệu carbon và titanium cao cấp.
              </Typography>
            </Box>
            <Box
              sx={{
                background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(249, 115, 22, 0.05))',
                border: '1px solid rgba(248, 250, 252, 0.06)',
                borderRadius: '16px',
                padding: 4,
                backdropFilter: 'blur(10px)'
              }}
            >
              <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: '#fb7185', mb: 2, fontWeight: 'bold' }}>
                TRIẾT LÝ ATELIER //
              </Typography>
              <Typography sx={{ color: '#fff', fontWeight: 800, fontFamily: 'Be Vietnam Pro', mb: 2, fontSize: '18px' }}>
                Dung Sai Nứt Lớp Bằng Không
              </Typography>
              <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px', fontFamily: 'Plus Jakarta Sans', lineHeight: 1.6 }}>
                Mỗi lớp carbon lò hấp autoclave chúng tôi dệt phải thẳng hàng hoàn hảo với hướng chịu ứng suất lực. Một độ lệch nhỏ nhất cũng sẽ hủy bỏ toàn bộ chi tiết. Chúng tôi chế tạo cho các điều kiện đua xe khắc nghiệt nhất, nơi hư hỏng không bao giờ được phép xảy ra.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* FACILITIES SHOWCASE */}
      <Box sx={{ py: 8, background: '#0a0a0a', borderTop: '1px solid rgba(248,250,252,0.04)' }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', fontSize: '32px', mb: 2, fontFamily: 'Be Vietnam Pro' }}>
              Cơ Sở Thử Nghiệm Tiên Tiến
            </Typography>
            <Typography sx={{ color: 'rgba(248, 250, 252, 0.5)', maxWidth: '600px', mx: 'auto', fontSize: '14px', fontFamily: 'Plus Jakarta Sans' }}>
              Atelier của chúng tôi vận hành ba phòng thí nghiệm chuyên dụng để nghiên cứu khí động học, kiểm tra độ mỏi vật liệu và tối ưu firmware điều khiển vi mạch.
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { md: 'repeat(3, 1fr)', sm: '1fr' }, gap: 4 }}>
            {LAB_FACILITIES.map((facility) => (
              <Box
                key={facility.id}
                sx={{
                  background: 'rgba(15, 15, 15, 0.5)',
                  border: '1px solid rgba(248, 250, 252, 0.05)',
                  borderRadius: '16px',
                  padding: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'rgba(244, 63, 94, 0.25)',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: '#fb7185', fontWeight: 'bold' }}>
                  PHÒNG THỬ NGHIỆM {facility.id}
                </span>
                <Typography variant="h5" sx={{ color: '#fff', fontWeight: 900, fontFamily: 'Be Vietnam Pro', mt: 1, mb: 1, fontSize: '20px' }}>
                  {facility.name}
                </Typography>
                <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'rgba(248, 250, 252, 0.4)', mb: 3 }}>
                  SPEC: {facility.specs}
                </Typography>
                <Typography sx={{ color: 'rgba(248, 250, 252, 0.55)', fontSize: '13px', fontFamily: 'Plus Jakarta Sans', lineHeight: 1.6 }}>
                  {facility.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* HERITAGE CHRONO GRID TIMELINE */}
      <Box sx={{ py: 8, background: '#050505', borderTop: '1px solid rgba(248,250,252,0.04)' }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Chip label="LỊCH SỬ PHÁT TRIỂN" sx={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e', fontWeight: 900, mb: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', fontSize: '32px', mb: 2, fontFamily: 'Be Vietnam Pro' }}>
              Hành Trình Công Nghệ
            </Typography>
            <Typography sx={{ color: 'rgba(248, 250, 252, 0.5)', maxWidth: '600px', mx: 'auto', fontSize: '14px', fontFamily: 'Plus Jakarta Sans' }}>
              Mô hình bento bất đối xứng ghi lại lịch sử nghiên cứu vật liệu composite và ứng dụng cơ khí đường đua của xưởng chúng tôi.
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 4 }}>
            {/* 2018 - span 4 */}
            <Box className="glow-card-premium" sx={{ gridColumn: { md: 'span 4', xs: 'span 12' }, p: 4, background: 'rgba(10, 10, 10, 0.5)', border: '1px solid rgba(248, 250, 252, 0.05)' }}>
              <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '18px', color: '#fb7185', fontWeight: 950 }}>2018</Typography>
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '16px', mt: 1, mb: 1.5, fontFamily: 'Be Vietnam Pro' }}>
                Phòng Thí Nghiệm SNU
              </Typography>
              <Typography sx={{ color: 'rgba(248, 250, 252, 0.5)', fontSize: '12.5px', fontFamily: 'Plus Jakarta Sans', lineHeight: 1.5 }}>
                Bắt đầu từ một dự án luyện kim học thuật tại Seoul, tập trung nghiên cứu sợi carbon prepreg autoclave và các liên kết hóa học cường độ cao.
              </Typography>
            </Box>

            {/* 2020 - span 8 */}
            <Box className="glow-card-premium" sx={{ gridColumn: { md: 'span 8', xs: 'span 12' }, p: 4, background: 'rgba(10, 10, 10, 0.5)', border: '1px solid rgba(248, 250, 252, 0.05)' }}>
              <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '18px', color: '#fb7185', fontWeight: 950 }}>2020</Typography>
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '16px', mt: 1, mb: 1.5, fontFamily: 'Be Vietnam Pro' }}>
                Xây Dựng Hầm Gió Động Lực Học
              </Typography>
              <Typography sx={{ color: 'rgba(248, 250, 252, 0.5)', fontSize: '12.5px', fontFamily: 'Plus Jakarta Sans', lineHeight: 1.5 }}>
                Hoàn thành tổ hợp hầm gió khép kín. Ứng dụng cảm biến laser Doppler đo đạc tách lớp luồng khí biên, đạt thông số lực ép gầm -1.82 tối ưu cho cánh gió thể thao.
              </Typography>
            </Box>

            {/* 2022 - span 7 */}
            <Box className="glow-card-premium" sx={{ gridColumn: { md: 'span 7', xs: 'span 12' }, p: 4, background: 'rgba(10, 10, 10, 0.5)', border: '1px solid rgba(248, 250, 252, 0.05)' }}>
              <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '18px', color: '#fb7185', fontWeight: 950 }}>2022</Typography>
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '16px', mt: 1, mb: 1.5, fontFamily: 'Be Vietnam Pro' }}>
                Hợp Tác Giải Đua FIA GT3
              </Typography>
              <Typography sx={{ color: 'rgba(248, 250, 252, 0.5)', fontSize: '12.5px', fontFamily: 'Plus Jakarta Sans', lineHeight: 1.5 }}>
                Đối tác cung cấp hệ thống ống xả Titanium Grade 5 cho các đội đua vô địch. Vượt qua bài kiểm tra độ bền mỏi 24 giờ liên tục và giảm 14kg khối lượng ống dẫn.
              </Typography>
            </Box>

            {/* 2024 - span 5 */}
            <Box className="glow-card-premium" sx={{ gridColumn: { md: 'span 5', xs: 'span 12' }, p: 4, background: 'rgba(10, 10, 10, 0.5)', border: '1px solid rgba(248, 250, 252, 0.05)' }}>
              <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '18px', color: '#fb7185', fontWeight: 950 }}>2024</Typography>
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '16px', mt: 1, mb: 1.5, fontFamily: 'Be Vietnam Pro' }}>
                ECU Mạng Nơ-ron & Nhân Pin Thể Rắn
              </Typography>
              <Typography sx={{ color: 'rgba(248, 250, 252, 0.5)', fontSize: '12.5px', fontFamily: 'Plus Jakarta Sans', lineHeight: 1.5 }}>
                Nghiên cứu sâu hệ truyền động điện thích ứng. Chế tạo thành công bộ điều khiển ECU sinh học quét 1000Hz và lõi tản nhiệt thể rắn.
              </Typography>
            </Box>

            {/* 2026 - span 12 */}
            <Box className="glow-card-premium" sx={{ gridColumn: 'span 12', p: 4, background: 'rgba(10, 10, 10, 0.5)', border: '1px solid rgba(248, 250, 252, 0.05)' }}>
              <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '18px', color: '#fb7185', fontWeight: 950 }}>2026</Typography>
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '16px', mt: 1, mb: 1.5, fontFamily: 'Be Vietnam Pro' }}>
                Thương Mại Hóa & Phân Phối Toàn Cầu
              </Typography>
              <Typography sx={{ color: 'rgba(248, 250, 252, 0.5)', fontSize: '12.5px', fontFamily: 'Plus Jakarta Sans', lineHeight: 1.5 }}>
                Ra mắt cổng thông tin phụ tùng trực tuyến, đưa các chi tiết cơ khí hàng không và giải đua chuyên nghiệp đến với người đam mê xe độ toàn cầu theo chuẩn FIA.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ISO-FIA RACING COMPLIANCE STAMPS */}
      <Box sx={{ py: 8, background: '#0a0a0a', borderTop: '1px solid rgba(248,250,252,0.04)' }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Chip label="ĐỒNG BỘ CHẤT LƯỢNG" sx={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e', fontWeight: 900, mb: 2 }} />
            <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', fontSize: '32px', mb: 2, fontFamily: 'Be Vietnam Pro' }}>
              Chứng Nhận Tiêu Chuẩn Chất Lượng
            </Typography>
            <Typography sx={{ color: 'rgba(248, 250, 252, 0.5)', maxWidth: '600px', mx: 'auto', fontSize: '14px', fontFamily: 'Plus Jakarta Sans' }}>
              Các con dấu chứng chỉ chứng nhận phụ tùng của chúng tôi đủ điều kiện vận hành tại các giải đua khắc nghiệt nhất.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
            {/* Stamp 1: ISO 9001 COMPOSITE */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(-8deg)' }}>
                <circle cx="50" cy="50" r="45" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 2" />
                <circle cx="50" cy="50" r="41" stroke="#f43f5e" strokeWidth="0.8" />
                <circle cx="50" cy="50" r="28" stroke="#f43f5e" strokeWidth="0.8" />
                <path id="isoPath" d="M 18,50 A 32,32 0 1,1 82,50" fill="none" />
                <text fill="#f43f5e" style={{ fontFamily: 'JetBrains Mono', fontSize: '5.5px', fontWeight: 'bold', letterSpacing: '0.4px' }}>
                  <textPath href="#isoPath" startOffset="5%">AEROTEC // ISO 9001 COMPOSITE CERT</textPath>
                </text>
                <text x="50" y="47" fill="#f43f5e" textAnchor="middle" style={{ fontFamily: 'JetBrains Mono', fontSize: '7px', fontWeight: 950 }}>SAI SỐ ĐỒNG TRỤC 0.0°</text>
                <text x="50" y="55" fill="#f43f5e" textAnchor="middle" style={{ fontFamily: 'JetBrains Mono', fontSize: '6px', fontWeight: 900 }}>HẤP AUTOCLAVE</text>
                <text x="50" y="63" fill="#f43f5e" textAnchor="middle" style={{ fontFamily: 'JetBrains Mono', fontSize: '5px', fontWeight: 900 }}>ĐẠT TIÊU CHUẨN // SEOUL</text>
              </svg>
              <Typography sx={{ color: '#fff', fontSize: '13px', fontWeight: 900, fontFamily: 'Plus Jakarta Sans' }}>Chứng Chỉ ISO 9001</Typography>
            </Box>

            {/* Stamp 2: FIA HOMOLOGATION */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(5deg)' }}>
                <polygon points="50,5 82,18 95,50 82,82 50,95 18,82 5,50 18,18" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                <polygon points="50,9 79,21 91,50 79,79 50,91 21,79 9,50 21,21" stroke="#38bdf8" strokeWidth="0.8" fill="none" />
                <circle cx="50" cy="50" r="26" stroke="#38bdf8" strokeWidth="0.8" />
                <text x="50" y="44" fill="#38bdf8" textAnchor="middle" style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', fontWeight: 950 }}>FIA</text>
                <text x="50" y="54" fill="#38bdf8" textAnchor="middle" style={{ fontFamily: 'JetBrains Mono', fontSize: '6px', fontWeight: 900 }}>ĐƯỢC CHẤP THUẬN ĐUA</text>
                <text x="50" y="62" fill="#38bdf8" textAnchor="middle" style={{ fontFamily: 'JetBrains Mono', fontSize: '5px', fontWeight: 900 }}>MÃ SỐ: AT-GT3-M</text>
              </svg>
              <Typography sx={{ color: '#fff', fontSize: '13px', fontWeight: 900, fontFamily: 'Plus Jakarta Sans' }}>Đạt Chuẩn Kiểm Định FIA</Typography>
            </Box>

            {/* Stamp 3: TUV RHEINLAND METALLURGY */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(-4deg)' }}>
                <circle cx="50" cy="50" r="44" stroke="#fb7185" strokeWidth="1.2" />
                <circle cx="50" cy="50" r="38" stroke="#fb7185" strokeWidth="0.8" />
                <line x1="12" y1="50" x2="88" y2="50" stroke="#fb7185" strokeWidth="0.8" />
                <text x="50" y="28" fill="#fb7185" textAnchor="middle" style={{ fontFamily: 'JetBrains Mono', fontSize: '6.5px', fontWeight: 900, letterSpacing: '0.5px' }}>TUV RHEINLAND</text>
                <text x="50" y="42" fill="#fb7185" textAnchor="middle" style={{ fontFamily: 'JetBrains Mono', fontSize: '5px', fontWeight: 900 }}>ỨNG SUẤT LỰC & NHIỆT</text>
                <text x="50" y="64" fill="#fb7185" textAnchor="middle" style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', fontWeight: 950 }}>1100°C</text>
                <text x="50" y="76" fill="#fb7185" textAnchor="middle" style={{ fontFamily: 'JetBrains Mono', fontSize: '5.5px', fontWeight: 900 }}>HỢP KIM TITANIUM ĐẠT</text>
              </svg>
              <Typography sx={{ color: '#fff', fontSize: '13px', fontWeight: 900, fontFamily: 'Plus Jakarta Sans' }}>Độ Bền Vật Liệu TUV</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Footer onNavigate={onNavigate} />

      {/* CART DRAWER */}
      <CartDrawer
        open={cartOpen}
        items={cartItems}
        mode={cartMode}
        notice={cartNotice}
        error={cartError}
        busy={cartBusy}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeCartItem}
        onClearCart={clearCart}
        onGoCheckout={() => {
          setCartOpen(false)
          onGoCheckout()
        }}
      />
    </Box>
  )
}
