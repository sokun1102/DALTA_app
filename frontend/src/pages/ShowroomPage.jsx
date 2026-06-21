import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import MenuIcon from '@mui/icons-material/Menu'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PersonIcon from '@mui/icons-material/Person'

// Components
import Header from '../components/Header'
import Footer from '../components/Footer'
import CartDrawer from '../components/CartDrawer'

// Utils & Helpers
import { clearGuestCart, normalizeCartItems, readGuestCart, writeGuestCart, cartItemKey } from '../utils/cart'
import { getAuthToken } from '../services/authToken'
import { apiFetch } from '../services/apiClient'

// Assets
import cleanShowroomBg from '../assets/clean_showroom_bg.png'

export default function ShowroomPage({ user, onNavigate, onOpenLogin, onOpenRegister, onOpenProfile, onLogout, onGoCheckout }) {
  const [activeCarIndex, setActiveCarIndex] = useState(0)

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

  const showroomCars = [
    {
      name: 'Apex Aero Package',
      type: 'Carbon aero module',
      desc: 'Cụm cánh gió, splitter và diffuser carbon dành cho xe track day, tập trung vào downforce ổn định và fitment chính xác.',
      specs: 'CARBON PREPREG / DOWNFORCE / TRACK FITMENT',
      image: '/images/cars/AT-SPLIT-FRT-11.png',
      assemblyLogs: [
        { phase: '01', task: 'LIÊN KẾT KHUNG CARBON', tech: 'AT-ENG-08', status: 'ĐÃ KIỂM CHỨNG', hash: '0x8f2a9e' },
        { phase: '02', task: 'HÌNH HỌC HỆ THỐNG TREO', tech: 'AT-ENG-12', status: 'ĐÃ HIỆU CHUẨN', hash: '0x3c99a4' },
        { phase: '03', task: 'LẮP RÁP HỘP SỐ SÀN', tech: 'AT-ENG-03', status: 'ĐÃ PHÊ DUYỆT', hash: '0x22db7e' }
      ],
      subComponents: [
        { name: 'Cánh gió đuôi Carbon ép', sku: 'AT-APEX-WING-01', weight: '8.5 kg' },
        { name: 'Bộ xả cổ van Titanium', sku: 'AT-TITAN-EXH-02', weight: '12.0 kg' },
        { name: 'Bộ giảm chấn thủy lực Analog', sku: 'AT-ANALOG-SHK-08', weight: '14.5 kg' }
      ],
      leadEngineer: 'SHIN JUNG-WOO',
      signHash: '0x5F19E92C3A880D'
    },
    {
      name: 'Vector Power Package',
      type: 'Engine & exhaust module',
      desc: 'Cụm ống xả titanium, cổ hút CNC và ECU map dành cho xe hiệu năng cao, tăng phản hồi ga và giảm trọng lượng.',
      specs: 'TITANIUM / ECU MAP / ACTIVE VALVE',
      image: '/images/cars/AT-CNC-INT-05.png',
      assemblyLogs: [
        { phase: '01', task: 'TÍCH HỢP BỘ PIN HYBRID', tech: 'AT-ENG-04', status: 'ĐẠT', hash: '0x7b11c9' },
        { phase: '02', task: 'ĐỒNG BỘ VI SAI PHÂN BỔ LỰC KÉO', tech: 'AT-ENG-14', status: 'ĐÃ HIỆU CHUẨN', hash: '0x99dd2f' },
        { phase: '03', task: 'HIỆU CHUẨN KHUẾCH TÁN GIÓ CHỦ ĐỘNG', tech: 'AT-ENG-09', status: 'ĐÃ KIỂM CHỨNG', hash: '0x10ae82' }
      ],
      subComponents: [
        { name: 'Bộ đĩa phanh gốm Carbon-Matrix', sku: 'AT-CERAM-BRK-03', weight: '22.0 kg' },
        { name: 'Kênh gió khuếch tán gầm sau chủ động', sku: 'AT-DIFF-UNDER-09', weight: '6.4 kg' },
        { name: 'ECU phân bổ mô-men xoắn sinh học', sku: 'AT-BIOM-ECU-04', weight: '1.2 kg' }
      ],
      leadEngineer: 'SARAH JENKINS',
      signHash: '0x884D2F2AE899BC'
    },
    {
      name: 'Nova Brake Package',
      type: 'Brake & chassis module',
      desc: 'Cụm đĩa phanh carbon ceramic, pad track compound và brace chassis, ưu tiên lực phanh ổn định và độ cứng thân xe.',
      specs: 'CARBON CERAMIC / ZERO FADE / CHASSIS BRACE',
      image: '/images/cars/AT-TRK-PAD-09.png',
      assemblyLogs: [
        { phase: '01', task: 'GIÁP NHIỆT PIN THỂ RẮN', tech: 'AT-ENG-01', status: 'ĐẠT', hash: '0xef9212' },
        { phase: '02', task: 'HIỆU CHUẨN CUỘN DÂY 4 ĐỘNG CƠ', tech: 'AT-ENG-11', status: 'ĐÃ HIỆU CHUẨN', hash: '0x88f2cc' },
        { phase: '03', task: 'PHẦN MỀM TRUYỀN ĐỘNG NEURAL OS', tech: 'AT-ENG-07', status: 'ĐÃ CẤP CHỨNG NHẬN', hash: '0xca77a3' }
      ],
      subComponents: [
        { name: 'Cell pin thể rắn xả dòng cao Hyper-Flow', sku: 'AT-SSTATE-BATT-01', weight: '180 kg' },
        { name: 'Cụm Stator đồng 4 động cơ độc lập', sku: 'AT-QUAD-STAT-11', weight: '64.0 kg' },
        { name: 'Bộ xử lý Neural Drive hợp kim Silicon', sku: 'AT-NEURAL-DRV-07', weight: '1.5 kg' }
      ],
      leadEngineer: 'DR. JUN-HO PARK',
      signHash: '0xAA99D2FF881E99'
    }
  ]

  const handleNextCar = () => {
    setActiveCarIndex((prev) => (prev + 1) % showroomCars.length)
  }

  const handlePrevCar = () => {
    setActiveCarIndex((prev) => (prev - 1 + showroomCars.length) % showroomCars.length)
  }

  return (
    <Box className="car-site">
      <Header
        user={user}
        activeTab="showroom"
        onNavigate={onNavigate}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        cartCount={cartCount}
        onCartClick={() => onNavigate('cart')}
      />

      {/* SHOWROOM HERO */}
      <section className="hero-section" style={{ minHeight: '85vh' }}>
        <img className="hero-image" src={cleanShowroomBg} alt="AEROTEC Atelier" />
        <div className="grid-overlay" />
        <div className="hero-glow-spot" />
        <Container maxWidth="xl" className="hero-content">
          <Box className="hero-copy" sx={{ maxWidth: '750px' }}>
            <Typography component="h1" className="hero-title" style={{ fontSize: 'clamp(44px, 5.5vw, 76px)', lineHeight: 1.1, fontWeight: 950 }}>
              XƯỞNG CHẾ TẠO<br />
              <span className="gradient-text-rose-orange">KỸ THUẬT SỐ</span>
            </Typography>
            <Typography className="hero-text" style={{ color: 'rgba(248,250,252,0.7)', fontSize: '15px', marginTop: '16px', lineHeight: 1.6 }}>
              Nơi sự chính xác cơ khí hội tụ cùng đổi mới công nghệ đột phá. Trải nghiệm không gian trưng bày Aerotec, thánh đường của sự tiến hóa hiệu năng cao.
            </Typography>
            <Box className="hero-actions" sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button className="gradient-btn-rose-orange" style={{ borderRadius: '99px', padding: '12px 32px', fontWeight: 900 }} onClick={() => onNavigate('home')}>
                KHÁM PHÁ BỘ SƯU TẬP
              </Button>
              <Button className="outline-button" style={{ borderRadius: '99px', padding: '12px 32px', fontWeight: 900 }} onClick={handleNextCar}>
                THÔNG SỐ KỸ THUẬT &rarr;
              </Button>
            </Box>
          </Box>
        </Container>
      </section>

      {/* THE GENERATIONS CAROUSEL */}
      <section style={{ padding: '100px 0', background: '#080808' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', fontSize: '32px' }}>
                CÁC GÓI PHỤ TÙNG TRƯNG BÀY
              </Typography>
              <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '14px', mt: 0.5 }}>
                Các cụm phụ tùng được nhóm theo mục tiêu sử dụng: aero, power, braking và chassis.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <IconButton onClick={handlePrevCar} sx={{ border: '1px solid rgba(248,250,252,0.15)', color: '#fff', '&:hover': { borderColor: '#f43f5e' } }}>
                &larr;
              </IconButton>
              <IconButton onClick={handleNextCar} sx={{ border: '1px solid rgba(248,250,252,0.15)', color: '#fff', '&:hover': { borderColor: '#f43f5e' } }}>
                &rarr;
              </IconButton>
            </Box>
          </Box>

          {/* ACTIVE CAR CARD VIEW */}
          <Box className="glow-card-premium" sx={{ p: { md: 6, xs: 4 }, display: 'grid', gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' }, gap: 6, alignItems: 'start' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', p: 4, borderRadius: '8px', border: '1px solid rgba(248,250,252,0.04)' }}>
                {/* Display car image */}
                <img
                  src={showroomCars[activeCarIndex].image}
                  alt={showroomCars[activeCarIndex].name}
                  style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}
                />
              </Box>
              <Box>
                <Chip label={showroomCars[activeCarIndex].type} sx={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', fontWeight: 900, border: '1px solid rgba(249,115,22,0.3)', mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 950, color: '#fff', fontSize: '32px', mb: 2 }}>
                  {showroomCars[activeCarIndex].name}
                </Typography>
                <Typography sx={{ color: 'rgba(248,250,252,0.6)', fontSize: '15px', lineHeight: 1.7, mb: 3, fontFamily: 'Plus Jakarta Sans' }}>
                  {showroomCars[activeCarIndex].desc}
                </Typography>
                <Box sx={{ background: 'rgba(248,250,252,0.03)', p: 2, borderRadius: '8px', border: '1px solid rgba(248,250,252,0.06)' }}>
                  <Typography sx={{ color: '#fb7185', fontWeight: 900, fontSize: '15px', letterSpacing: '0.5px', fontFamily: 'JetBrains Mono' }}>
                    Telemetry chẩn đoán // {showroomCars[activeCarIndex].specs}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Lead Engineer Approval Signature */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px dashed rgba(248,250,252,0.1)', p: 2, borderRadius: '6px', background: 'rgba(248,250,252,0.01)' }}>
                <Box>
                  <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '8.5px', color: 'rgba(248,250,252,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>KỸ SƯ TRƯỞNG PHÊ DUYỆT</Typography>
                  <Typography sx={{ fontFamily: 'Be Vietnam Pro', fontWeight: 900, fontSize: '13px', color: '#fff', mt: 0.2 }}>{showroomCars[activeCarIndex].leadEngineer}</Typography>
                </Box>
                <Box sx={{ zIndex: 2, textAlign: 'right' }}>
                  <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '8.5px', color: '#22c55e', fontWeight: 'bold', letterSpacing: '0.5px' }}>✓ ĐẠT CHUẨN ĐƯỜNG ĐUA</Typography>
                  <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: 'rgba(248,250,252,0.3)', mt: 0.2 }}>MÃ CHỮ KÝ: {showroomCars[activeCarIndex].signHash}</Typography>
                </Box>
              </Box>

              {/* Sub components SKUs */}
              <Box>
                <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#fb7185', fontWeight: 'bold', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  CÁC PHỤ TÙNG TRONG GÓI
                </Typography>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', fontFamily: 'Plus Jakarta Sans', color: '#fff' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(248,250,252,0.12)', textAlign: 'left', color: 'rgba(248,250,252,0.4)' }}>
                      <th style={{ paddingBottom: '6px', fontWeight: 800 }}>PHỤ TÙNG</th>
                      <th style={{ paddingBottom: '6px', fontWeight: 800 }}>MÃ SKU</th>
                      <th style={{ paddingBottom: '6px', fontWeight: 800, textAlign: 'right' }}>GIẢM KHỐI LƯỢNG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showroomCars[activeCarIndex].subComponents.map((comp) => (
                      <tr key={comp.sku} style={{ borderBottom: '1px solid rgba(248,250,252,0.04)' }}>
                        <td style={{ padding: '8px 0', fontWeight: 800 }}>{comp.name}</td>
                        <td style={{ padding: '8px 0', fontFamily: 'JetBrains Mono', color: 'rgba(248,250,252,0.5)' }}>{comp.sku}</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 800 }}>{comp.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>

              {/* Assembly Timeline Log */}
              <Box>
                <Typography sx={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#fb7185', fontWeight: 'bold', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  NHẬT KÝ LẮP RÁP KỸ THUẬT SỐ
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {showroomCars[activeCarIndex].assemblyLogs.map((log) => (
                    <Box key={log.phase} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', p: 1.2, borderRadius: '4px', border: '1px solid rgba(248,250,252,0.04)' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: 'rgba(248,250,252,0.4)' }}>
                        BƯỚC-{log.phase} // KỸ THUẬT: {log.tech}
                      </span>
                      <span style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '10.5px', color: '#fff', fontWeight: 800 }}>
                        {log.task}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#22c55e', fontWeight: 'bold' }}>
                        {log.status} ({log.hash})
                      </span>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </section>

      {/* ADVANCED PART ARCHITECTURE */}
      <section style={{ padding: '100px 0', background: '#050505', borderTop: '1px solid rgba(248,250,252,0.04)' }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'grid', gridTemplateColumns: { md: '0.8fr 1.2fr', xs: '1fr' }, gap: 6, alignItems: 'center' }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', fontSize: '36px', mb: 3, lineHeight: 1.1 }}>
                CẤU TRÚC PHỤ TÙNG<br />HIỆU NĂNG
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ borderLeft: '2px solid #f43f5e', pl: 2 }}>
                  <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '15px' }}>Vật liệu motorsport</Typography>
                  <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px', mt: 0.5 }}>Carbon prepreg, titanium Grade 5 và nhôm CNC được chọn theo tải trọng, nhiệt độ và điều kiện track.</Typography>
                </Box>
                <Box sx={{ borderLeft: '2px solid #f97316', pl: 2 }}>
                  <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '15px' }}>ECU và telemetry</Typography>
                  <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px', mt: 0.5 }}>Các module điện tử hỗ trợ map động cơ, ghi nhận telemetry và tinh chỉnh phản hồi theo cấu hình xe.</Typography>
                </Box>
                <Box sx={{ borderLeft: '2px solid #fb7185', pl: 2 }}>
                  <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '15px' }}>Kiểm tra fitment</Typography>
                  <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '13px', mt: 0.5 }}>Mỗi gói phụ tùng được kiểm tra kích thước lắp đặt, khoảng hở nhiệt và độ ổn định trước khi giao.</Typography>
                </Box>
              </Box>
            </Box>

            {/* METRICS GRID */}
            <Box className="spec-metrics-grid">
              <Box className="metric-box-premium">
                <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>
                  SẢN PHẨM DB
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', my: 1 }}>
                  12
                </Typography>
                <Typography sx={{ color: '#f43f5e', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>
                  ĐÃ SEED THEO CATALOG
                </Typography>
              </Box>

              <Box className="metric-box-premium">
                <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>
                  DANH MỤC
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', my: 1 }}>
                  6
                </Typography>
                <Typography sx={{ color: '#f97316', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>
                  NHÓM PHỤ TÙNG
                </Typography>
              </Box>

              <Box className="metric-box-premium">
                <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>
                  BẢO HÀNH
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 950, color: '#fff', my: 1 }}>
                  18-36
                </Typography>
                <Typography sx={{ color: '#fb7185', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>
                  THÁNG THEO SẢN PHẨM
                </Typography>
              </Box>

              <Box className="metric-box-premium">
                <Typography sx={{ color: 'rgba(248,250,252,0.4)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>
                  VẬT LIỆU
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 950, color: '#fff', my: 2 }}>
                  CNC
                </Typography>
                <Typography sx={{ color: 'rgba(248,250,252,0.5)', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' }}>
                  CARBON / TITANIUM / ALLOY
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </section>

      {/* PRECISION MANUFACTURING CALLOUT */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(180deg, #050505, #0a0a0a)' }}>
        <Container maxWidth="xl">
          <Box className="glow-card-premium" sx={{ p: 5, textAlign: 'center', border: '1px solid rgba(244,63,94,0.15)' }}>
            <Typography variant="h4" sx={{ fontWeight: 950, color: '#fff', mb: 2 }}>
              SẢN XUẤT CHÍNH XÁC
            </Typography>
            <Typography sx={{ color: 'rgba(248,250,252,0.6)', maxWidth: '800px', mx: 'auto', fontSize: '15px', lineHeight: 1.7, mb: 4 }}>
              Mỗi phụ tùng Aerotec đều được hoàn thiện thủ công tại Xưởng Kỹ thuật số của chúng tôi. Chúng tôi kết hợp công nghệ thiêu kết laser 3D với nghề thủ công truyền thống để đảm bảo mỗi chi tiết là một kiệt tác kỹ thuật hiện đại độc nhất.
            </Typography>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('tech'); }} style={{ color: '#fb7185', fontWeight: 900, fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              XEM QUY TRÌNH CHẾ TẠO &rarr;
            </a>
          </Box>
        </Container>
      </section>

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
